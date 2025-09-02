# Railway Deployment Guide for WhatsApp Backend

## Overview
This guide covers the deployment of the WhatsApp backend service to Railway, including troubleshooting common issues.

## Prerequisites
- Railway account
- Docker knowledge
- Node.js 18+ environment

## Deployment Steps

### 1. Railway Configuration
- Use the provided `railway.toml` file for proper configuration
- Ensure environment variables are set correctly
- Allocate sufficient resources (minimum 512MB RAM recommended)

### 2. Environment Variables
Set these in Railway dashboard:
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
CHROME_BIN=/usr/bin/chromium-browser
CHROME_PATH=/usr/bin/chromium-browser
```

### 3. Resource Allocation
- **Memory**: Minimum 512MB, recommended 1GB
- **CPU**: 0.5-1.0 cores
- **Storage**: 1GB minimum

## Troubleshooting

### Chrome/Puppeteer Issues

#### Error: "Protocol error (Target.setAutoAttach): Target closed"
**Cause**: Chrome fails to start in containerized environment
**Solution**:
1. Verify Chrome installation in container
2. Check memory allocation
3. Ensure proper Chrome flags are set

#### Error: "Chrome not found"
**Cause**: Chrome executable path mismatch
**Solution**:
1. Check `PUPPETEER_EXECUTABLE_PATH` environment variable
2. Verify Chrome installation in Dockerfile
3. Run startup script to check Chrome availability

#### Error: "Memory pressure"
**Cause**: Insufficient memory for Chrome
**Solution**:
1. Increase Railway memory allocation
2. Add memory optimization flags
3. Restart deployment

### Connection Issues

#### WhatsApp client fails to initialize
**Solutions**:
1. Check logs for specific error messages
2. Verify network connectivity
3. Ensure proper authentication setup

#### QR code not generating
**Solutions**:
1. Check client initialization logs
2. Verify Puppeteer configuration
3. Restart the service

## Monitoring

### Health Checks
- Endpoint: `/health`
- Expected response: `{"status": "healthy", "whatsapp": "connected"}`

### Logs
Monitor these log patterns:
- `🚀 Initializing WhatsApp client...`
- `✅ Chrome found at /usr/bin/chromium-browser`
- `🎉 WhatsApp client is ready and connected!`

### Common Log Messages
- **Success**: `WhatsApp client is ready and connected!`
- **QR Code**: `New QR Code received, generating base64...`
- **Error**: `Failed to initialize WhatsApp client:`

## Performance Optimization

### Memory Usage
- Monitor memory consumption in Railway dashboard
- Chrome typically uses 200-400MB
- Node.js process uses 50-100MB

### Startup Time
- First deployment: 2-3 minutes
- Subsequent deployments: 1-2 minutes
- Chrome initialization: 30-60 seconds

## Security Considerations

### Environment Variables
- Never commit sensitive data
- Use Railway's environment variable system
- Rotate keys regularly

### Container Security
- Non-root user execution
- Minimal package installation
- Regular security updates

## Support

### Railway Support
- Check Railway status page
- Review deployment logs
- Contact Railway support for platform issues

### Application Issues
- Check application logs
- Verify configuration
- Test locally before deployment

## Rollback Strategy

### Quick Rollback
1. Use Railway's rollback feature
2. Revert to previous deployment
3. Check logs for issues

### Emergency Fixes
1. Update code locally
2. Test thoroughly
3. Deploy with proper configuration
