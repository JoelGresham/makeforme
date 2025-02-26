import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase/client'

export async function POST(request: Request) {
  try {
    console.log("Commission API called")
    const body = await request.json()
    console.log("Commission request body:", body)

    const { 
      makerId, 
      customerEmail, 
      customerName, 
      title, 
      description, 
      chat_history 
    } = body

    // Validate required fields
    if (!makerId) {
      console.error("Missing makerId")
      return NextResponse.json(
        { error: 'makerId is required' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      console.error("Missing customerEmail")
      return NextResponse.json(
        { error: 'customerEmail is required' },
        { status: 400 }
      )
    }

    // First, get or create customer
    let customerId = null

    // Check if customer exists
    console.log("Looking for customer with email:", customerEmail)
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single()

    console.log("Customer lookup result:", existingCustomer, customerFetchError)

    if (customerFetchError && customerFetchError.code !== 'PGRST116') {
      // Real error, not just "no rows found"
      console.error("Customer fetch error:", customerFetchError)
      throw customerFetchError
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
      console.log("Using existing customer ID:", customerId)
    } else {
      // Create new customer
      console.log("Creating new customer:", customerName, customerEmail)
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from('customers')
        .insert([{ 
          name: customerName || 'Customer', 
          email: customerEmail 
        }])
        .select()
        .single()

      console.log("Customer creation result:", newCustomer, customerCreateError)

      if (customerCreateError) {
        console.error("Customer creation error:", customerCreateError)
        throw customerCreateError
      }

      customerId = newCustomer.id
      console.log("Created new customer with ID:", customerId)
    }

    // Create commission
    console.log("Creating commission:", {
      maker_id: makerId,
      customer_id: customerId, 
      title: title || "Custom Commission"
    })

    const { data: commission, error: commissionError } = await supabase
      .from('commissions')
      .insert([{
        maker_id: makerId,
        customer_id: customerId,
        title: title || "Custom Commission",
        description: description || "",
        status: 'pending',
        chat_history: chat_history || []
      }])
      .select()
      .single()

    console.log("Commission creation result:", commission, commissionError)

    if (commissionError) {
      console.error("Commission creation error:", commissionError)
      throw commissionError
    }

    console.log("Successfully created commission:", commission)
    return NextResponse.json(commission)
  } catch (error: any) {
    console.error('Commission Creation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create commission' },
      { status: 500 }
    )
  }
}