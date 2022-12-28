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
                if (window.matchMedia('(min-width:600px)').matches) {
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
                } else elem.scrollIntoView({behavior:'smooth'})
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