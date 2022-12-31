import React, { useRef } from "react";
import { useOnScrollAfterResize } from "../../common";
import Waves from "../waves";
import styles from './ScrollParallaxContainer.module.scss'

const ScrollParallaxContainer = (
    {
        wavePaths,
        children,
    }:{
        wavePaths:string[];
        children:JSX.Element;
    }
) => {
    const
        content = useRef<HTMLDivElement>(),
        shadow = useRef<HTMLDivElement>(),
        waves = useRef<SVGSVGElement>(),
        inViewport = useRef(false),
        prevTop = useRef(0),
        onScroll = () => {
            const 
                {top} = waves.current.getBoundingClientRect(),
                {innerHeight} = window

            if (!prevTop.current) prevTop.current = top
            
            if (!inViewport.current && top - (prevTop.current - top) < innerHeight){
                inViewport.current = true
                shadow.current.style.height = `${content.current.offsetHeight}px`
                shadow.current.style.display = 'block'
                content.current.classList.add(styles.lock)
            } else if (inViewport.current && top + (top - prevTop.current) > innerHeight){
                inViewport.current = false
                shadow.current.style.display = 'none'
                content.current.classList.remove(styles.lock)
            }

            prevTop.current = top
        }

    useOnScrollAfterResize(onScroll,onScroll,'')

    return (
        <>
            <div ref={content} className={styles.content}>{children}</div>
            <div ref={shadow} />
            <Waves ref={waves} paths={wavePaths} />
        </>
    )
}

export default ScrollParallaxContainer