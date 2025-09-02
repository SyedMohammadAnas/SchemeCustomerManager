# Quick Railway Deployment Guide

## 🚀 Deploy to Railway

### 1. **Deploy the Updated Code**
- Push all changes to your repository
- Railway will automatically rebuild with the new configuration

### 2. **Set Environment Variables in Railway Dashboard**
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
CHROME_BIN=/usr/bin/chromium-browser
CHROME_PATH=/usr/bin/chromium-browser
```

### 3. **Allocate Resources**
- **Memory**: Set to 1GB minimum
- **CPU**: 0.5-1.0 cores
- **Storage**: 1GB minimum

### 4. **Enable Persistent Volumes**
In Railway dashboard, add these volume mounts:
- `/app/tokens` → `tokens`
- `/app/logs` → `logs`
- `/app/sessions` → `sessions`

### 5. **Monitor Deployment**
Watch logs for:
- ✅ `Chrome found at /usr/bin/chromium-browser`
- ✅ `Venom Bot client created successfully`
- ✅ `WhatsApp client is ready and connected!`

## 🔧 **What's Fixed**

- **Switched to Venom Bot** - Better Chrome support
- **Persistent Sessions** - WhatsApp sessions survive restarts
- **Robust Chrome Config** - 40+ optimization flags
- **Auto-retry Logic** - Handles temporary failures
- **Volume Persistence** - Data survives deployments

## 📱 **Test After Deployment**

1. Check health: `https://your-app.railway.app/health`
2. Get QR code: `https://your-app.railway.app/api/whatsapp/qr`
3. Send test message: `https://your-app.railway.app/api/whatsapp/send`

## 🎯 **Expected Success Logs**
```
🚀 Starting WhatsApp Backend...
✅ Chrome found at /usr/bin/chromium-browser
✅ Persistent storage setup complete
🎉 Starting Node.js application...
🚀 Initializing WhatsApp client with Venom Bot...
✅ Venom Bot client created successfully
🔄 New QR Code received, generating base64...
🎉 WhatsApp client is ready and connected!
```
