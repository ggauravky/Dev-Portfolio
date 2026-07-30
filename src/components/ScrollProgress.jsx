import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
    const barRef = useRef(null)

    useEffect(() => {
        const bar = barRef.current
        if (!bar) return

        let rafId = null

        const update = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            bar.style.width = `${pct}%`
            rafId = null
        }

        const onScroll = () => {
            if (!rafId) rafId = requestAnimationFrame(update)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        update()
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[999] pointer-events-none">
            <div
                ref={barRef}
                style={{ width: '0%', willChange: 'width', transform: 'translateZ(0)' }}
                className="h-full bg-gradient-to-r from-toxic via-cyber to-purple-500 transition-none"
            />
        </div>
    )
}
