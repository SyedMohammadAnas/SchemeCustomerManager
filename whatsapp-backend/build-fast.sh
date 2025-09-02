#!/bin/bash

# Fast Docker Build Script with BuildKit
# This script optimizes the Docker build process for maximum speed

echo "🚀 Starting optimized Docker build..."

# Enable Docker BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with optimized parameters
docker build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from whatsapp-backend:latest \
    --tag whatsapp-backend:latest \
    --tag whatsapp-backend:$(date +%Y%m%d-%H%M%S) \
    --progress=plain \
    --no-cache=false \
    .

echo "✅ Build completed successfully!"
echo "📦 Image tagged as: whatsapp-backend:latest"
echo "🕒 Build time optimized with BuildKit and caching"
