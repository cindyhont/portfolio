import React, { useEffect, useRef } from "react";
import { IndexContext } from "../../context";
import Work from "./individual-work";

const 
    Works = () => {
        const 
            ref = useRef<HTMLDivElement>(),
            timeout = useRef<NodeJS.Timeout>(),
            canvasID = useRef(''),
            dispatchEvent = (id:string) => {
                document.getElementById(id)?.dispatchEvent(new CustomEvent('swipe',{detail:1}))
                timeout.current = setTimeout(dispatchEvent,5000,id)
            },
            deactivate = () => { 
                if (!!timeout.current) {
                    clearTimeout(timeout.current)
                    canvasID.current = ''
                }
            },
            activate = (id:string) => {
                deactivate()
                canvasID.current = id
                timeout.current = setTimeout(dispatchEvent,5000,id)
            },
            handleSliderAuto = (entries:IntersectionObserverEntry[]) => {
                // auto swipe first slider in viewport
                const targets = entries.filter(e=>e.isIntersecting).map(e=>e.target)
                if (!targets.length) deactivate()
                else if (targets[0].id !== canvasID.current) activate(targets[0].id)
            },
            slideButtonOnClick = (e:CustomEvent) => {
                const canvasId = e.detail as string
                if (canvasId === canvasID.current) activate(canvasId)
            }

        useEffect(()=>{
            const 
                observer = new IntersectionObserver(handleSliderAuto,{root:null,rootMargin:'0px',threshold:0.3}),
                containers = document.getElementsByClassName('work-container') as HTMLCollectionOf<HTMLDivElement>,
                len = containers.length

            for (let i=0; i<len; i++){
                const container = containers.item(i)
                if (!container.dataset?.haswebgl) continue
                const 
                    canvasId = container.dataset.canvasid,
                    canvas = document.getElementById(canvasId)
                if (!!canvas) observer.observe(canvas)
            }
            ref.current.addEventListener('restart',slideButtonOnClick)
            return () => ref.current.removeEventListener('restart',slideButtonOnClick)
        },[])

        return (
            <div id='works' ref={ref} className="section">
                <svg width='0' height='0'>
                    <filter id='slider-button-glow-onclick'>
                        {[1,3].map(e=><feDropShadow key={e} stdDeviation={e} dx={0} dy={0} floodColor='#fff' />)}
                    </filter>
                </svg>
                <IndexContext.Consumer>{({works})=>(
                    <>
                    {works.filter(e=>e.slug !== 'portfolio').map((e,i)=>(
                        <Work key={e.slug} {...{...e,first:i===0,last:i===works.length-2}} />
                    ))}
                    </>
                )}</IndexContext.Consumer>
            </div>
        )
    }

export default Works