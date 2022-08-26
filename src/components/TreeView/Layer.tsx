import produce from "immer"
import { Dispatch, SetStateAction, SyntheticEvent, useCallback, useRef, useState } from "react"
import * as model from "../../model"
import style from './index.module.css'
import { FoldableHeader } from './FoldableHeader'
import { Path } from "./Path"
import { Hamburger } from "../icons/Hamburger"
import { useDnd } from "../../hooks/useDnd"

export const Layer = (
  { layer, layerI, currentLayer, dispatch, sortHandleMouseDown }: {
    layerI: number,
    layer: model.Layer,
    currentLayer: [number, Dispatch<SetStateAction<number>>],
    dispatch: (operation: (image: model.Image) => model.Image) => void,
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void,
  }) => {
  const [showPaths, setShowPaths] = useState(false)

  const pathsContainer = useRef(null! as HTMLDivElement)
  const dnd = useDnd<number>(
    useCallback((pos, except) => Array.from(pathsContainer.current.children).findIndex((x, i) => {
      if (i === except) return false
      const rect = x.getBoundingClientRect()
      return rect.left <= pos[0] && pos[0] < rect.right &&
        rect.top <= pos[1] && pos[1] < rect.bottom
    }), []),
    useCallback((s, d) => {
      if (d === -1) return
      dispatch((img) => produce(img, img => {
        const layer = img.layers[layerI]
        const path = layer.paths[s]
        layer.paths.splice(s, 1)
        layer.paths.splice(d, 0, path)
      }))
    }, [dispatch, layerI]),
  )

  return (
    <div className={style.Layer}>
      <div>
        <span
          className={style.sortHandle}
          style={{ padding: 2, cursor: 'pointer' }}
          onMouseDown={sortHandleMouseDown}
        >
          <Hamburger color="#aaa" />
        </span>

        <div
          className={style.layerIndicator}
          style={{
            background: currentLayer[0] === layerI ? '#fa0' : '#666',
          }}
          onClick={() => currentLayer[1](layerI)}>
        </div>
        &nbsp;
        layer
        &nbsp;
        <div
          className={style.button}
          onClick={() => dispatch(img => produce(img, img => {
            img.layers[layerI].hide = !img.layers[layerI].hide
          }))}
        >hide</div>
        <div
          className={style.button}
          onClick={() => dispatch(img => produce(img, img => {
            img.layers.splice(layerI, 1)
          }))}
        >delete</div>
      </div>

      <div style={{ marginLeft: '0.5em' }}>
        <FoldableHeader
          fold={showPaths}
          setFold={setShowPaths}
        >
          paths ({layer.paths.length})
        </FoldableHeader>

        <div ref={pathsContainer}>
          {
            showPaths &&
            layer.paths.map((path, i) =>
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
                <Path
                  path={path}
                  pass={[layerI, i]}
                  dispatch={dispatch}
                  sortHandleMouseDown={dnd.genOnMouseDown(i)}
                />
              </div>
            )
          }
        </div>
      </div>
    </div>)
}
