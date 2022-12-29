import React from "react";
import styles from './styles/HeaderImg.module.scss'

const YoutubePlayer = ({url,title}:{url:string;title:string;}) => (
    <iframe 
        src={url}
        title={title}
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
        className={styles['slide-cropped-image']}
    />
)

export default YoutubePlayer