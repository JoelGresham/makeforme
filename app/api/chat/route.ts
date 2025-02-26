import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { supabase } from '../../../lib/supabase/client'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const { 
      messages, 
      makerId, 
      categories, 
      customerEmail, 
      customerName,
      beMoreConcise = false
    } = await request.json()

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

    // Email detection
    const emailMatch = lastUserMessage?.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    const providedEmail = emailMatch ? emailMatch[0] : null

    // Check if this could be the customer's name (short message after email request)
    const previousMessages = messages.slice(-3)
    const askedForName = previousMessages.some(m => 
      m.role === 'assistant' && 
      m.content.toLowerCase().includes('name') && 
      m.content.toLowerCase().includes('provide')
    )

    const isLikelyName = askedForName && 
                         lastUserMessage?.content.split(' ').length <= 4 &&
                         !providedEmail

    // Update current description by summarizing conversation
    let currentDescription = updateDescription(messages)

    // Normal chat response
    const cleanedMessages = messages.map((msg: any) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }))

    const systemGuidance = `You're a friendly assistant helping customers commission work from an artisan who creates ${categories.join(' and ')}.

    IMPORTANT: Keep your responses SHORT and CONCISE (2-3 sentences max), but friendly. Help customers describe what they want made.

    After each exchange, summarize their current request in a SINGLE SHORT PHRASE using the format:
    [REQUEST: summary of what they want]

    Example: [REQUEST: Blue ceramic coffee mug with mountain design]

    The maker will interpret the request creatively, so no need to gather extremely detailed specs.`

    const finalMessages = cleanedMessages.length > 0 
      ? [{ role: 'assistant', content: systemGuidance }, ...cleanedMessages.slice(1)]
      : [{ role: 'assistant', content: systemGuidance }]

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: finalMessages
    })

    // Extract request summary if present
    const responseText = response.content[0].text
    const requestMatch = responseText.match(/\[REQUEST: (.*?)\]/)

    if (requestMatch && requestMatch[1]) {
      currentDescription = requestMatch[1].trim()
    }

    // Clean response for user (remove the REQUEST tag)
    const cleanedResponse = responseText.replace(/\[REQUEST: .*?\]/, '').trim()

    return NextResponse.json({
      message: cleanedResponse,
      currentDescription: currentDescription,
      customerEmail: providedEmail || customerEmail,
      customerName: isLikelyName ? lastUserMessage?.content.trim() : customerName,
      createCommission: false
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

// Helper function to update description based on conversation
function updateDescription(messages: any[]) {
  // Extract key details from conversation
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)

  // Simple extraction of potential object description
  const joinedMessages = userMessages.join(' ').toLowerCase()

  // Look for clear item mentions
  const itemMatches = joinedMessages.match(/(coffee cup|mug|ceramic|pottery|wood|jewelry|metal|sculpture|bowl|plate|vase|furniture|piece)/g)

  // Look for clear color mentions
  const colorMatches = joinedMessages.match(/(red|blue|green|yellow|purple|pink|black|white|brown|gold|silver)/g)

  // Look for descriptive adjectives
  const styleMatches = joinedMessages.match(/(small|large|tiny|huge|modern|rustic|elegant|simple|complex|unique|custom|special)/g)

  // Compile description
  let description = "Custom commission"

  if (colorMatches && colorMatches.length > 0) {
    description = colorMatches[colorMatches.length - 1] + " " + description
  }

  if (styleMatches && styleMatches.length > 0) {
    description = styleMatches[styleMatches.length - 1] + " " + description
  }

  if (itemMatches && itemMatches.length > 0) {
    description = description.replace("commission", itemMatches[itemMatches.length - 1])
  }

  return description.charAt(0).toUpperCase() + description.slice(1)
}