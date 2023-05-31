import { modes, useAppStore } from '../../store';
import styles from './index.module.scss';

export const Tools = () => {
  const {mode, setMode} = useAppStore(state => ({mode: state.mode, setMode: state.setMode}))
  return <div className={styles.tools}>
    {modes.map(m => (
      <span
        key={m}
        className={[styles.button, m === mode?.type ? styles.active : ''].join(' ')}
        onClick={() => setMode(m)}
      >
        {m}
      </span>
    ))}
  </div>;
}
