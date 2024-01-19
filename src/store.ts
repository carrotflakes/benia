import { temporal } from "zundo";
import { create } from "zustand";
import { immer } from 'zustand/middleware/immer';
import { Image } from "./model";

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

const image = new Image([600, 600])

export type State = {
  mode: Mode | null;
  image: Image;
  currentLayerId: symbol;
  color: string;
  lineWidth: number;
  setColor: (color: string) => void;
  setLineWidth: (lineWidth: number) => void;
  setMode: (mode: Mode['type']) => void;
  setCurrentLayerId: (currentLayerId: symbol) => void;
  setImage: (image: Image | ((image: Image) => Image)) => void;
  setTrail: (trail: [number, number][]) => void;
  setDrag: (drag: { start: [number, number], end: [number, number] } | null) => void;
  setPoint: (point: {
    layerId: symbol,
    pathId: symbol,
    posesIdx: number,
  } | null) => void;
};

export const useAppStore = create<State>()(temporal(immer((set) => ({
  mode: null as Mode | null,
  image,
  currentLayerId: image.layers[0].id,
  color: 'black',
  lineWidth: 3,
  setColor: (color) => set(setColor(color)),
  setLineWidth: (lineWidth) => set(setLineWidth(lineWidth)),
  setMode: (mode) => set(setMode(mode)),
  setCurrentLayerId: (currentLayerId) => set(setCurrentLayerId(currentLayerId)),
  setImage: (image) => set(setImage(image)),
  setTrail: (trail) => set(setTrail(trail)),
  setDrag: (drag) => set(setDrag(drag)),
  setPoint: (point) => set(setPoint(point)),
})), {
  partialize: (state) => ({
    image: state.image,
    currentLayerId: state.currentLayerId,
  }),
}));


function setColor(color: State['color']) {
  return (state: State) => {
    state.color = color;
  }
}

function setLineWidth(lineWidth: State['lineWidth']) {
  return (state: State) => {
    state.lineWidth = lineWidth;
  }
}

function setMode(mode: Mode['type']) {
  return (state: State) => {
    if (modes.includes(mode)) {
      state.mode = {
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
    }
  }
}

function setCurrentLayerId(currentLayerId: State['currentLayerId']) {
  return (state: State) => {
    state.currentLayerId = currentLayerId;
  }
}

function setImage(image: State['image'] | ((image: State['image']) => State['image'])) {
  if (typeof image === 'function') {
    return (state: State) => {
      state.image = image(state.image);
    }
  }

  return (state: State) => {
    state.image = image;
  }
}

function setTrail(trail: [number, number][]) {
  return (state: State) => {
    if (state.mode?.type === 'pen')
      state.mode.trail = trail
  }
}

function setDrag(drag: { start: [number, number], end: [number, number] } | null) {
  return (state: State) => {
    if (state.mode?.type === 'layer_shift')
      state.mode.drag = drag
  }
}

function setPoint(point: {
  layerId: symbol,
  pathId: symbol,
  posesIdx: number,
} | null) {
  return (state: State) => {
    if (state.mode?.type === 'move_point')
      state.mode.point = point
  }
}