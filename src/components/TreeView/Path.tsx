import { produce } from "immer";
import * as model from "../../model";
import style from './index.module.css';
import { Hamburger } from "../icons/Hamburger";
import { SyntheticEvent, } from "react";
import { useAppStore } from "../../store";

export const Path = (
  { path, pass, sortHandleMouseDown }: {
    path: model.Path;
    pass: [number, number];
    sortHandleMouseDown: (e: SyntheticEvent<HTMLElement, MouseEvent>) => void;
  }) => {
  const state = useAppStore()

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
          state.setImage(img => produce(img, img => {
            img.layers[pass[0]].paths[pass[1]].color = state.color
            img.layers[pass[0]].paths[pass[1]].width = state.lineWidth
          }))
        }}
      ></div>

      &nbsp;
      ({path.poses.length})
      &nbsp;
      <div
        className={style.button}
        onClick={() => state.setImage(img => produce(img, img => {
          img.layers[pass[0]].paths[pass[1]].close = !img.layers[pass[0]].paths[pass[1]].close
        }))}
      >close</div>
      <span
        className={"material-symbols-outlined " + style.iconButton}
        onClick={() => state.setImage(img => produce(img, img => {
          if (img.layers[pass[0]].paths[pass[1]].fill) {
            img.layers[pass[0]].paths[pass[1]].fill = undefined
          } else {
            img.layers[pass[0]].paths[pass[1]].fill = state.color
          }
        }))}
      >
        format_color_fill
      </span>
      <span
        className={"material-symbols-outlined " + style.iconButton}
        onClick={() => state.setImage(img => produce(img, img => {
          img.layers[pass[0]].paths.splice(pass[1], 1)
        }))}
      >
        delete
      </span>
    </div>
  )
};
