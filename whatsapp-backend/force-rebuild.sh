#!/bin/bash

# Force Rebuild Script for Railway
# This script ensures Railway rebuilds with the new venom-bot dependencies

echo "🔄 Force rebuilding WhatsApp Backend..."

# Remove old node_modules and package-lock
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Install dependencies fresh
echo "📦 Installing new dependencies..."
npm install

# Verify venom-bot is installed
echo "✅ Verifying venom-bot installation..."
if npm list venom-bot; then
    echo "✅ venom-bot is installed successfully"
else
    echo "❌ venom-bot installation failed"
    exit 1
fi

# Check for old whatsapp-web.js
echo "🔍 Checking for old whatsapp-web.js..."
if npm list whatsapp-web.js; then
    echo "⚠️ Warning: whatsapp-web.js is still installed"
    echo "🔄 Removing whatsapp-web.js..."
    npm uninstall whatsapp-web.js
else
    echo "✅ whatsapp-web.js is not installed"
fi

echo "🎉 Force rebuild complete!"
echo "📤 Push these changes to trigger Railway rebuild"
