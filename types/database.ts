export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      makers: {
        Row: {
          id: string
          created_at: string
          username: string
          name: string
          email: string
          description: string | null
          location: string | null
          categories: string[]
          portfolio_images: string[] | null
          completed_projects: number
          rating: number | null
          available_from: string | null
          payment_methods: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          username: string
          name: string
          email: string
          description?: string | null
          location?: string | null
          categories?: string[]
          portfolio_images?: string[] | null
          completed_projects?: number
          rating?: number | null
          available_from?: string | null
          payment_methods?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          name?: string
          email?: string
          description?: string | null
          location?: string | null
          categories?: string[]
          portfolio_images?: string[] | null
          completed_projects?: number
          rating?: number | null
          available_from?: string | null
          payment_methods?: Json | null
        }
      }
      commissions: {
        Row: {
          id: string
          created_at: string
          maker_id: string
          customer_id: string
          title: string
          description: string
          status: 'pending' | 'in-progress' | 'completed'
          sketch_url: string | null
          final_image_url: string | null
          material_cost: number | null
          time_spent: number | null
          payment: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          maker_id: string
          customer_id: string
          title: string
          description: string
          status?: 'pending' | 'in-progress' | 'completed'
          sketch_url?: string | null
          final_image_url?: string | null
          material_cost?: number | null
          time_spent?: number | null
          payment?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          maker_id?: string
          customer_id?: string
          title?: string
          description?: string
          status?: 'pending' | 'in-progress' | 'completed'
          sketch_url?: string | null
          final_image_url?: string | null
          material_cost?: number | null
          time_spent?: number | null
          payment?: number | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
        }
      }
    }
  }
}