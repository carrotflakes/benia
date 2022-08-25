import produce from 'immer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CompactPicker } from 'react-color';
import style from './index.module.css';
import { useCursorTrackEventHandler } from '../../hooks/useCursorTrack';
import { Image } from '../../model'
import { TreeView } from '../../components/TreeView';
import { PenPicker } from '../../components/PenPicker';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const [mode, setMode] = useState('pen' as 'pen' | 'move')
  const [trail, setTrail] = useState([] as [number, number][])
  const [image, setImage] = useState({
    size: [400, 400],
    layers: [{
      paths: [],
    }]
  } as Image)
  const [layerI, setLayerI] = useState(0)
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
      mouseUp: () => {
        if (trail.length > 2) {
          const path =
          {
            poses: trail,
            close: false,
            color,
            width: lineWidth,
          }
          setImage(img => {
            return produce(img, (img) => {
              img.layers[layerI].paths.push(path)
            })
          })
        }
        setTrail([])
      },
    },
    move: {
      mouseDown: (pos: [number, number]) => {
      },
      mouseMove: (pos: [number, number]) => {
      },
      mouseUp: () => {
      },
    }
  }[mode]), [color, layerI, lineWidth, mode, trail])

  const handlers = useCursorTrackEventHandler(
    modeHandlers.mouseDown,
    modeHandlers.mouseMove,
    modeHandlers.mouseUp,
  )

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext('2d')
    if (!ctx)
      return

    let imageToDraw = image

    if (trail.length > 2) {
      imageToDraw = produce(imageToDraw, img => {
        img.layers[layerI].paths.push({
          poses: trail,
          close: false,
          color,
          width: lineWidth,
        })
      })
    }

    draw(ctx, imageToDraw)
  }, [image, trail, color, lineWidth, layerI])

  return (
    <div className={style.App} style={{ display: 'flex', flexDirection: 'column' }}>
      <header>
        benia - paint app
      </header>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          <div style={{ textAlign: 'left' }}>
            {['pen' as const, 'move' as const].map(m => (
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
            width="400"
            height="400"
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
          dispatch={op => setImage(i => op(i))}
        />
      </div>
    </div>
  );
}

export default App;

function draw(ctx: CanvasRenderingContext2D, image: Image) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (let layer of image.layers) {
    if (layer.hide) continue
    for (let path of layer.paths) {
      ctx.lineWidth = path.width
      ctx.strokeStyle = path.color

      ctx.beginPath()

      for (let i = 0; i < path.poses.length; ++i) {
        ctx.lineTo(path.poses[i][0], path.poses[i][1])
      }

      if (path.close) {
        ctx.closePath()

        if (path.fill) {
          ctx.fillStyle = path.fill;
          ctx.fill()
        }
      }

      ctx.stroke()
    }
  }
}

function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
