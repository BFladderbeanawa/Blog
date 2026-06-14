<# 
.SYNOPSIS
  批量提交随机信息到 Git 仓库

.PARAMETER RepoPath
  仓库路径（默认当前目录）

.PARAMETER Count
  提交次数（默认 10）

.PARAMETER Empty
  使用空提交 (--allow-empty)，不改动文件

.PARAMETER MinLen
  随机消息最短长度（默认 8）

.PARAMETER MaxLen
  随机消息最长长度（默认 16）

.PARAMETER DelayMs
  每次提交间隔毫秒（默认 0）

.PARAMETER Push
  循环结束后执行 git push
#>

param(
  [string]$RepoPath = ".",
  [int]$Count = 10,
  [switch]$Empty,
  [int]$MinLen = 8,
  [int]$MaxLen = 16,
  [int]$DelayMs = 0,
  [switch]$Push
)

function Get-RandomString([int]$len) {
  $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  -join (1..$len | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
}

# 进入仓库并校验
Set-Location -Path $RepoPath
$inside = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $inside -ne "true") {
  Write-Error "当前目录不是 Git 仓库：$((Get-Location).Path)"
  exit 1
}

# 确保存在一个用于追加提交的文件
$stampFile = ".commit-spam.log"

if (-not $Empty) {
  if (-not (Test-Path $stampFile)) {
    New-Item -ItemType File -Path $stampFile -Force | Out-Null
    git add -f $stampFile
    git commit -m "init $stampFile" | Out-Null
  }
}

Write-Host "Starting $Count commits in repo: $((Get-Location).Path)" -ForegroundColor Cyan

for ($i = 1; $i -le $Count; $i++) {
  $msgLen = Get-Random -Minimum $MinLen -Maximum ($MaxLen + 1)
  $msg = Get-RandomString -len $msgLen

  if ($Empty) {
    git commit --allow-empty -m $msg | Out-Null
  } else {
    $line = "{0} {1}" -f ([DateTime]::UtcNow.ToString("o")), $msg
    Add-Content -Path $stampFile -Value $line
    git add -f $stampFile
    git commit -m $msg | Out-Null
  }

  Write-Host ("[{0}/{1}] commit: {2}" -f $i, $Count, $msg)

  if ($DelayMs -gt 0) {
    Start-Sleep -Milliseconds $DelayMs
  }
}

if ($Push) {
  Write-Host "Pushing..." -ForegroundColor Yellow
  git push
}

Write-Host "Done." -ForegroundColor Green

