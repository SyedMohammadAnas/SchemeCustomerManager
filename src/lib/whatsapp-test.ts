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
  export function testDeadlineCalculation(): unknown {
    console.log('🧪 Testing deadline calculation...')

    const deadlineInfo = calculateDeadlineInfo()
    console.log('📅 Deadline Info:', deadlineInfo)

    return deadlineInfo
  }

  /**
   * Test phone number formatting
   */
  export function testPhoneNumberFormatting(): void {
    console.log('🧪 Testing phone number formatting...')

    const testNumbers: string[] = [
      '+91 9032555222',
      '9032555222',
      '919032555222',
      '+919032555222',
      '9032555222'
    ]

    testNumbers.forEach((number: string) => {
      const formatted = formatPhoneNumber(number)
      console.log(`📱 ${number} → ${formatted}`)
    })
  }

  /**
   * Test reminder message generation
   */
  export function testReminderMessageGeneration(): void {
    console.log('🧪 Testing reminder message generation...')

    const testCases: { name: string; isOverdue: boolean }[] = [
      { name: 'John Doe', isOverdue: false },
      { name: 'Jane Smith', isOverdue: true },
      { name: 'Test User', isOverdue: false }
    ]

    testCases.forEach((testCase) => {
      const message = generateReminderMessage(testCase.name, testCase.isOverdue)
      console.log(`\n📝 Message for ${testCase.name} (${testCase.isOverdue ? 'Overdue' : 'Pending'}):`)
      console.log(message)
    })
  }

  /**
   * Test backend health check
   */
  export async function testBackendHealth(): Promise<unknown> {
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
  export async function testWhatsAppStatus(): Promise<unknown> {
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
  export async function testBackendResponseFormat(): Promise<unknown> {
    console.log('🧪 Testing backend response format...')

    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: '917396926840',
          message: 'Test message from frontend'
        })
      })

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
   * Test health endpoint response
   */
  export async function testHealthEndpoint(): Promise<unknown> {
    console.log('🧪 Testing health endpoint...')

    try {
      const response = await fetch('http://localhost:3001/health')
      console.log(`📊 Health response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log('📦 Health response:', result)
        return result
      } else {
        const errorText = await response.text()
        console.error('❌ Health error response:', errorText)
        return null
      }
    } catch (error) {
      console.error('❌ Error testing health endpoint:', error)
      return null
    }
  }

  /**
   * Test status endpoint response
   */
  export async function testStatusEndpoint(): Promise<unknown> {
    console.log('🧪 Testing status endpoint...')

    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/status')
      console.log(`📊 Status response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log('📦 Status response:', result)
        return result
      } else {
        const errorText = await response.text()
        console.error('❌ Status error response:', errorText)
        return null
      }
    } catch (error) {
      console.error('❌ Error testing status endpoint:', error)
      return null
    }
  }

  /**
   * Test QR code endpoint
   */
  export async function testQREndpoint(): Promise<unknown> {
    console.log('🧪 Testing QR endpoint...')

    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/qr')
      console.log(`📊 QR response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log('📦 QR response:', result)
        return result
      } else {
        const errorText = await response.text()
        console.error('❌ QR error response:', errorText)
        return null
      }
    } catch (error) {
      console.error('❌ Error testing QR endpoint:', error)
      return null
    }
  }

  /**
   * Test WhatsApp health endpoint
   */
  export async function testWhatsAppHealthEndpoint(): Promise<unknown> {
    console.log('🧪 Testing WhatsApp health endpoint...')

    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/health')
      console.log(`📊 WhatsApp Health response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log('📦 WhatsApp Health response:', result)
        return result
      } else {
        const errorText = await response.text()
        console.error('❌ WhatsApp Health error response:', errorText)
        return null
      }
    } catch (error) {
      console.error('❌ Error testing WhatsApp health endpoint:', error)
      return null
    }
  }

  /**
   * Run all tests
   */
  export async function runAllTests(): Promise<void> {
    console.log('🚀 Running WhatsApp Integration Tests\n')

    testDeadlineCalculation()
    console.log('\n' + '='.repeat(50) + '\n')

    testPhoneNumberFormatting()
    console.log('\n' + '='.repeat(50) + '\n')

    testReminderMessageGeneration()
    console.log('\n' + '='.repeat(50) + '\n')

    await testBackendHealth()
    console.log('\n' + '='.repeat(50) + '\n')

    await testWhatsAppStatus()
    console.log('\n' + '='.repeat(50) + '\n')

    await testHealthEndpoint()
    console.log('\n' + '='.repeat(50) + '\n')

    await testStatusEndpoint()
    console.log('\n' + '='.repeat(50) + '\n')

    await testQREndpoint()
    console.log('\n' + '='.repeat(50) + '\n')

    await testWhatsAppHealthEndpoint()

    console.log('\n✅ All tests completed!')
  }

  declare global {
    interface Window {
      whatsappTest: Record<string, (...args: unknown[]) => unknown>
    }
  }

  if (typeof window !== 'undefined') {
    window.whatsappTest = {
      testDeadlineCalculation,
      testPhoneNumberFormatting,
      testReminderMessageGeneration,
      testBackendHealth,
      testWhatsAppStatus,
      testBackendResponseFormat,
      testHealthEndpoint,
      testStatusEndpoint,
      testQREndpoint,
      testWhatsAppHealthEndpoint,
      runAllTests
    }
  }
