$ErrorActionPreference = 'Stop'
# Get modified and deleted files
$lines = git status --porcelain
foreach ($line in $lines) {
  $status = $line.Substring(0,2).Trim()
  $path = $line.Substring(3).Trim()
  if ($status -eq 'M') {
    git add $path
    $scope = $path.Split('/')[1]
    git commit -m "chore($scope): update $path"
  } elseif ($status -eq 'D') {
    git rm $path
    $scope = $path.Split('/')[1]
    git commit -m "chore($scope): remove $path"
  }
}
Write-Host "All changes committed separately."
