import React, { useEffect, useRef } from "react";
import {AboutSceneTab} from "../../common";
import Background from "./bg";
import Form from "./form";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const Bottle = () => {
    gsap.registerPlugin(ScrollTrigger)
    const containerRef = useRef<HTMLDivElement>()
        
    useEffect(()=>{
        gsap.timeline({
            scrollTrigger:{
                trigger:containerRef.current,
                start:`top 0%`,
                end:`top -200%`,
                scrub:true,
                pin:true,
            },
        })
        .to(containerRef.current,{
            autoAlpha:1,
            duration:1
        })
        .to('#contact-form',{
            autoAlpha:1,
            duration:1
        })
    },[])
    
    return (
        <div 
            id='bottle-container' 
            ref={containerRef}
            style={{opacity:'0',visibility:'hidden'}}
        >
            <Background />
            <div id='contact-form'>
                <Form />
            </div>
            <AboutSceneTab codeURL='https://xxxxxxxxxxx.com/' id='bottle-about-scene'>
                <p>This scene is build with three.js. The sea is a modification of the <a href='https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Reflector.js' target='_blank' rel='noreferrer noopener'>Reflector mesh</a> in three.js.</p>
            </AboutSceneTab>
        </div>
    )
}

export default Bottle