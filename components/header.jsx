"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { isAdminRole } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Car, User, LogOut, Calendar, Settings } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Car className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">CarRental</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/cars">
            <Button variant="ghost">Browse Cars</Button>
          </Link>

          {user ? (
            <>
              <Link href="/bookings">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>
              
              {isAdminRole(user.role) && (
                <Link href="/admin">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>

              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
