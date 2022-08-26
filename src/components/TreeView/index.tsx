import produce from "immer"
import { Dispatch, SetStateAction, useCallback, useRef, } from "react"
import * as model from "../../model"
import style from './index.module.css'
import { Layer } from "./Layer"
import { useDnd } from "../../hooks/useDnd"

export const TreeView = (
  { image, currentLayer, dispatch }:
    {
      image: model.Image,
      currentLayer: [Symbol, Dispatch<SetStateAction<Symbol>>],
      dispatch: (operation: (image: model.Image) => model.Image) => void
    }) => {
  const layersContainer = useRef(null! as HTMLDivElement)
  const dnd = useDnd<number>(
    useCallback((pos, except) => Array.from(layersContainer.current.children).findIndex((x, i) => {
      if (i === except) return false
      const rect = x.getBoundingClientRect()
      return rect.left <= pos[0] && pos[0] < rect.right &&
        rect.top <= pos[1] && pos[1] < rect.bottom
    }), []),
    useCallback((s, d) => {
      if (d === -1) return
      dispatch((img) => produce(img, img => {
        const layer = img.layers[s]
        img.layers.splice(s, 1)
        img.layers.splice(d, 0, layer)
      }))
    }, [dispatch]),
  )

  return (
    <div className={style.TreeView}>
      <div>
        size: {image.size.join(', ')}
      </div>
      <div>
        <div>layers:</div>
        <div ref={layersContainer}>
          {
            image.layers.map((layer, i) => (
              <div
                key={i}
                style={{
                  ...i === dnd.source ? {
                    position: 'relative',
                    left: dnd.dpos[0],
                    top: dnd.dpos[1],
                  } : {},
                  border: 'solid 1px ' + (i === dnd.destination ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0)')
                }}
              >
                <Layer
                  layer={layer}
                  layerI={i}
                  currentLayer={currentLayer}
                  dispatch={dispatch}
                  sortHandleMouseDown={dnd.genOnMouseDown(i)}
                />
              </div>
            ))
          }
        </div>
        <div
          className={style.button}
          onClick={() => {
            dispatch((img) => produce(img, img => {
              img.layers.push(new model.Layer())
            }))
          }}
        >
          add layer
        </div>
      </div>
    </div>
  )
}
