/**
 * WhatsApp Integration Utilities
 * Handles communication with the WhatsApp backend for sending reminder messages
 */

import { Member, MonthTable } from './supabase'

// WhatsApp backend API configuration
const WHATSAPP_API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
console.log('WHATSAPP_API_BASE', WHATSAPP_API_BASE);

/**
 * WhatsApp API Response Types
 */
interface WhatsAppResponse {
  success: boolean;
  data?: {
    messageId?: string;
    timestamp?: string;
    to?: string;
    message?: string;
    isReady?: boolean;
    connectionStatus?: string;
    clientId?: string;
  };
  message?: string;
  error?: string;
  timestamp?: string;
}

interface WhatsAppStatusResponse {
  success: boolean;
  data: {
    isReady: boolean;
    connectionStatus: string;
    timestamp: string;
    clientId: string;
  };
  message: string;
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
  const cleaned = phoneNumber.replace(/\D/g, '');

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
  const { currentMonth, isOverdue: deadlineOverdue } = calculateDeadlineInfo();

  if (isOverdue || deadlineOverdue) {
    return `🔴 *Payment Overdue Alert*

Dear ${memberName},

Your payment for ${currentMonth} is *OVERDUE*. The deadline was 11th ${currentMonth}.

Please complete your payment immediately to avoid any inconvenience.

Thank you for your prompt attention.

*Rafi Scheme Team*`;
  } else {
    return `
⚠️ *PAYMENT REMINDER*

Respected ${memberName},

You are kindly requested to pay the scheme amount of *₹2000* on or before the *10th*.
On the *11th at 7:00 PM*, the Scheme Draw will be conducted.
Those who have the opportunity may come directly to the shop, pay *₹2000*, and collect the receipt.

Yours,
*Syed Rafi, Ponnur.*

-----------------------------------------------
⚠️ *చెల్లింపు గుర్తు*

గౌరవనీయులైన ${memberName} గారికి,

స్కీం తాలూకు కట్టవలసిన *₹2000* *10 తారీకు* లోపు చెల్లించవలసినదిగా కోరుచున్నాను.
*11 వ తారీకు సాయంత్రము 7 గంటలకు* షాపులు డ్రా తీయబడును.
అవకాశం ఉన్నవాళ్లు షాపు దగ్గరికి వచ్చి *₹2000* కట్టి రసీదు తీసుకోవాల్సిందిగా కోరుచున్నాను.

భక్తితో,
*సయ్యద్ రఫీ, పొన్నూరు.*
`
  }
}

/**
 * Generate token assignment message for members
 * @param memberName - Name of the member
 * @param tokenNumber - Assigned token number
 * @returns Formatted token assignment message
 */
export function generateTokenAssignmentMessage(memberName: string, tokenNumber: number): string {
  return `⚠️ *TOKEN NUMBER INFORMATION*

Respected ${memberName},

Your scheme token number is *${tokenNumber}*.
This token number will remain permanent for *16 months*.
The numbers will not change in between, and in the draw as well, this same token number *${tokenNumber}* will be considered.

---------------------------------

గౌరవనీయులైన ${memberName},

మీ యొక్క స్కీం టోకెన్ నెంబరు *${tokenNumber}*.
మీకు పంపించబడుతున్న ఈ టోకెన్ నంబరు ఇక పర్మనెంట్ గా *16 నెలలు* ఇదే నంబరు ఉంటుంది.
మధ్యలో నంబర్లు మారవు, డ్రాలో కూడా ఈ టోకెన్ నంబరు *${tokenNumber}* తీయబడును.

*Rafi Scheme Team*`;
}

/**
 * Generate draw reminder message for all members
 * @returns Formatted draw reminder message
 */
export function generateDrawReminderMessage(): string {
  return `⚠️SHEME DRAW

Today at 7:00 PM there will be a draw with all the paid customers, please stay tuned and look forward for the results

Hoping the best of luck for you

-----------------------------------

⚠️ స్కీమ్ డ్రా

ఈరోజు సాయంత్రం 7:00 గంటలకు అన్ని పేమెంట్ చేసిన కస్టమర్స్ కోసం డ్రా ఉంటుంది.
దయచేసి స్టే ట్యూన్ గా ఉండండి మరియు రిజల్ట్స్ కోసం వెయిట్ చేయండి.

మీకు బెస్ట్ ఆఫ్ లక్!

*Rafi Scheme Team*`;
}

/**
 * Generate receipt message for WhatsApp
 * @param member - Member object with all details
 * @param currentMonth - Current month information
 * @returns Formatted receipt message for WhatsApp
 */
export function generateReceiptMessage(member: Member, currentMonth: MonthTable): string {
  const getPaymentDate = () => {
    if (member.payment_status === 'paid') {
      const date = new Date(member.updated_at)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const formatTokenDisplay = (tokenNumber: number) => {
    return `#${tokenNumber.toString().padStart(2, '0')}`
  }

  const formatMonthName = (month: MonthTable) => {
    const [monthName, year] = month.split('_')
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
  }

  return `📄 *PAYMENT RECEIPT*

*RAFI GOLD SAVING SCHEME*

*Token Number:* ${member.token_number ? formatTokenDisplay(member.token_number) : 'N/A'}
*Member Name:* ${member.full_name}
*Mobile:* ${formatPhoneNumber(member.mobile_number)}
*Family:* ${member.family}
*Month:* ${formatMonthName(currentMonth)}
*Amount:* ₹2000
*Payment Status:* ${member.payment_status.toUpperCase()}
${member.paid_to ? `*Paid To:* ${member.paid_to}` : ''}
*Payment Date:* ${getPaymentDate()}

Thank you for your payment!

Generated on: ${new Date().toLocaleDateString()}

*RAFI GOLD SAVING SCHEME*
This receipt serves as proof of payment.`
}

/**
 * Send token assignment messages to multiple members with retry mechanism
 * @param members - Array of members with token numbers assigned
 * @param onProgress - Callback function for progress updates
 * @returns Promise with results summary
 */
export async function sendTokenAssignmentMessages(
  members: Array<{ id: number; full_name: string; mobile_number: string; token_number: number }>,
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

  console.log(`📤 Starting token assignment messages to ${members.length} members`);

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Skip members without token numbers
    if (!member.token_number) {
      console.log(`⚠️ Skipping ${member.full_name} - no token number assigned`);
      continue;
    }

    // Update progress
    onProgress?.(i + 1, members.length, member.full_name);

    // Generate token assignment message
    const message = generateTokenAssignmentMessage(member.full_name, member.token_number);

    // Send message with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    let messageSent = false;

    while (retryCount < maxRetries && !messageSent) {
      try {
        const result = await sendWhatsAppMessage(member.mobile_number, message);

        if (result.success === true) {
          results.sent++;
          console.log(`✅ Token assignment message sent to ${member.full_name} (Token: ${member.token_number})`);
          messageSent = true;
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name}: ${result.error}`);
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          } else {
            results.failed++;
            results.errors.push({
              memberId: member.id,
              memberName: member.full_name,
              error: result.error || result.message || 'Unknown error'
            });
            console.error(`❌ Failed to send token assignment message to ${member.full_name} after ${maxRetries} retries:`, result.error);
          }
        }
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name} due to error:`, error);
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        } else {
          results.failed++;
          results.errors.push({
            memberId: member.id,
            memberName: member.full_name,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`❌ Failed to send token assignment message to ${member.full_name} after ${maxRetries} retries:`, error);
        }
      }
    }

    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`📊 Token assignment messages completed: ${results.sent} sent, ${results.failed} failed`);

  if (results.failed > 0) {
    console.warn(`⚠️ ${results.failed} messages failed. Consider retrying failed messages.`);
  }

  return results;
}



/**
 * Send WhatsApp message using the backend API with improved error handling
 * @param phoneNumber - Recipient's phone number
 * @param message - Message content
 * @returns Promise with API response
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string; message?: string; data?: WhatsAppResponse['data'] }> {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    console.log(`📤 Sending WhatsApp message to ${formattedNumber}`);

    const requestBody = {
      number: formattedNumber,
      message: message
    };

    const response = await fetch(`${WHATSAPP_API_BASE}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result: WhatsAppResponse = await response.json();

    // Check for success in the response
    if (result.success === true) {
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
        message: 'Cannot connect to WhatsApp backend. Please ensure the backend is running on ' + WHATSAPP_API_BASE
      };
    }

    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'TimeoutError') {
      return {
        success: false,
        error: 'Timeout error',
        message: 'Request timed out. Please try again.'
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
 * Send draw reminder messages to all members
 * @param members - Array of all members to send draw reminders to
 * @param onProgress - Callback function for progress updates
 * @returns Promise with results summary
 */
export async function sendDrawReminders(
  members: Array<{ id: number; full_name: string; mobile_number: string }>,
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

  console.log(`📤 Starting draw reminder to ${members.length} members`);

  // Generate the draw reminder message once
  const message = generateDrawReminderMessage();

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Update progress
    onProgress?.(i + 1, members.length, member.full_name);

    // Send message with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    let messageSent = false;

    while (retryCount < maxRetries && !messageSent) {
      try {
        const result = await sendWhatsAppMessage(member.mobile_number, message);

        if (result.success === true) {
          results.sent++;
          console.log(`✅ Draw reminder sent to ${member.full_name}`);
          messageSent = true;
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name}: ${result.error}`);
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          } else {
            results.failed++;
            results.errors.push({
              memberId: member.id,
              memberName: member.full_name,
              error: result.error || result.message || 'Unknown error'
            });
            console.error(`❌ Failed to send draw reminder to ${member.full_name} after ${maxRetries} retries:`, result.error);
          }
        }
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name} due to error:`, error);
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        } else {
          results.failed++;
          results.errors.push({
            memberId: member.id,
            memberName: member.full_name,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`❌ Failed to send draw reminder to ${member.full_name} after ${maxRetries} retries:`, error);
        }
      }
    }

    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`📊 Draw reminder completed: ${results.sent} sent, ${results.failed} failed`);

  if (results.failed > 0) {
    console.warn(`⚠️ ${results.failed} draw reminder messages failed. Consider retrying failed messages.`);
  }

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

    const healthData = await response.json();
    console.log(`📦 Health data:`, healthData);

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

    console.log(`🔍 Checking WhatsApp status at ${WHATSAPP_API_BASE}/api/whatsapp/status`);

    const response = await fetch(`${WHATSAPP_API_BASE}/api/whatsapp/status`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: WhatsAppStatusResponse = await response.json();
    console.log(`📦 Status response:`, result);

    // Extract status from the nested data structure
    const isReady = result.data?.isReady || false;
    const status = result.data?.connectionStatus || 'unknown';

    return {
      isReady,
      status
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

/**
 * Send bulk receipt messages to paid members
 * @param members - Array of paid members to send receipts to
 * @param currentMonth - Current month information
 * @param onProgress - Callback function for progress updates
 * @returns Promise with results summary
 */
export async function sendBulkReceipts(
  members: Array<{ id: number; full_name: string; mobile_number: string; payment_status: string; token_number?: number | null; paid_to?: string | null; updated_at: string }>,
  currentMonth: MonthTable,
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

  // Filter only paid members
  const paidMembers = members.filter(member => member.payment_status === 'paid');

  if (paidMembers.length === 0) {
    console.log('⚠️ No paid members found to send receipts to');
    return {
      ...results,
      success: false,
      errors: [{ memberId: 0, memberName: 'No paid members', error: 'No paid members found' }]
    };
  }

  console.log(`📤 Starting bulk receipt sending to ${paidMembers.length} paid members`);

  for (let i = 0; i < paidMembers.length; i++) {
    const member = paidMembers[i];

    // Update progress
    onProgress?.(i + 1, paidMembers.length, member.full_name);

    // Generate receipt message
    const message = generateReceiptMessage(member as Member, currentMonth);

    // Send message with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    let messageSent = false;

    while (retryCount < maxRetries && !messageSent) {
      try {
        const result = await sendWhatsAppMessage(member.mobile_number, message);

        if (result.success === true) {
          results.sent++;
          console.log(`✅ Receipt sent to ${member.full_name} (Token: ${member.token_number || 'N/A'})`);
          messageSent = true;
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name}: ${result.error}`);
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          } else {
            results.failed++;
            results.errors.push({
              memberId: member.id,
              memberName: member.full_name,
              error: result.error || result.message || 'Unknown error'
            });
            console.error(`❌ Failed to send receipt to ${member.full_name} after ${maxRetries} retries:`, result.error);
          }
        }
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${member.full_name} due to error:`, error);
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        } else {
          results.failed++;
          results.errors.push({
            memberId: member.id,
            memberName: member.full_name,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`❌ Failed to send receipt to ${member.full_name} after ${maxRetries} retries:`, error);
        }
      }
    }

    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`📊 Bulk receipt sending completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
}
