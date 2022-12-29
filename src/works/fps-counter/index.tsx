import React, { memo, useEffect, useRef } from 'react'
import styles from './FpsCounter.module.scss'

const FpsCounter = memo(()=>{
    const 
        spanRef = useRef<HTMLSpanElement>(),
        request = useRef(0),
        now = useRef(0),
        arr = useRef(Array.from(Array(60),()=>60)),
        anim = (e:number) => {
            const v = Math.min(Math.round(1000 / (e - now.current)),60)
            arr.current = [...arr.current.slice(1),v]
            // takes the average fps, avoid the counter from keeping flashing
            if (!!spanRef.current) spanRef.current.innerText = `${Math.round(arr.current.reduce((a,b)=>a+b) / arr.current.length)}`
            now.current = e
            request.current = window.requestAnimationFrame(anim)
        }

    useEffect(()=>{
        request.current = window.requestAnimationFrame(anim)
        return () => cancelAnimationFrame(request.current)
    },[])

    return (
        <div className={styles['fps-counter']}><p>FPS: <span ref={spanRef} /></p></div>
    )
})
FpsCounter.displayName = 'FpsCounter'
export default FpsCounter