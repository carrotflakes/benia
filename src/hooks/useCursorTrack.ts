import { SyntheticEvent, useCallback, useEffect, useRef } from "react"

export const useCursorTrackEventHandler = (
  mouseDown: (pos: [number, number]) => void,
  mouseMove: (pos: [number, number]) => void,
  mouseUp: (e: MouseEvent) => void,
  targetRef: ReturnType<typeof useRef<HTMLElement>>,
) => {
  useEffect(() => {
    window.addEventListener('mouseup', mouseUp)
    return () => {
      window.removeEventListener('mouseup', mouseUp)
    }
  }, [mouseUp])

  const onMouseDown = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!targetRef.current)
      return

    const rect = targetRef.current.getBoundingClientRect()
    mouseDown([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])

    e.preventDefault()
  }, [mouseDown, targetRef])

  const onMouseMove = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!targetRef.current)
      return

    const rect = targetRef.current.getBoundingClientRect()
    mouseMove([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])

    e.preventDefault()
  }, [mouseMove, targetRef])

  return {
    onMouseDown,
    onMouseMove,
  }
}
