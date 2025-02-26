'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMakerByUsername } from '../../../lib/supabase/makers'
import { Send, ShoppingCart, Check, Loader2, Mail, User } from 'lucide-react'

export default function RequestPage({ params }: { params: { artist: string } }) {
  const router = useRouter()
  const [maker, setMaker] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [currentDescription, setCurrentDescription] = useState<string>("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [askedForContact, setAskedForContact] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMakerData()
  }, [params.artist])

  const loadMakerData = async () => {
    try {
      const makerData = await getMakerByUsername(params.artist)
      console.log("Loaded maker data:", makerData)
      setMaker(makerData)

      const greeting = `Hi! I'm here to help you commission something from ${makerData.name}. What would you like to have made?`

      setMessages([
        { role: 'assistant', content: greeting }
      ])

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading maker:', err)
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if we need contact details after a few exchanges
  useEffect(() => {
    if (messages.length >= 6 && !askedForContact && !customerEmail && !customerName) {
      setAskedForContact(true)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "This sounds like a great commission! To proceed, I'll need your contact details. What email address should the maker use to contact you?" 
      }])
    }
  }, [messages, askedForContact, customerEmail, customerName])

  // Redirect when order is placed
  useEffect(() => {
    if (orderPlaced) {
      // Wait a moment to show success message then redirect
      const timer = setTimeout(() => {
        router.push(`/${params.artist}/queue`)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [orderPlaced, router, params.artist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const userMessage = input.trim()
    setInput('')
    setIsSending(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Check if this message is likely an email address
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/

      if (emailRegex.test(userMessage) && !customerEmail) {
        // This appears to be an email address
        setCustomerEmail(userMessage)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Thanks for your email address. Could you also provide your name so the maker knows who they're creating for?" 
        }])
        setIsSending(false)
        return
      }

      // If we have an email but no name, and this is a short response, treat it as a name
      if (customerEmail && !customerName && userMessage.split(' ').length <= 4) {
        setCustomerName(userMessage)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Thanks, ${userMessage}! Now we have all the details needed. Would you like to keep discussing your commission or place the order now?` 
        }])
        setIsSending(false)
        return
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          makerId: maker.id,
          categories: maker.categories,
          customerEmail: customerEmail,
          customerName: customerName,
          beMoreConcise: true
        })
      })

      const data = await response.json()
      console.log("Chat API response:", data)

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      // Update commission description
      if (data.currentDescription) {
        setCurrentDescription(data.currentDescription)
      }

      // Handle customer details
      if (data.customerEmail) {
        setCustomerEmail(data.customerEmail)
      }

      if (data.customerName) {
        setCustomerName(data.customerName)
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleOrderCommission = async () => {
    // Reset any previous error
    setOrderError(null)

    if (!customerEmail) {
      // Ask for email if not provided
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "To place your order, I'll need your email address. What email would you like to use?" 
      }])
      return
    }

    if (!customerName) {
      // Ask for name if not provided
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Could you also tell me your name so the maker knows who they're creating for?" 
      }])
      return
    }

    // Only proceed if we have all needed info
    if (customerEmail && customerName) {
      // Set loading state
      setIsPlacingOrder(true)

      // Create the commission
      try {
        console.log("Placing order with:", {
          makerId: maker.id,
          customerEmail,
          customerName,
          title: currentDescription || "Custom Commission"
        })

        const response = await fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            makerId: maker.id,
            customerEmail,
            customerName,
            title: currentDescription || "Custom Commission",
            description: messages
              .filter(m => m.role === 'user')
              .map(m => m.content)
              .join('\n'),
            chat_history: messages
          })
        })

        // Log full response for debugging
        const responseText = await response.text()
        console.log("Raw commission response:", responseText)

        // Try to parse as JSON
        let data
        try {
          data = JSON.parse(responseText)
          console.log("Parsed commission data:", data)
        } catch (e) {
          console.error("Failed to parse JSON:", e)
          throw new Error("Invalid response format")
        }

        if (data.id) {
          // Success message
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Your order has been placed successfully! Redirecting you to the queue to track your commission..." 
          }])

          // Set order placed flag - this will trigger redirect
          setOrderPlaced(true)
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error('No commission ID returned')
        }
      } catch (err: any) {
        console.error('Error creating commission:', err)
        setOrderError(err.message || "Unknown error")
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `I'm sorry, there was an error placing your order: ${err.message || "Please try again"}` 
        }])
        setIsPlacingOrder(false)
      }
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={() => router.push(`/${params.artist}/queue`)}
          className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Queue
        </button>
        <button
          onClick={() => router.push(`/${params.artist}`)}
          className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Profile
        </button>
      </div>

      {/* Current Commission */}
      {currentDescription && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">Current Request:</p>
              <p className="text-gray-700">{currentDescription}</p>
            </div>
            {orderPlaced ? (
              <div className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg flex items-center gap-2">
                <Check size={18} />
                Order Placed!
              </div>
            ) : (
              <button
                onClick={handleOrderCommission}
                disabled={isPlacingOrder}
                className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:bg-green-300"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Place Order
                  </>
                )}
              </button>
            )}
          </div>

          {/* Contact Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} />
              {customerEmail ? (
                <span>Email: <strong>{customerEmail}</strong></span>
              ) : (
                <span className="text-red-500">Email address needed</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              {customerName ? (
                <span>Name: <strong>{customerName}</strong></span>
              ) : (
                <span className="text-red-500">Name needed</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          <p className="font-medium">Error placing order:</p>
          <p>{orderError}</p>
        </div>
      )}

      {/* Chat Window */}
        

        {/* Chat Window */}
        <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ height: "600px" }}>
          {/* Messages - Set overflow correctly */}
          <div 
            className="flex-1 overflow-y-scroll p-6"
            style={{ overflowY: 'scroll' }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-6 flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2">
                    👤
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  🤖
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>•</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form - Set explicit height and ensure it's shown */}
          <div className="border-t" style={{ minHeight: "80px" }}>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSending || orderPlaced}
                />
                <button
                  type="submit"
                  disabled={isSending || orderPlaced}
                  className="px-6 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        
    </div>
  )
}