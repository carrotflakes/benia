import produce from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CompactPicker } from 'react-color';
import './App.css';
import { useCursorTrackEventHandler } from './useCursorTrack';

function App() {
  const canvasRef = useRef(null! as HTMLCanvasElement)

  const [trail, setTrail] = useState([] as [number, number][])
  const [image, setImage] = useState({
    size: [300, 300],
    layers: [{
      strokes: [],
    }]
  } as Image)
  const [color, setColor] = useState('red')
  const [lineWidth, setLineWidth] = useState(1)

  const handlers = useCursorTrackEventHandler(useCallback((pos) => {
    setTrail([pos])
  }, []), useCallback((pos) => {
    const last = trail.at(-1)
    if (last) {
      const d = distance(last, pos)
      if (10 <= d) {
        setTrail(ps => [...ps, pos])
      }
    }
  }, [trail]), useCallback(() => {
    if (trail.length > 2) {
      const stroke =
      {
        poses: trail,
        close: false,
        color,
        width: lineWidth,
      }
      setImage(img => {
        return produce(img, (img) => {
          img.layers[0].strokes.push(stroke)
        })
      })
    }
    setTrail([])
  }, [color, lineWidth, trail]))


  useEffect(() => {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext('2d')
    if (!ctx)
      return

    let imageToDraw = image

    if (trail.length > 2) {
      imageToDraw = produce(imageToDraw, img => {
        img.layers[0].strokes.push({
          poses: trail,
          close: false,
          color,
          width: lineWidth,
        })
      })
    }

    draw(ctx, imageToDraw)
  }, [image, trail, color, lineWidth])

  return (
    <div className="App">
      <div>
        drawStroke
      </div>
      <canvas
        className='canvas'
        ref={canvasRef}
        width="300"
        height="300"
        {...handlers}
      ></canvas>
      <div>
        <CompactPicker color={color} onChange={c => {
          setColor(c.hex)
        }} />
        <input type="number" value={lineWidth} onChange={e => setLineWidth(+e.target.value)}></input>
      </div>
    </div>
  );
}

export default App;

type Image = {
  size: [number, number]
  layers: Layer[]
}

type Layer = {
  strokes: Stroke[]
}

type Stroke = {
  poses: Pos[]
  close: boolean
  color: string
  width: number
}

type Pos = [number, number]

function draw(ctx: CanvasRenderingContext2D, image: Image) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (let layer of image.layers) {
    for (let stroke of layer.strokes) {
      ctx.lineWidth = stroke.width
      ctx.strokeStyle = stroke.color

      ctx.beginPath()

      for (let i = 0; i < stroke.poses.length; ++i) {
        ctx.lineTo(stroke.poses[i][0], stroke.poses[i][1])
      }

      if (stroke.close)
        ctx.closePath()

      ctx.stroke()
    }
  }
}


function distance(a: [number, number], b: [number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}
