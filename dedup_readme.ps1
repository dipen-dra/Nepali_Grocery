
$path = "README.md"
$content = Get-Content $path -Raw
# Powershell usually auto-detects encoding (UTF-8 or UTF-16). 

# We want to remove the FIRST "Getting Started" block if there are two.
$marker = "## 🚀 Getting Started"
$idx1 = $content.IndexOf($marker)
$idx2 = $content.LastIndexOf($marker)

if ($idx1 -ne -1 -and $idx1 -ne $idx2) {
    Write-Host "Found duplicates. Removing the first one."
    
    # The first block ends before "## 🔐 Advanced Security Implementations"
    # Or "## CSRF Protection" depending on layout.
    # Let's verify what follows.
    # Usually getting started is followed by "### Installation"
    
    # Let's find end of the FIRST block. 
    # It probably ends at the next Horizontal Rule "---" or next header "##"
    $nextHeaderIdx = $content.IndexOf("## ", $idx1 + 10)
    
    if ($nextHeaderIdx -ne -1) {
        # We cut from idx1 to nextHeaderIdx
        # But we need to be careful not to delete the next header itself.
        # Actually, let's look at the context. 
        # Is the duplicate completely redundant?
        
        $part1 = $content.Substring(0, $idx1)
        $part2 = $content.Substring($nextHeaderIdx)
        # trim trailing logic
        
        $final = $part1 + $part2
        $final | Set-Content $path -Encoding UTF8
        Write-Host "Fixed."
    } else {
        Write-Host "Could not find end of first block."
    }
} else {
    Write-Host "No duplicates found ($idx1 vs $idx2)."
    # Ensure UTF-8 anyway
    $content | Set-Content $path -Encoding UTF8
}
