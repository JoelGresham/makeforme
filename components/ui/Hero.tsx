'use client'

import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()

  return (
    <div className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-6">
          Commission Custom Work,
          <br />
          Pay What You Value
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with skilled makers through AI-assisted chat,
          watch your commission come to life, and pay what you feel is fair.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/discover')}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Find a Maker
          </button>
          <button
            onClick={() => router.push('/artist/signup')}
            className="px-6 py-3 bg-white text-blue-500 font-medium rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors"
          >
            Become a Maker
          </button>
        </div>
      </div>
    </div>
  )
}