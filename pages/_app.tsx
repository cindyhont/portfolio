import '../styles.scss'
import React, { useEffect, useState } from 'react'
import {Context} from '../src/context'
import Script from 'next/script'

const App = ({ Component, pageProps }) => {
    const 
        [devicePixelRatio,setDevicePixelRatio] = useState(2),
        [mobile,setMobile] = useState(false),
        [isSafari,setIsSafari] = useState(false),
        onResize = () => {
            document.getElementsByTagName('html')[0].style.setProperty('--vh', window.innerHeight/100 + 'px');
        }

    useEffect(()=>{
        setDevicePixelRatio(Math.min(Math.floor(window.devicePixelRatio),2))
        setMobile(window.matchMedia("(pointer: coarse)").matches)
        const userAgent = navigator.userAgent.toLowerCase()
        setIsSafari(userAgent.search('safari') !== -1 && userAgent.search('chrome')===-1)
        
        window.addEventListener('resize',onResize)
        return () => window.removeEventListener('resize',onResize)
    },[])

    return (
        <>
        <Script strategy='beforeInteractive' id='theme-script' dangerouslySetInnerHTML={{__html:`
            // preload and set theme color to avoid 'flashing'
            let dark = false;
            const 
                prevDark = localStorage.getItem('dark'),
                systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches,
                htmlTag = document.getElementsByTagName('html')[0]

            htmlTag.style.setProperty('--vh', window.innerHeight/100 + 'px');

            if (!!prevDark) {
                dark = prevDark === 'true'
                if (dark === systemDark) localStorage.removeItem('dark')
            }
            else dark = systemDark
            
            if (dark) htmlTag.classList.add('dark')
                
            if (window.location.pathname === '/') htmlTag.style.backgroundColor = dark ? '#333' : '#eee'
        `}} />
        <Context.Provider value={{devicePixelRatio,mobile,isSafari}}>
            <Component {...pageProps} />
        </Context.Provider>
        </>
    )
}

export default App