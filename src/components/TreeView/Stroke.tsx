import produce from "immer";
import * as model from "../../model";
import style from './index.module.css';
import { Hamburger } from "../icons/Hamburger";

export const Stroke = (
  { stroke, path, dispatch }: {
    stroke: model.Stroke;
    path: [number, number];
    dispatch: (operation: (image: model.Image) => model.Image) => void;
  }) => {
  return (
    <div>
      <span
        className={style.sortHandle}
        style={{ padding: 2, cursor: 'pointer' }}
        onMouseDown={e => e.preventDefault()}
      >
        <Hamburger color="#aaa" />
      </span>

      <div
        className={style.strokeColor}
        style={{
          background: stroke.color,
        }}
      ></div>

      &nbsp;
      ({stroke.poses.length})
      &nbsp;
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[path[0]].strokes[path[1]].close = !img.layers[path[0]].strokes[path[1]].close;
        }))}
      >close</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          if (img.layers[path[0]].strokes[path[1]].fill) {
            img.layers[path[0]].strokes[path[1]].fill = undefined;
          } else {
            img.layers[path[0]].strokes[path[1]].fill = img.layers[path[0]].strokes[path[1]].color;
          }
        }))}
      >fill</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[path[0]].strokes.splice(path[1], 1);
        }))}
      >delete</div>
    </div>
  )
};
