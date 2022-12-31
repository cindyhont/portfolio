import React, { useEffect, useRef } from "react";

const ViewportReport = () => {
    const
        innerHeightRef = useRef<HTMLSpanElement>(),
        outerHeightRef = useRef<HTMLSpanElement>(),
        screenYRef = useRef<HTMLSpanElement>(),
        anim = () => {
            const {innerHeight,outerHeight,screenY} = window
            innerHeightRef.current.innerText = `${innerHeight}px`
            outerHeightRef.current.innerText = `${outerHeight}px`
            screenYRef.current.innerText = `${screenY}px`
            requestAnimationFrame(anim)
        }

    useEffect(()=>{requestAnimationFrame(anim)},[])

    return (
        <ul
            style={{
                backgroundColor:'black',
                color:'white',
                position:'fixed',
                top:'0',
                left:'0',
                zIndex:'999'
            }}
        >
            <li>innerHeight: <span ref={innerHeightRef} /></li>
            <li>outerHeight: <span ref={outerHeightRef} /></li>
            <li>screenY: <span ref={screenYRef} /></li>
        </ul>
    )
}

export default ViewportReport