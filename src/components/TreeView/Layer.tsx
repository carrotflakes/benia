import produce from "immer"
import { SyntheticEvent, useCallback, useRef, useState } from "react"
import { useDnd } from "../../hooks/useDnd"
import * as model from "../../model"
import { Hamburger } from "../icons/Hamburger"
import { FoldableHeader } from './FoldableHeader'
import style from './index.module.css'
import { Path } from "./Path"
import { useAppStore } from "../../store"

export const Layer = (
  { layer, layerI, sortHandleMouseDown }: {
    layer: model.Layer,
    layerI: number,
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void,
  }) => {
  const { currentLayerId, setCurrentLayerId, setImage } = useAppStore(state => ({ currentLayerId: state.currentLayerId, setCurrentLayerId: state.setCurrentLayerId, setImage: state.setImage }))
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
      setImage((img) => produce(img, img => {
        const layer = img.layers[layerI]
        const path = layer.paths[s]
        layer.paths.splice(s, 1)
        layer.paths.splice(d, 0, path)
      }))
    }, [setImage, layerI]),
  )

  return (
    <div className={style.Layer}>
      <div>
        <span
          className={style.sortHandle}
          onMouseDown={sortHandleMouseDown}
        >
          <Hamburger color="#aaa" />
        </span>

        <div
          className={style.editTarget}
          style={{
            color: currentLayerId === layer.id ? '#fa0' : '#666',
          }}
          onClick={() => setCurrentLayerId(layer.id)}
        >
          <span className="material-symbols-outlined">
            edit
          </span>
        </div>
        &nbsp;
        <LayerName name={layer.name} setName={(s) => {
          setImage(img => produce(img, img => {
            img.layers[layerI].name = s
          }))
        }} />
        &nbsp;
        <span
          className={"material-symbols-outlined " + style.iconButton}
          onClick={() => setImage(img => produce(img, img => {
            img.layers[layerI].hide = !img.layers[layerI].hide
          }))}
        >
          {layer.hide ? 'visibility_off' : 'visibility'}
        </span>
        <span
          className={"material-symbols-outlined " + style.iconButton}
          onClick={() => setImage(img => produce(img, img => {
            img.layers.splice(layerI, 1)
          }))}
        >
          delete
        </span>
        <div
          className={style.button}
          onClick={() => setImage(img => produce(img, img => {
            img.layers[layerI].alpha = img.layers[layerI].alpha === 1.0 ? 0.5 : 1.0
          }))}
        >{layer.alpha}</div>
        <CompositeMode
          compositeMode={layer.compositeMode}
          setCompositeMode={(cm => {
            setImage(img => produce(img, img => {
              img.layers[layerI].compositeMode = cm
            }))
          })} />
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
                  sortHandleMouseDown={dnd.genOnMouseDown(i)}
                />
              </div>
            )
          }
        </div>
      </div>
    </div>)
}

const LayerName = ({ name, setName }: { name: string, setName: (str: string) => void }) => {
  const [edit, setEdit] = useState(false)

  return (
    <div style={{ display: 'inline-block' }}>
      {
        edit ?
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setEdit(false)}
            autoFocus={true}
          />
          :
          <span
            style={{ color: name ? '#eee' : '#777' }}
            onClick={() => setEdit(true)}>
            {name || 'layer'}
          </span>
      }
    </div>
  )
}

const CompositeMode = (
  { compositeMode, setCompositeMode }: {
    compositeMode: model.CompositeMode,
    setCompositeMode: (str: model.CompositeMode) => void,
  }) => {
  return (
    <select
      size={1}
      defaultValue={compositeMode}
      onChange={e => {
        if (e.target instanceof HTMLSelectElement && model.compositeModes.includes(e.target.value as model.CompositeMode))
          setCompositeMode(e.target.value as model.CompositeMode)
      }}
    >
      {
        model.compositeModes.map(cm =>
          <option
            key={cm}
            value={cm}
          >
            {cm}
          </option>
        )
      }
    </select>
  )
}
