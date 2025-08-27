import { supabase, Member, NewMember, MonthTable } from './supabase'
import { generateTokenNumber, sortMembersAlphabetically } from './utils'

/**
 * Database service class for handling all member-related operations
 * Provides clean interface for interacting with monthly register tables
 */
export class DatabaseService {

  /**
   * Fetch all members from a specific month table
   * Returns members sorted alphabetically by full name
   */
  static async getMembers(monthTable: MonthTable): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        console.error(`Error fetching members from ${monthTable}:`, error)
        throw new Error(`Failed to fetch members: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Database error in getMembers:', error)
      throw error
    }
  }

  /**
   * Get all members of a specific family in a month
   * Used for mobile number sharing and family management
   */
  static async getFamilyMembers(monthTable: MonthTable, familyName: string): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .select('*')
        .eq('family', familyName)
        .order('full_name', { ascending: true })

      if (error) {
        console.error(`Error fetching family members from ${monthTable}:`, error)
        throw new Error(`Failed to fetch family members: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Database error in getFamilyMembers:', error)
      throw error
    }
  }

  /**
   * Add a new member to the specified month table
   * Automatically sorts the member list alphabetically
   * Shares mobile number with existing family members if family is specified
   */
  static async addMember(monthTable: MonthTable, memberData: NewMember): Promise<Member> {
    try {
      // If family is specified and not 'Individual', check if family exists and share mobile number
      let finalMobileNumber = memberData.mobile_number
      if (memberData.family && memberData.family !== 'Individual') {
        const existingFamilyMembers = await this.getFamilyMembers(monthTable, memberData.family)
        if (existingFamilyMembers.length > 0) {
          // Use the mobile number from the first family member
          finalMobileNumber = existingFamilyMembers[0].mobile_number
        }
      }

      const { data, error } = await supabase
        .from(monthTable)
        .insert({
          ...memberData,
          mobile_number: finalMobileNumber,
          family: memberData.family || 'Individual',
          payment_status: memberData.payment_status || 'pending',
          draw_status: memberData.draw_status || 'not_drawn'
        })
        .select()
        .single()

      if (error) {
        console.error(`Error adding member to ${monthTable}:`, error)
        throw new Error(`Failed to add member: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Database error in addMember:', error)
      throw error
    }
  }

    /**
   * Update an existing member's information
   * Maintains alphabetical sorting after update
   * Handles family changes and mobile number sharing
   */
  static async updateMember(
    monthTable: MonthTable,
    memberId: number,
    updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Member> {
    try {
      // If family is being changed, handle mobile number sharing
      let finalUpdates = { ...updates }
      if (updates.family && updates.family !== 'Individual') {
        const existingFamilyMembers = await this.getFamilyMembers(monthTable, updates.family)
        if (existingFamilyMembers.length > 0) {
          // Use the mobile number from the first family member
          finalUpdates.mobile_number = existingFamilyMembers[0].mobile_number
        }
      }

      const { data, error } = await supabase
        .from(monthTable)
        .update({
          ...finalUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) {
        console.error(`Error updating member in ${monthTable}:`, error)
        throw new Error(`Failed to update member: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Database error in updateMember:', error)
      throw error
    }
  }

  /**
   * Delete a member from the specified month table
   */
  static async deleteMember(monthTable: MonthTable, memberId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(monthTable)
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error(`Error deleting member from ${monthTable}:`, error)
        throw new Error(`Failed to delete member: ${error.message}`)
      }
    } catch (error) {
      console.error('Database error in deleteMember:', error)
      throw error
    }
  }

  /**
   * Assign token numbers to all members without tokens
   * Generates unique 4-digit token numbers for each member
   */
  static async assignTokenNumbers(monthTable: MonthTable): Promise<Member[]> {
    try {
      // First, get all current members
      const members = await this.getMembers(monthTable)

      // Find members without token numbers
      const membersWithoutTokens = members.filter(member => !member.token_number)

      if (membersWithoutTokens.length === 0) {
        throw new Error('All members already have token numbers assigned')
      }

      // Get existing token numbers to avoid duplicates
      const existingTokens = members
        .filter(member => member.token_number)
        .map(member => member.token_number as number)

      // Generate unique tokens for members without them
      const updatedMembers: Member[] = []

      for (const member of membersWithoutTokens) {
        const tokenNumber = generateTokenNumber(existingTokens)
        existingTokens.push(tokenNumber) // Add to existing tokens to avoid duplicates

        const updatedMember = await this.updateMember(monthTable, member.id, {
          token_number: tokenNumber
        })
        updatedMembers.push(updatedMember)
      }

      return updatedMembers
    } catch (error) {
      console.error('Database error in assignTokenNumbers:', error)
      throw error
    }
  }

  /**
   * Get statistics for a specific month
   * Returns counts for different statuses
   */
  static async getMonthStats(monthTable: MonthTable) {
    try {
      const members = await this.getMembers(monthTable)

      const stats = {
        totalMembers: members.length,
        membersWithTokens: members.filter(m => m.token_number).length,
        paidMembers: members.filter(m => m.payment_status === 'paid').length,
        pendingPayments: members.filter(m => m.payment_status === 'pending').length,
        overduePayments: members.filter(m => m.payment_status === 'overdue').length,
        winnersSelected: members.filter(m => m.draw_status === 'winner').length
      }

      return stats
    } catch (error) {
      console.error('Database error in getMonthStats:', error)
      throw error
    }
  }

  /**
   * Get all existing family names in a month (excluding 'Individual')
   * Used for providing suggestions in the UI
   */
  static async getExistingFamilyNames(monthTable: MonthTable): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .select('family')
        .not('family', 'eq', 'Individual')
        .not('family', 'is', null)

      if (error) {
        console.error(`Error fetching family names from ${monthTable}:`, error)
        throw new Error(`Failed to fetch family names: ${error.message}`)
      }

      // Extract unique family names
      const uniqueFamilies = [...new Set(data?.map(item => item.family) || [])]
      return uniqueFamilies.sort()
    } catch (error) {
      console.error('Database error in getExistingFamilyNames:', error)
      throw error
    }
  }
}
