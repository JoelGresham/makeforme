'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMakerByUsername, getMakerCommissions } from '../../lib/supabase/makers'

export default function ArtistPage({ params }: { params: { artist: string } }) {
  const [maker, setMaker] = useState<any>(null)
  const [commissions, setCommissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadMakerData()
  }, [params.artist])

  const loadMakerData = async () => {
    try {
      setIsLoading(true)
      const makerData = await getMakerByUsername(params.artist)
      setMaker(makerData)

      if (makerData?.id) {
        const commissionsData = await getMakerCommissions(makerData.id)
        setCommissions(commissionsData)
      }
    } catch (err) {
      setError("Failed to load maker profile")
      console.error("Error loading maker:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (error || !maker) {
    return <div className="p-8 text-center text-red-600">{error || "Maker not found"}</div>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="mt-6">
          <Link 
            href={`/${maker.username}/request`}
            className="block w-full py-3 px-4 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            Request Commission
          </Link>
          {maker.payment_methods && Object.keys(maker.payment_methods).length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Accepts payment via:</p>
              <div className="flex gap-2">
                {Object.entries(maker.payment_methods).map(([method, enabled]) => (
                  enabled && (
                    <span 
                      key={method}
                      className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600"
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-center mb-2">{maker.name}</h1>
            <p className="text-gray-600 text-center mb-4">
              {maker.categories?.join(", ")}
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Location:</strong> {maker.location || "Not specified"}
              </p>
              <p className="text-sm">
                <strong>Member since:</strong> {new Date(maker.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Completed projects:</strong> {maker.completed_projects}
              </p>
              {maker.rating && (
                <p className="text-sm">
                  <strong>Rating:</strong> {maker.rating} ⭐
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* About Section */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-gray-600">
              {maker.description || "No description provided"}
            </p>
          </div>

          {/* Queue Preview */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Current Queue</h2>
              <Link 
                href={`/${params.artist}/queue`}
                className="text-blue-500 hover:text-blue-600"
              >
                View Full Queue →
              </Link>
            </div>
            <div className="space-y-4">
              {commissions.slice(0, 3).map((commission) => (
                <div 
                  key={commission.id}
                  className={`border-l-4 pl-4 ${
                    commission.status === 'completed' ? 'border-green-500' :
                    commission.status === 'in-progress' ? 'border-blue-500' :
                    'border-yellow-500'
                  }`}
                >
                  <p className="font-medium">{commission.title}</p>
                  <p className="text-sm text-gray-600">
                    {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                  </p>
                </div>
              ))}
              {commissions.length === 0 && (
                <p className="text-gray-600">No active commissions</p>
              )}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Work</h2>
            {maker.portfolio_images && maker.portfolio_images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {maker.portfolio_images.map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No portfolio images yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}