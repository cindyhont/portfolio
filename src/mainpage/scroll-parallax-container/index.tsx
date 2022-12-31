import React, { useEffect, useRef, useState } from "react";
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
        isInViewport = () => {
            // shadow.current.style.height = `${content.current.offsetHeight}px`
            // shadow.current.style.display = 'block'
            // content.current.style.top = `calc(100vh - ${content.current.offsetHeight}px)`

            content.current.style.top = `calc(var(--current-actual-height) - ${content.current.offsetHeight}px)`
            shadow.current.style.height = `${content.current.offsetHeight}px`

            content.current.classList.add(styles.lock)
            shadow.current.style.position = null
            inViewport.current = true
        },
        isNotInViewport = () => {
            // shadow.current.style.display = 'none'

            content.current.style.top = `calc(var(--current-actual-height) - ${content.current.offsetHeight}px)`
            shadow.current.style.height = `${content.current.offsetHeight}px`

            shadow.current.style.position = 'absolute'
            content.current.classList.remove(styles.lock)
            inViewport.current = false
        },
        onScroll = () => {
            const 
                {top} = waves.current.getBoundingClientRect(),
                {innerHeight} = window
            
            if (!inViewport.current && top - (prevTop.current - top) < innerHeight) isInViewport()
            else if (inViewport.current && top + (top - prevTop.current) > innerHeight) isNotInViewport()

            prevTop.current = top
        },
        immediateOnResize = () => {
            const 
                {top} = waves.current.getBoundingClientRect(),
                {innerHeight} = window

            if (top < innerHeight) isInViewport()
            else isNotInViewport()

            prevTop.current = top
        }

    useOnScrollAfterResize(onScroll,immediateOnResize,'')

    return (
        <>
            <div ref={content} className={styles.content}>{children}</div>
            <div ref={shadow} style={{top:'0px',visibility:'hidden'}} />
            <Waves ref={waves} paths={wavePaths} />
        </>
    )
}

export default ScrollParallaxContainer