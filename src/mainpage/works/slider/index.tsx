import React, { useContext, useRef } from "react";
import { Context } from "../../../context";
import SimpleSlider from "./simple-slider";
import styles from '../styles/HeaderImg.module.scss'
import WebglSlider from "./webgl-slider";

const Slider = ({imgPaths,backgroundColor,id}:{imgPaths:string[];backgroundColor:string;id:string;}) => {
    const 
        container = useRef<HTMLDivElement>(),
        {webgl,imgFormat} = useContext(Context),
        onClick = (e:number) => {
            container.current.dispatchEvent(new CustomEvent('swipe',{detail:e}))

            // restart the auto loop if button is clicked, so that the next move doesn't come too soon after the first move
            document.getElementById('works')?.dispatchEvent(new CustomEvent('restart',{detail:id}))
        },
        prevOnClick = () => onClick(-1),
        nextOnClick = () => onClick(1)

    return (
        <div id={id} ref={container} className={styles['slide-cropped-image']} data-webgl={true} style={{backgroundColor}}>
            {webgl && <WebglSlider {...{imgPaths,id}} />}
            {webgl===false && !!imgFormat && <SimpleSlider {...{imgPaths,id}} />}
            <button className={styles['prev']} aria-label='Previous Slide' onClick={prevOnClick}>
                <svg viewBox="-3 -3 21 36" width='15' height='30'>
                    <polyline points="15,0 0,15 15,30" stroke='#fff' fill='none' strokeWidth={3} strokeLinecap='round' strokeLinejoin="round" />
                </svg>
            </button>
            <button className={styles['next']} aria-label='Next Slide' onClick={nextOnClick}>
                <svg viewBox="-3 -3 21 36" width='15' height='30'>
                    <polyline points="0,0 15,15 0,30" stroke='#fff' fill='none' strokeWidth={3} strokeLinecap='round' strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    )
}

export default Slider