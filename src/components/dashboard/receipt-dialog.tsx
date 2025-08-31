'use client'

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, User, Phone, Hash, Users, Calendar, CreditCard, Download, Printer } from "lucide-react"
import { Member, MonthTable, formatMonthName } from "@/lib/supabase"
import { formatPhoneNumber, formatTokenDisplay } from "@/lib/utils"

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
 * Includes options to download/print the receipt
 */
export function ReceiptDialog({
  open,
  onOpenChange,
  member,
  currentMonth
}: ReceiptDialogProps) {
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
   * Handle downloading the receipt as PDF
   * Uses browser's print-to-PDF functionality
   */
  const handleDownload = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${member.full_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { border: 2px solid #000; padding: 20px; max-width: 400px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .detail { margin: 10px 0; }
              .label { font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>RAFI GOLD SAVING SCHEME</h2>
                <p>Payment Receipt</p>
              </div>
              <div class="detail">
                <span class="label">Token Number:</span> ${member.token_number ? formatTokenDisplay(member.token_number) : 'N/A'}
              </div>
              <div class="detail">
                <span class="label">Member Name:</span> ${member.full_name}
              </div>
              <div class="detail">
                <span class="label">Mobile:</span> ${formatPhoneNumber(member.mobile_number)}
              </div>
              <div class="detail">
                <span class="label">Family:</span> ${member.family}
              </div>
              <div class="detail">
                <span class="label">Month:</span> ${formatMonthName(currentMonth)}
              </div>
              <div class="detail">
                <span class="label">Payment Status:</span> ${member.payment_status.toUpperCase()}
              </div>
              ${member.paid_to ? `<div class="detail"><span class="label">Paid To:</span> ${member.paid_to}</div>` : ''}
              <div class="detail">
                <span class="label">Payment Date:</span> ${getPaymentDate()}
              </div>
              <div class="footer">
                <p>Thank you for your payment!</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md print:max-w-none print:p-0">
        <DialogHeader className="print:hidden">
                  <DialogTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment Receipt - {member.full_name}
        </DialogTitle>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="space-y-4 print:space-y-2 receipt-print-content">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-gray-300 pb-4 print:pb-2">
            <h2 className="text-xl font-bold text-gray-900">RAFI GOLD SAVING SCHEME</h2>
            <p className="text-sm text-gray-600">Payment Receipt</p>
            {member.payment_status === 'paid' && (
              <p className="text-xs text-green-600 font-medium mt-1">✓ Payment Confirmed</p>
            )}
          </div>

          {/* Member Details */}
          <div className="space-y-3 print:space-y-2">
            {/* Token Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Token Number:</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {member.token_number ? formatTokenDisplay(member.token_number) : 'N/A'}
              </Badge>
            </div>

            {/* Member Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Member Name:</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">{member.full_name}</span>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Mobile:</span>
              </div>
              <span className="text-sm text-gray-900">{formatPhoneNumber(member.mobile_number)}</span>
            </div>

            {/* Family */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Family:</span>
              </div>
              <span className="text-sm text-gray-900">{member.family}</span>
            </div>

            {/* Month */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Month:</span>
              </div>
              <span className="text-sm text-gray-900">{formatMonthName(currentMonth)}</span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
              </div>
              <Badge
                variant={member.payment_status === 'paid' ? 'default' : 'secondary'}
                className={member.payment_status === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {member.payment_status.toUpperCase()}
              </Badge>
            </div>

            {/* Paid To (if applicable) */}
            {member.paid_to && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Paid To:</span>
                <Badge variant="outline" className="text-xs">
                  {member.paid_to}
                </Badge>
              </div>
            )}

            {/* Payment Date */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Payment Date:</span>
              <span className="text-sm text-gray-900">{getPaymentDate()}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center border-t border-gray-300 pt-4 print:pt-2">
            <p className="text-sm text-gray-600 font-medium">Thank you for your payment!</p>
            <p className="text-xs text-gray-500 mt-1">
              Generated on: {new Date().toLocaleDateString()}
            </p>
            <div className="mt-2 text-xs text-gray-500">
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
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
