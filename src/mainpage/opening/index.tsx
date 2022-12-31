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
                "M0 204L25 212.2C50 220.3 100 236.7 150 246.3C200 256 250 259 300 253.8C350 248.7 400 235.3 450 217.3C500 199.3 550 176.7 600 177.3C650 178 700 202 750 213.3C800 224.7 850 223.3 875 222.7L900 222L900 152L875 156.5C850 161 800 170 750 162.5C700 155 650 131 600 129.5C550 128 500 149 450 161.8C400 174.7 350 179.3 300 183.8C250 188.3 200 192.7 150 185.8C100 179 50 161 25 152L0 143Z",
                "M0 303L25 315C50 327 100 351 150 354C200 357 250 339 300 329.2C350 319.3 400 317.7 450 302.7C500 287.7 550 259.3 600 254.2C650 249 700 267 750 285C800 303 850 321 875 330L900 339L900 220L875 220.7C850 221.3 800 222.7 750 211.3C700 200 650 176 600 175.3C550 174.7 500 197.3 450 215.3C400 233.3 350 246.7 300 251.8C250 257 200 254 150 244.3C100 234.7 50 218.3 25 210.2L0 202Z",
                "M0 451L25 451C50 451 100 451 150 451C200 451 250 451 300 451C350 451 400 451 450 451C500 451 550 451 600 451C650 451 700 451 750 451C800 451 850 451 875 451L900 451L900 337L875 328C850 319 800 301 750 283C700 265 650 247 600 252.2C550 257.3 500 285.7 450 300.7C400 315.7 350 317.3 300 327.2C250 337 200 355 150 352C100 349 50 325 25 313L0 301Z",
            ]} />
        </div>
    )
}

export default Opening