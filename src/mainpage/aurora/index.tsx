import React, { useContext, useEffect, useRef } from "react";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { AboutSceneTab } from "../../common";
import Background from "./bg";
import Slides from "./slides";
import Modals from "./modals";
import { IndexContext } from "../../context";

const Aurora = () => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        containerRef = useRef<HTMLDivElement>(),
        {works} = useContext(IndexContext),
        transitionDuration = 1 / (works.length + 4), //100 / end,
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
            end:`top -${works.length + 4}00%`,
            scrub:true,
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
        <div id='aurora-container' style={{height:`${works.length + 4}00vh`,width:'100vw'}} ref={containerRef}>
            <Background />
            <Slides />
            {/*<Modals />
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
            </AboutSceneTab>*/}
        </div>
        <div style={{height:'100vh',width:'100vw'}} />
        </>
    )
}

export default Aurora