import style from './index.module.css'

export const PenPicker = ({ lineWidth, onChange }: { lineWidth: number, onChange?: (lineWidth: number) => void }) => {
  const sizes = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]

  return <div className={style.PenPicker}>
    Line width:
    {lineWidth}
    {
      sizes.map(x => (
        <div
          key={x}
          className={style.button}
          onClick={() => onChange?.(x)
          }>
          {x}
        </div>
      ))
    }
  </div>
}
