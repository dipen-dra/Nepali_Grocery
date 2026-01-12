
$path = "README.md"
# Try reading as UTF16 if that was the reported mime type, or Default
$content = Get-Content $path -Raw
$marker = "Getting Started"
$idx1 = $content.IndexOf($marker)
$idx2 = $content.LastIndexOf($marker)

Write-Host "Indices: $idx1 vs $idx2"

if ($idx1 -ne -1 -and $idx1 -ne $idx2) {
    Write-Host "Found duplicates. Removing the first one."
    # Find the start of the line containing the first marker
    $startOfBlock = $content.LastIndexOf("##", $idx1)
    
    # Find the next Header after this block
    $endOfBlock = $content.IndexOf("## ", $idx1 + 20)
    
    if ($startOfBlock -ne -1 -and $endOfBlock -ne -1) {
         $part1 = $content.Substring(0, $startOfBlock)
         $part2 = $content.Substring($endOfBlock)
         $final = $part1 + $part2
         $final | Set-Content $path -Encoding UTF8
         Write-Host "Fixed."
    }
} else {
    Write-Host "No duplicates found."
}
