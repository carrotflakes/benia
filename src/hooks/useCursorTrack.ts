import { SyntheticEvent, useCallback, useEffect } from "react"

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

    e.stopPropagation()
  }, [mouseDown])

  const onMouseMove = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLElement))
      return

    const rect = e.target.getBoundingClientRect()
    mouseMove([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])

    e.stopPropagation()
  }, [mouseMove])

  return {
    onMouseDown,
    onMouseMove,
  }
}
