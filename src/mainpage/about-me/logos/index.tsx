import React, { useEffect, useRef } from "react";
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
import styles from '../styles/AboutMe.module.scss'
import MaterialUI from "./material-ui";

const Logos = () => {
    const 
        container = useRef<HTMLDivElement>(),
        handleAnim = (entries:IntersectionObserverEntry[],observer:IntersectionObserver) => {
            const targets = entries.filter(e=>e.isIntersecting).map(entry=>{
                observer.unobserve(entry.target)
                return entry.target
            })
            targets.forEach((target,i)=>{
                setTimeout(()=>(target.firstChild.firstChild as HTMLElement).classList.add(styles.show),i * 200)
            })
        }

    useEffect(()=>{
        container.current.querySelectorAll('path').forEach(e=>e.setAttribute('pathLength','60'))
        const observer = new IntersectionObserver(handleAnim,{root:null,rootMargin:'0px',threshold:0.3})
        document.querySelectorAll(`.${styles['about-me-skill']}`).forEach(e=>observer.observe(e))
    },[])

    return (
        <div ref={container}>
            <h3>Languages</h3>
            <div className={styles['about-me-skills']}>
                <HTML />
                <CSS />
                <Sass />
                <Javascript />
                <Typescript />
                <Golang />
            </div>
            <h3>Technologies</h3>
            <div className={styles['about-me-skills']}>
                <ReactLogo />
                <NextJS />
                <Redux />
                <MaterialUI />
                <GSAP />
                <ThreeJS />
                <WebGL />
                <Postgresql />
                <RabbitMQ />
                <Nginx />
                <Docker />
            </div>
        </div>
    )
}

export default Logos