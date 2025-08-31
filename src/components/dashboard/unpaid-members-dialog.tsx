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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Member, isWinnerStatus, PaymentStatus, PaidToRecipient } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { User, Users, AlertCircle } from "lucide-react"

/**
 * Props for the Unpaid Members Dialog component
 */
interface UnpaidMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  onPaymentStatusChange?: (memberId: number, status: PaymentStatus) => void
  onPaidToChange?: (memberId: number, paidTo: string) => void
}

/**
 * Unpaid Members Dialog Component
 * Displays all members who haven't paid yet with their details
 */
export function UnpaidMembersDialog({
  open,
  onOpenChange,
  members,
  onPaymentStatusChange,
  onPaidToChange
}: UnpaidMembersDialogProps) {
  // Filter unpaid members (pending and overdue)
  // Exclude members with 'no_payment_required' status since they don't need to pay
  const unpaidMembers = React.useMemo(() => {
    return members.filter(member =>
      // Only show as unpaid if they have pending/overdue payment and don't have 'no_payment_required' status
      (member.payment_status === 'pending' || member.payment_status === 'overdue') &&
      member.payment_status !== 'no_payment_required'
    )
  }, [members])

  // Handler functions for payment updates
  const handlePaymentStatusChange = (memberId: number, status: PaymentStatus) => {
    if (onPaymentStatusChange) {
      onPaymentStatusChange(memberId, status)
    }
  }

  const handlePaidToChange = (memberId: number, paidTo: string) => {
    if (onPaidToChange) {
      onPaidToChange(memberId, paidTo)
    }
  }

  // Group unpaid members by payment status
  const pendingMembers = unpaidMembers.filter(m => m.payment_status === 'pending')
  const overdueMembers = unpaidMembers.filter(m => m.payment_status === 'overdue')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Unpaid Members
          </DialogTitle>
          <DialogDescription>
            Members who haven&apos;t completed their payment for this month.
            You can directly update payment status and recipient from here.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Overdue Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueMembers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Members List */}
        <div className="space-y-4">
          {unpaidMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>All members have paid!</p>
              <p className="text-sm">No unpaid members found</p>
            </div>
          ) : (
            <>
              {/* Pending Members */}
              {pendingMembers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-orange-600">Pending Payments ({pendingMembers.length})</h3>
                  {pendingMembers.map((member) => (
                    <Card key={member.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4 space-y-3">
                        {/* Member Name and Token */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.mobile_number} • {member.family}
                              </div>
                            </div>
                          </div>
                          {member.token_number && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatTokenDisplay(member.token_number)}
                            </Badge>
                          )}
                        </div>

                        {/* Family Tag */}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {member.family === 'Individual' ? (
                            <span className="text-sm text-muted-foreground">{member.family}</span>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {member.family}
                            </Badge>
                          )}
                        </div>

                        {/* Payment Status and Paid To Dropdowns */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                          {/* Payment Status */}
                          <div className="space-y-1">
                            <Label htmlFor={`payment-${member.id}`} className="text-xs text-muted-foreground">
                              Payment Status
                            </Label>
                            <Select
                              value={member.payment_status}
                              onValueChange={(value) => handlePaymentStatusChange(member.id, value as PaymentStatus)}
                              disabled={member.payment_status === 'no_payment_required'}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Paid To */}
                          <div className="space-y-1">
                            <Label htmlFor={`paid-to-${member.id}`} className="text-xs text-muted-foreground">
                              Paid To
                            </Label>
                            <Select
                              value={member.payment_status === 'no_payment_required' ? '' : (member.paid_to || '')}
                              onValueChange={(value) => handlePaidToChange(member.id, value)}
                              disabled={member.payment_status === 'no_payment_required'}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select recipient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Rafi">Rafi</SelectItem>
                                <SelectItem value="Basheer">Basheer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Additional Information */}
                        {member.additional_information && (
                          <div className="text-sm text-muted-foreground pt-2 border-t">
                            <p>{member.additional_information}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Overdue Members */}
              {overdueMembers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-red-600">Overdue Payments ({overdueMembers.length})</h3>
                  {overdueMembers.map((member) => (
                    <Card key={member.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4 space-y-3">
                        {/* Member Name and Token */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.mobile_number} • {member.family}
                              </div>
                            </div>
                          </div>
                          {member.token_number && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatTokenDisplay(member.token_number)}
                            </Badge>
                          )}
                        </div>

                        {/* Family Tag */}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {member.family === 'Individual' ? (
                            <span className="text-sm text-muted-foreground">{member.family}</span>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {member.family}
                            </Badge>
                          )}
                        </div>

                        {/* Payment Status and Paid To Dropdowns */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                          {/* Payment Status */}
                          <div className="space-y-1">
                            <Label htmlFor={`payment-overdue-${member.id}`} className="text-xs text-muted-foreground">
                              Payment Status
                            </Label>
                            <Select
                              value={member.payment_status}
                              onValueChange={(value) => handlePaymentStatusChange(member.id, value as PaymentStatus)}
                              disabled={member.payment_status === 'no_payment_required'}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Paid To */}
                          <div className="space-y-1">
                            <Label htmlFor={`paid-to-overdue-${member.id}`} className="text-xs text-muted-foreground">
                              Paid To
                            </Label>
                            <Select
                              value={member.payment_status === 'no_payment_required' ? '' : (member.paid_to || '')}
                              onValueChange={(value) => handlePaidToChange(member.id, value)}
                              disabled={member.payment_status === 'no_payment_required'}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select recipient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Rafi">Rafi</SelectItem>
                                <SelectItem value="Basheer">Basheer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Additional Information */}
                        {member.additional_information && (
                          <div className="text-sm text-muted-foreground pt-2 border-t">
                            <p>{member.additional_information}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
