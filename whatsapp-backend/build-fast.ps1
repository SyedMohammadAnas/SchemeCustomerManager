# Fast Docker Build Script with BuildKit for Windows
# This script optimizes the Docker build process for maximum speed

Write-Host "🚀 Starting optimized Docker build..." -ForegroundColor Green

# Enable Docker BuildKit for faster builds
$env:DOCKER_BUILDKIT = "1"

# Get current timestamp for tagging
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Build with optimized parameters
docker build `
    --build-arg BUILDKIT_INLINE_CACHE=1 `
    --cache-from whatsapp-backend:latest `
    --tag whatsapp-backend:latest `
    --tag whatsapp-backend:$timestamp `
    --progress=plain `
    --no-cache=false `
    .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📦 Image tagged as: whatsapp-backend:latest" -ForegroundColor Cyan
    Write-Host "🕒 Build time optimized with BuildKit and caching" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
