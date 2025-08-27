import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * This helps with conditional styling and class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format phone number for better display
 * Adds proper spacing for readability and formats Indian numbers with +91
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format Indian phone numbers with +91 country code
  if (cleaned.length === 10) {
    return `+91 ${cleaned}`
  }
  return phone
}

/**
 * Validate phone number format
 * Ensures proper phone number format before database insertion
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Generate a random token number for member assignment
 * Used when assigning tokens to members
 */
export function generateTokenNumber(existingTokens: number[]): number {
  let token: number
  do {
    token = Math.floor(Math.random() * 9000) + 1000 // 4-digit numbers
  } while (existingTokens.includes(token))
  return token
}

/**
 * Sort members alphabetically by full name
 * Used for displaying members in alphabetical order
 */
export function sortMembersAlphabetically<T extends { full_name: string }>(members: T[]): T[] {
  return [...members].sort((a, b) => a.full_name.localeCompare(b.full_name))
}
