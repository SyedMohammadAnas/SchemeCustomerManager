# WhatsApp Integration for Unpaid Members

## Overview

This feature integrates the existing WhatsApp backend with the unpaid members dialog to send automated payment reminders to members who haven't completed their payments.

## Features

### 🔵 Bulk Reminder System
- **Send Bulk Reminder Button**: Sends reminders to all unpaid members at once
- **Progress Tracking**: Shows real-time progress during bulk sending
- **Error Handling**: Tracks failed messages and provides summary

### 🔵 Individual Reminder System
- **Individual Send Reminder Button**: Send reminder to specific members
- **Loading States**: Shows loading spinner while sending
- **Status Feedback**: Provides success/error feedback for each message

### 🔵 Smart Deadline Calculation
- **Automatic Deadline**: Calculates days remaining until the 11th of each month
- **Overdue Detection**: Automatically detects if payments are overdue
- **Dynamic Messages**: Generates different messages for pending vs overdue payments

## Technical Implementation

### 📁 Files Created/Modified

1. **`src/lib/whatsapp.ts`** - Core WhatsApp integration utilities
2. **`src/components/dashboard/unpaid-members-dialog.tsx`** - Updated with reminder functionality
3. **`src/lib/whatsapp-test.ts`** - Test utilities for verification

### 🔧 Key Functions

#### Deadline Calculation
```typescript
calculateDeadlineInfo(): {
  daysRemaining: number;
  deadlineDate: Date;
  isOverdue: boolean;
  currentMonth: string;
}
```

#### Message Generation
```typescript
generateReminderMessage(memberName: string, isOverdue: boolean): string
```

#### Bulk Sending
```typescript
sendBulkReminders(
  members: Array<Member>,
  onProgress?: (current: number, total: number, memberName: string) => void
): Promise<Results>
```

#### Individual Sending
```typescript
sendWhatsAppMessage(phoneNumber: string, message: string): Promise<Response>
```

**API Endpoint:** `POST /api/whatsapp/send-message`
**Request Body:** `{ phoneNumber: string, message: string }`

## Message Templates

### 📝 Pending Payment Reminder
```
🟡 *Payment Reminder*

Dear [Member Name],

This is a friendly reminder that your payment for [Month] is due on the 11th.

*Days remaining: [X]*

Please ensure timely payment to avoid any late fees.

Thank you for your cooperation.

*Rafi Scheme Team*
```

### 📝 Overdue Payment Alert
```
🔴 *Payment Overdue Alert*

Dear [Member Name],

Your payment for [Month] is *OVERDUE*. The deadline was 11th [Month].

Please complete your payment immediately to avoid any inconvenience.

Thank you for your prompt attention.

*Rafi Scheme Team*
```

## Setup Requirements

### 🔌 Backend Requirements
1. **WhatsApp Backend Running**: Ensure the WhatsApp backend is running on `http://localhost:3001`
2. **WhatsApp Connected**: Scan QR code to connect WhatsApp Web
3. **API Endpoints Available**:
   - `GET /api/whatsapp/status` - Check connection status
   - `POST /api/whatsapp/send-message` - Send messages

### 📱 Phone Number Formatting
The system automatically formats phone numbers:
- `+91 9032555222` → `919032555222`
- `9032555222` → `919032555222`
- `919032555222` → `919032555222` (unchanged)

## Usage Instructions

### 🚀 Using Bulk Reminders
1. Open the "Unpaid Members" dialog
2. Check that WhatsApp status shows "WhatsApp Ready" (green dot)
3. Click "Send Bulk Reminder" button
4. Monitor progress in real-time
5. Review results summary

### 🚀 Using Individual Reminders
1. Open the "Unpaid Members" dialog
2. Locate the specific member
3. Click "Send Reminder" button on their card
4. Wait for confirmation message

## Error Handling

### 🔴 Common Issues
1. **WhatsApp Not Connected**: Shows "WhatsApp Offline" status
2. **Backend Unavailable**: Network error when trying to send
3. **Invalid Phone Numbers**: Messages fail to send
4. **Rate Limiting**: Delays between messages to avoid blocking

### 🟡 Troubleshooting
1. **Check Backend Status**: Verify WhatsApp backend is running
2. **Scan QR Code**: Reconnect WhatsApp if needed
3. **Check Console**: Review error messages in browser console
4. **Test Connection**: Use test functions in browser console

## Testing

### 🧪 Test Functions
Open browser console and run:
```javascript
// Run all tests
whatsappTest.runAllTests()

// Individual tests
whatsappTest.testDeadlineCalculation()
whatsappTest.testPhoneNumberFormatting()
whatsappTest.testReminderMessageGeneration()
whatsappTest.testWhatsAppStatus()
```

### 🔍 Manual Testing
1. **Test Deadline Calculation**: Verify correct days remaining
2. **Test Message Generation**: Check message formatting
3. **Test Phone Formatting**: Verify number conversion
4. **Test API Connection**: Ensure backend communication works

## Security Considerations

### 🔒 Data Protection
- Phone numbers are only sent to WhatsApp backend
- No message content is stored permanently
- All communication uses HTTPS (in production)

### 🛡️ Rate Limiting
- 1-second delay between messages to avoid blocking
- Bulk sending includes progress tracking
- Error handling prevents spam

## Future Enhancements

### 🚀 Potential Improvements
1. **Message Templates**: Allow customizing reminder messages
2. **Scheduling**: Schedule reminders for specific times
3. **Analytics**: Track message delivery and response rates
4. **Bulk Operations**: Add more bulk operations (mark as reminded, etc.)
5. **Notification System**: Replace alerts with toast notifications

### 📊 Monitoring
1. **Delivery Reports**: Track successful vs failed deliveries
2. **Response Tracking**: Monitor member responses
3. **Usage Analytics**: Track reminder usage patterns

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify WhatsApp backend is running
3. Test API endpoints manually
4. Review this documentation

---

**Note**: This integration requires the WhatsApp backend to be running and properly configured. Make sure to follow the backend setup instructions in the `whatsapp-backend/README.md` file.
