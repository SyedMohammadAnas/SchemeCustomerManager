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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Member, PaymentStatus } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import {
  sendBulkReminders,
  sendWhatsAppMessage,
  generateReminderMessage,
  calculateDeadlineInfo,
  checkWhatsAppStatus
} from "@/lib/whatsapp"
import { User, AlertCircle, MessageSquare, Send, Loader2, Search, X } from "lucide-react"

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
  // State for WhatsApp reminder functionality
  const [isWhatsAppReady, setIsWhatsAppReady] = React.useState(false)
  const [isSendingBulk, setIsSendingBulk] = React.useState(false)
  const [sendingIndividual, setSendingIndividual] = React.useState<Set<number>>(new Set())
  const [bulkProgress, setBulkProgress] = React.useState<{ current: number; total: number; memberName: string } | null>(null)
  const [deadlineInfo] = React.useState(calculateDeadlineInfo())

  // State for search functionality
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter unpaid members (pending and overdue)
  // Exclude members with 'no_payment_required' status since they don't need to pay
  const unpaidMembers = React.useMemo(() => {
    return members.filter(member =>
      // Only show as unpaid if they have pending/overdue payment
      (member.payment_status === 'pending' || member.payment_status === 'overdue')
    )
  }, [members])

  // Filter members based on search query
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return unpaidMembers
    }

    const query = searchQuery.toLowerCase().trim()
    return unpaidMembers.filter(member =>
      member.full_name.toLowerCase().includes(query) ||
      member.mobile_number.includes(query) ||
      member.family.toLowerCase().includes(query) ||
      (member.token_number && member.token_number.toString().includes(query))
    )
  }, [unpaidMembers, searchQuery])

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

  // WhatsApp reminder handlers
  const handleBulkReminder = async () => {
    if (filteredMembers.length === 0) return

    setIsSendingBulk(true)
    setBulkProgress(null)

    try {
      const results = await sendBulkReminders(filteredMembers, (current, total, memberName) => {
        setBulkProgress({ current, total, memberName })
      })

      if (results.sent > 0) {
        alert(`✅ Bulk reminder sent successfully!\n\n📊 Results:\n• Sent: ${results.sent}\n• Failed: ${results.failed}`)
      } else {
        alert(`❌ All messages failed to send. Please check the console for details.`)
      }
    } catch (error) {
      console.error('Error sending bulk reminders:', error)
      alert('❌ Failed to send bulk reminders. Please try again.')
    } finally {
      setIsSendingBulk(false)
      setBulkProgress(null)
    }
  }

  const handleIndividualReminder = async (member: Member) => {
    setSendingIndividual(prev => new Set(prev).add(member.id))

    try {
      const isOverdue = member.payment_status === 'overdue'
      const message = generateReminderMessage(member.full_name, isOverdue)

            const result = await sendWhatsAppMessage(member.mobile_number, message)

      if (result.success === true) {
        alert(`✅ Reminder sent successfully to ${member.full_name}`)
      } else {
        alert(`❌ Failed to send reminder to ${member.full_name}: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('Error sending individual reminder:', error)
      alert(`❌ Failed to send reminder to ${member.full_name}`)
    } finally {
      setSendingIndividual(prev => {
        const newSet = new Set(prev)
        newSet.delete(member.id)
        return newSet
      })
    }
  }

  // Check WhatsApp status when dialog opens
  React.useEffect(() => {
    if (open) {
      checkWhatsAppStatus().then(status => {
        setIsWhatsAppReady(status.isReady)
      })
    }
  }, [open])

  // Group filtered members by payment status
  const pendingMembers = filteredMembers.filter(m => m.payment_status === 'pending')
  const overdueMembers = filteredMembers.filter(m => m.payment_status === 'overdue')

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

        {/* Search Bar */}
        {unpaidMembers.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone number, family, or token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 text-sm text-muted-foreground">
                Found {filteredMembers.length} of {unpaidMembers.length} unpaid members
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Reminder Section */}
        {filteredMembers.length > 0 && (
          <div className="mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-blue-600">Reminders</h3>
                      <p className="text-sm text-muted-foreground">
                        {deadlineInfo.isOverdue ? (
                          <span className="text-red-600 font-medium"> • Payment is OVERDUE!</span>
                        ) : (
                          <span className="text-orange-600 font-medium"> • {deadlineInfo.daysRemaining} days remaining</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* WhatsApp Status Indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isWhatsAppReady ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {isWhatsAppReady ? 'Ready' : 'Offline'}
                      </span>
                    </div>

                    {/* Bulk Reminder Button */}
                    <Button
                      onClick={handleBulkReminder}
                      disabled={!isWhatsAppReady || isSendingBulk || filteredMembers.length === 0}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSendingBulk ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {bulkProgress ? `Sending (${bulkProgress.current}/${bulkProgress.total})` : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Bulk Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress indicator for bulk sending */}
                {bulkProgress && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Sending to: {bulkProgress.memberName}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Unpaid Members List */}
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchQuery.trim() ? (
                  <>
                    <p>No members found matching your search</p>
                    <p className="text-sm">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <p>All members have paid!</p>
                    <p className="text-sm">No unpaid members found</p>
                  </>
                )}
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
                        {/* Member Name, Token, and Send Reminder Button */}
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
                          <div className="flex items-center gap-2">
                            {member.token_number && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {formatTokenDisplay(member.token_number)}
                              </Badge>
                            )}
                            {/* Individual Reminder Button */}
                            <Button
                              onClick={() => handleIndividualReminder(member)}
                              disabled={!isWhatsAppReady || sendingIndividual.has(member.id)}
                              size="sm"
                              variant="outline"
                            >
                              {sendingIndividual.has(member.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </>
                              )}
                            </Button>
                          </div>
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
                              value={member.paid_to || ''}
                              onValueChange={(value) => handlePaidToChange(member.id, value)}
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
                        {/* Member Name, Token, and Send Reminder Button */}
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
                          <div className="flex items-center gap-2">
                            {member.token_number && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {formatTokenDisplay(member.token_number)}
                              </Badge>
                            )}
                            {/* Individual Reminder Button */}
                            <Button
                              onClick={() => handleIndividualReminder(member)}
                              disabled={!isWhatsAppReady || sendingIndividual.has(member.id)}
                              size="sm"
                              variant="outline"
                            >
                              {sendingIndividual.has(member.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </>
                              )}
                            </Button>
                          </div>
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
                              value={member.paid_to || ''}
                              onValueChange={(value) => handlePaidToChange(member.id, value)}
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
