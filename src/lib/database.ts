import { supabase, Member, NewMember, MonthTable, MONTHS } from './supabase'


/**
 * Database service class for handling all member-related operations
 * Provides clean interface for interacting with monthly register tables
 */
export class DatabaseService {

  /**
   * Fetch all members from a specific month table
   * Returns members sorted alphabetically by full name
   * This alphabetical sorting is used for consistent token assignment
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
      const finalUpdates = { ...updates }
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
   * Assign sequential token numbers to all members in alphabetical order
   * Generates clean sequential numbering starting from 1 based on name sorting
   * Clears existing tokens first to ensure proper sequence
   */
  static async assignTokenNumbers(monthTable: MonthTable): Promise<Member[]> {
    try {
      // First, get all current members sorted alphabetically
      const members = await this.getMembers(monthTable)

      if (members.length === 0) {
        throw new Error('No members found to assign tokens')
      }

      // Clear all existing token numbers first to ensure clean sequence
      for (const member of members) {
        if (member.token_number) {
          await this.updateMember(monthTable, member.id, {
            token_number: null
          })
        }
      }

      // Now assign sequential tokens starting from 1 in alphabetical order
      const updatedMembers: Member[] = []

      for (let i = 0; i < members.length; i++) {
        const member = members[i]
        const tokenNumber = i + 1 // Sequential numbering starting from 1

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
   * Declare a winner for the current month
   * Updates the member's draw_status to 'winner'
   */
  static async declareWinner(monthTable: MonthTable, memberId: number): Promise<Member> {
    try {
      const updatedMember = await this.updateMember(monthTable, memberId, {
        draw_status: 'winner'
      })
      return updatedMember
    } catch (error) {
      console.error('Database error in declareWinner:', error)
      throw error
    }
  }

  /**
   * Get the current month's winner
   * Returns null if no winner has been declared
   */
  static async getCurrentWinner(monthTable: MonthTable): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .select('*')
        .eq('draw_status', 'winner')
        .single()

      if (error) {
        // No winner found is not an error
        if (error.code === 'PGRST116') {
          return null
        }
        console.error(`Error fetching winner from ${monthTable}:`, error)
        throw new Error(`Failed to fetch winner: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Database error in getCurrentWinner:', error)
      throw error
    }
  }

  /**
   * Proceed to next month by copying current month data
   * Resets payment status and clears paid_to for all members
   * Maintains token numbers and other member information
   * Updates previous winner's draw_status to 'drawn'
   */
  static async proceedToNextMonth(currentMonth: MonthTable): Promise<MonthTable> {
    try {
      // Get the next month in sequence
      const currentIndex = MONTHS.indexOf(currentMonth)
      if (currentIndex === -1) {
        throw new Error('Invalid current month')
      }

      const nextIndex = (currentIndex + 1) % MONTHS.length
      const nextMonth = MONTHS[nextIndex]

      // Get all members from current month
      const currentMembers = await this.getMembers(currentMonth)

      if (currentMembers.length === 0) {
        throw new Error('No members found in current month to copy')
      }

      // Check if next month already has data
      const existingNextMonthMembers = await this.getMembers(nextMonth)
      if (existingNextMonthMembers.length > 0) {
        throw new Error('Next month already has data. Cannot proceed.')
      }

      // Find current month's winner
      const currentWinner = await this.getCurrentWinner(currentMonth)

      // Prepare members for next month
      const membersForNextMonth = currentMembers.map(member => ({
        full_name: member.full_name,
        mobile_number: member.mobile_number,
        family: member.family,
        token_number: member.token_number,
        payment_status: 'pending' as const,
        paid_to: null,
        draw_status: (currentWinner && member.id === currentWinner.id) ? 'drawn' as const : 'not_drawn' as const,
        additional_information: member.additional_information
      }))

      // Insert all members to next month table
      const { error } = await supabase
        .from(nextMonth)
        .insert(membersForNextMonth)
        .select()

      if (error) {
        console.error(`Error copying members to ${nextMonth}:`, error)
        throw new Error(`Failed to copy members to next month: ${error.message}`)
      }

      // Update current month's winner status to 'drawn' if exists
      if (currentWinner) {
        await this.updateMember(currentMonth, currentWinner.id, {
          draw_status: 'drawn'
        })
      }

      return nextMonth
    } catch (error) {
      console.error('Database error in proceedToNextMonth:', error)
      throw error
    }
  }

  /**
   * Get member's history across all months
   * Returns a map of month to member data (if exists)
   */
  static async getMemberHistory(memberName: string, mobileNumber: string): Promise<Record<MonthTable, Member | null>> {
    try {
      const history: Record<MonthTable, Member | null> = {} as Record<MonthTable, Member | null>

      // Check each month for this member
      for (const month of MONTHS) {
        try {
          const { data, error } = await supabase
            .from(month)
            .select('*')
            .eq('full_name', memberName)
            .eq('mobile_number', mobileNumber)
            .single()

          if (error) {
            // Member not found in this month
            if (error.code === 'PGRST116') {
              history[month] = null
            } else {
              console.error(`Error fetching member from ${month}:`, error)
              history[month] = null
            }
          } else {
            history[month] = data
          }
        } catch {
          // Handle any other errors by setting to null
          history[month] = null
        }
      }

      return history
    } catch (error) {
      console.error('Database error in getMemberHistory:', error)
      throw error
    }
  }

  /**
   * Check if a month is the starting month (September)
   * Used to determine if Add Member and Assign Tokens should be available
   */
  static isStartingMonth(monthTable: MonthTable): boolean {
    return monthTable === 'september_2025'
  }

  /**
   * Get the next month in sequence
   * Returns null if current month is the last month
   */
  static getNextMonth(currentMonth: MonthTable): MonthTable | null {
    const currentIndex = MONTHS.indexOf(currentMonth)
    if (currentIndex === -1 || currentIndex === MONTHS.length - 1) {
      return null
    }
    return MONTHS[currentIndex + 1]
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
        winnersSelected: members.filter(m => m.draw_status === 'winner').length,
        drawnMembers: members.filter(m => m.draw_status === 'drawn').length
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
