import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import MobileNav from './MobileNav'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Top Navigation Bar */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Main Content */}
      <main className="md:ml-64 md:pt-16 pb-20 md:pb-8 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  )
}
