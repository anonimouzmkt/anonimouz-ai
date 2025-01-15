import type { Database } from './database.types'
export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate } from './tables.types'
export type { Enums } from './enums.types'
export type { CompositeTypes } from './composite.types'

// Export the Profile type using the Tables utility type
export type Profile = Tables<'profiles'>