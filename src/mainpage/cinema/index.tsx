import React, { useContext, useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { IndexContext } from "../../context";
import Background from "./bg";
import Modals from "./modals";

const Cinema = () => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        {works} = useContext(IndexContext),
        containerRef = useRef<HTMLDivElement>(),
        transitionDuration = 1 / (works.length + 2),
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
            end:`bottom 0%`,
            scrub:true,
            onLeaveBack:()=>{
                document.body.style.cursor = null
            },
            onLeave:()=>{
                document.body.style.cursor = null
            },
        })
        
    },[])

    return (
        <div id='cinema-container' style={{height:`${works.length + 2}00vh`,width:'100vw'}} ref={containerRef}>
            <Background />
            <Modals />
        </div>
    )
}

export default Cinema;