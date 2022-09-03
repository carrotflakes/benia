import { createContext } from "react";
import { Image } from "../../model";

export const modes = ['pen', 'layer shift'] as const

export type Mode = typeof modes[number]

export const initialState = () => {
  const image = new Image([600, 600])
  return {
    mode: 'pen' as Mode,
    trail: [] as [number, number][],
    drag: null as { start: [number, number], end: [number, number] } | null,
    image,
    currentLayerId: image.layers[0].id,
    color: 'black',
    lineWidth: 3,
  }
}

type State = ReturnType<typeof initialState>

type Action = (staet: State) => State

export const AppContext = createContext({ state: initialState(), actions: getActions(() => { }) })

export const reducer = (state: State, action: Action) => {
  return action(state)
}

function setColor(color: State['color']) {
  return (state: State) => ({
    ...state,
    color,
  })
}

function setLineWidth(lineWidth: State['lineWidth']) {
  return (state: State) => ({
    ...state,
    lineWidth,
  })
}

function setTrail(trail: State['trail']) {
  return (state: State) => ({
    ...state,
    trail,
  })
}

function setDrag(drag: State['drag']) {
  return (state: State) => ({
    ...state,
    drag,
  })
}

function setMode(mode: State['mode']) {
  return (state: State) => ({
    ...state,
    mode,
  })
}

function setCurrentLayerId(currentLayerId: State['currentLayerId']) {
  return (state: State) => ({
    ...state,
    currentLayerId,
  })
}

function setImage(image: State['image'] | ((image: State['image']) => State['image'])) {
  if (typeof image === 'function') {
    return (state: State) => ({
      ...state,
      image: image(state.image),
    })
  }

  return (state: State) => ({
    ...state,
    image,
  })
}

export function getActions(dispatch: (action: Action) => void) {
  return {
    setColor: (...ps: Parameters<typeof setColor>) => dispatch(setColor(...ps)),
    setLineWidth: (...ps: Parameters<typeof setLineWidth>) => dispatch(setLineWidth(...ps)),
    setTrail: (...ps: Parameters<typeof setTrail>) => dispatch(setTrail(...ps)),
    setDrag: (...ps: Parameters<typeof setDrag>) => dispatch(setDrag(...ps)),
    setCurrentLayerId: (...ps: Parameters<typeof setCurrentLayerId>) => dispatch(setCurrentLayerId(...ps)),
    setImage: (...ps: Parameters<typeof setImage>) => dispatch(setImage(...ps)),
    setMode: (...ps: Parameters<typeof setMode>) => dispatch(setMode(...ps)),
  }
}
