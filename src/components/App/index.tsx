import produce from 'immer';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { CompactPicker } from 'react-color';
import { PenPicker } from '../../components/PenPicker';
import { TreeView } from '../../components/TreeView';
import { useCursorTrackEventHandler } from '../../hooks/useCursorTrack';
import { Path } from '../../model';
import { AppContext, getActions, initialState, reducer, State } from './context';
import { draw } from '../../model/draw';
import styles from './index.module.scss';
import { Tools } from './Tools';
import { getPointInImage } from '../../model/getPointInImage';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const [state, dispatch] = useReducer(reducer, initialState())
  const actions = useMemo(() => getActions(dispatch), [dispatch])

  const modeHandlers = useMemo(() => makeHandlers(state, actions), [state, actions])

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

    switch (state.mode?.type) {
      case 'pen':
        if (state.mode.trail.length > 2) {
          const trail = state.mode.trail
          imageToDraw = produce(imageToDraw, img => {
            img.getLayerById(state.currentLayerId)?.paths.push(new Path(trail, state.color, state.lineWidth))
          })
        }
        break
      case 'layer_shift':
        if (state.mode.drag) {
          const drag = state.mode.drag
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
        className={styles.App}
        onMouseMove={handlers.onMouseMove}
      >
        <header>
          <span className={styles.title}>
            benia - paint app
          </span>
        </header>
        <div className={styles.center}>
          <div>
            <Tools {...{ mode: state?.mode?.type, setMode: actions.setMode }} />
            <div>
              <canvas
                className={styles.canvas}
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

function makeHandlers(state: State, actions: ReturnType<typeof getActions>) {
  const mode = state.mode;
  switch (mode?.type) {
    case 'pen': return {
      mouseDown: (pos: [number, number]) => {
        actions.setTrail([pos]);
      },
      mouseMove: (pos: [number, number]) => {
        const last = mode.trail.at(-1);
        if (last) {
          const d = distance(last, pos);
          if (10 <= d) {
            actions.setTrail([...mode.trail, pos]);
          }
        }
      },
      mouseUp: (e: MouseEvent) => {
        if (mode.trail.length > 2) {
          const path = new Path(mode.trail, state.color, state.lineWidth);
          actions.setImage(img => {
            return produce(img, (img) => {
              img.getLayerById(state.currentLayerId)?.paths.push(path);
            });
          });
        }
        actions.setTrail([]);
        e.preventDefault();
      },
    };
    case 'layer_shift': return {
      mouseDown: (pos: [number, number]) => {
        actions.setDrag({
          start: pos,
          end: pos,
        });
      },
      mouseMove: (pos: [number, number]) => {
        if (mode.drag)
          actions.setDrag({
            start: mode.drag.start,
            end: pos,
          });
      },
      mouseUp: (e: MouseEvent) => {
        if (mode.drag) {
          const drag = mode.drag;
          actions.setImage(img => {
            return produce(img, (img) => {
              const layer = img.getLayerById(state.currentLayerId);
              if (!layer)
                return;
              layer.paths = layer.paths.map(p => {
                p.poses = p.poses.map(p => [
                  p[0] + drag.end[0] - drag.start[0],
                  p[1] + drag.end[1] - drag.start[1],
                ]);
                return p;
              });
            });
          });
          actions.setDrag(null);
        }
        e.preventDefault();
      },
    };
    case 'move_point': return {
      mouseDown: (pos: [number, number]) => {
        const point = getPointInImage(state.image, pos)
        actions.setPoint(point);
      },
      mouseMove: (pos: [number, number]) => {
        if (mode.point)
          actions.setImage(produce(state.image, (image) => {
            if (!mode.point) return
            const poses =
              image.getLayerById(mode.point.layerId)?.getPathById(mode.point.pathId)?.poses
            if (poses)
              poses[mode.point.posesIdx] = pos
          }))
      },
      mouseUp: (e: MouseEvent) => {
        actions.setPoint(null)
      },
    };
    default: return {
      mouseDown: () => { },
      mouseMove: () => { },
      mouseUp: () => { },
    };
  }
}

function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
