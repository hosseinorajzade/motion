import { createContext, useContext } from 'react'

export interface AppState {
  /** True once the loading screen has finished its exit animation */
  loaded: boolean
}

export const AppContext = createContext<AppState>({ loaded: false })
export const useApp = () => useContext(AppContext)
