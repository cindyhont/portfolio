import '../styles/global.scss'
import React, { useEffect, useState } from 'react'
import {Context} from '../src/context'
import { useWindowEventListeners } from '../src/hooks'

const App = ({ Component, pageProps }) => {
    const 
        [devicePixelRatio,setDevicePixelRatio] = useState(2),
        [webgl,setWebgl] = useState<boolean>(null),
        [imgFormat,setImgFormat] = useState<'avif'|'webp'|'none'|''>(''),
        onResize = () => {
            const 
                htmlTag = document.getElementsByTagName('html')[0],
                {innerHeight,innerWidth} = window
            htmlTag.style.setProperty('--vh', innerHeight/100 + 'px');
            htmlTag.style.setProperty('--current-actual-height', innerHeight + 'px');
            const cssTexts = htmlTag.style.cssText.split(';')
            cssTexts.forEach(e=>{
                const 
                    trimmed = e.trim(),
                    [key,value] = trimmed.split(':')
                if (key==='--landscape-height'){
                    const 
                        prev = +value.replace('px',''),
                        curr = Math.min(innerHeight,innerWidth)
                    if (curr < prev) htmlTag.style.setProperty('--landscape-height', curr + 'px');
                } else if (key==='--portrait-height') {
                    const 
                        prev = +value.replace('px',''),
                        curr = Math.max(innerHeight,innerWidth)
                    if (curr < prev) htmlTag.style.setProperty('--portrait-height', curr + 'px');
                } 
            })
        },
        detectWebGL = () => {
            const 
                canvas = document.createElement("canvas"),
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                
            setWebgl(gl instanceof WebGLRenderingContext)
        },
        detectImageSupport = (format:'avif'|'webp',content:string) => new Promise<boolean>((resolve,reject)=>{
            const img = new Image()
            img.src = `data:image/${format};base64,${content}`
            img.onload = () => resolve(true)
            img.onerror = () => reject(false)
        }),
        findImageSupport = async () => {
            const [avif,webp] = await Promise.all([
                detectImageSupport('avif','AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='),
                detectImageSupport('webp','UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=')
            ])
            if (avif) setImgFormat('avif')
            else if (webp) setImgFormat('webp')
            else setImgFormat('none')
        }

    useEffect(()=>{
        onResize()
        detectWebGL()
        findImageSupport()
        setDevicePixelRatio(Math.min(Math.floor(window.devicePixelRatio),2))
    },[])

    useWindowEventListeners([
        {evt:'resize',func:onResize},
    ])

    return (
        <Context.Provider value={{devicePixelRatio,webgl,imgFormat}}>
            <Component {...pageProps} />
        </Context.Provider>
    )
}

export default App