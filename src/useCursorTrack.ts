import { SyntheticEvent, useCallback, useEffect, useState } from "react"

export const useCursorTrack = () => {
  const [dropPos, setDropPos] = useState(null as null | [number, number])
  const [currentPos, setCurrentPos] = useState(null as null | [number, number])
  const [trail, setTrail] = useState([] as [number, number][])

  const handlers = useCursorTrackEventHandler(useCallback((pos) => {
    setDropPos(pos)
    setTrail([pos])
  }, []), useCallback((pos) => {
    setCurrentPos(pos)

    const last = trail.at(-1)
    if (last) {
      const d = distance(last, pos)
      if (10 <= d) {
        setTrail(ps => [...ps, pos])
      }
    }
  }, [trail]), useCallback(() => {
    setDropPos(null)
    setCurrentPos(null)
    setTrail([])
  }, []))

  return {
    ...handlers,
    dropPos, currentPos, trail,
  }
}

export const useCursorTrackEventHandler = (
  mouseDown: (pos: [number, number]) => void,
  mouseMove: (pos: [number, number]) => void,
  mouseUp: () => void) => {
  useEffect(() => {
    window.addEventListener('mouseup', mouseUp)
    return () => {
      window.removeEventListener('mouseup', mouseUp)
    }
  }, [mouseUp])

  const onMouseDown = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLElement))
      return

    const rect = e.target.getBoundingClientRect()
    mouseDown([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])
  }, [mouseDown])

  const onMouseMove = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLElement))
      return

    const rect = e.target.getBoundingClientRect()
    mouseMove([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])
  }, [mouseMove])

  return {
    onMouseDown,
    onMouseMove,
  }
}

const distance = (a: [number, number], b: [number, number]) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}
