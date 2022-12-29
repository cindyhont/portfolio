import '../styles/global.scss'
import React, { useEffect, useState } from 'react'
import {Context} from '../src/context'

const App = ({ Component, pageProps }) => {
    const 
        [devicePixelRatio,setDevicePixelRatio] = useState(2),
        [mobile,setMobile] = useState(false),
        [isSafari,setIsSafari] = useState(false),
        [webgl,setWebgl] = useState(false),
        onResize = () => {
            const htmlTag = document.getElementsByTagName('html')[0]
            htmlTag.style.setProperty('--vh', window.innerHeight/100 + 'px');
            const cssTexts = htmlTag.style.cssText.split(';')
            cssTexts.forEach(e=>{
                const 
                    trimmed = e.trim(),
                    [key,value] = trimmed.split(':')
                if (key==='--landscape-height'){
                    const 
                        prev = +value.replace('px',''),
                        curr = Math.min(window.innerHeight,window.innerWidth)
                    if (curr < prev) htmlTag.style.setProperty('--landscape-height', curr + 'px');
                } else if (key==='--portrait-height') {
                    const 
                        prev = +value.replace('px',''),
                        curr = Math.max(window.innerHeight,window.innerWidth)
                    if (curr < prev) htmlTag.style.setProperty('--portrait-height', curr + 'px');
                } 
            })
        },
        detectWebGL = () => {
            const 
                canvas = document.createElement("canvas"),
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                
            setWebgl(gl instanceof WebGLRenderingContext)
        }

    useEffect(()=>{
        detectWebGL()
        setDevicePixelRatio(Math.min(Math.floor(window.devicePixelRatio),2))
        setMobile(window.matchMedia("(pointer: coarse)").matches)
        const userAgent = navigator.userAgent.toLowerCase()
        setIsSafari(userAgent.search('safari') !== -1 && userAgent.search('chrome')===-1)
        
        window.addEventListener('resize',onResize)
        return () => window.removeEventListener('resize',onResize)
    },[])

    return (
        <Context.Provider value={{devicePixelRatio,mobile,isSafari,webgl}}>
            <Component {...pageProps} />
        </Context.Provider>
    )
}

export default App