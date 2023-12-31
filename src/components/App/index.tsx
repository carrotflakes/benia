import { produce } from 'immer';
import { useEffect, useMemo, useRef } from 'react';
import { CompactPicker } from 'react-color';
import { PenPicker } from '../../components/PenPicker';
import { TreeView } from '../../components/TreeView';
import { useCursorTrackEventHandler } from '../../hooks/useCursorTrack';
import { Path } from '../../model';
import { draw } from '../../model/draw';
import styles from './index.module.scss';
import { Tools } from './Tools';
import { getPointInLayer } from '../../model/getPointInImage';
import { State, useAppStore } from '../../store';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const state = useAppStore()
  const { undo, redo, clear } = useAppStore.temporal.getState();

  useEffect(() => {
    const keydown = (e: KeyboardEvent): void => {
      if (e.key === "z" && e.ctrlKey)
        undo();
      if (e.key === "Z" && e.ctrlKey)
        redo();
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [undo, redo]);

  const modeHandlers = useMemo(() => makeHandlers(state), [state])

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

    modeHandlers.draw(ctx)
  }, [modeHandlers])

  return (
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
          <Tools />
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
                state.setColor(c.hex)
              }}
            />
            <PenPicker
              lineWidth={state.lineWidth}
              onChange={w => state.setLineWidth(w)}
            />
          </div>
        </div>
        <TreeView />
      </div>
    </div>
  )
}

export default App;

function makeHandlers(state: State) {
  const mode = state.mode;
  switch (mode?.type) {
    case 'pen': return {
      mouseDown: (pos: [number, number]) => {
        state.setTrail([pos]);
      },
      mouseMove: (pos: [number, number]) => {
        const last = mode.trail.at(-1);
        if (last) {
          const d = distance(last, pos);
          if (10 <= d) {
            state.setTrail([...mode.trail, pos]);
          }
        }
      },
      mouseUp: (e: MouseEvent) => {
        if (mode.trail.length > 2) {
          const path = new Path(mode.trail, state.color, state.lineWidth);
          state.setImage(img => {
            return produce(img, (img) => {
              img.getLayerById(state.currentLayerId)?.paths.push(path);
            });
          });
        }
        state.setTrail([]);
        e.preventDefault();
      },
      draw: (ctx: CanvasRenderingContext2D) => {
        let imageToDraw = state.image

        if (mode.trail.length > 2) {
          const trail = mode.trail
          imageToDraw = produce(imageToDraw, img => {
            img.getLayerById(state.currentLayerId)?.paths.push(new Path(trail, state.color, state.lineWidth))
          })
        }

        draw(ctx, imageToDraw)
      },
    };
    case 'layer_shift': return {
      mouseDown: (pos: [number, number]) => {
        state.setDrag({
          start: pos,
          end: pos,
        });
      },
      mouseMove: (pos: [number, number]) => {
        if (mode.drag)
          state.setDrag({
            start: mode.drag.start,
            end: pos,
          });
      },
      mouseUp: (e: MouseEvent) => {
        if (mode.drag) {
          const drag = mode.drag;
          state.setImage(img => {
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
          state.setDrag(null);
        }
        e.preventDefault();
      },
      draw: (ctx: CanvasRenderingContext2D) => {
        let imageToDraw = state.image

        if (mode.drag) {
          const drag = mode.drag
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

        draw(ctx, imageToDraw)
      },
    };
    case 'move_point': return {
      mouseDown: (pos: [number, number]) => {
        const layer = state.image.getLayerById(state.currentLayerId)
        if (!layer) return
        const point = getPointInLayer(layer, pos)
        state.setPoint(point);
      },
      mouseMove: (pos: [number, number]) => {
        if (mode.point)
          state.setImage(produce(state.image, (image) => {
            if (!mode.point) return
            const poses =
              image.getLayerById(mode.point.layerId)?.getPathById(mode.point.pathId)?.poses
            if (poses)
              poses[mode.point.posesIdx] = pos
          }))
      },
      mouseUp: (e: MouseEvent) => {
        state.setPoint(null)
      },
      draw: (ctx: CanvasRenderingContext2D) => {
        draw(ctx, state.image)
      },
    };
    default: return {
      mouseDown: () => { },
      mouseMove: () => { },
      mouseUp: () => { },
      draw: (ctx: CanvasRenderingContext2D) => {
        draw(ctx, state.image)
      },
    };
  }
}

function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
