/**
 * WhatsApp Production Backend Connection Test
 * Test utility to verify the connection to the production WhatsApp backend
 */

import { checkBackendHealth, checkWhatsAppStatus, sendWhatsAppMessage } from './whatsapp'

/**
 * Test the production WhatsApp backend connection
 * This function can be called from the browser console for testing
 */
export async function testProductionWhatsAppConnection(): Promise<boolean> {
  console.log('🚀 Testing Production WhatsApp Backend Connection')
  console.log('='.repeat(50))

  try {
    // Test 1: Backend Health Check
    console.log('📋 Test 1: Backend Health Check')
    const healthResult = await checkBackendHealth()
    console.log('✅ Backend Health:', healthResult)

    if (!healthResult.isAccessible) {
      console.error('❌ Backend is not accessible!')
      return false
    }

    // Test 2: WhatsApp Status Check
    console.log('\n📋 Test 2: WhatsApp Status Check')
    const statusResult = await checkWhatsAppStatus()
    console.log('✅ WhatsApp Status:', statusResult)

    // Test 3: Send Test Message (only if WhatsApp is ready)
    if (statusResult.isReady) {
      console.log('\n📋 Test 3: Send Test Message')
      const testNumber = '917396926840'
      const testMessage = `🧪 Test message from Rafi Scheme Dashboard - ${new Date().toISOString()}`

      console.log(`📱 Sending test message to: ${testNumber}`)
      const sendResult = await sendWhatsAppMessage(testNumber, testMessage)
      console.log('✅ Send Result:', sendResult)

      if (sendResult.success) {
        console.log('🎉 Test message sent successfully!')
      } else {
        console.error('❌ Failed to send test message:', sendResult.error)
      }
    } else {
      console.log('\n📋 Test 3: Send Test Message (Skipped)')
      console.log('⚠️ WhatsApp is not ready, skipping send test')
    }

    console.log('\n🎉 Production WhatsApp Backend Connection Test Completed!')
    return true
  } catch (error) {
    console.error('❌ Error during connection test:', error)
    return false
  }
}

/**
 * Quick status check for production backend
 */
export async function quickProductionStatusCheck(): Promise<{
  backendOnline: boolean
  whatsappReady: boolean
  status: string
}> {
  console.log('🔍 Quick Production Status Check')

  try {
    const [health, status] = await Promise.all([
      checkBackendHealth(),
      checkWhatsAppStatus()
    ])

    return {
      backendOnline: health.isAccessible,
      whatsappReady: status.isReady,
      status: status.status
    }
  } catch (_err) {
    return {
      backendOnline: false,
      whatsappReady: false,
      status: 'error'
    }
  }
}

// SAFELY attach functions to window without using ANY
declare global {
  interface Window {
    testProductionWhatsApp?: {
      testProductionWhatsAppConnection: () => Promise<boolean>
      quickProductionStatusCheck: () => Promise<{
        backendOnline: boolean
        whatsappReady: boolean
        status: string
      }>
    }
  }
}

if (typeof window !== 'undefined') {
  window.testProductionWhatsApp = {
    testProductionWhatsAppConnection,
    quickProductionStatusCheck
  }
}
