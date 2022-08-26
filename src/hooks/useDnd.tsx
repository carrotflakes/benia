import { SyntheticEvent, useEffect, useMemo, useState } from "react";

export const useDnd = <A,>(
resolveMouseOver: (pos: [number, number], source?: A) => null | A,
    onMoved: (source: A, destination: A) => void
) => {
    const [source, setSource] = useState(null as null | A);
  const [destination, setDestination] = useState(null as null | A);
  const [sourcePos, setSourcePos] = useState([0, 0]);
  const [destinationPos, setDestinationPos] = useState([0, 0]);

    useEffect(() => {
        const mouseUp = (e: MouseEvent) => {
            if (source !== null && destination !== null) {
    onMoved(source, destination);
  e.preventDefault();
            }
  setSource(null);
  setDestination(null);
        };
  window.addEventListener('mouseup', mouseUp);
        return () => {
    window.removeEventListener('mouseup', mouseUp);
        };
    }, [destination, source, onMoved]);

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            if (source !== null) {
    setDestination(resolveMouseOver([e.clientX, e.clientY], source));
  setDestinationPos([e.clientX, e.clientY]);
            }
        };
  window.addEventListener('mousemove', mouseMove);
        return () => {
    window.removeEventListener('mousemove', mouseMove);
        };
    }, [source, resolveMouseOver]);

    const genOnMouseDown = (i: A) => (e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    setSource(i);
  setSourcePos([e.nativeEvent.clientX, e.nativeEvent.clientY]);
  setDestinationPos([e.nativeEvent.clientX, e.nativeEvent.clientY]);
  e.preventDefault();
    };

    const dpos = useMemo(() => [destinationPos[0] - sourcePos[0], destinationPos[1] - sourcePos[1]], [destinationPos, sourcePos]);

  return {
    genOnMouseDown,
    source,
    destination,
    dpos,
    };
};
