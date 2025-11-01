'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, CreditCard, Trophy, Hash, Search, ArrowRight, Crown, AlertCircle, ChevronDown, X, IndianRupee } from "lucide-react"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { MonthSelector } from "./month-selector"
import { MembersTable } from "./members-table"
import { AddMemberDialog } from "./add-member-dialog"
import { EditMemberDialog } from "./edit-member-dialog"
import { DeclareWinnerDialog } from "./declare-winner-dialog"
import { MemberHistoryDialog } from "./member-history-dialog"
import { PreviousWinnersDialog } from "./previous-winners-dialog"
import { UnpaidMembersDialog } from "./unpaid-members-dialog"
import { ReceiptDialog } from "./receipt-dialog"
import { DatabaseService } from "@/lib/database"
import { Member, NewMember, MonthTable, PaymentStatus, PaidToRecipient, formatMonthName, isWinnerOfMonth } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { sendDrawReminders, sendBulkReceipts } from "@/lib/whatsapp"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Main Dashboard Component
 * Provides complete interface for managing the scheme register
 * Includes month selection, member management, token assignment, and winner declaration
 * Mobile-first responsive design with progressive enhancement
 */
export function Dashboard() {
  // Current selected month state
  // Default to November as the primary month
  const [selectedMonth, setSelectedMonth] = React.useState<MonthTable>('november_2025')

  // Members data and loading state
  const [members, setMembers] = React.useState<Member[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Current month winner state - computed from members
  const currentWinner = React.useMemo(() => {
    const winner = members.find(member =>
      isWinnerOfMonth(member, selectedMonth)
    );
    console.log('Current winner computed:', {
      selectedMonth,
      winner,
      membersWithWinnerStatus: members.filter(m => isWinnerOfMonth(m, selectedMonth)),
      allMembers: members.map(m => ({ name: m.full_name, draw_status: m.draw_status }))
    });
    return winner;
  }, [members, selectedMonth]);

  // All winners across all months for tracking and display
  const [allWinners, setAllWinners] = React.useState<Record<MonthTable, Member | null>>({} as Record<MonthTable, Member | null>)

  /**
   * Check if current month already has a winner
   * Used to determine if declare winner button should be shown
   */
  const hasCurrentMonthWinner = React.useMemo(() => {
    const hasWinner = members.some(member =>
      isWinnerOfMonth(member, selectedMonth)
    );
    console.log('Has current month winner computed:', {
      selectedMonth,
      hasWinner,
      membersWithWinnerStatus: members.filter(m => isWinnerOfMonth(m, selectedMonth))
    });
    return hasWinner;
  }, [members, selectedMonth]);

  // Family suggestions for the selected month
  const [familySuggestions, setFamilySuggestions] = React.useState<string[]>([])

  // Search functionality state
  const [searchQuery, setSearchQuery] = React.useState('')

  // Family dropdown state
  const [selectedFamily, setSelectedFamily] = React.useState<string | null>(null)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeclareWinnerDialogOpen, setIsDeclareWinnerDialogOpen] = React.useState(false)
  const [isMemberHistoryDialogOpen, setIsMemberHistoryDialogOpen] = React.useState(false)
  const [isPreviousWinnersDialogOpen, setIsPreviousWinnersDialogOpen] = React.useState(false)
  const [isUnpaidMembersDialogOpen, setIsUnpaidMembersDialogOpen] = React.useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<Member | null>(null)
  const [historyMember, setHistoryMember] = React.useState<Member | null>(null)
  const [receiptMember, setReceiptMember] = React.useState<Member | null>(null)

  // Loading states for various operations
  const [isAssigningTokens, setIsAssigningTokens] = React.useState(false)
  const [isProceedingToNextMonth, setIsProceedingToNextMonth] = React.useState(false)
  const [isSendingReminders, setIsSendingReminders] = React.useState(false)
  const [isSendingBulkReceipts, setIsSendingBulkReceipts] = React.useState(false)

  // Error state for user feedback
  const [error, setError] = React.useState<string | null>(null)

  /**
   * Load members and winner for the selected month
   * Called whenever the month changes
   */
  const loadMembers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load members and all winners in parallel
      const [data, allWinnersData] = await Promise.all([
        DatabaseService.getMembers(selectedMonth),
        DatabaseService.getAllWinners()
      ])

      setMembers(data)
      // currentWinner is now computed from members
      setAllWinners(allWinnersData)

      // Load family suggestions
      const families = await DatabaseService.getExistingFamilyNames(selectedMonth)
      setFamilySuggestions(families)
    } catch (err) {
      console.error('Error loading members:', err)
      setError('Failed to load members. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth])

  // Check if next month already has data
  const [nextMonthHasData, setNextMonthHasData] = React.useState(false)

  /**
   * Check if next month has data to determine if proceed button should be shown
   */
  const checkNextMonthData = React.useCallback(async () => {
    try {
      const nextMonth = DatabaseService.getNextMonth(selectedMonth);
      if (nextMonth) {
        const nextMonthMembers = await DatabaseService.getMembers(nextMonth);
        setNextMonthHasData(nextMonthMembers.length > 0);
      } else {
        setNextMonthHasData(false);
      }
    } catch (error) {
      console.error('Error checking next month data:', error);
      setNextMonthHasData(false);
    }
  }, [selectedMonth]);

  /**
   * Load members when component mounts or month changes
   */
  React.useEffect(() => {
    loadMembers()
    checkNextMonthData()
  }, [loadMembers, checkNextMonthData])

  /**
   * Check next month data when selected month changes
   */
  React.useEffect(() => {
    checkNextMonthData()
  }, [selectedMonth, checkNextMonthData])

  /**
   * Handle month selection change
   */
  const handleMonthChange = (month: MonthTable) => {
    setSelectedMonth(month)
    // Clear search when month changes
    setSearchQuery('')
  }

  /**
   * Handle adding a new member
   */
  const handleAddMember = async (memberData: NewMember) => {
    try {
      setError(null)
      const newMember = await DatabaseService.addMember(selectedMonth, memberData)

      // Add the new member to the current list and re-sort
      setMembers(prev => [...prev, newMember].sort((a, b) => a.full_name.localeCompare(b.full_name)))
    } catch (err) {
      console.error('Error adding member:', err)
      setError('Failed to add member. Please try again.')
      throw err // Re-throw to handle in dialog
    }
  }

  /**
   * Handle editing a member
   */
  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setIsEditDialogOpen(true)
  }

  /**
   * Handle updating a member
   */
  const handleUpdateMember = async (memberId: number, updates: Partial<NewMember>) => {
    try {
      setError(null)
      const updatedMember = await DatabaseService.updateMember(selectedMonth, memberId, updates)

      // Update the editingMember state with the new data
      setEditingMember(updatedMember)

      // Reload members to get updated data
      await loadMembers()

      // Don't close the dialog - keep it open after updating
      // User can manually close it when done
    } catch (err) {
      console.error('Error updating member:', err)
      setError('Failed to update member. Please try again.')
      throw err // Re-throw to handle in dialog
    }
  }

  /**
   * Handle deleting a member
   */
  const handleDeleteMember = (memberId: number) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return
    }

    // Use async IIFE to handle async operations
    ;(async () => {
      try {
        setError(null)
        await DatabaseService.deleteMember(selectedMonth, memberId)

        // Remove the member from the current list
        setMembers(prev => prev.filter(member => member.id !== memberId))
      } catch (err) {
        console.error('Error deleting member:', err)
        setError('Failed to delete member. Please try again.')
      }
    })()
  }

  /**
   * Handle token assignment for all members
   * Includes WhatsApp messaging functionality
   */
  const handleAssignTokens = async () => {
    const membersWithoutTokens = members.filter(member => !member.token_number)

    if (membersWithoutTokens.length === 0) {
      alert('All members already have token numbers assigned.')
      return
    }

    const confirmMessage = `This will assign token numbers to ${membersWithoutTokens.length} member(s) and send WhatsApp messages to all members with their token numbers. Are you sure?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsAssigningTokens(true)
      setError(null)

      // Show initial progress message
      console.log(`🔄 Starting token assignment for ${membersWithoutTokens.length} members`)

      await DatabaseService.assignTokenNumbers(selectedMonth)

      // Reload members to get updated token numbers
      await loadMembers()

      // Show success message
      console.log(`✅ Token assignment completed successfully`)
      alert(`✅ Token numbers assigned successfully!\n\nWhatsApp messages have been sent to all members with their assigned token numbers.\n\nNote: If any messages failed, they will be logged in the console for review.`)
    } catch (err) {
      console.error('Error assigning tokens:', err)
      setError('Failed to assign tokens. Please try again.')
    } finally {
      setIsAssigningTokens(false)
    }
  }

  /**
   * Handle declaring a winner for the current month
   */
  const handleDeclareWinner = async (memberId: number) => {
    try {
      setError(null)

      // Double-check that no winner exists for this month
      if (hasCurrentMonthWinner) {
        setError('A winner has already been declared for this month.')
        return
      }

      await DatabaseService.declareWinner(selectedMonth, memberId)

      // hasCurrentMonthWinner will automatically update via useMemo when members change

      // Reload members to get updated draw status
      await loadMembers()

      // Show success message
      setError(null)
    } catch (err) {
      console.error('Error declaring winner:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to declare winner. Please try again.')
      }
      throw err // Re-throw to handle in dialog
    }
  }

  /**
   * Handle proceeding to the next month
   */
  const handleProceedToNextMonth = async () => {
    const nextMonth = DatabaseService.getNextMonth(selectedMonth)

    if (!nextMonth) {
      alert('This is the last month in the sequence.')
      return
    }

    if (!currentWinner) {
      alert('Please declare a winner for the current month before proceeding.')
      return
    }

    const confirmMessage = `This will copy all members to ${formatMonthName(nextMonth)}. Payment statuses will be reset to 'pending' for regular members, and 'no_payment_required' for previous winners. Are you sure?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsProceedingToNextMonth(true)
      setError(null)

      const newMonth = await DatabaseService.proceedToNextMonth(selectedMonth)

      // Update next month data state
      setNextMonthHasData(true)

      // Switch to the new month
      setSelectedMonth(newMonth)
    } catch (err) {
      console.error('Error proceeding to next month:', err)
      setError('Failed to proceed to next month. Please try again.')
    } finally {
      setIsProceedingToNextMonth(false)
    }
  }

  /**
   * Handle sending draw reminders to all members
   */
  const handleSendReminders = async () => {
    if (members.length === 0) {
      alert('No members found to send reminders to.')
      return
    }

    const confirmMessage = `This will send draw reminder messages to all ${members.length} members via WhatsApp. Are you sure?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsSendingReminders(true)
      setError(null)

      // Show initial progress message
      console.log(`🔄 Starting draw reminder to ${members.length} members`)

      const results = await sendDrawReminders(members, (current, total, memberName) => {
        console.log(`📤 Sending reminder ${current}/${total}: ${memberName}`)
      })

      // Show success message
      console.log(`✅ Draw reminders completed: ${results.sent} sent, ${results.failed} failed`)

      if (results.failed > 0) {
        alert(`✅ Draw reminders sent!\n\n${results.sent} messages sent successfully.\n${results.failed} messages failed.\n\nFailed messages:\n${results.errors.map(e => `- ${e.memberName}: ${e.error}`).join('\n')}`)
      } else {
        alert(`✅ Draw reminders sent successfully!\n\nAll ${results.sent} messages were delivered.`)
      }
    } catch (err) {
      console.error('Error sending draw reminders:', err)
      setError('Failed to send draw reminders. Please try again.')
    } finally {
      setIsSendingReminders(false)
    }
  }

  /**
   * Handle sending bulk receipts to paid members
   */
  const handleSendBulkReceipts = async () => {
    // Filter paid members
    const paidMembers = members.filter(member => member.payment_status === 'paid')

    if (paidMembers.length === 0) {
      alert('No paid members found to send receipts to.')
      return
    }

    const confirmMessage = `This will send payment receipts to ${paidMembers.length} paid members via WhatsApp. Are you sure?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setIsSendingBulkReceipts(true)
      setError(null)

      // Show initial progress message
      console.log(`🔄 Starting bulk receipt sending to ${paidMembers.length} paid members`)

      const results = await sendBulkReceipts(paidMembers, selectedMonth, (current, total, memberName) => {
        console.log(`📤 Sending receipt ${current}/${total}: ${memberName}`)
      })

      // Show success message
      console.log(`✅ Bulk receipts completed: ${results.sent} sent, ${results.failed} failed`)

      if (results.failed > 0) {
        alert(`✅ Bulk receipts sent!\n\n${results.sent} receipts sent successfully.\n${results.failed} receipts failed.\n\nFailed receipts:\n${results.errors.map(e => `- ${e.memberName}: ${e.error}`).join('\n')}`)
      } else {
        alert(`✅ Bulk receipts sent successfully!\n\nAll ${results.sent} receipts were delivered.`)
      }
    } catch (err) {
      console.error('Error sending bulk receipts:', err)
      setError('Failed to send bulk receipts. Please try again.')
    } finally {
      setIsSendingBulkReceipts(false)
    }
  }

  /**
   * Handle viewing member history
   */
  const handleViewMemberHistory = (member: Member) => {
    setHistoryMember(member)
    setIsMemberHistoryDialogOpen(true)
  }

  /**
   * Handle viewing member receipt
   */
  const handleViewReceipt = (member: Member) => {
    setReceiptMember(member)
    setIsReceiptDialogOpen(true)
  }

  /**
   * Handle payment status change from unpaid members dialog
   */
  const handlePaymentStatusChange = async (memberId: number, status: PaymentStatus) => {
    try {
      setError(null)
      await DatabaseService.updateMember(selectedMonth, memberId, { payment_status: status })
      // Reload members to get updated data
      await loadMembers()
    } catch (err) {
      console.error('Error updating payment status:', err)
      setError('Failed to update payment status. Please try again.')
    }
  }

  /**
   * Handle paid to change from unpaid members dialog
   */
  const handlePaidToChange = async (memberId: number, paidTo: string) => {
    try {
      setError(null)
      await DatabaseService.updateMember(selectedMonth, memberId, { paid_to: paidTo as PaidToRecipient })
      // Reload members to get updated data
      await loadMembers()
    } catch (err) {
      console.error('Error updating paid to:', err)
      setError('Failed to update paid to. Please try again.')
    }
  }

  /**
   * Filter members based on search query and family selection
   * Searches across full name, mobile number, and family name
   * Also filters by selected family if any
   */
  const filteredMembers = React.useMemo(() => {
    let filtered = members

    // First filter by family if selected
    if (selectedFamily) {
      filtered = filtered.filter(member => member.family === selectedFamily)
    }

    // Then filter by search query if any
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(query) ||
        member.mobile_number.includes(query) ||
        member.family.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [members, searchQuery, selectedFamily])

  /**
   * Check if current month is starting month for conditional features
   */
  const isStartingMonth = DatabaseService.isStartingMonth(selectedMonth)

  /**
   * Get unique families from current members
   */
  const uniqueFamilies = React.useMemo(() => {
    const families = members.map(member => member.family).filter(Boolean)
    return [...new Set(families)].sort()
  }, [members])



  /**
   * Handle family selection from dropdown
   */
  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName)
    // Clear search when family is selected
    setSearchQuery('')
  }

  /**
   * Clear family filter
   */
  const handleClearFamilyFilter = () => {
    setSelectedFamily(null)
  }

  /**
   * Clear search query
   */
  const handleClearSearch = () => {
    setSearchQuery('')
  }

  /**
   * Calculate dashboard statistics based on filtered members
   * Includes proper counting of members with 'no_payment_required' status
   */
  const stats = React.useMemo(() => {
    const totalWinners = members.filter(m => m.draw_status === 'winner').length
    const drawnMembers = members.filter(m => m.draw_status === 'drawn').length

    // Count members with different payment statuses
    const paidMembersCount = members.filter(m => m.payment_status === 'paid').length
    const noPaymentRequiredCount = members.filter(m => m.payment_status === 'no_payment_required').length
    const pendingMembersCount = members.filter(m => m.payment_status === 'pending').length
    const overdueMembersCount = members.filter(m => m.payment_status === 'overdue').length

    // Calculate effective paid members (including those who do not need to pay)
    const effectivePaidMembers = paidMembersCount + noPaymentRequiredCount

    // Get unique families count
    const uniqueFamiliesCount = uniqueFamilies.length

    return {
      totalMembers: members.length,
      membersWithTokens: members.filter(m => m.token_number).length,
      uniqueFamilies: uniqueFamiliesCount,
      paidMembers: effectivePaidMembers,
      noPaymentRequired: noPaymentRequiredCount,
      pendingMembers: pendingMembersCount,
      overdueMembers: overdueMembersCount,
      winnersSelected: totalWinners,
      drawnMembers: drawnMembers,
      totalWinners: totalWinners + drawnMembers, // Current + previous winners
      // Add filtered count for search results
      filteredCount: filteredMembers.length
    }
  }, [members, filteredMembers, uniqueFamilies])

  /**
   * Check if there are eligible members for winner declaration
   * Members must be paid or have no payment required, have tokens, and not be drawn
   */
  const hasEligibleMembers = React.useMemo(() => {
    return members.filter(m =>
      (m.payment_status === 'paid' || m.payment_status === 'no_payment_required') &&
      m.token_number &&
      m.draw_status === 'not_drawn'
    ).length > 0
  }, [members])

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
      {/* Theme Switch - Top right corner for mobile, hidden on desktop */}
      <div className="flex justify-end -mb-5 sm:hidden">
        <ThemeSwitch />
      </div>

      {/* Header Section - Mobile optimized with stacked layout */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            రఫీ బంగారు పొదుపు పథకం
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage members and tokens for {formatMonthName(selectedMonth)}
            {currentWinner && (
              <span className="ml-2 inline-flex items-center gap-1">
                &bull; <Crown className="h-4 w-4 text-yellow-500" /> Winner: {currentWinner.full_name}
              </span>
            )}
            {!currentWinner && hasCurrentMonthWinner && (
              <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                &bull; Winner already declared for this month
              </span>
            )}
          </p>
        </div>

        {/* Right side controls - Month selector and theme toggle */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          {/* Month selector - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Theme switch - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:flex justify-end">
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* Error Alert - Mobile optimized spacing */}
      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm sm:px-4 sm:py-3 sm:text-base">
          {error}
        </div>
      )}

      {/* Statistics Cards - Mobile-first grid layout */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {/* Total Members Card */}
        <Card className="min-h-[80px] sm:min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-1">
            <CardTitle className="text-xs font-medium sm:text-xl">Total Members</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
            <div className="text-xl font-bold sm:text-2xl">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Object.values(allWinners).filter(winner => winner !== null).length} total winners
            </p>
            {/* Previous Winners Button */}
            <Button
              variant="outline"
              onClick={() => setIsPreviousWinnersDialogOpen(true)}
              className="w-full mt-7 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-500 h-8 text-xs"
              size="sm"
            >
              <Trophy className="mr-1 h-3 w-3" />
              Previous Winners
            </Button>
          </CardContent>
        </Card>

        {/* Families Card - Changed from Tokens Assigned */}
        <Card className="min-h-[80px] sm:min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-1">
            <CardTitle className="text-xs font-medium sm:text-xl">Families</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
            <div className="text-xl font-bold sm:text-2xl">{stats.uniqueFamilies}</div>
            <p className="text-xs text-muted-foreground">
              total families
            </p>
            {/* Family Dropdown Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-7 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 h-8 text-xs"
                  size="sm"
                >
                  <Users className="mr-1 h-3 w-3" />
                  {selectedFamily ? `Viewing: ${selectedFamily}` : 'View Families'}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                {uniqueFamilies.length > 0 ? (
                  uniqueFamilies.map((family) => (
                    <DropdownMenuItem
                      key={family}
                      onClick={() => handleFamilySelect(family)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{family}</span>
                        <span className="text-xs text-muted-foreground">
                          {members.filter(m => m.family === family).length} member{members.filter(m => m.family === family).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">No families found</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </CardContent>
        </Card>

        {/* Paid Members Card */}
        <Card className="min-h-[80px] sm:min-h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-1">
            <CardTitle className="text-xs font-medium sm:text-xl">Paid Members</CardTitle>
            <CreditCard className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
            <div className="text-xl font-bold sm:text-2xl">{stats.paidMembers - stats.noPaymentRequired}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalMembers} members {stats.noPaymentRequired > 0 && `(+${stats.noPaymentRequired} winner${stats.noPaymentRequired > 1 ? 's' : ''})`}
            </p>
            {/* Unpaid Members Button */}
            <Button
              variant="outline"
              onClick={() => setIsUnpaidMembersDialogOpen(true)}
              className="w-full mt-7 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 h-8 text-xs"
              size="sm"
            >
              <AlertCircle className="mr-1 h-3 w-3" />
              Unpaid ({members.filter(m =>
                m.payment_status === 'pending' || m.payment_status === 'overdue'
              ).length})
            </Button>
          </CardContent>
        </Card>

        {/* Current Month Winner Card */}
        <Card className={`min-h-[80px] sm:min-h-[100px] ${currentWinner ? 'border-2 border-yellow-200 bg-yellow-50/30' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-1">
            <CardTitle className="text-xs font-medium sm:text-xl">Current Month Winner</CardTitle>
            <Trophy className={`h-3 w-3 sm:h-4 sm:w-4 ${currentWinner ? 'text-yellow-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
            {currentWinner ? (
              <div className="space-y-2">
                <div className="text-lg font-bold sm:text-xl text-yellow-700">{currentWinner.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentWinner.family} • {currentWinner.mobile_number}
                </div>
                {currentWinner.token_number && (
                  <div className="text-xs text-muted-foreground">
                    Token {formatTokenDisplay(currentWinner.token_number)}
                  </div>
                )}
                <div className="text-xs text-yellow-600 font-medium">
                  Winner of {formatMonthName(selectedMonth)}
                </div>
              </div>
            ) : (
              <div className="space-y-14">
                <div className="text-sm text-muted-foreground">
                  No winner declared yet
                </div>
                {/* Declare Winner Button - Only show if no winner exists for current month */}
                {!hasCurrentMonthWinner && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeclareWinnerDialogOpen(true)}
                      disabled={!hasEligibleMembers}
                      className="w-full -mt-1 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-500 h-8 text-xs"
                      size="sm"
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      Declare Winner
                    </Button>

                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons and Search Bar - Mobile optimized with responsive layout */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mt-4">
        {/* Show Add Member and Assign Tokens only for starting month */}
        {isStartingMonth && (
          <>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>

            <Button
              variant="outline"
              onClick={handleAssignTokens}
              disabled={isAssigningTokens || members.length === 0}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Hash className="mr-2 h-4 w-4" />
              {isAssigningTokens ? 'Assigning Tokens & Sending Messages...' : 'Assign Tokens & Send WhatsApp Messages'}
            </Button>
          </>
        )}

        {/* Proceed to Next Month Button - Show if winner is declared and next month doesn't have data */}
        {currentWinner && DatabaseService.getNextMonth(selectedMonth) && !nextMonthHasData && (
          <Button
            variant="outline"
            onClick={handleProceedToNextMonth}
            disabled={isProceedingToNextMonth}
            className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 border-blue-200"
            size="lg"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {isProceedingToNextMonth ? 'Proceeding...' : `Proceed to ${formatMonthName(DatabaseService.getNextMonth(selectedMonth)!)}`}
          </Button>
        )}

        {/* Send Reminders and Send Receipts Buttons */}
        <div className="flex flex-row items-center space-x-2 w-full sm:w-auto sm:ml-auto">
          {/* Send Reminders Button */}
          <Button
            variant="outline"
            onClick={handleSendReminders}
            disabled={isSendingReminders || members.length === 0}
            className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 h-10 text-sm whitespace-nowrap"
            size="sm"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {isSendingReminders ? 'Sending Reminders...' : 'Send Reminders'}
          </Button>

          {/* Send Bulk Receipts Button */}
          <Button
            variant="outline"
            onClick={handleSendBulkReceipts}
            disabled={isSendingBulkReceipts || members.filter(m => m.payment_status === 'paid').length === 0}
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 h-10 text-sm whitespace-nowrap"
            size="sm"
          >
            <IndianRupee className="mr-2 h-4 w-4" />
            {isSendingBulkReceipts ? 'Sending Receipts...' : 'Send Receipts'}
          </Button>
        </div>
      </div>

      {/* Search Bar - Positioned below buttons */}
      <div className="flex flex-row items-center space-x-2 mt-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, mobile number, or family name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 w-full"
          />
          {/* Clear Search Button - Inside the search field */}
          {searchQuery.trim() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {/* Search results count indicator */}
          {searchQuery.trim() && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              {stats.filteredCount} of {stats.totalMembers}
            </div>
          )}
        </div>
      </div>

      {/* Members Table - Mobile optimized with filtered data */}
      <div className="mt-4">
        <MembersTable
        members={filteredMembers}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
        onViewHistory={handleViewMemberHistory}
        onViewReceipt={handleViewReceipt}
        isLoading={isLoading}
        currentMonth={selectedMonth}
        selectedFamily={selectedFamily}
        onClearFamilyFilter={handleClearFamilyFilter}
      />

      {/* Add Member Dialog - Only shown for starting month */}
      {isStartingMonth && (
        <AddMemberDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddMember={handleAddMember}
          isLoading={isLoading}
          familySuggestions={familySuggestions}
          currentMonth={selectedMonth}
        />
      )}

      {/* Edit Member Dialog */}
      <EditMemberDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateMember={handleUpdateMember}
        member={editingMember}
        isLoading={isLoading}
        familySuggestions={familySuggestions}
        currentMonth={selectedMonth}
      />

      {/* Declare Winner Dialog */}
      <DeclareWinnerDialog
        open={isDeclareWinnerDialogOpen}
        onOpenChange={setIsDeclareWinnerDialogOpen}
        onDeclareWinner={handleDeclareWinner}
        members={members}
        isLoading={isLoading}
        hasCurrentMonthWinner={hasCurrentMonthWinner}
      />

      {/* Member History Dialog */}
      <MemberHistoryDialog
        open={isMemberHistoryDialogOpen}
        onOpenChange={setIsMemberHistoryDialogOpen}
        member={historyMember}
      />

      {/* Previous Winners Dialog */}
      <PreviousWinnersDialog
        open={isPreviousWinnersDialogOpen}
        onOpenChange={setIsPreviousWinnersDialogOpen}
      />

      {/* Unpaid Members Dialog */}
      <UnpaidMembersDialog
        open={isUnpaidMembersDialogOpen}
        onOpenChange={setIsUnpaidMembersDialogOpen}
        members={members}
        onPaymentStatusChange={handlePaymentStatusChange}
        onPaidToChange={handlePaidToChange}
      />

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={isReceiptDialogOpen}
        onOpenChange={setIsReceiptDialogOpen}
        member={receiptMember}
        currentMonth={selectedMonth}
      />
    </div>
    </div>
  )
}
