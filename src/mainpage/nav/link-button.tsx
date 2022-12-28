import React, { useContext, useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";
import { Ilinkbutton } from "./buttons";
import gsap from 'gsap'
import {ScrollToPlugin} from 'gsap/dist/ScrollToPlugin'
import { Context } from "../../context";

const LinkButton = (
    {
        title,
    }:Ilinkbutton
) => {
    gsap.registerPlugin(ScrollToPlugin)
    const 
        ref = useRef<HTMLDivElement>(),
        {mobile} = useContext(Context),
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
                if (mobile){
                    window.scrollTo({
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