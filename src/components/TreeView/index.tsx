import * as model from "../../model"
import './index.css'

export const TreeView = ({ image }: { image: model.Image }) => {
  return <div className="TreeView">
    <div>
      {image.size.join(', ')}
    </div>
    <div>
      <div>layers:</div>
      {
        image.layers.map((layer, i) => (<Layer key={i} layer={layer} />))
      }
    </div>
  </div>
}

const Layer = ({ layer }: { layer: model.Layer }) => {
  return <div>
    <div>layer</div>
    <div>strokes</div>
    {layer.strokes.map((stroke, i) => <Stroke key={i} stroke={stroke} />)}
  </div>
}

const Stroke = ({ stroke }: { stroke: model.Stroke }) => {
  return <div>
    {stroke.poses.length}
  </div>
}
