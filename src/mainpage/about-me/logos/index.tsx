import React, { useEffect } from "react";
import Docker from "./docker";
import Golang from "./golang";
import GSAP from "./gsap";
import NextJS from "./nextjs";
import Nginx from "./nginx";
import Postgresql from "./postgresql";
import RabbitMQ from "./rabbitmq";
import Redux from "./redux";
import Sass from "./sass";
import ThreeJS from "./threejs";
import Typescript from "./typescript";
import ReactLogo from "./react";
import WebGL from "./webgl";
import HTML from "./html";
import CSS from "./css";
import Javascript from "./javascript";

const Logos = () => {
    const handleAnim = (entries:IntersectionObserverEntry[],observer:IntersectionObserver) => {
        const targets = entries.filter(e=>e.isIntersecting).map(entry=>{
            observer.unobserve(entry.target)
            return entry.target
        })
        targets.forEach((target,i)=>{
            setTimeout(()=>(target.firstChild.firstChild as HTMLElement).classList.add('show'),i * 200)
        })
    }

    useEffect(()=>{
        const observer = new IntersectionObserver(handleAnim,{root:null,rootMargin:'0px',threshold:0.3})
        document.querySelectorAll('.about-me-skill').forEach(e=>observer.observe(e))
    },[])

    return (
        <div id='about-me-skills'>
            <HTML />
            <CSS />
            <Javascript />
            <Typescript />
            <Sass />
            <ReactLogo />
            <NextJS />
            <Redux />
            <GSAP />
            <ThreeJS />
            <WebGL />
            <Golang />
            <Postgresql />
            <RabbitMQ />
            <Nginx />
            <Docker />
        </div>
    )
}

export default Logos