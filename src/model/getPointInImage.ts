import { distance, Image, Layer } from ".";

export const getPointInImage = (image: Image, pos: [number, number]) => {
  let ret = null

  for (const layer of image.layers) {
    for (const path of layer.paths) {
      for (const i in path.poses) {
        const p = path.poses[i]
        if (ret === null || distance(pos, p) < distance(ret.pos, pos)) {
          ret = {
            layerId: layer.id,
            pathId: path.id,
            posesIdx: +i,
            pos: p,
            distance: distance(pos, p),
          }
        }
      }
    }
  }

  return ret
}

export const getPointInLayer = (layer: Layer, pos: [number, number]) => {
  let ret = null

  for (const path of layer.paths) {
    for (const i in path.poses) {
      const p = path.poses[i]
      if (ret === null || distance(pos, p) < distance(ret.pos, pos)) {
        ret = {
          layerId: layer.id,
          pathId: path.id,
          posesIdx: +i,
          pos: p,
          distance: distance(pos, p),
        }
      }
    }
  }

  return ret
}
