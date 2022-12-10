import React, { useEffect, useRef } from "react";
import Background from "./bg";
import Content from "./content";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import {AboutSceneTab} from "../../common";

const FlockOnSphere = () => {
    gsap.registerPlugin(ScrollTrigger);

    const 
        st = useRef<ScrollTrigger>(),
        onRefreshInit = () => {
            if (!!st.current) st.current.kill(true)
            const tween = gsap.to('#flock-container',{autoAlpha:0})
            st.current = ScrollTrigger.create({
                trigger:document.body,
                start:'top 0%',
                end:'top -100%',
                scrub:true,
                animation:tween,
            })
        }

    useEffect(()=>{
        onRefreshInit()
        ScrollTrigger.addEventListener('refreshInit',onRefreshInit)
        return () => ScrollTrigger.removeEventListener('refreshInit',onRefreshInit)
    },[])
    
    return (
        <div id='flock-container'>
            <div id='flock-background'>
                <Background />
            </div>
            <Content />
            <AboutSceneTab codeURL='https://github.com/cindyhont/portfolio/blob/main/src/mainpage/flockonsphere/bg.tsx' id='flock-sphere-about-scene'>
                <p>
                    These are particles flocking around a sphere. This scene is build with three.js and GPGPU. 
                    The algorithm of flocking boids is well explained in <a href='https://www.red3d.com/cwr/boids/' target='_blank' rel='noreferrer noopener'>Craig Reynolds{`'`} article</a>.
                </p>
            </AboutSceneTab>
        </div>
    )
}

export default FlockOnSphere