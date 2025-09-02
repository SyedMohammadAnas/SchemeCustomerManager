#!/bin/sh

# WhatsApp Backend Startup Script for Railway
# This script ensures proper Chrome initialization and environment setup

echo "🚀 Starting WhatsApp Backend..."

# Set environment variables for Puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
export CHROME_BIN=/usr/bin/chromium-browser
export CHROME_PATH=/usr/bin/chromium-browser

# Verify Chrome installation
if [ ! -f "/usr/bin/chromium-browser" ]; then
    echo "❌ Chrome not found at /usr/bin/chromium-browser"
    echo "🔍 Checking available Chrome installations..."
    find /usr -name "*chrome*" -type f 2>/dev/null || echo "No Chrome found"
    exit 1
fi

echo "✅ Chrome found at /usr/bin/chromium-browser"

# Check Chrome version
echo "🔍 Chrome version:"
/usr/bin/chromium-browser --version || echo "Could not get Chrome version"

# Create necessary directories
mkdir -p whatsapp-session logs
chmod 755 whatsapp-session logs

# Start the application
echo "🎉 Starting Node.js application..."
exec node src/server.js
