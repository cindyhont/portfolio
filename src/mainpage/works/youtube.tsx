import React, { useEffect, useRef, useState } from "react";
import styles from './styles/HeaderImg.module.scss'

const YoutubePlayer = (
    {
        url,
        title,
        backgroundColor,
    }:{
        url:string;
        title:string;
        backgroundColor:string;
    }
) => {
    const 
        container = useRef<HTMLDivElement>(),
        [showPlayer,setShowPlayer] = useState(false),
        timeout = useRef<NodeJS.Timeout>(),
        handleObserver = (entries:IntersectionObserverEntry[],observer:IntersectionObserver) => {
            entries.forEach(e=>{
                if (e.isIntersecting){
                    clearTimeout(timeout.current)
                    setShowPlayer(true)
                    observer.unobserve(e.target)
                }
            })
        }

    useEffect(()=>{
        const observer = new IntersectionObserver(handleObserver,{root:null,rootMargin:'0px',threshold:0})
        observer.observe(container.current)
        timeout.current = setTimeout(()=>{
            setShowPlayer(true)
            observer.unobserve(container.current)
        },5000)
    },[])

    return (
        <div ref={container} className={styles['slide-cropped-image']} style={{backgroundColor}}>
            {showPlayer && <iframe 
                src={url}
                title={title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className={styles.youtube}
            />}
            {!showPlayer && <div className={styles['youtube-loading']}><p>Loading Youtube video ...</p></div>}
        </div>
    )
}

export default YoutubePlayer