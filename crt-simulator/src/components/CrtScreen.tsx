import type { ReactNode } from 'react'
import './CrtScreen.css'

interface CrtScreenProps {
  children: ReactNode
  className?: string
}

function CrtScreen({ children, className }: CrtScreenProps) {
  return (
    <div className={`crt-screen ${className ?? ''}`}>
      <div className="crt-screen__content">{children}</div>
    </div>
  )
}

export default CrtScreen
