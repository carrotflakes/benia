import { immerable } from "immer"

export class Image {
  [immerable] = true
  size: [number, number]
  layers: Layer[] = [new Layer()]

  constructor(size: [number, number]) {
    this.size = size
  }

  getLayerById(id: Symbol) {
    return this.layers.find(l => l.id === id)
  }

  getLayerIndexById(id: Symbol) {
    const i = this.layers.findIndex(l => l.id === id)
    return i === -1 ? null : i
  }
}

export class Layer {
  [immerable] = true
  id: Symbol = Symbol('layer')
  name: string = ''
  paths: Path[] = []
  compositeMode: CompositeMode = 'source-over'
  alpha: number = 1.0
  hide?: boolean

  clone() {
    return {
      ...this,
      id: Symbol('layer'),
    }
  }
}

export class Path {
  [immerable] = true
  id: Symbol = Symbol('path')
  poses: Pos[] = []
  close: boolean = false
  color: string = '#000'
  width: number = 1
  fill?: string

  constructor(poses: Pos[], color: string, width: number) {
    this.poses = poses
    this.color = color
    this.width = width
  }
}

export type Pos = [number, number]

export type CompositeMode = GlobalCompositeOperation
export const compositeModes: CompositeMode[] = [
  "color",
  "color-burn",
  "color-dodge",
  "copy",
  "darken",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "exclusion",
  "hard-light",
  "hue",
  "lighten",
  "lighter",
  "luminosity",
  "multiply",
  "overlay",
  "saturation",
  "screen",
  "soft-light",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "xor",
]
