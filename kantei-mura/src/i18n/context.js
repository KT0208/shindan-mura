import { createContext, useContext } from 'react'
import ja from './ja'

export const DictionaryContext = createContext(ja)

export function useDictionary() {
  return useContext(DictionaryContext)
}
