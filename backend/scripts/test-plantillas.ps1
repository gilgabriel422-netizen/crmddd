$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000/api/plantillas'
$list = Invoke-RestMethod -Uri $base -Method GET

$results = @()
foreach ($p in $list.data) {
  try {
    $item = Invoke-RestMethod -Uri "$base/$($p.id)" -Method GET
    $keys = ($item.data.PSObject.Properties.Name -join ',')
    $results += [PSCustomObject]@{
      id = $p.id
      ok = $true
      keys = $keys
    }
  } catch {
    $results += [PSCustomObject]@{
      id = $p.id
      ok = $false
      error = $_.Exception.Message
    }
  }
}

$results | Format-Table -AutoSize
