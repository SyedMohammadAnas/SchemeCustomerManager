'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Member, MonthTable, formatMonthName, MONTHS, isWinnerStatus, isWinnerOfMonth } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { DatabaseService } from "@/lib/database"
import { History, User, Trophy, Clock, CheckCircle, XCircle } from "lucide-react"

interface MemberHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
}

/**
 * Dialog component showing member's history across all months
 * Displays a visual trail of member status through each month
 * Shows payment status, draw status, and other relevant information
 */
export function MemberHistoryDialog({
  open,
  onOpenChange,
  member
}: MemberHistoryDialogProps) {
  // Member history data state
  const [memberHistory, setMemberHistory] = React.useState<Record<MonthTable, Member | null>>({} as Record<MonthTable, Member | null>)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  /**
   * Fetch member history across all months
   */
  const loadMemberHistory = React.useCallback(async () => {
    if (!member) return

    try {
      setIsLoading(true)
      setError(null)

      const history = await DatabaseService.getMemberHistory(member.full_name, member.mobile_number)
      setMemberHistory(history)
    } catch (err) {
      console.error('Error loading member history:', err)
      setError('Failed to load member history')
    } finally {
      setIsLoading(false)
    }
  }, [member])

  /**
   * Load member history when dialog opens
   */
  React.useEffect(() => {
    if (open && member) {
      loadMemberHistory()
    }
  }, [open, member, loadMemberHistory])

  /**
   * Get status icon based on member data for a month
   * Shows appropriate icons for different member statuses
   */
  const getStatusIcon = (monthMember: Member | null, month: MonthTable) => {
    if (!monthMember) {
      return <XCircle className="h-4 w-4 text-gray-400" />
    }

    if (isWinnerOfMonth(monthMember, month)) {
      return <Trophy className="h-4 w-4 text-yellow-500" />
    }

    if (isWinnerStatus(monthMember.draw_status)) {
      return <Trophy className="h-4 w-4 text-gray-500" />
    }

    // For customers who haven't won yet, show payment status icons
    if (monthMember.payment_status === 'paid') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }

    if (monthMember.payment_status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }

    return <XCircle className="h-4 w-4 text-red-500" />
  }

  /**
   * Get status description for a month
   * Shows payment status only for the month they won, no payment concerns for other months
   */
  const getStatusDescription = (monthMember: Member | null, month: MonthTable) => {
    if (!monthMember) return 'Not participated'

    const statuses = []

    if (isWinnerOfMonth(monthMember, month)) {
      statuses.push('Winner')
      // Show payment status only for the month they won
      if (monthMember.payment_status === 'paid') {
        statuses.push('Paid')
      }
    } else if (isWinnerStatus(monthMember.draw_status)) {
      // For months after they won, no payment concerns
      statuses.push('Winner of previous month')
    } else {
      // Only show payment status for months where they haven't won yet
      if (monthMember.payment_status === 'paid') {
        statuses.push('Paid')
      } else if (monthMember.payment_status === 'pending') {
        statuses.push('Pending payment')
      } else if (monthMember.payment_status === 'overdue') {
        statuses.push('Overdue payment')
      } else if (monthMember.payment_status === 'no_payment_required') {
        statuses.push('No payment required')
      }
    }

    if (monthMember.token_number) {
      statuses.push(`Token ${formatTokenDisplay(monthMember.token_number)}`)
    }

    return statuses.length > 0 ? statuses.join(' • ') : 'Participated'
  }

  /**
   * Get background color for month entry
   * Ensures proper text contrast in both light and dark modes
   */
  const getMonthBackgroundColor = (monthMember: Member | null, month: MonthTable) => {
    if (!monthMember) return 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'

    if (isWinnerOfMonth(monthMember, month)) return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600 text-gray-900 dark:text-yellow-100'
    if (isWinnerStatus(monthMember.draw_status)) return 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100'
    if (monthMember.payment_status === 'paid') return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600 text-gray-900 dark:text-green-100'
    if (monthMember.payment_status === 'no_payment_required') return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-gray-900 dark:text-blue-100'
    return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-gray-900 dark:text-blue-100'
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Member History
          </DialogTitle>
          <DialogDescription>
            Complete history of {member.full_name} across all months
          </DialogDescription>
        </DialogHeader>

        {/* Member basic info */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <div className="font-medium text-blue-900">{member.full_name}</div>
            <div className="text-sm text-blue-700">
              {member.mobile_number} • {member.family}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading member history...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* History timeline */}
        {!isLoading && !error && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Month-by-Month Trail</h3>

            <div className="space-y-2">
              {MONTHS.map((month, index) => {
                const monthMember = memberHistory[month]
                const isCurrentMonth = index === 0 // Assuming September is current

                return (
                  <div
                    key={month}
                    className={`flex items-center gap-3 p-3 border rounded-md transition-all ${getMonthBackgroundColor(monthMember, month)} ${
                      isCurrentMonth ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Month indicator with connecting line */}
                    <div className="flex flex-col items-center">
                      {getStatusIcon(monthMember, month)}
                      {index < MONTHS.length - 1 && (
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-500 mt-1" />
                      )}
                    </div>

                    {/* Month details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatMonthName(month)}</span>
                        {isCurrentMonth && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {getStatusDescription(monthMember, month)}
                      </div>

                      {/* Additional details for active months */}
                      {monthMember && (
                        <div className="flex gap-2 mt-1">
                          {monthMember.paid_to && (
                            <Badge variant="secondary" className="text-xs">
                              Paid to {monthMember.paid_to}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col gap-2 items-end">
                      {monthMember && (
                        <>
                          {/* Show Winner badge and trophy icon in the month they actually won */}
                          {isWinnerOfMonth(monthMember, month) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-yellow-600 text-xs">Winner</Badge>
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {/* Show payment status ONLY for the month they won */}
                              {monthMember.payment_status === 'paid' && (
                                <Badge className="bg-green-600 text-xs">Paid</Badge>
                              )}
                            </div>
                          )}
                          {/* Show payment status for months where they haven't won yet */}
                          {!isWinnerStatus(monthMember.draw_status) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {monthMember.payment_status === 'paid' && (
                                <Badge className="bg-green-600 text-xs">Paid</Badge>
                              )}
                              {monthMember.payment_status === 'pending' && (
                                <Badge variant="outline" className="text-xs">Pending</Badge>
                              )}
                              {monthMember.payment_status === 'overdue' && (
                                <Badge variant="destructive" className="text-xs">Overdue</Badge>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
