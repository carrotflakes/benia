import { Mode, modes } from './context';
import styles from './index.module.scss';

export const Tools = ({ mode, setMode }: { mode?: Mode['type']; setMode: (mode: Mode['type']) => void; }) => {
  return <div className={styles.tools}>
    {modes.map(m => (
      <span
        key={m}
        className={[styles.button, m === mode ? styles.active : ''].join(' ')}
        onClick={() => setMode(m)}
      >
        {m}
      </span>
    ))}
  </div>;
}
