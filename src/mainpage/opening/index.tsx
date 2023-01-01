import React, { useEffect, useRef } from "react";
import Waves from "../waves";
import styles from './Opening.module.scss'

const Opening = () => {
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
                span.style.animationDelay = `${1.5 + i * 0.15}s`
                if (hideSpace) span.classList.add(styles.space)
                titleRef.current.appendChild(span)
                const hr = document.createElement('hr')
                hr.style.animationDelay = `${1.5 + i * 0.15}s`
                if (hideSpace) hr.classList.add(styles.space)
                titleRef.current.appendChild(hr);
            }
        },
        onScroll = () => (titleRef.current.lastElementChild as HTMLHRElement).style.animation = 'none'

    useEffect(()=>{
        addTitle()
        setTimeout(()=>nameRef.current.style.animation = 'none',1500)
        window.addEventListener('scroll',onScroll,{passive:true})
        return () => window.removeEventListener('scroll',onScroll)
    },[])

    return (
        <div id='home' className={`section ${styles.home}`}>
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
    )
}

export default Opening