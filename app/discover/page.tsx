'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getAllMakers } from '../../lib/supabase/makers'

export default function DiscoverPage() {
  const [makers, setMakers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadMakers()
  }, [])

  const loadMakers = async () => {
    try {
      setIsLoading(true)
      const data = await getAllMakers()
      setMakers(data)
    } catch (err) {
      setError("Failed to load makers")
      console.error("Error loading makers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMakers = makers.filter(maker => {
    const matchesSearch = maker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maker.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "" || 
                          maker.categories?.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center">Loading makers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Maker</h1>
        <p className="text-gray-600">
          Discover skilled artisans and craftspeople for your custom project
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {['woodworking', 'metalwork', 'ceramics', 'textiles', 'jewelry'].map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Makers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMakers.map(maker => (
          <div key={maker.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-100"></div>
            <div className="p-6">
              <Link href={`/${maker.username}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
                  {maker.name}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4">{maker.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>📍 {maker.location}</p>
                <p>⭐ {maker.rating || 'New'} ({maker.completed_projects} projects)</p>
                <p>📅 Available from {new Date(maker.available_from || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <Link 
                  href={`/${maker.username}/queue`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Queue →
                </Link>
                <div className="flex gap-2">
                  {maker.categories?.map(category => (
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
          </div>
        ))}
      </div>

      {filteredMakers.length === 0 && (
        <div className="text-center text-gray-600 py-8">
          No makers found matching your criteria
        </div>
      )}
    </div>
  )
}