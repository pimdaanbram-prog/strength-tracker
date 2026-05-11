// Generated from supabase-schema.sql — update with:
// npx supabase gen types typescript --project-id <id> > src/shared/lib/database.types.ts

type TrainingProfileRow = {
  id: string
  account_id: string
  name: string
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  available_equipment: string[]
  avatar: string
  color: string
  created_at: string
  updated_at: string | null
}

type WorkoutSessionRow = {
  id: string
  account_id: string
  profile_id: string
  date: string
  week_number: number
  year: number
  day_label: string
  workout_name: string
  exercises: unknown
  duration_minutes: number
  notes: string
  completed_at: string | null
  created_at: string | null
}

type WeekLogRow = {
  id: string
  account_id: string
  profile_id: string
  week_number: number
  year: number
  sessions: string[]
  feedback_generated: boolean
  feedback: unknown | null
}

type WorkoutPlanRow = {
  id: string
  account_id: string
  name: string
  exercises: unknown
  created_at: string
  last_used_at: string | null
  updated_at: string | null
}

export interface Database {
  public: {
    Tables: {
      training_profiles: {
        Row: TrainingProfileRow
        Insert: Omit<TrainingProfileRow, 'updated_at'> & { updated_at?: string | null }
        Update: Partial<TrainingProfileRow>
      }
      workout_sessions: {
        Row: WorkoutSessionRow
        Insert: Omit<WorkoutSessionRow, 'created_at'> & { created_at?: string | null }
        Update: Partial<WorkoutSessionRow>
      }
      week_logs: {
        Row: WeekLogRow
        Insert: Omit<WeekLogRow, 'id'> & { id?: string }
        Update: Partial<WeekLogRow>
      }
      workout_plans: {
        Row: WorkoutPlanRow
        Insert: Omit<WorkoutPlanRow, 'updated_at'> & { updated_at?: string | null }
        Update: Partial<WorkoutPlanRow>
      }
    }
  }
}
