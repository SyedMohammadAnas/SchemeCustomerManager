/**
 * WhatsApp Connection Test
 * Tests the connection to the WhatsApp backend and verifies API endpoints
 */

import {
  checkBackendHealth,
  checkWhatsAppStatus,
  sendWhatsAppMessage,
  formatPhoneNumber,
  generateReminderMessage
} from './whatsapp'

/**
 * Test the complete WhatsApp integration
 */
export async function testWhatsAppIntegration() {
  console.log('🚀 Starting WhatsApp Integration Test\n')

  // Test 1: Check backend health
  console.log('📋 Test 1: Backend Health Check')
  console.log('='.repeat(40))
  const healthResult = await checkBackendHealth()
  console.log('Health Result:', healthResult)

  if (!healthResult.isAccessible) {
    console.error('❌ Backend is not accessible. Please ensure the WhatsApp backend is running on http://localhost:3001')
    return false
  }
  console.log('✅ Backend is accessible\n')

  // Test 2: Check WhatsApp status
  console.log('📋 Test 2: WhatsApp Status Check')
  console.log('='.repeat(40))
  const statusResult = await checkWhatsAppStatus()
  console.log('Status Result:', statusResult)

  if (!statusResult.isReady) {
    console.warn('⚠️ WhatsApp is not ready. Status:', statusResult.status)
    console.warn('This might be because the QR code needs to be scanned')
  } else {
    console.log('✅ WhatsApp is ready\n')
  }

  // Test 3: Test phone number formatting
  console.log('📋 Test 3: Phone Number Formatting')
  console.log('='.repeat(40))
  const testNumbers = [
    '+91 9032555222',
    '9032555222',
    '919032555222'
  ]

  testNumbers.forEach(number => {
    const formatted = formatPhoneNumber(number)
    console.log(`${number} → ${formatted}`)
  })
  console.log('✅ Phone number formatting test completed\n')

  // Test 4: Test message generation
  console.log('📋 Test 4: Message Generation')
  console.log('='.repeat(40))
  const testMessage = generateReminderMessage('Test User', false)
  console.log('Generated message preview:')
  console.log(testMessage.substring(0, 200) + '...')
  console.log('✅ Message generation test completed\n')

  // Test 5: Test sending a message (only if WhatsApp is ready)
  if (statusResult.isReady) {
    console.log('📋 Test 5: Send Test Message')
    console.log('='.repeat(40))

    // Use a test number - replace with your actual test number
    const testNumber = '917396926840' // Replace with your test number
    const testMessage = '🧪 This is a test message from the Rafi Scheme dashboard integration test.'

    try {
      const sendResult = await sendWhatsAppMessage(testNumber, testMessage)
      console.log('Send Result:', sendResult)

      if (sendResult.success) {
        console.log('✅ Test message sent successfully')
      } else {
        console.error('❌ Failed to send test message:', sendResult.error)
      }
    } catch (error) {
      console.error('❌ Error sending test message:', error)
    }
  } else {
    console.log('📋 Test 5: Send Test Message (Skipped)')
    console.log('='.repeat(40))
    console.log('⚠️ Skipping send test because WhatsApp is not ready')
  }

  console.log('\n🎉 WhatsApp Integration Test Completed!')
  return true
}

/**
 * Quick connection test
 */
export async function quickConnectionTest() {
  console.log('🔍 Quick Connection Test')

  try {
    const health = await checkBackendHealth()
    const status = await checkWhatsAppStatus()

    console.log('Backend Health:', health.isAccessible ? '✅ Online' : '❌ Offline')
    console.log('WhatsApp Status:', status.isReady ? '✅ Ready' : '⚠️ Not Ready')

    return {
      backendOnline: health.isAccessible,
      whatsappReady: status.isReady,
      status: status.status
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return {
      backendOnline: false,
      whatsappReady: false,
      status: 'error'
    }
  }
}

/**
 * Test individual API endpoints
 */
export async function testIndividualEndpoints() {
  console.log('🔍 Testing Individual API Endpoints\n')

  const endpoints = [
    { name: 'Backend Health', url: 'http://localhost:3001/health', method: 'GET' },
    { name: 'WhatsApp Status', url: 'http://localhost:3001/api/whatsapp/status', method: 'GET' },
    { name: 'WhatsApp Health', url: 'http://localhost:3001/api/whatsapp/health', method: 'GET' },
    { name: 'WhatsApp QR', url: 'http://localhost:3001/api/whatsapp/qr', method: 'GET' }
  ]

  for (const endpoint of endpoints) {
    console.log(`📋 Testing ${endpoint.name}`)
    console.log(`🔗 ${endpoint.method} ${endpoint.url}`)

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log(`📊 Status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Response:', result)
      } else {
        const errorText = await response.text()
        console.error('❌ Error:', errorText)
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
    }

    console.log('='.repeat(40) + '\n')
  }
}

/**
 * Test message sending with detailed logging
 */
export async function testMessageSending() {
  console.log('📤 Testing Message Sending\n')

  const testNumber = '917396926840' // Replace with your test number
  const testMessage = '🧪 Test message from Rafi Scheme Dashboard - ' + new Date().toISOString()

  console.log(`📱 Sending to: ${testNumber}`)
  console.log(`📝 Message: ${testMessage}`)

  try {
    const result = await sendWhatsAppMessage(testNumber, testMessage)

    if (result.success) {
      console.log('✅ Message sent successfully!')
      console.log('📦 Response data:', result.data)
    } else {
      console.error('❌ Failed to send message:')
      console.error('Error:', result.error)
      console.error('Message:', result.message)
    }
  } catch (error) {
    console.error('❌ Exception occurred:', error)
  }
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as { whatsappConnectionTest: Record<string, unknown> }).whatsappConnectionTest = {
    testWhatsAppIntegration,
    quickConnectionTest,
    testIndividualEndpoints,
    testMessageSending
  }
}
