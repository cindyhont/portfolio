import React, { useEffect, useRef } from "react";
import { IndexContext } from "../../context";
import ScrollParallaxContainer from "../scroll-parallax-container";
import Work from "./individual-work";
import styles from './styles/Container.module.scss'
import individualWorkStyles from './styles/IndividualWork.module.scss'

const 
    WorksContainer = ({children}:{children:JSX.Element}) => {
        // detect sliders in viewport and automate first slider's swiping
        const 
            container = useRef<HTMLDivElement>(),
            timeout = useRef<NodeJS.Timeout>(),
            sliderID = useRef(''),
            dispatchEvent = (id:string) => {
                document.getElementById(id)?.dispatchEvent(new CustomEvent('swipe',{detail:1}))
                timeout.current = setTimeout(dispatchEvent,5000,id)
            },
            deactivate = () => { 
                if (!!timeout.current) {
                    clearTimeout(timeout.current)
                    sliderID.current = ''
                }
            },
            activate = (id:string) => {
                deactivate()
                sliderID.current = id
                timeout.current = setTimeout(dispatchEvent,5000,id)
            },
            handleSliderAuto = (entries:IntersectionObserverEntry[]) => {
                // auto swipe first slider in viewport
                const targets = entries.filter(e=>e.isIntersecting).map(e=>e.target)
                if (!targets.length) deactivate()
                else if (targets[0].id !== sliderID.current) activate(targets[0].id)
            },
            slideButtonOnClick = (e:CustomEvent) => {
                const sliderId = e.detail as string
                if (sliderId === sliderID.current) activate(sliderId)
            }

        useEffect(()=>{
            const 
                observer = new IntersectionObserver(handleSliderAuto,{root:null,rootMargin:'0px',threshold:0.3}),
                containers = document.getElementsByClassName(individualWorkStyles['work-container']) as HTMLCollectionOf<HTMLDivElement>,
                len = containers.length

            for (let i=0; i<len; i++){
                const container = containers.item(i)
                if (!container.dataset?.hasslides) continue
                const 
                    sliderId = container.dataset.sliderid,
                    canvas = document.getElementById(sliderId)
                
                if (!!canvas) observer.observe(canvas)
            }
            container.current.addEventListener('restart',slideButtonOnClick)
            return () => container.current.removeEventListener('restart',slideButtonOnClick)
        },[])

        return (
            <div id='works' ref={container} className={`section ${styles['works-container']}`}>
                {children}
            </div>
        )
    },
    Works = () => (
        <WorksContainer>
            <>
            <svg width='0' height='0' style={{position:'absolute'}}>
                <filter id='slider-button-glow-onclick'>
                    {[1,3].map(e=><feDropShadow key={e} stdDeviation={e} dx={0} dy={0} floodColor='#fff' />)}
                </filter>
            </svg>
            <ScrollParallaxContainer wavePaths={[
                "M0 240L25 225C50 210 100 180 150 165C200 150 250 150 300 166.5C350 183 400 216 450 236.2C500 256.3 550 263.7 600 259.8C650 256 700 241 750 224.5C800 208 850 190 875 181L900 172L900 71L875 87.5C850 104 800 137 750 152.8C700 168.7 650 167.3 600 164.3C550 161.3 500 156.7 450 145.3C400 134 350 116 300 107.8C250 99.7 200 101.3 150 106.7C100 112 50 121 25 125.5L0 130Z",
                "M0 298L25 292C50 286 100 274 150 262.8C200 251.7 250 241.3 300 245.8C350 250.3 400 269.7 450 290.7C500 311.7 550 334.3 600 335.8C650 337.3 700 317.7 750 307.8C800 298 850 298 875 298L900 298L900 170L875 179C850 188 800 206 750 222.5C700 239 650 254 600 257.8C550 261.7 500 254.3 450 234.2C400 214 350 181 300 164.5C250 148 200 148 150 163C100 178 50 208 25 223L0 238Z",
                "M0 451L25 451C50 451 100 451 150 451C200 451 250 451 300 451C350 451 400 451 450 451C500 451 550 451 600 451C650 451 700 451 750 451C800 451 850 451 875 451L900 451L900 296L875 296C850 296 800 296 750 305.8C700 315.7 650 335.3 600 333.8C550 332.3 500 309.7 450 288.7C400 267.7 350 248.3 300 243.8C250 239.3 200 249.7 150 260.8C100 272 50 284 25 290L0 296Z",
            ]}>
                <IndexContext.Consumer>{({works})=>(
                    <>
                    {works.filter(e=>e.slug !== 'portfolio').map(e=>(
                        <Work key={e.slug} {...e} />
                    ))}
                    </>
                )}</IndexContext.Consumer>
            </ScrollParallaxContainer>
            </>
        </WorksContainer>
    )

export default Works