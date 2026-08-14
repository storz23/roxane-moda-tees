$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Servidor corriendo en http://localhost:8080/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $relPath = $req.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($relPath)) { $relPath = "index.html" }
        
        $filePath = Join-Path "C:\Users\Willy\.gemini\antigravity\scratch\roxane-moda-tees" $relPath
        if ((Test-Path $filePath) -and (Get-Item $filePath).PSIsContainer) {
            $filePath = Join-Path $filePath "index.html"
        }
        
        if (Test-Path $filePath) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentLength64 = $bytes.Length
            
            if ($filePath.EndsWith(".html")) { $res.ContentType = "text/html; charset=utf-8" }
            elseif ($filePath.EndsWith(".css")) { $res.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".js")) { $res.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".png")) { $res.ContentType = "image/png" }
            
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    } catch {
        # ignore context errors on exit
    }
}
