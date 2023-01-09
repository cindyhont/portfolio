import React, { memo, useEffect, useRef } from "react";
import { delayInSecond } from "../../common";
import { useWindowEventListeners } from "../../hooks";
import Waves from "../waves";

const Opening = memo(() => {
    const
        titleRef = useRef<HTMLParagraphElement>(),
        nameRef = useRef<HTMLHeadingElement>(),
        addTitle = () => {
            const 
                title = 'Full Stack Developer',
                chars = title.split(''),
                len = chars.length,
                spaceCount = chars.filter(e=>e===' ').length

            let spaceIdx = 0

            for (let i=0; i<len; i++){
                if (chars[i]===' ') spaceIdx++
                const 
                    hideSpace = spaceIdx===spaceCount && chars[i]===' ',
                    span = document.createElement('span')
                span.innerText = chars[i]
                span.style.animationDelay = `${1.5 + delayInSecond + i * 0.15}s`
                if (hideSpace) span.classList.add('space')
                titleRef.current.appendChild(span)
                const hr = document.createElement('hr')
                hr.style.animationDelay = `${1.5 + delayInSecond + i * 0.15}s`
                if (hideSpace) hr.classList.add('space')
                titleRef.current.appendChild(hr);
            }
        },
        onScroll = () => {
            (titleRef.current.lastElementChild as HTMLHRElement).style.animation = 'none'
            window.removeEventListener('scroll',onScroll)
        }

    useEffect(()=>{
        addTitle()
        setTimeout(()=>nameRef.current.style.animation = 'none',1500 + delayInSecond * 1000)
    },[])

    useWindowEventListeners([
        {evt:'scroll',func:onScroll},
    ])

    return (
        <>
        <style global jsx>{`
            :root{
                --name-font-size: min(100px, 15vw, 30vh);
                --name-shadow-displacement-a: min(5px, 0.75vw, 1.5vh);
                --name-shadow-displacement-a-negative: max(-5px, -0.75vw, -1.5vh);
                --name-shadow-displacement-b: min(8px, 1.2vw, 2.4vh);
                --name-shadow-back-a: min(30px, 4.5vw, 9vh);
                --name-shadow-back-b: min(40px, 6vw, 12vh);
                --title-font-size: min(20px, 5vw, 8vh);
                --mode-transition-time: 0.5s;
            }
            
            @keyframes title-name-reveal {
                from {
                    color: var(--background-color);
                    text-shadow: none;
                }
                to {
                    color: var(--title-text-color);
                    text-shadow: var(--name-shadow-displacement-a) 
                        var(--name-shadow-displacement-a) 
                        var(--name-shadow-displacement-b) 
                        var(--title-shadow-dark),
                        var(--name-shadow-displacement-a-negative) 
                        var(--name-shadow-displacement-a-negative) 
                        var(--name-shadow-displacement-b) 
                        var(--title-shadow-light),
                        0 0 var(--name-shadow-back-a) var(--title-shadow-back-a),
                        0 0 var(--name-shadow-back-b) var(--title-shadow-back-b);
                }
            }
            
            @keyframes title-show-cursor {
                0% { opacity: 1; }
                99% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            @keyframes title-cursor-flash {
                0% { opacity: 1; }
                49% { opacity: 1; }
                50% { opacity: 0; }
                99% { opacity: 0; }
            }

            @keyframes title-show-chars {
                to { opacity: 1; }
            }
            
            .home.section{
                height: max(calc(100vh + 50vw),calc(100vh + 250px));
                position: relative;
            }

            .home.section > div {
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100vh;
                width:100%;
            }

            @media (hover:none) and (orientation:landscape){
                .home.section{
                    height: max(calc(var(--landscape-height) + 50vw),calc(var(--landscape-height) + 250px));
                    position: relative;
                }
                .home.section > div {
                    height: var(--landscape-height);
                }
            }
            @media (hover:none) and (orientation:portrait){
                .home.section{
                    height: max(calc(var(--portrait-height) + 50vw),calc(var(--portrait-height) + 250px));
                    position: relative;
                }
                .home.section > div {
                    height: var(--portrait-height);
                }
            }

            .home.section > svg {
                position:absolute;
                bottom:0px;
            }

            .home.section h1, .home.section p {
                margin:0px;
                text-transform: uppercase;
            }

            .home.section h1 {
                color:var(--title-text-color);
                font-weight: 900;
                font-size: var(--name-font-size);
                transition: color var(--mode-transition-time), text-shadow var(--mode-transition-time);
                text-shadow: var(--name-shadow-displacement-a) 
                    var(--name-shadow-displacement-a) 
                    var(--name-shadow-displacement-b) 
                    var(--title-shadow-dark),
                    var(--name-shadow-displacement-a-negative) 
                    var(--name-shadow-displacement-a-negative) 
                    var(--name-shadow-displacement-b) 
                    var(--title-shadow-light),
                    0 0 var(--name-shadow-back-a) var(--title-shadow-back-a),
                    0 0 var(--name-shadow-back-b) var(--title-shadow-back-b);
                animation: title-name-reveal 1.5s;
            }

            .home.section p {
                font-weight: 300;
                color: var(--text-color) !important;
                font-size: var(--title-font-size);
                margin: 0 5vw;
                transition: color var(--mode-transition-time);
            }

            .home.section span {
                margin: 0 0.1rem;
                opacity: 0;
                animation: title-show-chars 10ms forwards;
            }
            .home.section hr{
                display: inline;
                opacity: 0;
                border-color: var(--title-cursor-border-color);
                transition: border-color var(--mode-transition-time);
            }
            .home.section hr:not(:last-child){
                animation: title-show-cursor 0.15s forwards;
            }
            .home.section p hr:last-child {
                animation: title-cursor-flash 1s infinite;
            }
            .home.section p hr.space + span::before{
                content:'\A';
                white-space: pre;
            }

            @media screen and (max-width:343px){
                .home.section p .space {
                    display:none;
                }
            }
            @media screen and (min-width:344px){
                .home.section p .space + span::before{
                    display: none;
                }
            }
        `}</style>
        <div id='home' className={`section home`}>
            <div>
                <h1 ref={nameRef}>Cindy Ho</h1>
                <p ref={titleRef} />
            </div>
            <Waves paths={[
                "m0 204 25 8c25 8 75 25 125 34a508 508 0 0 0 300-29c50-18 100-40 150-40 50 1 100 25 150 36 50 12 100 10 125 10l25-1v-70l-25 5c-25 4-75 13-125 6-50-8-100-32-150-33-50-2-100 19-150 32s-100 17-150 22c-50 4-100 9-150 2S50 161 25 152l-25-9Z",
                "m0 303 25 12c25 12 75 36 125 39s100-15 150-25 100-11 150-26 100-44 150-49 100 13 150 31l125 45 25 9V220l-25 1c-25 0-75 2-125-10-50-11-100-35-150-36-50 0-100 22-150 40s-100 32-150 37-100 2-150-8c-50-9-100-26-125-34l-25-8Z",
                "M0 451h900V337l-25-9-125-45c-50-18-100-36-150-31s-100 34-150 49-100 16-150 26-100 28-150 25-100-27-125-39L0 301Z",
            ]} />
        </div>
        </>
    )
})

Opening.displayName = 'Opening'
export default Opening