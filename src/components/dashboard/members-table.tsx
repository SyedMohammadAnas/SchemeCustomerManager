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
import { Edit2, Trash2, Hash, Phone, User, CreditCard, Trophy, Info, Users } from "lucide-react"
import { Member } from "@/lib/supabase"
import { formatPhoneNumber } from "@/lib/utils"

/**
 * Props for the MembersTable component
 */
interface MembersTableProps {
  members: Member[]
  onEditMember: (member: Member) => void
  onDeleteMember: (memberId: number) => void
  isLoading?: boolean
}

/**
 * Badge variant mapping for payment status
 * Provides consistent color coding across the application
 */
const getPaymentStatusBadge = (status: Member['payment_status']) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

/**
 * Badge variant mapping for draw status
 * Visual indicators for different draw states
 */
const getDrawStatusBadge = (status: Member['draw_status']) => {
  switch (status) {
    case 'winner':
      return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Winner</Badge>
    case 'drawn':
      return <Badge variant="outline">Drawn</Badge>
    case 'not_drawn':
      return <Badge variant="secondary">Not Drawn</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

/**
 * Mobile Member Card Component
 * Displays member information in a card format optimized for mobile devices
 */
function MobileMemberCard({ member, onEditMember, onDeleteMember }: {
  member: Member
  onEditMember: (member: Member) => void
  onDeleteMember: (memberId: number) => void
}) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        {/* Header with Token */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {member.token_number && (
              <Badge variant="outline" className="font-mono text-xs">
                Token: {member.token_number}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
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
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-base">{member.full_name}</span>
        </div>

        {/* Mobile Number */}
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{formatPhoneNumber(member.mobile_number)}</span>
        </div>

        {/* Family */}
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {member.family === 'Individual' ? (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">Individual</Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">{member.family}</Badge>
                <span className="text-xs text-muted-foreground">Family</span>
              </div>
            )}
          </span>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            {getPaymentStatusBadge(member.payment_status)}
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            {getDrawStatusBadge(member.draw_status)}
          </div>
        </div>

        {/* Additional Information */}
        {member.additional_information && (
          <div className="flex items-start space-x-2 pt-2 border-t">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm text-muted-foreground">{member.additional_information}</span>
          </div>
        )}

        {/* Paid To Information */}
        {member.paid_to && (
          <div className="text-xs text-muted-foreground pt-1">
            Paid to: {member.paid_to}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Professional Members Table Component
 * Displays all members with their information in a clean, sortable format
 * Includes action buttons for editing and deleting members
 * Mobile-responsive with card layout on small screens and table on larger screens
 */
export function MembersTable({ members, onEditMember, onDeleteMember, isLoading }: MembersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Members Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading members...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Members Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground text-center px-4">
              No members added yet. Click "Add Member" to get started.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Members Register ({members.length} members)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Card Layout */}
        <div className="block lg:hidden">
          <div className="space-y-2">
            {members.map((member) => (
              <MobileMemberCard
                key={member.id}
                member={member}
                onEditMember={onEditMember}
                onDeleteMember={onDeleteMember}
              />
            ))}
          </div>
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden lg:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] underline-offset-4 underline decoration-dashed font-extrabold">Token #</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Full Name</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Mobile Number</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Family</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Payment Status</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Paid To</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Draw Status</TableHead>
                  <TableHead className="font-extrabold underline-offset-4 underline decoration-dashed">Additional Info</TableHead>
                  <TableHead className="text-right w-[100px] underline-offset-4 underline decoration-dashed font-extrabold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    {/* Token Number */}
                    <TableCell>
                      {member.token_number ? (
                        <Badge variant="outline" className="font-mono">
                          {member.token_number}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </TableCell>

                    {/* Full Name */}
                    <TableCell className="font-medium">
                      {member.full_name}
                    </TableCell>

                    {/* Mobile Number */}
                    <TableCell className="font-mono">
                      {formatPhoneNumber(member.mobile_number)}
                    </TableCell>

                    {/* Family */}
                    <TableCell>
                      {member.family === 'Individual' ? (
                        <Badge variant="outline" className="text-xs ">Individual</Badge>
                      ) : (
                        <div className="flex flex-col items-start space-y-1">
                          <Badge variant="secondary" className="text-xs border-blue-500 text-blue-500">{member.family}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Family member
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      {getPaymentStatusBadge(member.payment_status)}
                    </TableCell>

                    {/* Paid To */}
                    <TableCell>
                      {member.paid_to || <span className="text-muted-foreground">-</span>}
                    </TableCell>

                    {/* Draw Status */}
                    <TableCell>
                      {getDrawStatusBadge(member.draw_status)}
                    </TableCell>

                    {/* Additional Information */}
                    <TableCell>
                      {member.additional_information ? (
                        <span className="text-sm">{member.additional_information}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
