'use client'

import { useState, useEffect } from 'react'
import { getMakerByUsername, getMakerCommissions } from '../../../lib/supabase/makers'

export default function QueuePage({ params }: { params: { artist: string } }) {
  const [maker, setMaker] = useState<any>(null)
  const [commissions, setCommissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadQueueData()
  }, [params.artist])

  const loadQueueData = async () => {
    try {
      setIsLoading(true)
      const makerData = await getMakerByUsername(params.artist)
      setMaker(makerData)

      if (makerData?.id) {
        const commissionsData = await getMakerCommissions(makerData.id)
        setCommissions(commissionsData)
      }
    } catch (err) {
      setError("Failed to load queue")
      console.error("Error loading queue:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (error || !maker) {
    return <div className="p-8 text-center text-red-600">{error || "Queue not found"}</div>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{maker.name}'s Queue</h1>
        <p className="text-gray-600">Current and completed commissions</p>
      </div>

      {/* Status Legend */}
      <div className="mb-8 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span>Completed</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-6">
        {commissions.map((commission) => (
          <div 
            key={commission.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
              commission.status === 'completed' ? 'border-green-500' :
              commission.status === 'in-progress' ? 'border-blue-500' :
              'border-yellow-500'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{commission.title}</h3>
                  <p className="text-gray-600">{commission.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  commission.status === 'completed' ? 'bg-green-100 text-green-800' :
                  commission.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                </span>
              </div>

              {/* Images */}
              {(commission.sketch_url || commission.final_image_url) && (
                <div className="flex gap-4 mb-4">
                  {commission.sketch_url && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Sketch</p>
                      <div className="w-40 h-40 bg-gray-100 rounded"></div>
                    </div>
                  )}
                  {commission.final_image_url && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Final</p>
                      <div className="w-40 h-40 bg-gray-100 rounded"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="flex gap-4 text-sm text-gray-500">
                {commission.material_cost && (
                  <span>Materials: ${commission.material_cost}</span>
                )}
                {commission.time_spent && (
                  <span>Time: {commission.time_spent}h</span>
                )}
                {commission.payment && (
                  <span>Payment: ${commission.payment}</span>
                )}
                <span>Created: {new Date(commission.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {commissions.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No commissions in the queue yet
          </div>
        )}
      </div>
    </div>
  )
}