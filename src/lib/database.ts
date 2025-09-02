import { supabase, Member, NewMember, MonthTable, MONTHS, createWinnerDrawStatus, PaymentStatus, PaidToRecipient, DrawStatus, formatMonthName } from './supabase'


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
   * Get the mobile number of the first member in a family
   * Used for manual mobile number sharing functionality
   */
  static async getFamilyMobileNumber(monthTable: MonthTable, familyName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .select('mobile_number')
        .eq('family', familyName)
        .limit(1)
        .single()

      if (error) {
        console.error(`Error fetching family mobile number from ${monthTable}:`, error)
        return null
      }

      return data?.mobile_number || null
    } catch (error) {
      console.error('Database error in getFamilyMobileNumber:', error)
      return null
    }
  }

  /**
   * Add a new member to the specified month table
   * Automatically sorts the member list alphabetically
   * No longer automatically shares mobile number - users must explicitly choose to share
   */
  static async addMember(monthTable: MonthTable, memberData: NewMember): Promise<Member> {
    try {
      const { data, error } = await supabase
        .from(monthTable)
        .insert({
          ...memberData,
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
   * Allows family members to have individual mobile numbers
   * Prevents changing payment status for previously won customers
   */
  static async updateMember(
    monthTable: MonthTable,
    memberId: number,
    updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Member> {
    try {
      // Get current member data to check if they're previously won
      const currentMember = await this.getMembers(monthTable)
        .then(members => members.find(m => m.id === memberId))

      if (!currentMember) {
        throw new Error('Member not found')
      }

      // Prevent changing payment status for previously won customers
      const isPreviouslyWon = currentMember.draw_status === 'winner' || currentMember.draw_status === 'drawn'
      if (isPreviouslyWon && (updates.payment_status || updates.paid_to)) {
        throw new Error('Cannot change payment status for previously won customers. They don\'t need to pay anymore.')
      }

      // Prevent changing payment status for members with 'no_payment_required' status
      if (currentMember.payment_status === 'no_payment_required' && (updates.payment_status || updates.paid_to)) {
        throw new Error('Cannot change payment status for members who don\'t need to pay. Their status is automatically managed.')
      }

      const { data, error } = await supabase
        .from(monthTable)
        .update({
          ...updates,
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
   * Updates the member's draw_status to month-specific winner status
   * Prevents multiple winner declarations per month
   */
  static async declareWinner(monthTable: MonthTable, memberId: number): Promise<Member> {
    try {
      // Check if a winner already exists for this month
      const existingWinner = await this.getCurrentWinner(monthTable)
      if (existingWinner) {
        throw new Error(`A winner has already been declared for ${formatMonthName(monthTable)}`)
      }

      // Update the member to be the winner with month-specific status
      const updatedMember = await this.updateMember(monthTable, memberId, {
        draw_status: createWinnerDrawStatus(monthTable)
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
        .eq('draw_status', createWinnerDrawStatus(monthTable))
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
   * Proceed to the next month by copying all members from current month
   * Maintains token numbers and other member information
   * Updates previous winner's draw_status to 'drawn'
   * Resets payment status to 'pending' for regular members
   * Sets payment_status to 'no_payment_required' for previous winners only
   * Clears paid_to information for all members in the new month
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
      const membersForNextMonth = currentMembers.map(member => {
        // Check if this member has won in any previous month
        // We need to check ALL previous months, not just the current one
        const hasWonPreviously = member.draw_status === 'winner' || member.draw_status === 'drawn' ||
                                (currentWinner && member.id === currentWinner.id)

        // Set payment status based on previous wins
        let paymentStatus: PaymentStatus
        let paidToValue: PaidToRecipient | null = null

        if (hasWonPreviously) {
          // Previous winners don't need to pay
          paymentStatus = 'no_payment_required' as const
          paidToValue = null // Clear paid_to for winners
        } else {
          // Regular members start fresh with pending payment status
          paymentStatus = 'pending' as const
          paidToValue = null // Clear paid_to for new month
        }

        // Determine draw status: if they won in current month, mark as 'drawn'
        // If they won in any previous month, keep them as 'drawn'
        let drawStatus: DrawStatus
        if (currentWinner && member.id === currentWinner.id) {
          drawStatus = 'drawn' as const
        } else if (member.draw_status === 'winner' || member.draw_status === 'drawn') {
          drawStatus = 'drawn' as const // Keep previous winner status
        } else {
          drawStatus = 'not_drawn' as const
        }

        return {
          full_name: member.full_name,
          mobile_number: member.mobile_number,
          family: member.family,
          token_number: member.token_number,
          payment_status: paymentStatus,
          paid_to: paidToValue, // Reset paid_to for new month
          draw_status: drawStatus,
          additional_information: member.additional_information
        }
      })

      // Insert all members to next month table
      const { error } = await supabase
        .from(nextMonth)
        .insert(membersForNextMonth)
        .select()

      if (error) {
        console.error(`Error copying members to ${nextMonth}:`, error)
        throw new Error(`Failed to copy members to next month: ${error.message}`)
      }

      // Update payment statuses for all previous winners in the new month
      // This ensures that previous winners from all months get 'no_payment_required' status
      try {
        const { error: updateError } = await supabase.rpc('update_previous_winners_payment_status', { target_month: nextMonth })
        if (updateError) {
          console.warn(`Warning: Could not update previous winners payment status: ${updateError.message}`)
        }
      } catch (updateError) {
        console.warn('Warning: Could not update previous winners payment status:', updateError)
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

      // Only check months that are likely to exist to avoid 406 errors
      // For now, only check the first few months that we know exist
      const monthsToCheck = ['september_2025', 'october_2025', 'november_2025'] as MonthTable[]

      // Check each month for this member
      for (const month of monthsToCheck) {
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
        } catch (err) {
          // Handle any other errors by setting to null
          console.warn(`Skipping month ${month} due to error:`, err)
          history[month] = null
        }
      }

      // Set all other months to null since they don't exist yet
      for (const month of MONTHS) {
        if (!monthsToCheck.includes(month)) {
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

  /**
   * Get all winners across all months
   * Returns a map of month to winner information
   */
  static async getAllWinners(): Promise<Record<MonthTable, Member | null>> {
    try {
      const winners: Record<MonthTable, Member | null> = {} as Record<MonthTable, Member | null>

      // Only check months that are likely to exist to avoid 406 errors
      // For now, only check the first few months that we know exist
      const monthsToCheck = ['september_2025', 'october_2025', 'november_2025'] as MonthTable[]

      // Check each month for a winner
      for (const month of monthsToCheck) {
        try {
          const { data, error } = await supabase
            .from(month)
            .select('*')
            .eq('draw_status', createWinnerDrawStatus(month))
            .single()

          if (error) {
            // No winner found in this month
            if (error.code === 'PGRST116') {
              winners[month] = null
            } else {
              console.error(`Error fetching winner from ${month}:`, error)
              winners[month] = null
            }
          } else {
            winners[month] = data
          }
        } catch {
          // Handle any other errors by setting to null
          winners[month] = null
        }
      }

      // Set all other months to null since they don't exist yet
      for (const month of MONTHS) {
        if (!monthsToCheck.includes(month)) {
          winners[month] = null
        }
      }

      return winners
    } catch (error) {
      console.error('Database error in getAllWinners:', error)
      throw error
    }
  }

  /**
   * Check if a month already has a winner declared
   * Used to determine if declare winner button should be shown
   */
  static async hasWinner(monthTable: MonthTable): Promise<boolean> {
    try {
      const winner = await this.getCurrentWinner(monthTable)
      return winner !== null
    } catch (error) {
      console.error('Database error in hasWinner:', error)
      return false
    }
  }
}
