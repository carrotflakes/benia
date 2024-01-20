import style from "./index.module.css";

export const PenPicker = ({
  lineWidth,
  onChange,
}: {
  lineWidth: number;
  onChange?: (lineWidth: number) => void;
}) => {
  return (
    <div className={style.PenPicker}>
      <div>
        Line width:
        {lineWidth}
      </div>
      <div>
        <input
          type="range"
          min={0.1}
          max={6}
          step={0.01}
          value={Math.log(lineWidth)}
          onChange={(e) => onChange?.(Math.round(Math.exp(+e.target.value)))}
        />
      </div>
    </div>
  );
};
