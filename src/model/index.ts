import { immerable } from "immer"

export class Image {
  [immerable] = true
  size: [number, number]
  layers: Layer[] = [new Layer()]

  constructor(size: [number, number]) {
    this.size = size
  }

  getLayerById(id: symbol) {
    return this.layers.find(l => l.id === id)
  }

  getLayerIndexById(id: symbol) {
    const i = this.layers.findIndex(l => l.id === id)
    return i === -1 ? null : i
  }
}

export class Layer {
  [immerable] = true
  id: symbol = Symbol('layer')
  name: string = ''
  paths: Path[] = []
  compositeMode: CompositeMode = 'source-over'
  alpha: number = 1.0
  hide?: boolean

  getPathById(id: symbol) {
    return this.paths.find(p => p.id === id)
  }

  clone() {
    return {
      ...this,
      id: Symbol('layer'),
    }
  }
}

export class Path {
  [immerable] = true
  id: symbol = Symbol('path')
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

// export class Shape {
//   [immerable] = true
//   id: symbol = Symbol('symbol')
//   paths: Path[] = []
//   color: string = '#000'
//   width: number = 1
//   fill?: string

// }

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

export const distance = (a: [number, number], b: [number, number]) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
