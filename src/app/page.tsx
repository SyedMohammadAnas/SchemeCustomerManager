import { Dashboard } from "@/components/dashboard/dashboard"

/**
 * Main Application Page
 * Renders the complete RAFI Gold Saving Scheme dashboard
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Main Dashboard Component */}
      <Dashboard />
    </main>
  )
}
