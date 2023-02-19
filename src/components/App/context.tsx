import produce from "immer";
import { createContext, FC, ReactNode, useMemo, useReducer } from "react";
import { Image } from "../../model";


export type Mode = {
  type: 'pen';
  trail: [number, number][];
  // setTrail: (trail: [number, number][]) => void;
} | {
  type: 'layer_shift';
  drag: { start: [number, number], end: [number, number] } | null;
  // setDrag: (drag: { start: [number, number], end: [number, number] } | null) => void;
} | {
  type: 'move_point',
  point: {
    layerId: symbol,
    pathId: symbol,
    posesIdx: number,
  } | null
}
export const modes: Mode['type'][] = ['pen', 'layer_shift', 'move_point']

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

export type State = ReturnType<typeof initialState>

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
      },
      move_point: {
        type: mode,
        point: null,
      },
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
  return (state: State) => produce(state, (state) => {
    if (state.mode?.type === 'layer_shift')
      state.mode.drag = drag
  })
}

function setPoint(point: {
  layerId: symbol,
  pathId: symbol,
  posesIdx: number,
} | null) {
  return (state: State) => produce(state, (state) => {
    if (state.mode?.type === 'move_point')
      state.mode.point = point
  })
}

export function getActions(dispatch: (action: Action) => void) {
  const actions = {
    setColor,
    setLineWidth,
    setCurrentLayerId,
    setImage,
    setMode,
    setTrail,
    setDrag,
    setPoint,
  }
  return Object.fromEntries(Object.entries(actions).map(([k, v]: any) => [k, (...ps: any) => dispatch(v(...ps))])) as typeof actions
  // return {
  //   setColor: (...ps: Parameters<typeof setColor>) => dispatch(setColor(...ps)),
  //   setLineWidth: (...ps: Parameters<typeof setLineWidth>) => dispatch(setLineWidth(...ps)),
  //   setCurrentLayerId: (...ps: Parameters<typeof setCurrentLayerId>) => dispatch(setCurrentLayerId(...ps)),
  //   setImage: (...ps: Parameters<typeof setImage>) => dispatch(setImage(...ps)),
  //   setMode: (...ps: Parameters<typeof setMode>) => dispatch(setMode(...ps)),
  //   setTrail: (...ps: Parameters<typeof setTrail>) => dispatch(setTrail(...ps)),
  //   setDrag: (...ps: Parameters<typeof setDrag>) => dispatch(setDrag(...ps)),
  //   setPoint: (...ps: Parameters<typeof setPoint>) => dispatch(setPoint(...ps)),
  // }
}

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState())
  const actions = useMemo(() => getActions(dispatch), [dispatch])

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}
