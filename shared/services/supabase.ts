import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const url = Constants.expoConfig?.extra?.supabaseUrl ?? ''
const key = Constants.expoConfig?.extra?.supabaseAnonKey ?? ''

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
