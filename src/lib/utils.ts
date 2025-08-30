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
 * Generate a sequential token number for member assignment
 * Creates clean sequential numbering starting from 1
 */
export function generateTokenNumber(existingTokens: number[]): number {
  // Find the next available sequential number
  let nextToken = 1
  while (existingTokens.includes(nextToken)) {
    nextToken++
  }
  return nextToken
}

/**
 * Format token number for display with "#" prefix
 * Converts token number to "#1", "#2", "#3" format
 */
export function formatTokenDisplay(tokenNumber: number | null): string {
  if (tokenNumber === null || tokenNumber === undefined) {
    return '—'
  }
  return `#${tokenNumber}`
}

/**
 * Sort members alphabetically by full name
 * Used for displaying members in alphabetical order
 */
export function sortMembersAlphabetically<T extends { full_name: string }>(members: T[]): T[] {
  return [...members].sort((a, b) => a.full_name.localeCompare(b.full_name))
}
