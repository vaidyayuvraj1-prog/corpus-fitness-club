import React from 'react'
import { Outlet } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col selection:bg-[#E50914] selection:text-white">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
