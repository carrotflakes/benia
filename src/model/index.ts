import { immerable } from "immer"

export class Image {
  [ immerable ] = true
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
    return i === -1?null: i
  }
}

export class Layer {
  [ immerable ] = true
  id: Symbol = Symbol('layer')
  paths: Path[] = []
  hide?: boolean

  clone() {
    return {
      ...this,
      id: Symbol('layer'),
    }
  }
}

export class Path {
  [ immerable ] = true
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
