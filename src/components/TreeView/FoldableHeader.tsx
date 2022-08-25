import { Dispatch, ReactNode, SetStateAction } from "react";

export const FoldableHeader = ({ fold, setFold, children }: {
  fold: boolean;
  setFold: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}) => {
  return (
    <div
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={e => {
        setFold(x => !x)
        e.preventDefault()
      }}
    >
      <span style={{
        display: 'inline-block',
        transform: `scale(0.8) rotate(${fold ? 0 : '-90deg'})`
      }}>▼</span>
      {children}
    </div>
  );
};
