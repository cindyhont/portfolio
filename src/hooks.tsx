import { createRoot, events, useThree } from "@react-three/fiber";
import { MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";

const
    useLoaded = () => {
        const [loaded,setLoaded] = useState(false);
        useEffect(()=>setLoaded(true),[])
        return loaded
    },
    useEventListeners = (eventFuncArr:{elem:Window | Node | MutableRefObject<Element>,evt:string;func:(e:Event)=>void;}[]) => {
        useEffect(()=>{
            for (let {elem,evt,func} of eventFuncArr){
                if ('current' in elem) elem.current?.addEventListener(evt,func,{passive:true})
                else elem?.addEventListener(evt,func,{passive:true})
            }
            return () => {
                for (let {elem,evt,func} of eventFuncArr){
                    if ('current' in elem) elem.current?.addEventListener(evt,func,{passive:true})
                    else elem?.removeEventListener(evt,func)
                }
            }
        },[])
    },
    useWindowEventListeners = (eventFuncArr:{evt:string;func:(e:Event)=>void;}[]) => {
        useEffect(()=>{
            for (let {evt,func} of eventFuncArr) window.addEventListener(evt,func,{passive:true})
            return () => {
                for (let {evt,func} of eventFuncArr) window.removeEventListener(evt,func)
            }
        },[])
    },
    useMediaQueryListener = (queryFuncArr:{query:string,func:(e: MediaQueryListEvent)=>void}[]) => {
        useEffect(()=>{
            for (let {query,func} of queryFuncArr) window.matchMedia(query).addEventListener('change',func,{passive:true})
            return () => {
                for (let {query,func} of queryFuncArr) window.matchMedia(query).removeEventListener('change',func)
            }
        },[])
    },
    useOnScrollAfterResize = (onScroll:()=>void,immediateOnResize:()=>void,mediaQuery:string) => {
        const 
            timeout = useRef<NodeJS.Timeout>(),
            loaded = useLoaded(),
            setScrollEventListener = () => {
                window.removeEventListener('scroll',onScroll)
                if (!mediaQuery || !!mediaQuery && window.matchMedia(mediaQuery).matches) window.addEventListener('scroll',onScroll,{passive:true})
            },
            onResize = () => {
                if (loaded && (!mediaQuery || !!mediaQuery && window.matchMedia(mediaQuery).matches)) immediateOnResize()
                if (!!timeout.current) clearTimeout(timeout.current)
                timeout.current = setTimeout(setScrollEventListener,550)
            }

        useEffect(()=>{
            onResize()
            window.addEventListener('resize',onResize,{passive:true})
            return () => window.removeEventListener('resize',onResize)
        },[loaded])
    },
    useLoadThreejs = (
        container:HTMLDivElement,
        canvas:HTMLCanvasElement,
        scene:ReactNode,
    ) => {
        const 
            root = createRoot(canvas),
            loaded = useLoaded(),
            prevSize = useRef({w:0,h:0}),
            onResize = () => {
                const {width,height} = container.getBoundingClientRect()
                if (prevSize.current.w !== width || prevSize.current.h !== height){
                    root.configure({ size: { width, height, top: 0, left: 0 } })
                    prevSize.current = {w:width,h:height}
                }
            }

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
    useUpdateThreeJsOnCanvasChange = (
        dpr:number,
        frameloop?: "always" | "demand" | "never"
    ) => {
        const 
            size = useThree(e=>size),
            setDpr = useThree(e=>e.setDpr),
            setFrameloop = useThree(e=>e.setFrameloop)

        useEffect(()=>{
            setDpr(dpr)
            if (!!frameloop) setFrameloop(frameloop)
        },[size.width,size.height])
    },
    useTheme = () => {
        /*
            this is written because there are more than one theme button in the same page
            some theme related fucntions are linked to the Window or local storage
            this is for avoiding multiple triggers for the same process to these targets
        */

        const
            systemThemeQuery = useRef('(prefers-color-scheme: dark)').current,
            updateIcon = (dark:boolean,animate:boolean) => {
                if (animate) ['sun','moon'].forEach(e=>document.getElementById(e)?.classList.remove('no-anim'))
    
                const htmlTag = document.getElementsByTagName('html')[0]
                htmlTag.style.backgroundColor = dark ? '#333' : '#eee'
                htmlTag.dataset.theme = dark ? 'dark' : 'light'
            },
            systemThemeUpdate = (e:MediaQueryListEvent) => {
                const storageValueStr = localStorage.getItem('dark')
                if (!storageValueStr) updateIcon(e.matches,true)
                else {
                    const storageValue = storageValueStr === 'true'
                    if (storageValue === e.matches){
                        localStorage.removeItem('dark')
                        updateIcon(e.matches,true)
                    }
                }
            },
            onClick = () => {
                const darkMode = document.getElementsByTagName('html')[0].dataset.theme === 'dark'
                updateIcon(!darkMode,true)
                if (darkMode === window.matchMedia(systemThemeQuery).matches) localStorage.setItem('dark',(!darkMode).toString())
                else localStorage.removeItem('dark')
            },
            buttonsAddRemoveListener = (buttons: HTMLCollectionOf<Element>, addListener:boolean) => {
                for (let i=0; i<buttons.length; i++){
                    const button = buttons.item(i)
                    if (addListener) button.addEventListener('click',onClick,{passive:true})
                    else button.removeEventListener('click',onClick)
                }
            }

        useEffect(()=>{
            if (!localStorage.getItem('dark')) updateIcon(window.matchMedia(systemThemeQuery).matches,false);
            
            const themeButtons = document.getElementsByClassName('theme-button')
            buttonsAddRemoveListener(themeButtons,true)

            return () => buttonsAddRemoveListener(themeButtons,false)
        },[])

        useMediaQueryListener([
            {query:systemThemeQuery,func:systemThemeUpdate},
        ])
    }

export {
    useLoaded,
    useEventListeners,
    useWindowEventListeners,
    useMediaQueryListener,
    useOnScrollAfterResize,
    useLoadThreejs,
    useUpdateThreeJsOnCanvasChange,
    useTheme,
}