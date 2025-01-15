import type { Database } from './database.types'
export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate } from './tables.types'
export type { Enums } from './enums.types'
export type { CompositeTypes } from './composite.types'

// Export the Profile type using the Database type directly
export type Profile = Database['public']['Tables']['profiles']['Row']