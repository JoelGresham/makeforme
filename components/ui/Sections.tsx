'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFeaturedMakers } from '../../lib/supabase/makers'

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chat with AI</h3>
            <p className="text-gray-600">
              Describe your vision to our AI assistant, who knows each maker's skills and style
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Watch Progress</h3>
            <p className="text-gray-600">
              Follow your commission in the public queue as it moves from concept to creation
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Pay What's Fair</h3>
            <p className="text-gray-600">
              When your piece is complete, pay what you feel reflects its value
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturedMakers() {
  const [makers, setMakers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFeaturedMakers()
  }, [])

  const loadFeaturedMakers = async () => {
    try {
      setIsLoading(true)
      const data = await getFeaturedMakers()
      setMakers(data)
    } catch (err) {
      setError('Failed to load featured makers')
      console.error('Error loading featured makers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // If we're still loading, show skeleton
  if (isLoading) {
    return (
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Makers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // If there are no makers, show a friendly message
  if (!makers || makers.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Makers</h2>
          <div className="text-center">
            <p className="text-gray-600">
              No makers available yet. 
              <Link href="/artist/signup" className="text-blue-500 hover:text-blue-600 ml-2">
                Become our first maker!
              </Link>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Makers</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {makers.map((maker) => (
            <div key={maker.id} className="bg-white rounded-lg shadow p-6">
              <div className="h-48 bg-gray-100 rounded mb-4"></div>
              <Link href={`/${maker.username}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
                  {maker.name}
                </h3>
              </Link>
              <p className="text-gray-600 mb-4">
                {maker.description || 'Skilled artisan ready for commissions'}
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <p>📍 {maker.location || 'Location not specified'}</p>
                <p>✨ {maker.completed_projects || 0} completed projects</p>
                <p>📋 {maker.commission_count || 0} items in queue</p>
              </div>
              <div className="flex justify-between items-center">
                <Link 
                  href={`/${maker.username}/queue`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Queue →
                </Link>
                <div className="flex gap-2">
                  {maker.categories?.slice(0, 2).map((category: string) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}