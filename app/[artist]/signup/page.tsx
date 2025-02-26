'use client'

import { useState } from 'react'
import { createMaker } from '../../../lib/supabase/makers'
import { useRouter } from 'next/navigation'

export default function BecomeAMakerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    description: '',
    location: '',
    categories: [] as string[],
    payment_methods: {} as any
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      setError('')

      await createMaker(formData)
      router.push(`/${formData.username}`) // Redirect to maker's profile
    } catch (err) {
      setError('Failed to create maker profile. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Become a Maker</h1>
        <p className="text-xl text-gray-600">
          Join our community of skilled artisans and get paid fairly for your custom work
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((number) => (
              <div 
                key={number}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${step === number ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input 
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={(e) => updateFormData({ username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email"
                className="w-full p-2 border rounded"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Your Craft</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <div className="space-y-2">
                {['woodworking', 'metalwork', 'ceramics', 'textiles', 'jewelry'].map(category => (
                  <div key={category}>
                    <input 
                      type="checkbox"
                      id={category}
                      checked={formData.categories.includes(category)}
                      onChange={(e) => {
                        const updatedCategories = e.target.checked
                          ? [...formData.categories, category]
                          : formData.categories.filter(c => c !== category)
                        updateFormData({ categories: updatedCategories })
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Tell us about your work and experience..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input 
                type="text"
                className="w-full p-2 border rounded"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Select Payment Methods</label>
              <div className="space-y-2">
                {['paypal', 'stripe', 'venmo'].map(method => (
                  <div key={method}>
                    <input 
                      type="checkbox"
                      id={method}
                      checked={!!formData.payment_methods[method]}
                      onChange={(e) => {
                        updateFormData({
                          payment_methods: {
                            ...formData.payment_methods,
                            [method]: e.target.checked
                          }
                        })
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border rounded hover:bg-gray-50"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          <button 
            onClick={() => {
              if (step < 3) {
                setStep(step + 1)
              } else {
                handleSubmit()
              }
            }}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto disabled:bg-blue-300"
          >
            {isLoading ? 'Loading...' : step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}