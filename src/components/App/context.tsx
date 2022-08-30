import { createContext } from "react";

export const AppContext = createContext({
  color: '#000',
  setColor: (color: string) => { },
  lineWidth: 1,
  setLineWidth: (lineWidth: number) => { },
  currentLayerId: null! as symbol,
  setCurrentLayerId: (id: symbol) => { },
})
