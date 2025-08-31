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
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'no_payment_required'
export type DrawStatus = 'not_drawn' | 'drawn' | 'winner' |
  'winner_september_2025' | 'winner_october_2025' | 'winner_november_2025' | 'winner_december_2025' |
  'winner_january_2026' | 'winner_february_2026' | 'winner_march_2026' | 'winner_april_2026' |
  'winner_may_2026' | 'winner_june_2026' | 'winner_july_2026' | 'winner_august_2026' |
  'winner_september_2026' | 'winner_october_2026' | 'winner_november_2026' | 'winner_december_2026'
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

/**
 * Helper function to create winner draw status for a specific month
 */
export const createWinnerDrawStatus = (month: MonthTable): DrawStatus => {
  return `winner_${month}` as DrawStatus
}

/**
 * Helper function to check if a draw status indicates a winner
 */
export const isWinnerStatus = (drawStatus: DrawStatus): boolean => {
  return drawStatus.startsWith('winner_')
}

/**
 * Helper function to extract month from winner draw status
 */
export const getWinnerMonth = (drawStatus: DrawStatus): MonthTable | null => {
  if (!isWinnerStatus(drawStatus)) return null
  const month = drawStatus.replace('winner_', '') as MonthTable
  return MONTHS.includes(month) ? month : null
}

/**
 * Helper function to check if a member is winner of a specific month
 */
export const isWinnerOfMonth = (member: Member, month: MonthTable): boolean => {
  return member.draw_status === createWinnerDrawStatus(month)
}
