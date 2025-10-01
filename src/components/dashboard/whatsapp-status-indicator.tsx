'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { checkBackendHealth, checkWhatsAppStatus } from "@/lib/whatsapp"

/**
 * WhatsApp Connection Status Indicator Component
 * Shows the current status of the WhatsApp backend connection
 * Provides real-time status updates and manual refresh functionality
 */
export function WhatsAppStatusIndicator() {
  // Connection status state
  const [backendStatus, setBackendStatus] = React.useState<{
    isAccessible: boolean;
    status: string;
    error?: string;
  } | null>(null)

  const [whatsappStatus, setWhatsappStatus] = React.useState<{
    isReady: boolean;
    status: string;
    error?: string;
  } | null>(null)

  // Loading state for refresh operations
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  /**
   * Check backend and WhatsApp status
   */
  const checkStatus = React.useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Check both backend health and WhatsApp status in parallel
      const [backendResult, whatsappResult] = await Promise.all([
        checkBackendHealth(),
        checkWhatsAppStatus()
      ])

      setBackendStatus(backendResult)
      setWhatsappStatus(whatsappResult)
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
      setBackendStatus({
        isAccessible: false,
        status: 'Error checking status',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  /**
   * Check status when component mounts
   */
  React.useEffect(() => {
    checkStatus()
  }, [checkStatus])

  /**
   * Auto-refresh status every 30 seconds
   */
  React.useEffect(() => {
    const interval = setInterval(checkStatus, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [checkStatus])

  /**
   * Get status badge variant based on connection status
   */
  const getStatusBadgeVariant = (isReady: boolean, isAccessible: boolean) => {
    if (!isAccessible) return "destructive"
    if (isReady) return "default"
    return "secondary"
  }

  /**
   * Get status icon based on connection status
   */
  const getStatusIcon = (isReady: boolean, isAccessible: boolean) => {
    if (!isAccessible) return <XCircle className="h-4 w-4 text-red-500" />
    if (isReady) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  /**
   * Get status text based on connection status
   */
  const getStatusText = (isReady: boolean, isAccessible: boolean, status: string) => {
    if (!isAccessible) return "Backend Offline"
    if (isReady) return "WhatsApp Ready"
    return status || "Connecting..."
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp Status
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkStatus}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Backend</span>
          <div className="flex items-center gap-2">
            {backendStatus && getStatusIcon(backendStatus.isAccessible, backendStatus.isAccessible)}
            <Badge variant={getStatusBadgeVariant(backendStatus?.isAccessible || false, backendStatus?.isAccessible || false)}>
              {backendStatus ? getStatusText(backendStatus.isAccessible, backendStatus.isAccessible, backendStatus.status) : "Checking..."}
            </Badge>
          </div>
        </div>

        {/* WhatsApp Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">WhatsApp</span>
          <div className="flex items-center gap-2">
            {whatsappStatus && getStatusIcon(whatsappStatus.isReady, backendStatus?.isAccessible || false)}
            <Badge variant={getStatusBadgeVariant(whatsappStatus?.isReady || false, backendStatus?.isAccessible || false)}>
              {whatsappStatus ? getStatusText(whatsappStatus.isReady, backendStatus?.isAccessible || false, whatsappStatus.status) : "Checking..."}
            </Badge>
          </div>
        </div>

        {/* Error Messages */}
        {(backendStatus?.error || whatsappStatus?.error) && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded border">
            {backendStatus?.error && (
              <div>Backend: {backendStatus.error}</div>
            )}
            {whatsappStatus?.error && (
              <div>WhatsApp: {whatsappStatus.error}</div>
            )}
          </div>
        )}

        {/* Status Summary */}
        <div className="text-xs text-muted-foreground">
          {backendStatus?.isAccessible && whatsappStatus?.isReady ? (
            <span className="text-green-600">✅ Ready to send messages</span>
          ) : backendStatus?.isAccessible && !whatsappStatus?.isReady ? (
            <span className="text-yellow-600">⚠️ Backend online, WhatsApp connecting...</span>
          ) : (
            <span className="text-red-600">❌ Cannot send messages</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
