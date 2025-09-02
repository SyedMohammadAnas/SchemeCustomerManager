/**
 * WhatsApp Integration Utilities
 * Handles communication with the WhatsApp backend for sending reminder messages
 */

// WhatsApp backend API configuration
const WHATSAPP_API_BASE = 'http://localhost:3001';

/**
 * WhatsApp API Response Types
 */
interface WhatsAppResponse {
  success?: boolean;
  status?: string;
  message?: string;
  data?: {
    messageId?: string;
    timestamp?: string;
    to?: string;
    message?: string;
  };
  error?: string;
  // Backend might return different formats
  [key: string]: any;
}

/**
 * Calculate days remaining until the 11th deadline
 * @returns Object containing days remaining and deadline information
 */
export function calculateDeadlineInfo(): {
  daysRemaining: number;
  deadlineDate: Date;
  isOverdue: boolean;
  currentMonth: string;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Create deadline date (11th of current month)
  const deadlineDate = new Date(currentYear, currentMonth, 11);

  // If we're past the 11th, the deadline is the 11th of next month
  if (now.getDate() > 11) {
    deadlineDate.setMonth(currentMonth + 1);
  }

  // Calculate days remaining
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Check if overdue (past the 11th)
  const isOverdue = now.getDate() > 11;

  // Get current month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonth];

  return {
    daysRemaining: Math.max(0, daysRemaining),
    deadlineDate,
    isOverdue,
    currentMonth: currentMonthName
  };
}

/**
 * Format phone number for WhatsApp API
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // If number starts with 91 (India), keep it
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }

  // If number is 10 digits, add 91 prefix
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  // If number is 12 digits and starts with 91, return as is
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }

  // Return cleaned number as fallback
  return cleaned;
}

/**
 * Generate reminder message for unpaid members
 * @param memberName - Name of the member
 * @param isOverdue - Whether payment is overdue
 * @returns Formatted reminder message
 */
export function generateReminderMessage(memberName: string, isOverdue: boolean = false): string {
  const { daysRemaining, currentMonth, isOverdue: deadlineOverdue } = calculateDeadlineInfo();

  if (isOverdue || deadlineOverdue) {
    return `🔴 *Payment Overdue Alert*

Dear ${memberName},

Your payment for ${currentMonth} is *OVERDUE*. The deadline was 11th ${currentMonth}.

Please complete your payment immediately to avoid any inconvenience.

Thank you for your prompt attention.

*Rafi Scheme Team*`;
  } else {
    return `⚠️ *PAYMENT REMINDER*

Dear ${memberName},
This is a friendly reminder that your payment for *${currentMonth}* is due on the *11th*.
Please ensure timely payment to avoid any late fees.

*${daysRemaining} Days remaining*

Thank you for your cooperation.

Yours Truly,
*Syed Rafi, Ponnur.*`;
  }
}

/**
 * Send WhatsApp message using the backend API
 * @param phoneNumber - Recipient's phone number
 * @param message - Message content
 * @returns Promise with API response
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    console.log(`📤 Sending WhatsApp message to ${formattedNumber}`);
    console.log(`🔗 API URL: ${WHATSAPP_API_BASE}/api/whatsapp/send-message`);

    const requestBody = {
      phoneNumber: formattedNumber,
      message: message
    };

    console.log(`📦 Request body:`, requestBody);

    const response = await fetch(`${WHATSAPP_API_BASE}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result: WhatsAppResponse = await response.json();

    // Log the actual response for debugging
    console.log(`📦 Backend response:`, result);

    // Check for success in different possible formats
    const isSuccess = result.success === true ||
                     result.status === 'success' ||
                     result.message === 'Message sent successfully' ||
                     (result.data && result.data.messageId);

    if (isSuccess) {
      console.log(`✅ Message sent successfully to ${formattedNumber}`);
      return {
        success: true,
        data: result.data,
        message: result.message || 'Message sent successfully'
      };
    } else {
      console.error(`❌ Failed to send message to ${formattedNumber}:`, result.error || result.message);
      return {
        success: false,
        error: result.error || 'Unknown error',
        message: result.message || 'Failed to send message'
      };
    }
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message to ${phoneNumber}:`, error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error',
        message: 'Cannot connect to WhatsApp backend. Please ensure the backend is running on http://localhost:3001'
      };
    }

    return {
      success: false,
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send bulk reminder messages to multiple members
 * @param members - Array of members to send reminders to
 * @param onProgress - Callback function for progress updates
 * @returns Promise with results summary
 */
export async function sendBulkReminders(
  members: Array<{ id: number; full_name: string; mobile_number: string; payment_status: string }>,
  onProgress?: (current: number, total: number, memberName: string) => void
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ memberId: number; memberName: string; error: string }>;
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as Array<{ memberId: number; memberName: string; error: string }>
  };

  console.log(`📤 Starting bulk reminder to ${members.length} members`);

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const isOverdue = member.payment_status === 'overdue';

    // Update progress
    onProgress?.(i + 1, members.length, member.full_name);

    // Generate reminder message
    const message = generateReminderMessage(member.full_name, isOverdue);

    // Send message
    const result = await sendWhatsAppMessage(member.mobile_number, message);

    if (result.success === true) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({
        memberId: member.id,
        memberName: member.full_name,
        error: result.error || result.message || 'Unknown error'
      });
    }

    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`📊 Bulk reminder completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

/**
 * Check if WhatsApp backend is accessible
 * @returns Promise with backend accessibility status
 */
export async function checkBackendHealth(): Promise<{
  isAccessible: boolean;
  status: string;
  error?: string;
}> {
  try {
    console.log(`🔍 Checking backend health at ${WHATSAPP_API_BASE}/health`);

    const response = await fetch(`${WHATSAPP_API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Health check status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      isAccessible: true,
      status: 'Backend is running'
    };
  } catch (error) {
    console.error('❌ Error checking backend health:', error);
    return {
      isAccessible: false,
      status: 'Backend not accessible',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check WhatsApp backend connection status
 * @returns Promise with connection status
 */
export async function checkWhatsAppStatus(): Promise<{
  isReady: boolean;
  status: string;
  error?: string;
}> {
  try {
    // First check if backend is accessible
    const healthCheck = await checkBackendHealth();
    if (!healthCheck.isAccessible) {
      return {
        isReady: false,
        status: 'Backend not running',
        error: healthCheck.error
      };
    }

    const response = await fetch(`${WHATSAPP_API_BASE}/api/whatsapp/status`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      isReady: result.data?.isReady || false,
      status: result.data?.status || 'unknown'
    };
  } catch (error) {
    console.error('❌ Error checking WhatsApp status:', error);
    return {
      isReady: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
