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
        onClick = () => {
            (document.getElementById('menu-checkbox') as HTMLInputElement).checked = false
            const 
                elem = document.getElementById(title.toLowerCase()),
                {top,bottom} = elem.getBoundingClientRect(),
                {innerHeight} = window,
                overlap = top >= 0 && bottom <= innerHeight
                        || top < 0 && bottom > innerHeight
                        || top >= 0 && top <= innerHeight * 0.5
                        || bottom <= innerHeight && bottom >= innerHeight * 0.5

            if (!overlap) {
                const desktopNavBar = document.getElementById('desktop-nav')
                gsap.to(window,{
                    duration:1,
                    scrollTo:{
                        y: window.matchMedia('(min-width:600px)').matches ? elem.offsetTop - 50 : elem.offsetTop,
                        autoKill:true,
                    },
                    onStart:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:true})),
                    onComplete:()=>desktopNavBar.dispatchEvent(new CustomEvent('lock',{detail:false}))
                })
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