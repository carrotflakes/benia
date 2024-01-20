import { SyntheticEvent, useCallback, useEffect, useRef, useState } from "react"

export const useCursorTrackEventHandler = (
  mouseDown: (pos: [number, number]) => void,
  mouseMove: (pos: [number, number]) => void,
  mouseUp: (e: MouseEvent) => void,
  targetRef: ReturnType<typeof useRef<HTMLElement>>,
) => {
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    const mouseUpHandler = (e: MouseEvent) => {
      setIsMouseDown(false)
      mouseUp(e)
    }
    window.addEventListener('mouseup', mouseUpHandler)
    return () => {
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [mouseUp])

  const onMouseDown = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!targetRef.current)
      return

    const rect = targetRef.current.getBoundingClientRect()
    mouseDown([e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top])
    setIsMouseDown(true)

    e.preventDefault()
  }, [mouseDown, targetRef])

  const onMouseMove = useCallback((e: SyntheticEvent<HTMLElement, MouseEvent>) => {
    if (!targetRef.current || !isMouseDown)
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
