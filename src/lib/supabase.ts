import { createClient } from '@supabase/supabase-js'

/**
 * Supabase configuration and client initialization
 * This file handles the connection to our Supabase database
 */

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Main Supabase client instance
 * Used for all database operations throughout the application
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Database types and interfaces for type safety
 */

// Specific types for form options
export type PaymentStatus = 'pending' | 'paid' | 'overdue'
export type DrawStatus = 'not_drawn' | 'drawn' | 'winner'
export type PaidToRecipient = 'Rafi' | 'Basheer'

// Member interface representing the structure of each table record
export interface Member {
  id: number
  token_number: number | null
  full_name: string
  mobile_number: string
  family: string
  payment_status: PaymentStatus
  paid_to: PaidToRecipient | null
  draw_status: DrawStatus
  additional_information: string | null
  created_at: string
  updated_at: string
}

// Type for adding a new member (without auto-generated fields)
export interface NewMember {
  full_name: string
  mobile_number: string
  family?: string
  payment_status?: PaymentStatus
  paid_to?: PaidToRecipient | null
  draw_status?: DrawStatus
  additional_information?: string | null
}

/**
 * List of all available months for the scheme
 * Used for table selection and month navigation
 * Starting from September 2025 and extending for 16 months total
 * This covers the complete scheme period from September 2025 to December 2026
 */
export const MONTHS = [
  'september_2025',
  'october_2025',
  'november_2025',
  'december_2025',
  'january_2026',
  'february_2026',
  'march_2026',
  'april_2026',
  'may_2026',
  'june_2026',
  'july_2026',
  'august_2026',
  'september_2026',
  'october_2026',
  'november_2026',
  'december_2026'
] as const

export type MonthTable = typeof MONTHS[number]

/**
 * Helper function to format month names for display
 */
export const formatMonthName = (month: MonthTable): string => {
  const [monthName, year] = month.split('_')
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
}
