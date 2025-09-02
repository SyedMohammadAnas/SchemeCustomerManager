# WhatsApp Integration Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue: HTTP 404 Error
**Error Message:** `HTTP error! status: 404`

**Root Cause:** WhatsApp backend is not running or not accessible

**Solutions:**

#### 1. Start WhatsApp Backend
```bash
# Navigate to backend directory
cd whatsapp-backend

# Install dependencies (if not done)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
🎉 ====================================
🚀 WhatsApp Backend server running!
🎉 ====================================
📍 Port: 3001
📱 Health check: http://localhost:3001/health
🔗 API base: http://localhost:3001/api/whatsapp
📋 API docs: http://localhost:3001/
🎉 ====================================
```

#### 2. Check Backend Health
Open browser console and run:
```javascript
// Check if backend is running
whatsappTest.testBackendHealth()

// Check WhatsApp status
whatsappTest.testWhatsAppStatus()
```

#### 3. Verify Port Configuration
- Backend should be running on `http://localhost:3001`
- Check if port 3001 is not used by another application
- If port is different, update `WHATSAPP_API_BASE` in `src/lib/whatsapp.ts`

### Issue: Network Error
**Error Message:** `Cannot connect to WhatsApp backend`

**Solutions:**
1. Ensure backend is running
2. Check firewall settings
3. Verify CORS configuration in backend
4. Try accessing `http://localhost:3001/health` directly in browser

### Issue: WhatsApp Not Ready
**Error Message:** `WhatsApp not ready`

**Solutions:**
1. Scan QR code when backend starts
2. Wait for "WhatsApp is connected and ready!" message
3. Check WhatsApp Web connection in your phone

## 🔧 Debugging Steps

### Step 1: Check Backend Status
```bash
# In terminal
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "service": "WhatsApp Backend Server",
    "status": "running",
    "uptime": 123.45,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Step 2: Check WhatsApp Status
```bash
# In terminal
curl http://localhost:3001/api/whatsapp/status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isReady": true,
    "status": "connected",
    "hasQrCode": false,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Step 3: Test Message Sending
```bash
# In terminal
curl -X POST http://localhost:3001/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919032555222", "message": "Test message"}'
```

## 🧪 Testing Commands

### Browser Console Testing
```javascript
// Run all tests
whatsappTest.runAllTests()

// Individual tests
whatsappTest.testBackendHealth()
whatsappTest.testWhatsAppStatus()
whatsappTest.testDeadlineCalculation()
whatsappTest.testPhoneNumberFormatting()
whatsappTest.testReminderMessageGeneration()
```

### Backend Testing
```bash
# Navigate to backend directory
cd whatsapp-backend

# Run backend tests
node test-api.js

# Run message tests
node test-message.js
```

## 🔍 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `HTTP error! status: 404` | Backend not running | Start backend with `npm start` |
| `Network error` | Backend unreachable | Check if backend is on correct port |
| `WhatsApp not ready` | WhatsApp not connected | Scan QR code |
| `Missing required fields` | Invalid request format | Check request body format |
| `Failed to send message` | WhatsApp API error | Check phone number format |

## 📱 Phone Number Format

**Correct Format:** `919032555222` (12 digits with 91 prefix)

**Examples:**
- `+91 9032555222` → `919032555222` ✅
- `9032555222` → `919032555222` ✅
- `919032555222` → `919032555222` ✅

## 🔄 Restart Process

If issues persist:

1. **Stop Backend:**
   ```bash
   # Press Ctrl+C in backend terminal
   ```

2. **Clear Node Modules:**
   ```bash
   cd whatsapp-backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Restart Backend:**
   ```bash
   npm start
   ```

4. **Scan QR Code:**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Scan the QR code shown in terminal

5. **Test Connection:**
   ```javascript
   // In browser console
   whatsappTest.testBackendHealth()
   whatsappTest.testWhatsAppStatus()
   ```

## 📞 Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify backend logs in terminal
3. Test API endpoints manually with curl
4. Check WhatsApp Web connection on your phone

---

**Note:** Always ensure the WhatsApp backend is running before using the reminder features in the dashboard.
