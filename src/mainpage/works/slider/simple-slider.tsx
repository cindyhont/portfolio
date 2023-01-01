import React, { useContext, useEffect, useRef } from "react";
import { cdnPrefix, convertImgFileName } from "../../../common";
import { Context } from "../../../context";
import styles from '../styles/HeaderImg.module.scss'

const SimpleSlider = ({imgPaths,id}:{imgPaths:string[];id:string;}) => {
    const 
        img = useRef<HTMLImageElement>(),
        imgIdx = useRef(0),
        {webgl,imgFormat} = useContext(Context),
        preloadImage = (idx:number) => {
            if (!imgFormat) return
            const image = new Image()
            image.src = `${cdnPrefix()}/${convertImgFileName(imgPaths[idx],imgFormat)}`
            image.onload = () => {}
        },
        loadImage = () => {
            if (!!imgFormat) img.current.src = `${cdnPrefix()}/${convertImgFileName(imgPaths[imgIdx.current],imgFormat)}`
            preloadImage((imgPaths.length + imgIdx.current - 1) % imgPaths.length)
            preloadImage((imgIdx.current + 1) % imgPaths.length)
        },
        onSwipe = (e:CustomEvent) => {
            imgIdx.current = (imgPaths.length + imgIdx.current + e.detail as number) % imgPaths.length
            loadImage()
        }

    useEffect(()=>{
        const container = document.getElementById(id)
        if (webgl===false && !!imgFormat) {
            loadImage()
            container.addEventListener('swipe',onSwipe,{passive:true})
        }
        return () => container.removeEventListener('swipe',onSwipe)
    },[webgl,imgFormat])

    return <img ref={img} className={styles['raw-image']} />
}

export default SimpleSlider