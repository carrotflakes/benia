import produce from "immer";
import * as model from "../../model";
import style from './index.module.css';
import { Hamburger } from "../icons/Hamburger";
import { SyntheticEvent, useContext } from "react";
import { AppContext } from "../App/context";

export const Path = (
  { path, pass, dispatch, sortHandleMouseDown }: {
    path: model.Path;
    pass: [number, number];
    dispatch: (operation: (image: model.Image) => model.Image) => void;
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void;
  }) => {
  const appCtx = useContext(AppContext)

  return (
    <div>
      <span
        className={style.sortHandle}
        onMouseDown={sortHandleMouseDown}
      >
        <Hamburger color="#aaa" />
      </span>

      <div
        className={style.strokeColor}
        style={{
          background: path.color,
        }}
        onClick={() => {
          dispatch(img => produce(img, img => {
            img.layers[pass[0]].paths[pass[1]].color = appCtx.color
            img.layers[pass[0]].paths[pass[1]].width = appCtx.lineWidth
          }))
        }}
      ></div>

      &nbsp;
      ({path.poses.length})
      &nbsp;
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[pass[0]].paths[pass[1]].close = !img.layers[pass[0]].paths[pass[1]].close
        }))}
      >close</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          if (img.layers[pass[0]].paths[pass[1]].fill) {
            img.layers[pass[0]].paths[pass[1]].fill = undefined
          } else {
            img.layers[pass[0]].paths[pass[1]].fill = appCtx.color
          }
        }))}
      >fill</div>
      <div
        className={style.button}
        onClick={() => dispatch(img => produce(img, img => {
          img.layers[pass[0]].paths.splice(pass[1], 1)
        }))}
      >delete</div>
    </div>
  )
};
