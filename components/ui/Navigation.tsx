'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import styles from './Navigation.module.css'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          MakeForMe
        </Link>

        <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <Link href="/discover" className={styles.menuItem}>
            Discover
          </Link>
          <Link href="/how-it-works" className={styles.menuItem}>
            How It Works
          </Link>
          <Link href="/pricing" className={styles.menuItem}>
            Pricing
          </Link>
        </div>

        <div className={`${styles.authButtons} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <Link href="/login" className={styles.menuItem}>
            Log in
          </Link>
          <Link href="/signup" className={styles.menuItem}>
            Sign up
          </Link>
        </div>

        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}