'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2, Hash, Phone, User, Trophy, Info, Users, History } from "lucide-react"
import { Member, isWinnerOfMonth, getWinnerMonth, formatMonthName, isWinnerStatus } from "@/lib/supabase"
import { formatPhoneNumber, formatTokenDisplay } from "@/lib/utils"

/**
 * Props for the MembersTable component
 */
interface MembersTableProps {
  members: Member[]
  onEditMember: (member: Member) => void
  onDeleteMember: (memberId: number) => void
  onViewHistory: (member: Member) => void
  isLoading?: boolean
  currentMonth: string // Add current month for winner highlighting
  allWinners: Record<string, Member | null> // Add all winners for context
}

/**
 * Badge variant mapping for payment status
 * Provides consistent color coding across the application
 * Shows actual payment status in current month table
 * Handles 'no_payment_required' for previous winners
 */
const getPaymentStatusBadge = (status: Member['payment_status'], member: Member) => {
  // Show actual payment status in the current month table
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>
    case 'no_payment_required':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">No Payment Required</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

/**
 * Badge variant mapping for draw status
 * Visual indicators for different draw states
 */
const getDrawStatusBadge = (status: Member['draw_status'], member: Member, currentMonth: string, allWinners: Record<string, Member | null>) => {
  // A member is the current month winner if they won in the currently selected month
  const isCurrentMonthWinner = isWinnerOfMonth(member, currentMonth as any);

  switch (status) {
    case 'winner':
      if (isCurrentMonthWinner) {
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Winner</Badge>
      } else {
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Winner</Badge>
      }
    case 'drawn':
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">Previously Won</Badge>
    case 'not_drawn':
      return <Badge variant="secondary">Not Drawn</Badge>
    default:
      // Handle month-specific winner statuses
      if (isWinnerOfMonth(member, currentMonth as any)) {
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Winner</Badge>
      } else if (getWinnerMonth(member.draw_status)) {
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Winner</Badge>
      } else {
        return <Badge variant="outline">Unknown</Badge>
      }
  }
}

/**
 * Get row styling based on member status
 * Highlights current month winners and dims previously drawn members
 */
const getRowStyling = (member: Member, currentMonth: string, allWinners: Record<string, Member | null>) => {
  // A member is the current month winner if they won in the currently selected month
  const isCurrentMonthWinner = isWinnerOfMonth(member, currentMonth as any);
  // A member is drawn if they were previously a winner but not in the current month
  const isDrawn = member.draw_status === 'drawn';

  if (isCurrentMonthWinner) {
    return 'bg-yellow-50 border-yellow-200 border-2' // Current month winner - bright yellow
  }
  if (isDrawn) {
    return 'bg-gray-50 opacity-75' // Previous winner - dimmed gray
  }
  return ''
}

/**
 * Mobile Member Card Component
 * Displays member information in a card format optimized for mobile devices
 */
function MobileMemberCard({ member, onEditMember, onDeleteMember, onViewHistory, currentMonth, allWinners }: {
  member: Member
  onEditMember: (member: Member) => void
  onDeleteMember: (memberId: number) => void
  onViewHistory: (member: Member) => void
  currentMonth: string
  allWinners: Record<string, Member | null>
}) {
  return (
    <Card className={`mb-4 ${getRowStyling(member, currentMonth, allWinners)}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header with Token */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {member.token_number && (
              <Badge variant="outline" className="font-mono text-xs">
                {formatTokenDisplay(member.token_number)}
              </Badge>
            )}
            {member.draw_status === 'winner' && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
            {(member.draw_status !== 'winner' && isWinnerStatus(member.draw_status)) && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewHistory(member)}
              className="h-8 w-8"
              title="View History"
            >
              <History className="h-4 w-4" />
              <span className="sr-only">View member history</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditMember(member)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit member</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteMember(member.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete member</span>
            </Button>
          </div>
        </div>

        {/* Member Name */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{member.full_name}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatPhoneNumber(member.mobile_number)}</span>
          </div>
        </div>

        {/* Family Information */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {member.family === 'Individual' ? (
              <span className="text-sm text-muted-foreground">{member.family}</span>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {member.family}
              </Badge>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {getPaymentStatusBadge(member.payment_status, member)}
          {getDrawStatusBadge(member.draw_status, member, currentMonth, allWinners)}
        </div>

        {/* Payment Information */}
        {member.paid_to && (
          <div className="text-xs text-muted-foreground">
            Paid to: {member.paid_to}
          </div>
        )}
        {member.payment_status === 'no_payment_required' && !member.paid_to && (
          <div className="text-xs text-blue-600 font-medium">
            No payment required (previous winner)
          </div>
        )}

        {/* Additional Information */}
        {member.additional_information && (
          <div className="pt-2 border-t">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{member.additional_information}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Members Table Component
 * Displays the complete list of members with all their information
 * Mobile-first responsive design with progressive enhancement
 */
export function MembersTable({
  members,
  onEditMember,
  onDeleteMember,
  onViewHistory,
  isLoading = false,
  currentMonth,
  allWinners
}: MembersTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading members...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No members found</h3>
            <p className="text-muted-foreground">
              Start by adding your first member to the scheme register.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile View */}
        <div className="block md:hidden p-4 space-y-4">
          {members.map((member) => (
            <MobileMemberCard
              key={member.id}
              member={member}
              onEditMember={onEditMember}
              onDeleteMember={onDeleteMember}
              onViewHistory={onViewHistory}
              currentMonth={currentMonth}
              allWinners={allWinners}
            />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-lg underline underline-offset-4">Token</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Name</TableHead>
                <TableHead className="text-lg underline underline-offset-4   ">Mobile</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Family</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Payment</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Paid To</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Draw Status</TableHead>
                <TableHead className="text-lg underline underline-offset-4">Notes</TableHead>
                <TableHead className="w-[120px] text-lg underline underline-offset-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                // A member is the current month winner if they won in the currently selected month
                const isCurrentMonthWinner = isWinnerOfMonth(member, currentMonth as any);
                // A member is drawn if they were previously a winner but not in the current month
                const isDrawn = member.draw_status === 'drawn';

                let rowClass = getRowStyling(member, currentMonth, allWinners);
                // The getRowStyling function already handles all the styling logic
                // No need to add additional classes here

                return (
                  <TableRow
                    key={member.id}
                    className={rowClass}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {member.token_number ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {formatTokenDisplay(member.token_number)}
                          </Badge>
                        ) : (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        )}
                        {(member.draw_status === 'winner' || isWinnerStatus(member.draw_status)) && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{formatPhoneNumber(member.mobile_number)}</TableCell>
                    <TableCell>
                      {member.family === 'Individual' ? (
                        <span className="text-sm text-muted-foreground">{member.family}</span>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {member.family}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(member.payment_status, member)}</TableCell>
                    <TableCell>
                      {member.paid_to && (
                        <Badge variant="outline" className="text-xs">
                          {member.paid_to}
                        </Badge>
                      )}
                      {member.payment_status === 'no_payment_required' && !member.paid_to && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          No payment required
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getDrawStatusBadge(member.draw_status, member, currentMonth, allWinners)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {member.additional_information && (
                        <div className="truncate text-sm text-muted-foreground" title={member.additional_information}>
                          {member.additional_information}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewHistory(member)}
                          className="h-8 w-8"
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                          <span className="sr-only">View member history</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditMember(member)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit member</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMember(member.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete member</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
