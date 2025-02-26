import { supabase } from './client'

export async function getAllMakers() {
  const { data, error } = await supabase
    .from('makers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}



export async function getFeaturedMakers() {
  try {
    // First get all makers
    const { data: makers, error: makersError } = await supabase
      .from('makers')
      .select('*')
      .limit(3)

    if (makersError) throw makersError

    // If we have makers, get their commission counts
    if (makers && makers.length > 0) {
      const makersWithCommissions = await Promise.all(
        makers.map(async (maker) => {
          const { count } = await supabase
            .from('commissions')
            .select('*', { count: 'exact' })
            .eq('maker_id', maker.id)
            .single()

          return {
            ...maker,
            commission_count: count || 0
          }
        })
      )

      // Sort by commission count and return top 3
      return makersWithCommissions
        .sort((a, b) => (b.commission_count || 0) - (a.commission_count || 0))
        .slice(0, 3)
    }

    // If no makers, return empty array
    return []
  } catch (error) {
    console.error('Error in getFeaturedMakers:', error)
    return [] // Return empty array instead of throwing
  }
}

export async function getMakerByUsername(username: string) {
  console.log('Looking for username:', username)
  const { data, error } = await supabase
    .from('makers')
    .select('*')
    .eq('username', username)
    .single()

  console.log('Found data:', data)
  console.log('Error if any:', error)

  if (error) {
    console.error('Error getting maker:', error)
    throw error
  }

  return data
}

export async function createMaker({
  username,
  name,
  email,
  description,
  location,
  categories,
  payment_methods
}: {
  username: string
  name: string
  email: string
  description?: string
  location?: string
  categories?: string[]
  payment_methods?: any
}) {
  const { data, error } = await supabase
    .from('makers')
    .insert([
      {
        username,
        name,
        email,
        description,
        location,
        categories,
        payment_methods,
        completed_projects: 0
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMakerCommissions(makerId: string) {
  const { data, error } = await supabase
    .from('commissions')
    .select(`
      *,
      customers (
        name,
        email
      )
    `)
    .eq('maker_id', makerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}