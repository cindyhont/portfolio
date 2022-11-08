import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { AboutSceneTab } from '../../common'
import About from './about'
import Background from './bg'

const Diamonds = (
    {
        end,
        slideDuration,
        bgTransition
    }:{
        end:number;
        slideDuration:number;
        bgTransition:number;
    }
) => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        containerRef = useRef<HTMLDivElement>(),
        transitionDuration = 100 / end,
        fullOpacityDuration = 1 - transitionDuration * 2

    useEffect(()=>{
        const tl = gsap.timeline();
        tl.from(containerRef.current,{
            autoAlpha:0,
            duration:transitionDuration
        })
        tl.to(containerRef.current, {
            autoAlpha: 1,
            duration:fullOpacityDuration
        })
        tl.to(containerRef.current,{
            autoAlpha:0,
            duration:transitionDuration
        })

        ScrollTrigger.create({
            animation:tl,
            trigger:containerRef.current,
            start:`top 0%`,
            end:`top -${end}%`,
            scrub:true,
            pin:true,
        })
    },[])

    return (
        <div id='diamonds-container' ref={containerRef}>
            <Background end={end} />
            <About start={100} end={end-100} slideDuration={slideDuration} bgTransition={bgTransition} />
            <AboutSceneTab codeURL='https://xxxxxxxxxxx.com/' id='diamonds-about-scene'>
                <p>
                    This scene is build with three.js, instacing and postprocessing. 
                    In each frame, the 3D position of each diamond is set by original positions multiplied by the rotation matrix. 
                    The normals are transformed by being multplied by the transpose of the inverse of the same matrix.
                    Shader material and instanced buffer geometry are used instead of a simple instanced mesh for the realistic reflection.
                </p>
            </AboutSceneTab>
        </div>
    )
}

export default Diamonds