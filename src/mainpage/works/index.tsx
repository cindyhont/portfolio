import React, { useEffect, useRef } from "react";
import { IndexContext } from "../../context";
import { useEventListeners } from "../../hooks";
import SectionHeading from "../section-heading";
import SeparatorContainer from "../separator";
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
        },[])

        useEventListeners([
            {elem:container,evt:'restart',func:slideButtonOnClick},
        ])

        return (
            <div id='works' ref={container} className={`section ${styles['works-container']}`}>
                {children}
            </div>
        )
    },
    Works = () => (
        <WorksContainer>
            <>
            <style global jsx>{`
                .modal-pm-tool-ul-title{
                    display: inline-block;
                    margin-right:0.3rem;
                }
                .list{
                    transition: padding-left 0.5s;
                }
                @media screen and (min-width: 500px){
                    .modal-pm-tool-ul-title{
                        width: 5.5rem;
                    }
                }
                @media screen and (max-width: 499px){
                    .list{
                        padding-left: 15px;
                    }
                }
            `}</style>
            <svg width='0' height='0' style={{position:'absolute'}}>
                <filter id='slider-button-glow-onclick'>
                    {[1,3].map(e=><feDropShadow key={e} stdDeviation={e} dx={0} dy={0} floodColor='#fff' />)}
                </filter>
            </svg>
            <SeparatorContainer wavePaths={[
                "m0 240 25-15c25-15 75-45 125-60s100-15 150 2c50 16 100 49 150 69s100 28 150 24 100-19 150-35l125-44 25-9V71l-25 17c-25 16-75 49-125 65s-100 14-150 11-100-7-150-19c-50-11-100-29-150-37s-100-7-150-1c-50 5-100 14-125 19l-25 4Z",
                "m0 298 25-6 125-29c50-11 100-22 150-17 50 4 100 24 150 45s100 43 150 45c50 1 100-18 150-28s100-10 125-10h25V170l-25 9-125 44c-50 16-100 31-150 35s-100-4-150-24-100-53-150-69c-50-17-100-17-150-2S50 208 25 223L0 238Z",
                "M0 451h900V296h-25c-25 0-75 0-125 10s-100 29-150 28c-50-2-100-24-150-45s-100-41-150-45c-50-5-100 6-150 17L25 290l-25 6Z",
            ]}>
                <IndexContext.Consumer>{({works})=>(
                    <>
                    <SectionHeading text='WORKS' className={styles['section-heading']} />
                    {works.filter(e=>e.slug !== 'portfolio').map(e=>(
                        <Work key={e.slug} {...e} />
                    ))}
                    </>
                )}</IndexContext.Consumer>
            </SeparatorContainer>
            </>
        </WorksContainer>
    )

export default Works