import { createContext } from "react";
import { Image } from "../../model";


export type Mode = {
  type: 'pen';
  trail: [number, number][];
  // setTrail: (trail: [number, number][]) => void;
} | {
  type: 'layer_shift';
  drag: { start: [number, number], end: [number, number] } | null;
  // setDrag: (drag: { start: [number, number], end: [number, number] } | null) => void;
}
export const modes: Mode['type'][] = ['pen', 'layer_shift']

export const initialState = () => {
  const image = new Image([600, 600])
  return {
    mode: null as Mode | null,
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

function setMode(mode: Mode['type']) {
  return (state: State) => ({
    ...state,
    mode: {
      pen: {
        type: mode,
        trail: [],
      },
      layer_shift: {
        type: mode,
        drag: null,
      }
    }[mode] as Mode
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

function setTrail(trail: [number, number][]) {
  return (state: State) => (state.mode?.type === 'pen' ? {
    ...state,
    mode: {
      ...state.mode,
      trail,
    },
  } : state)
}

function setDrag(drag: { start: [number, number], end: [number, number] } | null) {
  return (state: State) => (state.mode?.type === 'pen' ? {
    ...state,
    mode: {
      ...state.mode,
      drag,
    },
  } : state)
}

export function getActions(dispatch: (action: Action) => void) {
  return {
    setColor: (...ps: Parameters<typeof setColor>) => dispatch(setColor(...ps)),
    setLineWidth: (...ps: Parameters<typeof setLineWidth>) => dispatch(setLineWidth(...ps)),
    setCurrentLayerId: (...ps: Parameters<typeof setCurrentLayerId>) => dispatch(setCurrentLayerId(...ps)),
    setImage: (...ps: Parameters<typeof setImage>) => dispatch(setImage(...ps)),
    setMode: (...ps: Parameters<typeof setMode>) => dispatch(setMode(...ps)),
    setTrail: (...ps: Parameters<typeof setTrail>) => dispatch(setTrail(...ps)),
    setDrag: (...ps: Parameters<typeof setDrag>) => dispatch(setDrag(...ps)),
  }
}
