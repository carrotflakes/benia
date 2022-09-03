import produce from 'immer';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { CompactPicker } from 'react-color';
import { PenPicker } from '../../components/PenPicker';
import { TreeView } from '../../components/TreeView';
import { useCursorTrackEventHandler } from '../../hooks/useCursorTrack';
import { Path } from '../../model';
import { AppContext, getActions, initialState, Mode, modes, reducer } from './context';
import { draw } from './draw';
import style from './index.module.css';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const [state, dispatch] = useReducer(reducer, initialState())
  const actions = useMemo(() => getActions(dispatch), [dispatch])

  const modeHandlers = useMemo(() => ({
    pen: {
      mouseDown: (pos: [number, number]) => {
        actions.setTrail([pos])
      },
      mouseMove: (pos: [number, number]) => {
        const last = state.trail.at(-1)
        if (last) {
          const d = distance(last, pos)
          if (10 <= d) {
            actions.setTrail([...state.trail, pos])
          }
        }
      },
      mouseUp: (e: MouseEvent) => {
        if (state.trail.length > 2) {
          const path = new Path(state.trail, state.color, state.lineWidth)
          actions.setImage(img => {
            return produce(img, (img) => {
              img.getLayerById(state.currentLayerId)?.paths.push(path)
            })
          })
        }
        actions.setTrail([])
        e.preventDefault()
      },
    },
    'layer shift': {
      mouseDown: (pos: [number, number]) => {
        actions.setDrag({
          start: pos,
          end: pos,
        })
      },
      mouseMove: (pos: [number, number]) => {
        if (state.drag)
          actions.setDrag({
            start: state.drag.start,
            end: pos,
          })
      },
      mouseUp: (e: MouseEvent) => {
        if (state.drag) {
          const drag = state.drag
          actions.setImage(img => {
            return produce(img, (img) => {
              const layer = img.getLayerById(state.currentLayerId)
              if (!layer) return
              layer.paths = layer.paths.map(p => {
                p.poses = p.poses.map(p => [
                  p[0] + drag.end[0] - drag.start[0],
                  p[1] + drag.end[1] - drag.start[1],
                ])
                return p
              })
            })
          })
          actions.setDrag(null)
        }
        e.preventDefault()
      },
    }
  }[state.mode]), [state, actions])

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

    let imageToDraw = state.image

    switch (state.mode) {
      case 'pen':
        if (state.trail.length > 2) {
          imageToDraw = produce(imageToDraw, img => {
            img.getLayerById(state.currentLayerId)?.paths.push(new Path(state.trail, state.color, state.lineWidth))
          })
        }
        break
      case 'layer shift':
        if (state.drag) {
          const drag = state.drag
          imageToDraw = produce(imageToDraw, (img) => {
            const layer = img.getLayerById(state.currentLayerId)
            if (!layer) return
            layer.paths = layer.paths.map(p => {
              p.poses = p.poses.map(p => [
                p[0] + drag.end[0] - drag.start[0],
                p[1] + drag.end[1] - drag.start[1],
              ])
              return p
            })
          })
        }
        break
    }

    draw(ctx, imageToDraw)
  }, [state, actions])

  return (
    <AppContext.Provider value={{ state, actions }}>
      <div
        className={style.App}
        onMouseMove={handlers.onMouseMove}
      >
        <header>
          <span className={style.title}>
            benia - paint app
          </span>
        </header>
        <div className={style.center}>
          <div>
            <Tools {...{ mode: state.mode, setMode: actions.setMode }} />
            <div>
              <canvas
                className={style.canvas}
                ref={canvasRef}
                width={state.image.size[0]}
                height={state.image.size[1]}
                onMouseDown={handlers.onMouseDown}
              ></canvas>
            </div>
            <div>
              <CompactPicker
                color={state.color}
                onChange={c => {
                  actions.setColor(c.hex)
                }}
              />
              <PenPicker
                lineWidth={state.lineWidth}
                onChange={w => actions.setLineWidth(w)}
              />
            </div>
          </div>
          <TreeView
            image={state.image}
            dispatch={actions.setImage}
          />
        </div>
      </div>
    </AppContext.Provider>
  )
}

export default App;

const Tools = ({ mode, setMode }: { mode: Mode, setMode: (mode: Mode) => void }) => {
  return <div style={{ textAlign: 'left' }}>
    {modes.map(m => (
      <span
        key={m}
        className={[style.button, m === mode ? style.active : ''].join(' ')}
        onClick={() => setMode(m)}
      >
        {m}
      </span>
    ))}
  </div>;
}

function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
