import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function ModalPortal({ children }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {children}
    </div>,
    document.body,
  )
}
