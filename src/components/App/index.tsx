import produce from 'immer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CompactPicker } from 'react-color';
import style from './index.module.css';
import { useCursorTrackEventHandler } from '../../hooks/useCursorTrack';
import { Image, Path } from '../../model'
import { TreeView } from '../../components/TreeView';
import { PenPicker } from '../../components/PenPicker';
import { AppContext } from './context';
import { draw } from './draw';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const [mode, setMode] = useState('pen' as 'pen' | 'layer shift')
  const [trail, setTrail] = useState([] as [number, number][])
  const [dragStart, setDragStart] = useState([0, 0])
  const [dragEnd, setDragEnd] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const [image, setImage] = useState(new Image([600, 600]))
  const [layerI, setLayerI] = useState(image.layers[0].id)
  const [color, setColor] = useState('black')
  const [lineWidth, setLineWidth] = useState(3)

  const modeHandlers = useMemo(() => ({
    pen: {
      mouseDown: (pos: [number, number]) => {
        setTrail([pos])
      },
      mouseMove: (pos: [number, number]) => {
        const last = trail.at(-1)
        if (last) {
          const d = distance(last, pos)
          if (10 <= d) {
            setTrail(ps => [...ps, pos])
          }
        }
      },
      mouseUp: (e: MouseEvent) => {
        if (trail.length > 2) {
          const path = new Path(trail, color, lineWidth)
          setImage(img => {
            return produce(img, (img) => {
              img.getLayerById(layerI)?.paths.push(path)
            })
          })
        }
        setTrail([])
        e.preventDefault()
      },
    },
    'layer shift': {
      mouseDown: (pos: [number, number]) => {
        setDragStart(pos)
        setDragging(true)
      },
      mouseMove: (pos: [number, number]) => {
        setDragEnd(pos)
      },
      mouseUp: (e: MouseEvent) => {
        if (dragging) {
          setImage(img => {
            return produce(img, (img) => {
              const layer = img.getLayerById(layerI)
              if (!layer) return
              layer.paths = layer.paths.map(p => {
                p.poses = p.poses.map(p => [
                  p[0] + dragEnd[0] - dragStart[0],
                  p[1] + dragEnd[1] - dragStart[1],
                ])
                return p
              })
            })
          })
          setDragging(false)
        }
        e.preventDefault()
      },
    }
  }[mode]), [color, dragEnd, dragStart, dragging, layerI, lineWidth, mode, trail])

  const handlers = useCursorTrackEventHandler(
    modeHandlers.mouseDown,
    modeHandlers.mouseMove,
    modeHandlers.mouseUp,
    canvasRef,
  )

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext('2d')
    if (!ctx)
      return

    let imageToDraw = image

    if (trail.length > 2) {
      imageToDraw = produce(imageToDraw, img => {
        img.getLayerById(layerI)?.paths.push(new Path(trail, color, lineWidth))
      })
    }
    if (dragging) {
      imageToDraw = produce(imageToDraw, (img) => {
        const layer = img.getLayerById(layerI)
        if (!layer) return
        layer.paths = layer.paths.map(p => {
          p.poses = p.poses.map(p => [
            p[0] + dragEnd[0] - dragStart[0],
            p[1] + dragEnd[1] - dragStart[1],
          ])
          return p
        })
      })
    }

    draw(ctx, imageToDraw)
  }, [image, trail, color, lineWidth, layerI, dragging, dragEnd, dragStart])

  const dispatch = useCallback((op: (image: Image) => Image) => setImage(i => op(i)), [])

  return (
    <AppContext.Provider value={{ color, setColor, lineWidth, setLineWidth }}>
      <div className={style.App}>
        <header>
          <span className={style.title}>
            benia - paint app
          </span>
        </header>
        <div className={style.center}>
          <div>
            <div style={{ textAlign: 'left' }}>
              {['pen' as const, 'layer shift' as const].map(m => (
                <span
                  key={m}
                  className={[style.button, m === mode ? style.active : ''].join(' ')}
                  onClick={() => setMode(m)}
                >
                  {m}
                </span>
              ))}
            </div>
            <canvas
              className={style.canvas}
              ref={canvasRef}
              width={image.size[0]}
              height={image.size[1]}
              {...handlers}
            ></canvas>
            <div>
              <CompactPicker
                color={color}
                onChange={c => {
                  setColor(c.hex)
                }}
              />
              <PenPicker
                lineWidth={lineWidth}
                onChange={w => setLineWidth(w)}
              />
            </div>
          </div>
          <TreeView
            image={image}
            currentLayer={[layerI, setLayerI]}
            dispatch={dispatch}
          />
        </div>
      </div>
    </AppContext.Provider>
  )
}

export default App;

function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
