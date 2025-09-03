'use client'

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { Receipt, User, Phone, Hash, Users, Calendar, CreditCard, MessageSquare, Printer, IndianRupee } from "lucide-react"
import { Member, MonthTable, formatMonthName } from "@/lib/supabase"
import { formatPhoneNumber, formatTokenDisplay } from "@/lib/utils"
import { sendWhatsAppMessage, generateReceiptMessage } from "@/lib/whatsapp"

/**
 * Props for the ReceiptDialog component
 */
interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  currentMonth: MonthTable
}

/**
 * Receipt Dialog Component
 * Displays a professional receipt showing customer details and payment information
 * Includes options to print the receipt and send via WhatsApp
 */
export function ReceiptDialog({
  open,
  onOpenChange,
  member,
  currentMonth
}: ReceiptDialogProps) {
  // State for WhatsApp sending
  const [isSendingWhatsApp, setIsSendingWhatsApp] = React.useState(false)
  const [whatsappStatus, setWhatsappStatus] = React.useState<'idle' | 'success' | 'error'>('idle')

  // Don't render if no member is selected
  if (!member) return null

  /**
   * Format the payment date for display
   * Uses updated_at field when payment status is 'paid'
   * Shows current date if payment is pending/overdue
   */
  const getPaymentDate = () => {
    if (member.payment_status === 'paid') {
      // Use the updated_at timestamp when payment was marked as paid
      const date = new Date(member.updated_at)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      // For pending/overdue payments, show current date
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  /**
   * Handle printing the receipt
   * Opens the browser's print dialog
   */
  const handlePrint = () => {
    window.print()
  }

  /**
   * Handle sending receipt via WhatsApp
   * Generates receipt message and sends to member's mobile number
   */
  const handleSendWhatsApp = async () => {
    if (!member) return

    setIsSendingWhatsApp(true)
    setWhatsappStatus('idle')

    try {
      // Generate receipt message
      const message = generateReceiptMessage(member, currentMonth)

      // Send via WhatsApp
      const result = await sendWhatsAppMessage(member.mobile_number, message)

      if (result.success) {
        setWhatsappStatus('success')
        // Reset status after 3 seconds
        setTimeout(() => setWhatsappStatus('idle'), 3000)
      } else {
        setWhatsappStatus('error')
        // Reset status after 3 seconds
        setTimeout(() => setWhatsappStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error sending WhatsApp receipt:', error)
      setWhatsappStatus('error')
      // Reset status after 3 seconds
      setTimeout(() => setWhatsappStatus('idle'), 3000)
    } finally {
      setIsSendingWhatsApp(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md print:max-w-none print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Payment Receipt - {member.full_name}
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="space-y-4 print:space-y-2 receipt-print-content">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-border pb-4 print:pb-2">
            <h2 className="text-xl font-bold text-foreground">RAFI GOLD SAVING SCHEME</h2>
            <p className="text-sm text-muted-foreground">Payment Receipt</p>
            {member.payment_status === 'paid' && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">✓ Payment Confirmed</p>
            )}
          </div>

          {/* Member Details */}
          <div className="space-y-3 print:space-y-2">
            {/* Token Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Token Number:</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {member.token_number ? formatTokenDisplay(member.token_number) : 'N/A'}
              </Badge>
            </div>

            {/* Member Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Member Name:</span>
              </div>
              <span className="text-sm text-foreground font-medium">{member.full_name}</span>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Mobile:</span>
              </div>
              <span className="text-sm text-foreground">{formatPhoneNumber(member.mobile_number)}</span>
            </div>

            {/* Family */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Family:</span>
              </div>
              <span className="text-sm text-foreground">{member.family}</span>
            </div>

            {/* Month */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Month:</span>
              </div>
              <span className="text-sm text-foreground">{formatMonthName(currentMonth)}</span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Amount:</span>
              </div>
              <span className="text-sm text-foreground font-medium">₹2000</span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Payment Status:</span>
              </div>
              <Badge
                variant={member.payment_status === 'paid' ? 'default' : 'secondary'}
                className={member.payment_status === 'paid' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
              >
                {member.payment_status.toUpperCase()}
              </Badge>
            </div>

            {/* Paid To (if applicable) */}
            {member.paid_to && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Paid To:</span>
                <Badge variant="outline" className="text-xs">
                  {member.paid_to}
                </Badge>
              </div>
            )}

            {/* Payment Date */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Payment Date:</span>
              <span className="text-sm text-foreground">{getPaymentDate()}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center border-t border-border pt-4 print:pt-2">
            <p className="text-sm text-muted-foreground font-medium">Thank you for your payment!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generated on: {new Date().toLocaleDateString()}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>RAFI GOLD SAVING SCHEME</p>
              <p>This receipt serves as proof of payment</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex gap-2 pt-4 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            disabled={isSendingWhatsApp}
            className={`flex-1 ${
              whatsappStatus === 'success'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : whatsappStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {isSendingWhatsApp
              ? 'Sending...'
              : whatsappStatus === 'success'
              ? 'Sent!'
              : whatsappStatus === 'error'
              ? 'Failed'
              : 'WhatsApp'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
