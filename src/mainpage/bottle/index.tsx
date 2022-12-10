import React, { useEffect, useRef } from "react";
import {AboutSceneTab} from "../../common";
import Background from "./bg";
import Form from "./form";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const Bottle = () => {
    gsap.registerPlugin(ScrollTrigger)
    const 
        containerRef = useRef<HTMLDivElement>(),
        trigger = useRef<ScrollTrigger>(),
        onRefreshInit = () => {
            if (!!trigger.current) trigger.current.kill(true)

            const tween = gsap.timeline()
                .fromTo(containerRef.current,{
                    autoAlpha:0
                },{
                    duration:1,
                    autoAlpha:1
                })
                .fromTo('#contact-form',{
                    autoAlpha:0
                },{
                    duration:1,
                    autoAlpha:1
                })

            trigger.current = ScrollTrigger.create({
                trigger:containerRef.current,
                start:`top 0%`,
                end:`bottom 100%`,
                scrub:true,
                animation:tween
            })
        }
        
    useEffect(()=>{
        onRefreshInit()
        ScrollTrigger.addEventListener('refreshInit',onRefreshInit)
        return () => ScrollTrigger.removeEventListener('refreshInit',onRefreshInit)
    },[])
    
    return (
        <div 
            id='bottle-container' 
            ref={containerRef}
            style={{height:'300vh'}}
        >
            <Background />
            <div id='contact-form'>
                <Form />
            </div>
            <AboutSceneTab codeURL='https://github.com/cindyhont/portfolio/blob/main/src/mainpage/bottle/bg.tsx' id='bottle-about-scene'>
                <p>This scene is build with three.js. The sea is a modification of the <a href='https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Reflector.js' target='_blank' rel='noreferrer noopener'>Reflector mesh</a> in three.js.</p>
            </AboutSceneTab>
        </div>
    )
}

export default Bottle