import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const Content = () => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        titleContainerRef = useRef<HTMLDivElement>(),
        nameRef = useRef<HTMLSpanElement>(),
        titleRef = useRef<HTMLSpanElement>(),
        separatorRef = useRef<SVGEllipseElement>(),
        scrollSign = useRef<HTMLDivElement>(),
        getSphereDia = () => {
            const 
                {innerWidth,innerHeight} = window,
                sepWidth = Math.min(400,innerHeight * 0.7, innerWidth * 0.8) * 0.9,
                topFS = Math.max(sepWidth / 10,30),
                bottomFS = Math.max(sepWidth / 22,12),
                top = innerHeight * 0.5 - topFS,
                left = innerWidth * 0.5 - sepWidth * 0.5

            if (titleContainerRef.current){
                const masterStyle = titleContainerRef.current.style
                masterStyle.width = `${sepWidth}px`
                masterStyle.top = `${top}px`
                masterStyle.left = `${left}px`

                const nameStyle = nameRef.current.parentElement.style
                nameStyle.letterSpacing = `${topFS * 0.05}px`
                nameStyle.fontSize = `${topFS}px`
                nameStyle.lineHeight = `${topFS}px`
                nameStyle.height = `${topFS * 1.2}px`

                const titleStyle = titleRef.current.parentElement.style
                titleStyle.letterSpacing = `${bottomFS * 0.05}px`
                titleStyle.fontSize = `${bottomFS}px`
                titleStyle.lineHeight = `${bottomFS}px`
                titleStyle.height = `${bottomFS * 1.5}px`
            }

            if (scrollSign.current){
                const scrollTextStyle = (scrollSign.current.children[0].children[0] as HTMLElement).style
                scrollTextStyle.visibility = innerHeight > 300 ? 'visible' : 'hidden'
            }
        }

    useEffect(()=>{
        getSphereDia()

        gsap.timeline()
            .to(separatorRef.current,{
                duration:1,
                delay:2,
                attr:{
                    'rx':'100%'
                }
            })
            .to([nameRef.current,titleRef.current],{
                duration:1.2,
                delay:0.4,
                y:0
            })
            .to(scrollSign.current,{
                duration:1.2,
                delay:0.4,
                y:'+0px',
                autoAlpha:1
            })

        window.addEventListener('resize',getSphereDia)
        return () => window.removeEventListener('resize',getSphereDia)
    },[])

    return (
        <>
        <div ref={titleContainerRef} style={{position:'absolute'}} id='title-container'>
            <p>
                <span ref={nameRef}>CINDY HO</span>
            </p>
            <svg height="2" id='separatorSvg' width='100%'>
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:'rgba(0,0,0,0)',stopOpacity:1}} />
                        <stop offset="40%" style={{stopColor:'rgba(200,200,200,1)',stopOpacity:1}} />
                        <stop offset="60%" style={{stopColor:'rgba(200,200,200,1)',stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:'rgba(0,0,0,0)',stopOpacity:1}} />
                    </linearGradient>
                </defs>
                <ellipse ref={separatorRef} id='separatorEllipse' cx="50%" cy="0" rx="0" ry="2" fill="url(#grad1)" />
            </svg>
            <p>
                <span ref={titleRef}>FULL STACK DEVELOPER</span>
            </p>
        </div>
        <div id='flock-sphere-scroll' ref={scrollSign}>
            <div>
                <p>Scroll</p>
                <svg height="15" width='30'>
                    <filter id="scroll-shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#fff"/>
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fff"/>
                    </filter>
                    <polyline filter='url(#scroll-shadow)' points='3,3 15,12 27,3' />
                </svg>
            </div>
        </div>
        </>
    )
}

export default Content;