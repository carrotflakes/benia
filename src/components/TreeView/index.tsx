import produce from "immer"
import { Dispatch, SetStateAction, } from "react"
import * as model from "../../model"
import style from './index.module.css'
import { Layer } from "./Layer"

export const TreeView = (
  { image, currentLayer, dispatch }:
    {
      image: model.Image,
      currentLayer: [number, Dispatch<SetStateAction<number>>],
      dispatch: (operation: (image: model.Image) => model.Image) => void
    }) => {
  return (
    <div className={style.TreeView}>
      <div>
        size: {image.size.join(', ')}
      </div>
      <div>
        <div>layers:</div>
        {
          image.layers.map((layer, i) => (
            <Layer
              key={i}
              layerI={i}
              layer={layer}
              currentLayer={currentLayer}
              dispatch={dispatch}
              sortHandleMouseDown={(e) => {
                // dispatch((img) => produce(img, img => {
                //   const layer = img.layers[i]
                //   img.layers.splice(i, 1)
                //   img.layers.push(layer)
                // }))
                e.preventDefault()
              }}
            />
          ))
        }
        <div
          className={style.button}
          onClick={() => {
            dispatch((img) => produce(img, img => {
              img.layers.push({
                paths: [],
              })
            }))
          }}
        >
          add layer
        </div>
      </div>
    </div>
  )
}
