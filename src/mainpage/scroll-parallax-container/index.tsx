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
        contentWrapper = useRef<HTMLDivElement>(),
        shadow = useRef<HTMLDivElement>(),
        benchmark = useRef<HTMLDivElement>(),
        waves = useRef<SVGSVGElement>(),
        inViewport = useRef(false),
        prevTop = useRef(0),
        isInViewport = () => {
            shadow.current.style.height = `${content.current.offsetHeight}px`

            contentWrapper.current.classList.add(styles.lock)
            shadow.current.style.position = null
            inViewport.current = true
        },
        isNotInViewport = () => {
            shadow.current.style.height = `${content.current.offsetHeight}px`

            contentWrapper.current.classList.remove(styles.lock)
            shadow.current.style.position = 'absolute'
            inViewport.current = false
        },
        onScroll = () => {
            const 
                {top} = waves.current.getBoundingClientRect(),
                {innerHeight} = window
            
            if (window.matchMedia('(hover:hover)').matches){
                if (!inViewport.current && top - (prevTop.current - top) < innerHeight) isInViewport()
                else if (inViewport.current && top + (top - prevTop.current) > innerHeight) isNotInViewport()
            } else {
                const benchmarkBottom = benchmark.current.getBoundingClientRect().bottom
                if (!inViewport.current && top - (prevTop.current - top) < benchmarkBottom) isInViewport()
                else if (inViewport.current && top + (top - prevTop.current) > benchmarkBottom) isNotInViewport()
            }

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
            <div ref={contentWrapper}>
                <div ref={content} className={styles.content}>{children}</div>
            </div>
            <div ref={shadow} style={{top:'0px',visibility:'hidden'}} />
            <div ref={benchmark} style={{position:'fixed',top:'0px',left:'0px',width:'1px',height:'100vh',visibility:'hidden'}} />
            <Waves ref={waves} paths={wavePaths} />
        </>
    )
}

export default ScrollParallaxContainer