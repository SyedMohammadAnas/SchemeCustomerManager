'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Member, MonthTable, formatMonthName, MONTHS } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { DatabaseService } from "@/lib/database"
import { Trophy, Calendar, User, Hash } from "lucide-react"

/**
 * Props for the Previous Winners Dialog component
 */
interface PreviousWinnersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Previous Winners Dialog Component
 * Displays all previous winners from all months with their respective months
 * Replaces the summary section with comprehensive winner history
 */
export function PreviousWinnersDialog({ open, onOpenChange }: PreviousWinnersDialogProps) {
  // State for storing all previous winners
  const [previousWinners, setPreviousWinners] = React.useState<Array<{
    member: Member
    month: MonthTable
    monthName: string
  }>>([])

  // Loading state
  const [isLoading, setIsLoading] = React.useState(false)

  // Error state
  const [error, setError] = React.useState<string | null>(null)

  /**
   * Load all previous winners from all months
   * Fetches winners from each month table and compiles the list
   */
  const loadPreviousWinners = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const winners: Array<{
        member: Member
        month: MonthTable
        monthName: string
      }> = []

      // Only check months that are likely to exist to avoid 406 errors
      // For now, only check the first few months that we know exist
      const monthsToCheck = ['september_2025', 'october_2025', 'november_2025'] as MonthTable[]

      // Iterate through existing months to find winners
      for (const month of monthsToCheck) {
        try {
          const winner = await DatabaseService.getCurrentWinner(month)
          if (winner) {
            winners.push({
              member: winner,
              month: month,
              monthName: formatMonthName(month)
            })
          }
        } catch (err) {
          // Skip months that don't exist or have errors
          console.warn(`Error loading winner from ${month}:`, err)
        }
      }

      // Sort winners by month order (chronological)
      const sortedWinners = winners.sort((a, b) => {
        const monthAIndex = MONTHS.indexOf(a.month)
        const monthBIndex = MONTHS.indexOf(b.month)
        return monthAIndex - monthBIndex
      })

      setPreviousWinners(sortedWinners)
    } catch (err) {
      console.error('Error loading previous winners:', err)
      setError('Failed to load previous winners. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Load winners when dialog opens
   */
  React.useEffect(() => {
    if (open) {
      loadPreviousWinners()
    }
  }, [open, loadPreviousWinners])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Previous Winners History
          </DialogTitle>
          <DialogDescription>
            View all winners from previous months and their details
            {previousWinners.length > 0 && (
              <span className="block mt-1 text-sm font-medium text-blue-600">
                Total Winners: {previousWinners.length}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading previous winners...</div>
          </div>
        )}

        {/* Previous Winners List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {previousWinners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No previous winners found</p>
                <p className="text-sm">Winners will appear here once declared</p>
              </div>
            ) : (
              previousWinners.map((winnerData, index) => (
                <Card key={`${winnerData.month}-${winnerData.member.id}`} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{winnerData.monthName}</CardTitle>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Winner #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Winner Details */}
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{winnerData.member.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {winnerData.member.mobile_number} • {winnerData.member.family}
                        </div>
                      </div>
                    </div>

                    {/* Token Information */}
                    {winnerData.member.token_number && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatTokenDisplay(winnerData.member.token_number)}
                        </Badge>
                      </div>
                    )}

                    {/* Additional Information */}
                    {winnerData.member.additional_information && (
                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        <p>{winnerData.member.additional_information}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
