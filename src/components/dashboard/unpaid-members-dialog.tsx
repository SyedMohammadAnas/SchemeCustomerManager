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
import { Member } from "@/lib/supabase"
import { formatTokenDisplay } from "@/lib/utils"
import { User, Users, AlertCircle } from "lucide-react"

/**
 * Props for the Unpaid Members Dialog component
 */
interface UnpaidMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
}

/**
 * Unpaid Members Dialog Component
 * Displays all members who haven't paid yet with their details
 */
export function UnpaidMembersDialog({ open, onOpenChange, members }: UnpaidMembersDialogProps) {
  // Filter unpaid members (pending and overdue)
  const unpaidMembers = React.useMemo(() => {
    return members.filter(member =>
      member.payment_status === 'pending' || member.payment_status === 'overdue'
    )
  }, [members])

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
            Members who haven&apos;t completed their payment for this month
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
