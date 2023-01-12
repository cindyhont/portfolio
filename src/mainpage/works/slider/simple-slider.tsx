import React, { useContext, useEffect, useRef } from "react";
import { cdnPrefix, convertImgFileName } from "../../../common/functions";
import { Context } from "../../../context";
import styles from '../styles/HeaderImg.module.scss'

const SimpleSlider = ({imgPaths,id}:{imgPaths:string[];id:string;}) => {
    const 
        images = useRef<HTMLImageElement[]>([]),
        currImgElemIdx = useRef(0),
        imgIdx = useRef(0),
        {webgl,imgFormat} = useContext(Context),
        imagePending = useRef([false, ...Array.from(Array(4),()=>true)]),
        imagesNotLoaded = useRef(true),
        preloadImage = (idx:number) => {
            if (!imgFormat) return
            const image = new Image()
            image.src = `${cdnPrefix()}/${convertImgFileName(imgPaths[idx],imgFormat)}`
            image.onload = () => {
                imagePending.current = [
                    ...imagePending.current.slice(0 ,idx),
                    false,
                    ...imagePending.current.slice(idx + 1, imgPaths.length),
                ]
                if (imagePending.current.every(e=>!e)) imagesNotLoaded.current = false
            }
        },
        preloadImages = () => {
            const prevIdx = (imgPaths.length + imgIdx.current - 1) % imgPaths.length
            if (imagePending.current[prevIdx]) preloadImage(prevIdx)
            const nextIdx = (imgIdx.current + 1) % imgPaths.length
            if (imagePending.current[nextIdx]) preloadImage(nextIdx)
        },
        loadImage = () => {
            const newImageElemIdx = !currImgElemIdx.current ? 1 : 0
            if (!!imgFormat) images.current[newImageElemIdx].src = `${cdnPrefix()}/${convertImgFileName(imgPaths[imgIdx.current],imgFormat)}`
            images.current[newImageElemIdx].classList.add(styles.show)

            images.current[currImgElemIdx.current].classList.remove(styles.show)

            currImgElemIdx.current = newImageElemIdx

            if (imagesNotLoaded.current) preloadImages()
        },
        onSwipe = (e:CustomEvent) => {
            imgIdx.current = (imgPaths.length + imgIdx.current + e.detail as number) % imgPaths.length
            loadImage()
        }

    useEffect(()=>{
        const container = document.getElementById(id)
        if (webgl===false && !!imgFormat) {
            images.current[currImgElemIdx.current].src = `${cdnPrefix()}/${convertImgFileName(imgPaths[imgIdx.current],imgFormat)}`
            images.current[currImgElemIdx.current].classList.add(styles.show)
            preloadImages()
            
            container.addEventListener('swipe',onSwipe,{passive:true})
        }
        return () => container.removeEventListener('swipe',onSwipe)
    },[webgl,imgFormat])

    return (
        <>
        <div className={styles['raw-image-container']}>
            <img ref={elem=>images.current.push(elem)} className={styles['raw-image']} />
        </div>
        <div className={styles['raw-image-container']}>
            <img ref={elem=>images.current.push(elem)} className={styles['raw-image']} />
        </div>
        </>
    )
}

export default SimpleSlider