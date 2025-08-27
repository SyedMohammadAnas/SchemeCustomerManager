'use client'

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MONTHS, MonthTable, formatMonthName } from "@/lib/supabase"

/**
 * Props for the MonthSelector component
 */
interface MonthSelectorProps {
  selectedMonth: MonthTable
  onMonthChange: (month: MonthTable) => void
  className?: string
}

/**
 * Month Selector Component
 * Allows admin to switch between different months/tables
 * Uses Shadcn Select component for professional styling
 * Mobile-first responsive design with full width on mobile
 */
export function MonthSelector({ selectedMonth, onMonthChange, className }: MonthSelectorProps) {
  return (
    <div className={className}>
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-full sm:w-[200px] text-sm sm:text-base">
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonthName(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
