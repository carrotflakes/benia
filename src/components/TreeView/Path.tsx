import produce from "immer";
import * as model from "../../model";
import style from './index.module.css';
import { Hamburger } from "../icons/Hamburger";

export const Path = (
  { path, pass, dispatch }: {
    path: model.Path;
    pass: [number, number];
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
          background: path.color,
        }}
      ></div>

      &nbsp;
      ({path.poses.length})
      &nbsp;
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[pass[0]].paths[pass[1]].close = !img.layers[pass[0]].paths[pass[1]].close;
        }))}
      >close</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          if (img.layers[pass[0]].paths[pass[1]].fill) {
            img.layers[pass[0]].paths[pass[1]].fill = undefined;
          } else {
            img.layers[pass[0]].paths[pass[1]].fill = img.layers[pass[0]].paths[pass[1]].color;
          }
        }))}
      >fill</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[pass[0]].paths.splice(pass[1], 1);
        }))}
      >delete</div>
    </div>
  )
};
