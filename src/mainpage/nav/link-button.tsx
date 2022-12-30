import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";

const LinkButton = (
    {
        title,
        letterSpaceClassName,
        extraClassNames,
    }:{
        title:string;
        letterSpaceClassName:string;
        extraClassNames?:string;
    }
) => {
    // since I have no control over the duration of window.scroll* functions,
    // I write this script so that I can control the time of scrolling 
    // and especially when I can unlock the header nav bar

    const 
        ref = useRef<HTMLDivElement>(),
        scrollDistance = useRef(0),
        scrollTarget = useRef(0),
        scrollTargetID = useRef(''),
        prevTimeElapsed = useRef(0),
        still = useRef(true),
        startTime = useRef(0),
        request = useRef(0),
        duration = useRef(0.5 * 1000).current, // in milliseconds

        scroll = (timestamp:number) => {
            if (!startTime.current) {
                startTime.current = timestamp
                prevTimeElapsed.current = 0
            }

            const timeElapsed = timestamp - startTime.current

            if (timeElapsed >= duration) {
                window.scrollTo({top:scrollTarget.current,behavior:'auto'})
                document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:false}))
                scrollTargetID.current = ''
                still.current = true
            } else {
                window.scrollBy({top:scrollDistance.current * (timeElapsed - prevTimeElapsed.current) / duration,behavior:'auto'})
                prevTimeElapsed.current = timeElapsed
                request.current = requestAnimationFrame(scroll)
            }
        },

        onClick = () => {
            (document.getElementById('menu-checkbox') as HTMLInputElement).checked = false
            document.body.style.overflowY = null

            const 
                elem = document.getElementById(title.toLowerCase()),
                {top,bottom} = elem.getBoundingClientRect(),
                {innerHeight} = window,
                overlap = top >= 0 && bottom <= innerHeight
                    || top < 0 && bottom > innerHeight
                    || top >= 0 && top <= innerHeight * 0.5
                    || bottom <= innerHeight && bottom >= innerHeight * 0.5

            if (!overlap && (still.current || scrollTargetID.current !== elem.id)) {
                cancelAnimationFrame(request.current)
                
                document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:true}))
                startTime.current = 0
                scrollDistance.current = window.matchMedia('(min-width:600px)').matches ? top - 50 : top
                scrollTarget.current = window.matchMedia('(min-width:600px)').matches ? elem.offsetTop - 50 : elem.offsetTop
                scrollTargetID.current = elem.id
                request.current = requestAnimationFrame(scroll)

                still.current = false
            }
        }

    useEffect(()=>{
        addLetterSpacing(title,ref.current,letterSpaceClassName)
    },[])

    return (
        <button className={`${title.toLowerCase()} ${extraClassNames || ''}`} aria-label={title} onClick={onClick}>
            <div ref={ref} />
        </button>
    )
}

export default LinkButton