import React, { useEffect, useRef, useState } from "react";
import Background from "./bg";
import Content from "./content";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import {AboutSceneTab} from "../../common";

const FlockOnSphere = () => {
    gsap.registerPlugin(ScrollTrigger);
    const containerRef = useRef<HTMLDivElement>()

    useEffect(()=>{
        gsap.to(containerRef.current,{
            scrollTrigger:{
                trigger:document.body,
                start:'top 0%',
                end:'top -100%',
                scrub:true,
            },
            autoAlpha:0,
        })

        gsap.timeline()
        .fromTo(containerRef.current,{
            autoAlpha:0
        },{
            duration:1,
            delay:0.5,
            autoAlpha:1
        });
    },[])
    
    return (
        <div ref={containerRef} style={{position:'fixed',height:'100vh',width:'100vw'}}>
            <Background />
            <Content />
            <AboutSceneTab codeURL='https://xxxxxxxxxxx.com/' id='flock-sphere-about-scene'>
                <p>
                    These are particles flocking around a sphere. This scene is build with three.js and GPGPU. 
                    The algorithm of flocking boids is well explained in <a href='https://www.red3d.com/cwr/boids/' target='_blank' rel='noreferrer noopener'>Craig Reynolds{`'`} article</a>.
                </p>
            </AboutSceneTab>
        </div>
    )
}

export default FlockOnSphere