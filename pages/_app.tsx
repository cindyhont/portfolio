import '../styles.scss'
import React, { useEffect, useState } from 'react'
import {Context} from '../src/context'

const App = ({ Component, pageProps }) => {
    const 
        [devicePixelRatio,setDevicePixelRatio] = useState(2),
        [mobile,setMobile] = useState(false),
        [isSafari,setIsSafari] = useState(false),
        onResize = () => {
            document.body.style.setProperty('--vh', window.innerHeight/100 + 'px');
        }

    useEffect(()=>{
        setDevicePixelRatio(Math.min(Math.floor(window.devicePixelRatio),2))
        setMobile(window.matchMedia("(pointer: coarse)").matches)
        const userAgent = navigator.userAgent.toLowerCase()
        setIsSafari(userAgent.search('safari') !== -1 && userAgent.search('chrome')===-1)
        onResize()
        
        window.addEventListener('resize',onResize)
        return () => window.removeEventListener('resize',onResize)
    },[])

    return (
        <Context.Provider value={{devicePixelRatio,mobile,isSafari}}>
            <Component {...pageProps} />
        </Context.Provider>
    )
}

export default App