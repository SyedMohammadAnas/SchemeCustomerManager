'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Member } from "@/lib/supabase"
import { Trophy, User } from "lucide-react"
import { formatTokenDisplay } from "@/lib/utils"

interface DeclareWinnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeclareWinner: (memberId: number) => Promise<void>
  members: Member[]
  isLoading: boolean
  hasCurrentMonthWinner: boolean // Add this prop to check if winner already exists
}

/**
 * Dialog component for declaring a winner for the current month
 * Allows selection from eligible members (paid members with tokens)
 * Provides clear visual feedback and confirmation
 */
export function DeclareWinnerDialog({
  open,
  onOpenChange,
  onDeclareWinner,
  members,
  isLoading,
  hasCurrentMonthWinner
}: DeclareWinnerDialogProps) {
  // Selected member state
  const [selectedMemberId, setSelectedMemberId] = React.useState<string>('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Filter eligible members (paid members with tokens who haven't been drawn)
  const eligibleMembers = React.useMemo(() => {
    return members.filter(member =>
      member.payment_status === 'paid' &&
      member.token_number &&
      member.draw_status === 'not_drawn'
    )
  }, [members])

  // Get selected member details
  const selectedMember = React.useMemo(() => {
    if (!selectedMemberId) return null
    return members.find(member => member.id.toString() === selectedMemberId) || null
  }, [selectedMemberId, members])

  /**
   * Handle winner declaration
   */
  const handleDeclareWinner = async () => {
    if (!selectedMemberId) return

    try {
      setIsSubmitting(true)
      await onDeclareWinner(parseInt(selectedMemberId))

      // Reset form and close dialog
      setSelectedMemberId('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error declaring winner:', error)
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Reset form when dialog closes
   */
  React.useEffect(() => {
    if (!open) {
      setSelectedMemberId('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Declare Winner
          </DialogTitle>
          <DialogDescription>
            Select a member to declare as the winner for this month.
            Only paid members with token numbers are eligible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Check if winner already exists */}
          {hasCurrentMonthWinner ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-lg font-medium text-yellow-700">Winner Already Declared</p>
              <p className="text-sm">A winner has already been declared for this month.</p>
            </div>
          ) : (
            <>
              {/* Eligible members count */}
              <div className="text-sm text-muted-foreground">
                {eligibleMembers.length} eligible member(s) available
              </div>

              {/* Member selection */}
              {eligibleMembers.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="member-select">Select Winner</Label>
                  <Select
                    value={selectedMemberId}
                    onValueChange={setSelectedMemberId}
                    disabled={isLoading || isSubmitting}
                  >
                    <SelectTrigger id="member-select">
                      <SelectValue placeholder="Choose a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-xs text-muted-foreground">
                                Token {formatTokenDisplay(member.token_number)} • {member.family}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No eligible members found</p>
                  <p className="text-sm">Members must be paid and have token numbers to be eligible</p>
                </div>
              )}

              {/* Selected member confirmation */}
              {selectedMember && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">Selected Winner</span>
                  </div>
                  <div className="mt-1 text-sm text-yellow-700">
                    <div><strong>{selectedMember.full_name}</strong></div>
                    <div>Token {formatTokenDisplay(selectedMember.token_number)} • {selectedMember.family}</div>
                    <div>Mobile: {selectedMember.mobile_number}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {hasCurrentMonthWinner ? 'Close' : 'Cancel'}
          </Button>
          {/* Only show declare winner button when no winner exists and there are eligible members */}
          {!hasCurrentMonthWinner && eligibleMembers.length > 0 && (
            <Button
              onClick={handleDeclareWinner}
              disabled={!selectedMemberId || isSubmitting}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isSubmitting ? 'Declaring Winner...' : 'Declare Winner'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
