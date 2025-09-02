/**
 * WhatsApp Integration Test Utilities
 * Test functions to verify WhatsApp integration works correctly
 */

import {
  calculateDeadlineInfo,
  formatPhoneNumber,
  generateReminderMessage,
  checkWhatsAppStatus,
  checkBackendHealth
} from './whatsapp'

/**
 * Test deadline calculation
 */
export function testDeadlineCalculation() {
  console.log('🧪 Testing deadline calculation...')

  const deadlineInfo = calculateDeadlineInfo()
  console.log('📅 Deadline Info:', deadlineInfo)

  return deadlineInfo
}

/**
 * Test phone number formatting
 */
export function testPhoneNumberFormatting() {
  console.log('🧪 Testing phone number formatting...')

  const testNumbers = [
    '+91 9032555222',
    '9032555222',
    '919032555222',
    '+919032555222',
    '9032555222'
  ]

  testNumbers.forEach(number => {
    const formatted = formatPhoneNumber(number)
    console.log(`📱 ${number} → ${formatted}`)
  })
}

/**
 * Test reminder message generation
 */
export function testReminderMessageGeneration() {
  console.log('🧪 Testing reminder message generation...')

  const testCases = [
    { name: 'John Doe', isOverdue: false },
    { name: 'Jane Smith', isOverdue: true },
    { name: 'Test User', isOverdue: false }
  ]

  testCases.forEach(testCase => {
    const message = generateReminderMessage(testCase.name, testCase.isOverdue)
    console.log(`\n📝 Message for ${testCase.name} (${testCase.isOverdue ? 'Overdue' : 'Pending'}):`)
    console.log(message)
  })
}

/**
 * Test backend health check
 */
export async function testBackendHealth() {
  console.log('🧪 Testing backend health check...')

  try {
    const health = await checkBackendHealth()
    console.log('🏥 Backend Health:', health)
    return health
  } catch (error) {
    console.error('❌ Error checking backend health:', error)
    return null
  }
}

/**
 * Test WhatsApp status check
 */
export async function testWhatsAppStatus() {
  console.log('🧪 Testing WhatsApp status check...')

  try {
    const status = await checkWhatsAppStatus()
    console.log('📊 WhatsApp Status:', status)
    return status
  } catch (error) {
    console.error('❌ Error checking WhatsApp status:', error)
    return null
  }
}

/**
 * Test actual backend response format
 */
export async function testBackendResponseFormat() {
  console.log('🧪 Testing backend response format...')

  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '917396926840',
        message: 'Test message from frontend'
      }),
    });

    console.log(`📊 Response status: ${response.status}`)

    if (response.ok) {
      const result = await response.json()
      console.log('📦 Actual backend response:', result)
      return result
    } else {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      return null
    }
  } catch (error) {
    console.error('❌ Error testing backend response:', error)
    return null
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Running WhatsApp Integration Tests\n')

  // Test deadline calculation
  testDeadlineCalculation()
  console.log('\n' + '='.repeat(50) + '\n')

  // Test phone number formatting
  testPhoneNumberFormatting()
  console.log('\n' + '='.repeat(50) + '\n')

  // Test reminder message generation
  testReminderMessageGeneration()
  console.log('\n' + '='.repeat(50) + '\n')

  // Test backend health
  await testBackendHealth()
  console.log('\n' + '='.repeat(50) + '\n')

  // Test WhatsApp status
  await testWhatsAppStatus()

  console.log('\n✅ All tests completed!')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).whatsappTest = {
    testDeadlineCalculation,
    testPhoneNumberFormatting,
    testReminderMessageGeneration,
    testBackendHealth,
    testWhatsAppStatus,
    testBackendResponseFormat,
    runAllTests
  }
}
