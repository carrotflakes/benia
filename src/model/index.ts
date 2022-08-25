
export type Image = {
  size: [number, number]
  layers: Layer[]
}

export type Layer = {
  paths: Path[]
  hide?: boolean
}

export type Path = {
  poses: Pos[]
  close: boolean
  color: string
  width: number
  fill?: string
}

export type Pos = [number, number]
