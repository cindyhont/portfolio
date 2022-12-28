import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";
import { Ilinkbutton } from "./buttons";
import gsap from 'gsap'
import {ScrollToPlugin} from 'gsap/dist/ScrollToPlugin'

const LinkButton = (
    {
        title,
    }:Ilinkbutton
) => {
    gsap.registerPlugin(ScrollToPlugin)
    const 
        ref = useRef<HTMLDivElement>(),
        fromTop = useRef(0),
        request = useRef(0),
        onScroll = () => {
            if (fromTop.current === window.scrollY) document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:false}))
            else {
                fromTop.current = window.scrollY
                request.current = requestAnimationFrame(onScroll)
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

            if (!overlap) {
                cancelAnimationFrame(request.current)
                fromTop.current = -1
                document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:true}))
                window.scrollBy({
                    top:window.matchMedia('(min-width:600px)').matches ? top - 50 : top,
                    behavior:'smooth'
                })
                setTimeout(()=>request.current = requestAnimationFrame(onScroll),300)
                
                /*
                if (mobile){
                    window.scrollBy({
                        top:window.matchMedia('(min-width:600px)').matches ? top - 50 : top,
                        behavior:'smooth'
                    })
                } else {
                    const desktopNavBar = document.getElementById('desktop-nav')
                    gsap.to(window,{
                        duration:1,
                        scrollTo:{
                            y: `#${elem.id}`,
                            offsetY:window.matchMedia('(min-width:600px)').matches ? 50 : 0,
                            autoKill:true,
                        },
                        onStart:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:true})),
                        onComplete:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:false}))
                    })
                }

                /*
                if (window.matchMedia('(max-width:599px)').matches || mobile) {
                    elem.scrollIntoView({behavior:'smooth'})
                } else {
                    const desktopNavBar = document.getElementById('desktop-nav')
                    gsap.to(window,{
                        duration:1,
                        scrollTo:{
                            y: elem.offsetTop - 50,
                            autoKill:true,
                        },
                        onStart:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:true})),
                        onComplete:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:false}))
                    })
                }
                */
            }
        }

    useEffect(()=>{
        addLetterSpacing(title,ref.current)
    },[])

    return (
        <button className={title.toLowerCase()} aria-label={title} onClick={onClick}>
            <div ref={ref} />
        </button>
    )
}

export default LinkButton