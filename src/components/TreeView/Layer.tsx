import produce from "immer"
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react"
import * as model from "../../model"
import style from './index.module.css'
import { FoldableHeader } from './FoldableHeader'
import { Stroke } from "./Stroke"
import { Hamburger } from "../icons/Hamburger"

export const Layer = (
  { layer, layerI, currentLayer, dispatch, sortHandleMouseDown }: {
    layerI: number,
    layer: model.Layer,
    currentLayer: [number, Dispatch<SetStateAction<number>>],
    dispatch: (operation: (image: model.Image) => model.Image) => void,
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void,
  }) => {
  const [showStrokes, setShowStrokes] = useState(false)

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
          fold={showStrokes}
          setFold={setShowStrokes}
        >
          strokes ({layer.strokes.length})
        </FoldableHeader>

        {
          showStrokes &&
          layer.strokes.map((stroke, i) =>
            <Stroke
              key={i}
              stroke={stroke}
              path={[layerI, i]}
              dispatch={dispatch}
            />
          )
        }
      </div>
    </div>)
}
