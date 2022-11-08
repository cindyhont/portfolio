import '../styles.scss'
import React, { useEffect, useState } from 'react'
import {Context} from '../src/context'

const App = ({ Component, pageProps }) => {
    const 
        [devicePixelRatio,setDevicePixelRatio] = useState(2),
        [mobile,setMobile] = useState(false)

    useEffect(()=>{
        setDevicePixelRatio(Math.min(Math.floor(window.devicePixelRatio),2))
        setMobile(window.matchMedia("(pointer: coarse)").matches)
    },[])

    return (
        <Context.Provider value={{devicePixelRatio,mobile}}>
            <Component {...pageProps} />
        </Context.Provider>
    )
}

export default App