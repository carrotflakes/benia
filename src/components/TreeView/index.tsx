import produce from "immer"
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import * as model from "../../model"
import './index.css'

export const TreeView = (
  { image, dispatch }:
    {
      image: model.Image,
      dispatch: (operation: (image: model.Image) => model.Image) => void
    }) => {
  return <div className="TreeView">
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
            dispatch={dispatch}
          />
        ))
      }
      <div
        className="button"
        onClick={() => {
          dispatch((img) => produce(img, img => {
            img.layers.push({
              strokes: [],
            })
          }))
        }}
      >
        add layer
      </div>
    </div>
  </div>
}

const Layer = (
  { layer, layerI, dispatch }: {
    layerI: number,
    layer: model.Layer,
    dispatch: (operation: (image: model.Image) => model.Image) => void,
  }) => {
  const [showStrokes, setShowStrokes] = useState(false)

  return <div className="Layer">
    <div>
      layer&nbsp;
      <div
        className="button"
        onClick={() => dispatch(img => produce(img, img => {
          img.layers.splice(layerI, 1)
        }))}
      >delete</div>
    </div>
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
}

const Stroke = (
  { stroke, path, dispatch }: {
    stroke: model.Stroke,
    path: [number, number],
    dispatch: (operation: (image: model.Image) => model.Image) => void,
  }) => {
  return <div>
    <div style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: stroke.color,
    }}>
    </div>
    {stroke.poses.length}
    <div
      className="button"
      onClick={() => dispatch(img => produce(img, img => {
        img.layers[path[0]].strokes.splice(path[1], 1)
      }))}
    >delete</div>
  </div>
}

const FoldableHeader = ({ fold, setFold, children }: {
  fold: boolean,
  setFold: Dispatch<SetStateAction<boolean>>,
  children: ReactNode,
}) => {
  return (
    <div
      style={{ cursor: 'pointer' }}
      onClick={() => setFold(x => !x)}
    >
      <span style={{
        display: 'inline-block',
        transform: `scale(0.8) rotate(${fold ? 0 : '-90deg'})`
      }}>▼</span>
      {children}
    </div>
  )
}
