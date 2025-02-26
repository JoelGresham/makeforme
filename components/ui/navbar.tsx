// components/ui/navbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <Link href="/" className="flex items-center font-bold text-xl">
              MakeForMe
            </Link>
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link href="/discover" className="text-gray-600 hover:text-gray-900">
                Discover
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/discover"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              Discover
            </Link>
            <Link 
              href="/how-it-works"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              How It Works
            </Link>
            <Link 
              href="/pricing"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link 
              href="/login"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link 
              href="/signup"
              className="block px-3 py-2 bg-blue-600 text-white rounded-lg"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}