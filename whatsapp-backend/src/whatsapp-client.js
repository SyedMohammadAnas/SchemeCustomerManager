/**
 * WhatsApp Client Manager
 * Handles WhatsApp Web.js client initialization, QR code generation, and message sending
 * This module prevents circular dependencies by being a standalone client manager
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Global variables to store client state
let client = null;
let qrCodeData = null;
let isClientReady = false;
let connectionStatus = 'disconnected';

/**
 * Initialize WhatsApp client with proper event handlers
 * Sets up authentication and QR code generation
 */
function initializeWhatsAppClient() {
  console.log('🚀 Initializing WhatsApp client...');

  // Create new client instance with local authentication
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './whatsapp-session',
      clientId: 'rafi-scheme-client'
    }),
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ],
      timeout: 60000,
      protocolTimeout: 60000
    }
  });

  // Event handler for QR code generation
  client.on('qr', async (qr) => {
    console.log('🔄 New QR Code received, generating base64...');
    try {
      // Convert QR code to base64 for frontend display
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('✅ QR Code converted to base64 successfully');
      connectionStatus = 'qr_ready';
    } catch (error) {
      console.error('❌ Error converting QR to base64:', error);
      qrCodeData = null;
    }
  });

  // Event handler for successful authentication
  client.on('authenticated', () => {
    console.log('✅ WhatsApp client authenticated successfully');
    connectionStatus = 'authenticated';
  });

  // Event handler for client ready state
  client.on('ready', () => {
    console.log('🎉 WhatsApp client is ready and connected!');
    isClientReady = true;
    connectionStatus = 'ready';
    qrCodeData = null; // Clear QR code once connected
  });

  // Event handler for authentication failure
  client.on('auth_failure', (message) => {
    console.error('❌ Authentication failed:', message);
    connectionStatus = 'auth_failed';
    qrCodeData = null;
  });

  // Event handler for client disconnection
  client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp client disconnected:', reason);
    isClientReady = false;
    connectionStatus = 'disconnected';
    qrCodeData = null;
  });

  // Event handler for loading screen
  client.on('loading_screen', (percent, message) => {
    console.log(`📱 Loading: ${percent}% - ${message}`);
  });

  // Initialize the client with error handling
  client.initialize().catch(error => {
    console.error('❌ Failed to initialize WhatsApp client:', error);
    connectionStatus = 'initialization_failed';

    // Retry initialization after 30 seconds
    setTimeout(() => {
      console.log('🔄 Retrying WhatsApp client initialization...');
      initializeWhatsAppClient();
    }, 30000);
  });
}

/**
 * Get current WhatsApp connection state
 * Returns object with connection status and QR code if available
 */
function getWhatsAppState() {
  return {
    isReady: isClientReady,
    status: connectionStatus,
    qrCode: qrCodeData,
    hasQrCode: qrCodeData !== null
  };
}

/**
 * Get QR code data for frontend display
 * Returns base64 encoded QR code or null if not available
 */
function getQrCode() {
  return qrCodeData;
}

/**
 * Send WhatsApp message to specified number
 * @param {string} number - Phone number with country code (e.g., "1234567890")
 * @param {string} message - Message text to send
 * @returns {Promise<Object>} - Result object with success status and details
 */
async function sendWhatsAppMessage(number, message) {
  // Check if client is ready before sending
  if (!isClientReady || !client) {
    return {
      success: false,
      error: 'WhatsApp client is not ready. Please scan QR code first.'
    };
  }

  try {
    // Format phone number for WhatsApp (add @c.us suffix)
    const chatId = number.includes('@') ? number : `${number}@c.us`;

    // Send the message
    const sentMessage = await client.sendMessage(chatId, message);

    console.log(`✅ Message sent successfully to ${number}`);
    return {
      success: true,
      messageId: sentMessage.id._serialized,
      timestamp: sentMessage.timestamp,
      to: number
    };
  } catch (error) {
    console.error(`❌ Error sending message to ${number}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if WhatsApp client is ready for operations
 * @returns {boolean} - True if client is ready, false otherwise
 */
function isWhatsAppReady() {
  return isClientReady;
}

/**
 * Get client connection status
 * @returns {string} - Current connection status
 */
function getConnectionStatus() {
  return connectionStatus;
}

/**
 * Restart WhatsApp client connection
 * Useful for reconnecting after disconnection
 */
async function restartWhatsAppClient() {
  console.log('🔄 Restarting WhatsApp client...');

  if (client) {
    await client.destroy();
  }

  // Reset state variables
  client = null;
  qrCodeData = null;
  isClientReady = false;
  connectionStatus = 'disconnected';

  // Reinitialize client
  initializeWhatsAppClient();
}

// Export all functions for use in other modules
module.exports = {
  initializeWhatsAppClient,
  getWhatsAppState,
  getQrCode,
  sendWhatsAppMessage,
  isWhatsAppReady,
  getConnectionStatus,
  restartWhatsAppClient
};
