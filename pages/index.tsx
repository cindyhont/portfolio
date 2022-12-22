import React, { useEffect, useRef } from "react";
import Head from 'next/head';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import matter from 'gray-matter'
import fs from 'fs'
import { join } from 'path'
import { GetStaticProps } from 'next'
import { IindexItem } from "../src/interfaces";
import { IndexContext } from "../src/context";
import Diamonds from "../src/mainpage/diamonds";
import Bottle from "../src/mainpage/bottle";
import FlockOnSphere from "../src/mainpage/flockonsphere";
import FpsCounter from "../src/mainpage/fps-counter";
import Cinema from "../src/mainpage/cinema";
import Loader from "../src/mainpage/loader";
import MenuButtons from "../src/mainpage/menu-buttons";

export const getStaticProps:GetStaticProps = async () => {
    const 
        root = join (process.cwd (), 'src', 'works', 'mdx'),
        listing = fs.readdirSync(root)

    let works:IindexItem[] = []

    listing.forEach(async filename=>{
        if (!filename.endsWith('.mdx')) return
        const 
            buf = fs.readFileSync(join(root,filename)),
            m = matter(buf,{excerpt_separator: '<!-- excerpt end -->'})

        works.push({
            ...m.data as IindexItem,
            excerpt:m.excerpt,
            slug:filename.replace('.mdx',''),
        })
    })

    return {
        props:{works:works.sort((a,b)=>a.order - b.order)}
    }
}

const Index = ({works}:{works:IindexItem[]}) => {
    gsap.registerPlugin(ScrollTrigger)
    const 
        progressRef = useRef<HTMLDivElement>(),
        mobileCheckbox = useRef<HTMLInputElement>(),
        onResize = () => mobileCheckbox.current.checked = false,
        bgOnClick = (e:any) => {
            if (e.target.id==='mobile-menu-container') mobileCheckbox.current.checked = false
        }

    useEffect(()=>{
        window.addEventListener('resize',onResize)

        progressRef.current.style.width = '0%'

        ScrollTrigger.create({
            trigger:'#home',
            start:'top 0%',
            end:'bottom 100%',
            onUpdate:({progress})=> progressRef.current.style.width = `${progress * 100}%`
        })

        return () => window.removeEventListener('resize',onResize)
    },[])

    return (
        <>
        <Head>
            <title>Cindy Ho - Full Stack Developer</title>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html:`{
                "@context": "https://schema.org",
                "@type" : "WebSite",
                "name": "Cindy Ho - Full Stack Developer",
                "description": "I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site.",
                "url": "https://cindyhodev.com/",
                "image":"portfolio.jpg",
                "creator":{
                    "@type": "Person",
                    "name": "Cindy Ho"
                }
            }`}}></script>
            <link rel="canonical" href="https://cindyhodev.com" />
            <meta charSet="utf-8"/>
            <meta name="robots" content="index,follow" />
            <meta httpEquiv="cache-control" content="private" />
            <meta httpEquiv="expires" content="43200"/>
            <meta name="description" content="I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site."></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <script id="perlin-noise-worker" type="javascript/worker" dangerouslySetInnerHTML={{__html:`
                const
                    smoothStep = t => t*t*t*(t*(t*6-15)+10),
                    interpolate = (e0,e1,x) => (e1 - e0) * x + e0,
                    getDotProduct = (angleCornerNoPi,xCoord,yCoord,cornerX,cornerY) => {
                        let angleSelf = 0;
                
                        if (cornerX === 0){
                            if (cornerY === 0) angleSelf = Math.PI * 0.5 + Math.atan(yCoord / xCoord);
                            else angleSelf = Math.PI * 0.5 - Math.atan((1 - yCoord) / xCoord);
                        } else {
                            if (cornerY === 0) angleSelf = Math.PI * 1.5 - Math.atan(yCoord / (1 - xCoord))
                            else angleSelf = Math.PI * 1.5 + Math.atan((1 - yCoord) / (1 - xCoord));
                        }
                
                        const angleCorner = angleCornerNoPi * Math.PI * 2;
                
                        let angleBetween = angleCorner > angleSelf ? angleCorner - angleSelf : angleSelf - angleCorner;
                        if (angleBetween >= Math.PI) angleBetween = Math.PI * 2 - angleBetween;
                        
                        const 
                            vectorLen = Math.sqrt(Math.pow(cornerX - xCoord, 2) + Math.pow(cornerY - yCoord,2)),
                            result = (vectorLen * Math.max(Math.min(Math.cos(angleBetween),1),-1))
                        
                        return isNaN(result) ? 0.5 : result * 0.5 + 0.5
                    }
                
                self.onmessage = ({data}) => {
                    const 
                        {px,size} = data,
                        cellSize = px / size,
                        srcArr = Array.from(Array(size).keys(),()=>new Float32Array(Array.from(Array(size).keys(),()=>Math.random())))
                
                    let 
                        frontNoise = new Float32Array(px * px * 4),
                        desertNoise = new Float32Array(px * px * 4)
                
                    for (let y=0; y<px; y++){
                        const 
                            yCoord = (y % cellSize) / cellSize,
                            yInterpolate = smoothStep(yCoord),
                            top = Math.floor(y / cellSize),
                            bottom = top === size - 1 ? 0 : top + 1
                
                        for (let x=0; x<px; x++){
                            const 
                                i = 4 * (px * y + x),
                
                                xCoord = (x % cellSize) / cellSize,
                                xInterpolate = smoothStep(xCoord),
                                left = Math.floor(x / cellSize),
                                right = left === size - 1 ? 0 : left + 1,
                                dTopLeft = getDotProduct(srcArr[top][left],xCoord,yCoord,0,0),
                                dTopRight = getDotProduct(srcArr[top][right],xCoord,yCoord,1,0),
                                dBottomLeft = getDotProduct(srcArr[bottom][left],xCoord,yCoord,0,1),
                                dBottomRight = getDotProduct(srcArr[bottom][right],xCoord,yCoord,1,1),
                                dTop = interpolate(dTopLeft,dTopRight,xInterpolate),
                                dBottom = interpolate(dBottomLeft,dBottomRight,xInterpolate),
                                d = interpolate(dTop,dBottom,yInterpolate),
                                dd = d * Math.min(1,Math.min(y / cellSize,1))
                
                            for (let z=0; z<4; z++){
                                frontNoise[i+z] = d
                                desertNoise[i+z] = dd
                            }
                        }
                    }
                    self.postMessage({frontNoise,desertNoise})
                }
            `}}></script>
        </Head>
        <div id='home'>
            <FlockOnSphere />
            <IndexContext.Provider value={{works}}>
                <Cinema />
            </IndexContext.Provider>
            <Diamonds />
            <Bottle />
            <FpsCounter />
            <div id='desktop-menu'>
                <div ref={progressRef} id='progress' />
                <MenuButtons id='desktop-menu-btns' />
            </div>
            <input type='checkbox' id='mobile-menu-checkbox' ref={mobileCheckbox} hidden />
            <div id='mobile-menu-container' onClick={bgOnClick}>
                <MenuButtons id='mobile-menu' />
            </div>
            <label htmlFor="mobile-menu-checkbox">
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </label>
        </div>
        <Loader />
        </>
    )
}

export default Index