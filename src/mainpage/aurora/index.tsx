import React, { useEffect, useRef } from "react";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { AboutSceneTab } from "../../common";
import Background from "./bg";
import Slides from "./slides";
import Modals from "./modals";

const Aurora = ({end}:{end:number;}) => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        containerRef = useRef<HTMLDivElement>(),
        transitionDuration = 100 / end,
        fullOpacityDuration = 1 - transitionDuration * 2,
        closeAboutScene = () => {
            const elem = document.getElementById('aurora-about-scene') as HTMLInputElement
            if (!!elem) elem.checked = false
        }

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
            onLeaveBack:()=>{
                closeAboutScene()
                document.body.style.cursor = "default"
            },
            onLeave:()=>{
                closeAboutScene()
                document.body.style.cursor = "default"
            },
        })
    },[])

    return (
        <>
        <div style={{height:'100vh',width:'100vw'}} />
        <div id='aurora-container' style={{height:'100vh',width:'100vw'}} ref={containerRef}>
            <Background {...{start:100,end:end-100}} />
            <Slides {...{start:100,end:end-100}} />
            <Modals />
            <AboutSceneTab codeURL='https://xxxxxxxxxxx.com/' id='aurora-about-scene'>
                <>
                <p>
                    The aurora borealis background built with three.js, instancing, postprocessing.
                </p>
                <p>
                    Each ribbon is just a plane, with the position Z altered by a tileable simplex noise texture (generated on load). 
                    Then the scene is blurred by a postprocessing filter horizontally.
                </p>
                </>
            </AboutSceneTab>
        </div>
        </>
    )
}

export default Aurora