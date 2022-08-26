import { Image, Layer } from '../../model';

export function draw(ctx: CanvasRenderingContext2D, image: Image) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let layer of image.layers) {
    if (layer.hide)
      continue

    const buffer = canvasFromLayer([ctx.canvas.width, ctx.canvas.height], layer)

    ctx.globalCompositeOperation = layer.compositeMode
    ctx.globalAlpha = layer.alpha
    ctx.drawImage(buffer, 0, 0)
  }
}

function canvasFromLayer(size: [number, number], layer: Layer) {
  const canvas = document.createElement('canvas')
  canvas.width = size[0]
  canvas.height = size[1]
  const ctx = canvas.getContext('2d')
  if (ctx === null)
    throw new Error('faild to get canvas context')

  drawLayer(ctx, layer)

  return canvas
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: Layer, clear = true) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (clear)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let path of layer.paths) {
    ctx.lineWidth = path.width;
    ctx.strokeStyle = path.color;

    ctx.beginPath();

    for (let i = 0; i < path.poses.length; ++i) {
      ctx.lineTo(path.poses[i][0], path.poses[i][1]);
    }

    if (path.close) {
      ctx.closePath();

      if (path.fill) {
        ctx.fillStyle = path.fill;
        ctx.fill();
      }
    }

    ctx.stroke();
  }
}
