import React, { useEffect, useRef } from "react";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import {CustomEase} from 'gsap/dist/CustomEase';

const
    skills = [
        'TypeScript',
        'React',
        'Sass',
        'Three.js',
        'PostgreSQL',
        'Python',
        'Git',
    ],
    About = () => {
        gsap.registerPlugin(ScrollTrigger,CustomEase);

        const 
            aboutMeRef = useRef<HTMLDivElement>(),
            st = useRef<ScrollTrigger>(),
            updateBgColor = (progress:number) => aboutMeRef.current.style.backgroundColor = `rgba(30,30,30,${Math.pow(progress,0.25) * 0.7})`,
            onResize = () => {
                if (!!st.current) st.current.kill(true)

                gsap.set('.about-me-sections.content',{
                    x:'10%',
                    autoAlpha:0
                })

                gsap.set('.about-me-sections.title',{
                    y:'-50%',
                    autoAlpha:0
                })

                gsap.set('#about-me',{
                    backgroundColor:'rgba(30,30,30,0)'
                })

                const tween = gsap.to('.about-me-sections',{
                    x:0,
                    y:0,
                    autoAlpha:1,
                    ease:CustomEase.create("custom", "M0,0,C0.084,0.61,0.05,0.906,0.116,0.96,0.192,1.022,0.374,1,1,1")
                    
                })

                st.current = ScrollTrigger.create({
                    animation:tween,
                    trigger:'#about-me',
                    start:`top 0%`,
                    end:`+=100%`,
                    scrub:true,
                    pin:true,
                    ...(window.matchMedia('(orientation: portrait)').matches && {
                        onRefresh:({progress})=>updateBgColor(progress),
                        onUpdate:({progress})=>updateBgColor(progress),
                    })
                })
            }

        useEffect(()=>{
            onResize()
            ScrollTrigger.addEventListener('refreshInit',onResize)
            return () => ScrollTrigger.removeEventListener('refreshInit',onResize)
        },[])

        return (
            <div id='about-me' ref={aboutMeRef}>
                <h1 className="about-me-sections title">ABOUT ME</h1>
                <p className="about-me-sections content">
                    I am a self-taught developer, 
                    born and raised in Hong Kong, 
                    used to work as a product manager and marketer for over 5 years 
                    in the fashion accessories sector - which means: 
                    I value both functionality and commercial value.
                </p>
                <p className="about-me-sections content">
                    I am a fast and aggressive learner. 
                    I learn new things whenever I have problems to solve but cannot find a solution. 
                    While I was working on this portfolio, 
                    it happened more than once that none of the packages/plugins available could meet my needs. 
                    I ended up writing my own version.
                </p>
                <h2 className="about-me-sections title">Skills</h2>
                <div style={{display: 'flex',flexWrap:'wrap',marginBottom:'15px'}} className='about-me-sections content'>
                    {skills.map((skill,i)=>(
                        <div className='skill' key={i}>{skill}</div>
                    ))}
                </div>
            </div>
        )
    }

export default About;