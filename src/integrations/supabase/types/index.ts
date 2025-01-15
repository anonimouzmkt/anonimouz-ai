import type { Database } from './database.types'

export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate } from './tables.types'
export type { Enums } from './enums.types'
export type { CompositeTypes } from './composite.types'

// Export Profile type from the profiles table in Database type
export type Profile = Database['public']['Tables']['profiles']['Row']