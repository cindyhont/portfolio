import React, { useEffect, useRef } from 'react'
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { AboutSceneTab } from '../../common'
import About from './about'
import Background from './bg'

const Diamonds = () => {
    gsap.registerPlugin(ScrollTrigger);
    
    const 
        containerRef = useRef<HTMLDivElement>(),
        paragraph = useRef<HTMLParagraphElement>(),
        trigger = useRef<ScrollTrigger>(),
        updateTrigger = () => {
            if (!!trigger.current) trigger.current.kill()

            const 
                {innerHeight} = window,
                containerHeight = containerRef.current.offsetHeight,
                transitionDuration = innerHeight / containerHeight,
                fullOpacityDuration = 1 - transitionDuration * 2,
                tl = gsap.timeline();

            paragraph.current.innerText = `innerHeight: ${innerHeight}, containerHeight: ${containerHeight}`

            tl.from(containerRef.current,{
                autoAlpha:0,
                duration:0.01//transitionDuration
            })
            tl.to(containerRef.current, {
                autoAlpha: 1,
                duration:0.98//fullOpacityDuration
            })
            tl.to(containerRef.current,{
                autoAlpha:0,
                duration:0.01//transitionDuration
            })

            trigger.current = ScrollTrigger.create({
                animation:tl,
                trigger:containerRef.current,
                start:`top 0%`,
                end:`bottom 0%`,
                scrub:true,
                markers:true
            })
        }

    useEffect(()=>{
        updateTrigger()
        window.addEventListener('resize',updateTrigger)
        return ()=>window.removeEventListener('resize',updateTrigger)
    },[])

    return (
        <div id='diamonds-container' ref={containerRef}>
            <Background />
            <About />
            <AboutSceneTab codeURL='https://xxxxxxxxxxx.com/' id='diamonds-about-scene'>
                <>
                <p>
                    This scene is build with three.js, instacing and postprocessing. 
                    In each frame, the 3D position of each diamond is set by original positions multiplied by the rotation matrix. 
                    The normals are transformed by being multplied by the transpose of the inverse of the same matrix.
                    Shader material and instanced buffer geometry are used instead of a simple instanced mesh for the realistic reflection.
                </p>
                <p ref={paragraph} />
                </>
            </AboutSceneTab>
        </div>
    )
}

export default Diamonds