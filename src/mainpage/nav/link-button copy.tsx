import React, { useEffect, useRef } from "react";
import { addLetterSpacing, hideMobileSidebar } from "../../common";
import { useMediaQueryListener } from "../../hooks";

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

    // GSAP's ScrollToPlugin works fine in desktop but not in mobile, thus can't use

    const 
        ref = useRef<HTMLDivElement>(),
        scrollDistance = useRef(0),
        scrollTarget = useRef(0),
        scrollTargetID = useRef(''),
        prevTimeElapsed = useRef(0),
        still = useRef(true),
        startTime = useRef(0),
        request = useRef(0),
        duration = useRef(500).current, // in milliseconds
        windowWidthQuery = useRef('(min-width:600px)').current,
        wideWindow = useRef(false),

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
            hideMobileSidebar()

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

                scrollDistance.current = wideWindow.current ? top - 50 : top
                scrollTarget.current = wideWindow.current ? elem.offsetTop - 50 : elem.offsetTop
                scrollTargetID.current = elem.id
                request.current = requestAnimationFrame(scroll)

                still.current = false
            }
        },
        onResize = (e:MediaQueryListEvent) => wideWindow.current = e.matches

    useEffect(()=>{
        wideWindow.current = window.matchMedia(windowWidthQuery).matches
        addLetterSpacing(title,ref.current,letterSpaceClassName)
    },[])

    useMediaQueryListener([
        {query:windowWidthQuery,func:onResize},
    ])

    return (
        <button className={`${title.toLowerCase()} ${extraClassNames || ''}`.trim()} aria-label={title} onClick={onClick}>
            <div ref={ref} />
        </button>
    )
}

export default LinkButton