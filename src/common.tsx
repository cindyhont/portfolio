import { createRoot, events, RenderProps } from "@react-three/fiber"
import { ReactNode, useEffect, useRef, useState } from "react"

const 
    addLetterSpacing = (title:string,elem:HTMLElement,className:string) => {
        const len = title.length

        for (let i=0; i<len; i++){
            const char = document.createElement('span')
            char.innerText = title[i]
            elem.appendChild(char)
            if (i === len-1) break;
            const gap = document.createElement('div')
            gap.classList.add(className)
            elem.appendChild(gap)
        }
    },
    cdnPrefix = () => `${process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'https://cdn.cindyhodev.com' : ''}`,
    convertImgFileName = (fileName:string,format:'avif'|'webp'|'none') => {
        const fileNameSplit = fileName.split('.')
        if (fileNameSplit.length < 2) return fileName

        else if (['avif','webp'].includes(format)) return [...fileNameSplit.slice(0,fileNameSplit.length-1),format].join('.')
        else return fileName
    },
    useOnScrollAfterResize = (onScroll:()=>void,immediateOnResize:()=>void,mediaQuery:string) => {
        const 
            timeout = useRef<NodeJS.Timeout>(),
            [loaded,setLoaded] = useState(false),
            setScrollEventListener = () => {
                window.removeEventListener('scroll',onScroll)
                if (!mediaQuery || !!mediaQuery && window.matchMedia(mediaQuery).matches) window.addEventListener('scroll',onScroll,{passive:true})
            },
            onResize = () => {
                if (loaded && (!mediaQuery || !!mediaQuery && window.matchMedia(mediaQuery).matches)) immediateOnResize()
                if (!!timeout.current) clearTimeout(timeout.current)
                timeout.current = setTimeout(setScrollEventListener,100)
            }

        useEffect(()=>{
            onResize()
            window.addEventListener('resize',onResize,{passive:true})
            return () => window.removeEventListener('resize',onResize)
        },[loaded])

        useEffect(()=>setLoaded(true),[])
    },
    useLoadThreejs = (
        container:HTMLDivElement,
        canvas:HTMLCanvasElement,
        scene:ReactNode,
    ) => {
        const 
            root = createRoot(canvas),
            [loaded,setLoaded] = useState(false),
            prevSize = useRef({w:0,h:0}),
            onResize = () => {
                const {width,height} = container.getBoundingClientRect()
                if (prevSize.current.w !== width || prevSize.current.h !== height){
                    root.configure({ size: { width, height, top: 0, left: 0 } })
                    prevSize.current = {w:width,h:height}
                }
            }
    
        useEffect(()=>{
            setLoaded(true)
        },[])
    
        useEffect(()=>{
            if (loaded){
                root.configure({ events })
                if ('ResizeObserver' in window){
                    const observer = new ResizeObserver(onResize)
                    observer.observe(container)
                } else {
                    onResize()
                    window.addEventListener('resize',onResize)
                }
                root.render(scene)
            }
            return () => window.removeEventListener('resize',onResize)
        },[loaded])
    },
    delayInSecond = 0.1

export {
    cdnPrefix,
    addLetterSpacing,
    convertImgFileName,
    useOnScrollAfterResize,
    useLoadThreejs,
    delayInSecond,
}