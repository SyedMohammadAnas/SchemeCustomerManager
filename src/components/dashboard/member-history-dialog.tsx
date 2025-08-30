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
import { Member, MonthTable, formatMonthName, MONTHS } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { DatabaseService } from "@/lib/database"
import { History, User, Trophy, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react"

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
   * Load member history when dialog opens
   */
  React.useEffect(() => {
    if (open && member) {
      loadMemberHistory()
    }
  }, [open, member])

  /**
   * Fetch member history across all months
   */
  const loadMemberHistory = async () => {
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
  }

  /**
   * Get status icon based on member data for a month
   */
  const getStatusIcon = (monthMember: Member | null) => {
    if (!monthMember) {
      return <XCircle className="h-4 w-4 text-gray-400" />
    }

    if (monthMember.draw_status === 'winner') {
      return <Trophy className="h-4 w-4 text-yellow-500" />
    }

    if (monthMember.draw_status === 'drawn') {
      return <Trophy className="h-4 w-4 text-gray-500" />
    }

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
   */
  const getStatusDescription = (monthMember: Member | null) => {
    if (!monthMember) return 'Not participated'

    const statuses = []

    if (monthMember.draw_status === 'winner') {
      statuses.push('Winner')
    } else if (monthMember.draw_status === 'drawn') {
      statuses.push('Previously won')
    }

    if (monthMember.payment_status === 'paid') {
      statuses.push('Paid')
    } else if (monthMember.payment_status === 'pending') {
      statuses.push('Pending payment')
    } else if (monthMember.payment_status === 'overdue') {
      statuses.push('Overdue payment')
    }

    if (monthMember.token_number) {
      statuses.push(`Token ${formatTokenDisplay(monthMember.token_number)}`)
    }

    return statuses.length > 0 ? statuses.join(' • ') : 'Participated'
  }

  /**
   * Get background color for month entry
   */
  const getMonthBackgroundColor = (monthMember: Member | null) => {
    if (!monthMember) return 'bg-gray-50'

    if (monthMember.draw_status === 'winner') return 'bg-yellow-50 border-yellow-200'
    if (monthMember.draw_status === 'drawn') return 'bg-gray-100 border-gray-300'
    if (monthMember.payment_status === 'paid') return 'bg-green-50 border-green-200'
    return 'bg-blue-50 border-blue-200'
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
                    className={`flex items-center gap-3 p-3 border rounded-md transition-all ${getMonthBackgroundColor(monthMember)} ${
                      isCurrentMonth ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Month indicator with connecting line */}
                    <div className="flex flex-col items-center">
                      {getStatusIcon(monthMember)}
                      {index < MONTHS.length - 1 && (
                        <div className="w-px h-4 bg-gray-300 mt-1" />
                      )}
                    </div>

                    {/* Month details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatMonthName(month)}</span>
                        {isCurrentMonth && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {getStatusDescription(monthMember)}
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
                    <div className="flex flex-col gap-1">
                      {monthMember && (
                        <>
                          {monthMember.draw_status === 'winner' && (
                            <Badge className="bg-yellow-600 text-xs">Winner</Badge>
                          )}
                          {monthMember.draw_status === 'drawn' && (
                            <Badge variant="secondary" className="text-xs">Previously Won</Badge>
                          )}
                          {monthMember.payment_status === 'paid' && (
                            <Badge className="bg-green-600 text-xs">Paid</Badge>
                          )}
                          {monthMember.payment_status === 'pending' && (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                          {monthMember.payment_status === 'overdue' && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
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

        {/* Summary statistics */}
        {!isLoading && !error && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Months Participated:</span>
                <span className="ml-2 font-medium">
                  {Object.values(memberHistory).filter(m => m !== null).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Times Won:</span>
                <span className="ml-2 font-medium">
                  {Object.values(memberHistory).filter(m => m?.draw_status === 'winner').length}
                </span>
              </div>
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
