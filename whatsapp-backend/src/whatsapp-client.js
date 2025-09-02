/**
 * WhatsApp Client Manager using Venom Bot
 * Handles WhatsApp Web client initialization, QR code generation, and message sending
 * This module provides better Chrome support and persistent sessions
 */

const venom = require('venom-bot');
const qrcode = require('qrcode');

// Global variables to store client state
let client = null;
let qrCodeData = null;
let isClientReady = false;
let connectionStatus = 'disconnected';

/**
 * Initialize WhatsApp client with Venom Bot
 * Sets up authentication and QR code generation with persistent sessions
 */
function initializeWhatsAppClient() {
  console.log('🚀 Initializing WhatsApp client with Venom Bot...');

  // Create new client instance with proper configuration
  venom
    .create({
      session: 'rafi-scheme-session',
      multidevice: true,
      headless: true,
      useChrome: true,
      debug: false,
      logQR: true,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-background-downloads',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--remote-debugging-port=9222',
        '--remote-debugging-address=0.0.0.0',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-background-downloads',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
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
      puppeteerOptions: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-blink-features=AutomationControlled',
          '--no-default-browser-check',
          '--disable-default-apps',
          '--disable-popup-blocking',
          '--disable-translate',
          '--disable-background-networking',
          '--disable-sync',
          '--disable-background-downloads',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-domain-reliability',
          '--disable-features=AudioServiceOutOfProcess',
          '--disable-hang-monitor',
          '--memory-pressure-off',
          '--max_old_space_size=4096',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--remote-debugging-port=9222',
          '--remote-debugging-address=0.0.0.0'
        ],
        timeout: 120000,
        protocolTimeout: 120000,
        ignoreDefaultArgs: ['--disable-extensions'],
        defaultViewport: {
          width: 1280,
          height: 720
        }
      }
    })
    .then((venomClient) => {
      client = venomClient;
      console.log('✅ Venom Bot client created successfully');
      connectionStatus = 'initialized';
    })
    .catch((error) => {
      console.error('❌ Failed to create Venom Bot client:', error);
      connectionStatus = 'initialization_failed';

      // Retry initialization after 30 seconds
      setTimeout(() => {
        console.log('🔄 Retrying WhatsApp client initialization...');
        initializeWhatsAppClient();
      }, 30000);
    });

  // Event handler for QR code generation
  client?.on('qr', async (qr) => {
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
  client?.on('authenticated', () => {
    console.log('✅ WhatsApp client authenticated successfully');
    connectionStatus = 'authenticated';
  });

  // Event handler for client ready state
  client?.on('ready', () => {
    console.log('🎉 WhatsApp client is ready and connected!');
    isClientReady = true;
    connectionStatus = 'ready';
    qrCodeData = null; // Clear QR code once connected
  });

  // Event handler for authentication failure
  client?.on('auth_failure', (message) => {
    console.error('❌ Authentication failed:', message);
    connectionStatus = 'auth_failed';
    qrCodeData = null;
  });

  // Event handler for client disconnection
  client?.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp client disconnected:', reason);
    isClientReady = false;
    connectionStatus = 'disconnected';
    qrCodeData = null;
  });

  // Event handler for loading screen
  client?.on('loading_screen', (percent, message) => {
    console.log(`📱 Loading: ${percent}% - ${message}`);
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
    // Format phone number for WhatsApp (add @c.us suffix if needed)
    const chatId = number.includes('@') ? number : `${number}@c.us`;

    // Send the message using Venom Bot
    const sentMessage = await client.sendText(chatId, message);

    console.log(`✅ Message sent successfully to ${number}`);
    return {
      success: true,
      messageId: sentMessage.id,
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
    await client.close();
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
