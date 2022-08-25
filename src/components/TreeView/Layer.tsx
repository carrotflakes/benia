import produce from "immer"
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react"
import * as model from "../../model"
import style from './index.module.css'
import { FoldableHeader } from './FoldableHeader'
import { Path } from "./Path"
import { Hamburger } from "../icons/Hamburger"

export const Layer = (
  { layer, layerI, currentLayer, dispatch, sortHandleMouseDown }: {
    layerI: number,
    layer: model.Layer,
    currentLayer: [number, Dispatch<SetStateAction<number>>],
    dispatch: (operation: (image: model.Image) => model.Image) => void,
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void,
  }) => {
  const [showPaths, setShowPaths] = useState(false)

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

        {
          showPaths &&
          layer.paths.map((path, i) =>
            <Path
              key={i}
              path={path}
              pass={[layerI, i]}
              dispatch={dispatch}
            />
          )
        }
      </div>
    </div>)
}
