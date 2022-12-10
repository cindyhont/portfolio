import React, { useEffect, useRef } from 'react'
import Background from './bg';
import About from './about';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const Diamonds = () => {
    gsap.registerPlugin(ScrollTrigger)

    const 
        trigger = useRef<ScrollTrigger>(),
        updateCanvas = (isActive:boolean) => document.getElementById('diamonds-canvas').style.visibility = isActive ? 'visible' : 'hidden',
        onRefreshInit = () => {
            if (!!trigger.current) trigger.current.kill(true)
            trigger.current = ScrollTrigger.create({
                trigger:'#diamonds-container',
                start:`top 0%`,
                end:`bottom 0%`,
                scrub:true,
                onRefresh:({isActive})=>updateCanvas(isActive),
                onEnter:()=>updateCanvas(true),
                onEnterBack:()=>updateCanvas(true),
                onLeave:()=>updateCanvas(false),
                onLeaveBack:()=>updateCanvas(false),
            })
        }

    useEffect(()=>{
        onRefreshInit()
        ScrollTrigger.addEventListener('refreshInit',onRefreshInit)
        return () => ScrollTrigger.removeEventListener('refreshInit',onRefreshInit)
    },[])

    return (
        <div id='diamonds-container'>
            <Background />
            <div style={{height:'100vh',width:'100vw'}} />
            <About />
        </div>
    )
}

export default Diamonds