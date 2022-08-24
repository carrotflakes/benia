
export type Image = {
  size: [number, number]
  layers: Layer[]
}

export type Layer = {
  strokes: Stroke[]
}

export type Stroke = {
  poses: Pos[]
  close: boolean
  color: string
  width: number
  fill?: string
}

export type Pos = [number, number]