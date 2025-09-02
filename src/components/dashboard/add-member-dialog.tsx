'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NewMember, PaymentStatus } from "@/lib/supabase"
import { validatePhoneNumber } from "@/lib/utils"
import { DatabaseService } from "@/lib/database"

/**
 * Props for the AddMemberDialog component
 */
interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMember: (member: NewMember) => Promise<void>
  isLoading?: boolean
  familySuggestions?: string[]
  currentMonth?: string // Add current month for family number lookup
}

/**
 * Add Member Dialog Component
 * Professional form for adding new members to the register
 * Includes validation for required fields and phone numbers
 * Mobile-optimized with responsive design
 * Now includes manual family number sharing option
 */
export function AddMemberDialog({ open, onOpenChange, onAddMember, isLoading, familySuggestions, currentMonth }: AddMemberDialogProps) {
  // Form state management
  const [formData, setFormData] = React.useState<NewMember>({
    full_name: '',
    mobile_number: '',
    family: 'Individual',
    payment_status: 'pending',
    paid_to: undefined,
    draw_status: 'not_drawn',
    additional_information: ''
  })

  // Custom family input state
  const [customFamilyName, setCustomFamilyName] = React.useState('')

  // Form validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Loading state for family number sharing
  const [isLoadingFamilyNumber, setIsLoadingFamilyNumber] = React.useState(false)

  /**
   * Reset form when dialog is closed
   */
  React.useEffect(() => {
    if (!open) {
      setFormData({
        full_name: '',
        mobile_number: '',
        family: 'Individual',
        payment_status: 'pending',
        paid_to: undefined,
        draw_status: 'not_drawn',
        additional_information: ''
      })
      setCustomFamilyName('')
      setErrors({})
    }
  }, [open])

  /**
   * Handle input field changes
   */
  const handleInputChange = (field: keyof NewMember, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Reset custom family name when selecting existing family
    if (field === 'family' && value !== '__new__') {
      setCustomFamilyName('')
    }
  }

  /**
   * Handle sharing family mobile number
   * Fetches the mobile number from the first family member and applies it
   */
  const handleShareFamilyNumber = async () => {
    if (!currentMonth || !formData.family || formData.family === 'Individual' || formData.family === '__new__') {
      return
    }

    setIsLoadingFamilyNumber(true)
    try {
      const familyMobileNumber = await DatabaseService.getFamilyMobileNumber(currentMonth as any, formData.family)
      if (familyMobileNumber) {
        setFormData(prev => ({ ...prev, mobile_number: familyMobileNumber }))
        // Clear any mobile number validation errors
        if (errors.mobile_number) {
          setErrors(prev => ({ ...prev, mobile_number: '' }))
        }
      }
    } catch (error) {
      console.error('Error fetching family mobile number:', error)
    } finally {
      setIsLoadingFamilyNumber(false)
    }
  }

  /**
   * Check if family number sharing button should be shown
   */
  const shouldShowShareFamilyButton = () => {
    return formData.family &&
           formData.family !== 'Individual' &&
           formData.family !== '__new__' &&
           familySuggestions?.includes(formData.family) &&
           currentMonth
  }

  /**
   * Validate form data before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate full name
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters'
    }

    // Validate mobile number
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required'
    } else if (!validatePhoneNumber(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid mobile number'
    }

    // Validate family name
    if (formData.family === '__new__') {
      if (!customFamilyName.trim()) {
        newErrors.family = 'Please enter a new family name'
      } else if (customFamilyName.trim().length < 2) {
        newErrors.family = 'Family name must be at least 2 characters'
      }
    } else if (!formData.family || formData.family === 'Individual') {
      // Individual is valid, no error needed
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Clean up form data before submission
      const cleanedData: NewMember = {
        full_name: formData.full_name.trim(),
        mobile_number: formData.mobile_number.trim(),
        family: formData.family === '__new__' ? customFamilyName.trim() : (formData.family || 'Individual'),
        payment_status: formData.payment_status,
        paid_to: formData.paid_to || null,
        draw_status: formData.draw_status,
        additional_information: formData.additional_information?.trim() || null
      }

      await onAddMember(cleanedData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding member:', error)
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Member</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill in the member details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm sm:text-base">
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter full name"
              className={`${errors.full_name ? "border-destructive" : ""} text-sm sm:text-base`}
            />
            {errors.full_name && (
              <p className="text-xs sm:text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          {/* Mobile Number Field */}
          <div className="space-y-2">
            <Label htmlFor="mobile_number" className="text-sm sm:text-base">
              Mobile Number *
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="mobile_number"
                value={formData.mobile_number}
                onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                placeholder="Enter mobile number"
                className={`${errors.mobile_number ? "border-destructive" : ""} text-sm sm:text-base flex-1`}
                type="tel"
              />
              {shouldShowShareFamilyButton() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShareFamilyNumber}
                  disabled={isLoadingFamilyNumber}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  {isLoadingFamilyNumber ? "Loading..." : "Share Family #"}
                </Button>
              )}
            </div>
            {errors.mobile_number && (
              <p className="text-xs sm:text-sm text-destructive">{errors.mobile_number}</p>
            )}
          </div>

          {/* Family Field */}
          <div className="space-y-2">
            <Label htmlFor="family" className="text-sm sm:text-base">
              Family *
            </Label>
            <Select
              value={formData.family}
              onValueChange={(value) => handleInputChange('family', value)}
            >
              <SelectTrigger className="text-sm sm:text-base w-full">
                <SelectValue placeholder="Select family or type new name" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto w-full min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="Individual">Individual</SelectItem>
                {familySuggestions?.map((family) => (
                  <SelectItem key={family} value={family}>
                    {family}
                  </SelectItem>
                ))}
                <SelectItem value="__new__">+ Add New Family</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Family Input - shown when "Add New Family" is selected */}
            {formData.family === '__new__' && (
              <div className="mt-2">
                <Input
                  placeholder="Enter new family name"
                  value={customFamilyName}
                  onChange={(e) => setCustomFamilyName(e.target.value)}
                  className={`text-sm ${customFamilyName.trim().length >= 2 ? 'border-green-500' : ''}`}
                />
                {customFamilyName.trim().length >= 2 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Family name is ready
                  </p>
                )}
              </div>
            )}

            {errors.family && (
              <p className="text-xs sm:text-sm text-destructive">{errors.family}</p>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Select existing family or create a new one. Family members can have their own mobile numbers.
              </p>
              {formData.family && formData.family !== 'Individual' && formData.family !== '__new__' && familySuggestions?.includes(formData.family) && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>Family Exists:</strong> This family already has members. You can use the "Share Family #" button to copy their mobile number, or keep your own.
                </p>
              )}
            </div>
          </div>

          {/* Payment Status and Paid To Fields - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Status Field */}
            <div className="space-y-2">
              <Label htmlFor="payment_status" className="text-sm sm:text-base">
                Payment Status
              </Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleInputChange('payment_status', value as PaymentStatus)}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paid To Field */}
            <div className="space-y-2">
              <Label htmlFor="paid_to" className="text-sm sm:text-base">
                Paid To
              </Label>
              <Select
                value={formData.paid_to || ''}
                onValueChange={(value) => handleInputChange('paid_to', value)}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rafi">Rafi</SelectItem>
                  <SelectItem value="Basheer">Basheer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information Field */}
          <div className="space-y-2">
            <Label htmlFor="additional_information" className="text-sm sm:text-base">
              Additional Information
            </Label>
            <Input
              id="additional_information"
              value={formData.additional_information || ''}
              onChange={(e) => handleInputChange('additional_information', e.target.value)}
              placeholder="Enter any additional notes (optional)"
              className="text-sm sm:text-base"
            />
          </div>

          <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
