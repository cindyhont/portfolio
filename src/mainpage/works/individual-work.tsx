import React, { useContext, useId } from "react";
import { cdnPrefix, convertImgFileName } from "../../common";
import LinkButton from "./link-button";
import Slider from "./slider";
import YoutubePlayer from "./youtube";
import styles from './styles/IndividualWork.module.scss'
import headerImgStyles from './styles/HeaderImg.module.scss'
import Image from "next/image";
import { Context } from "../../context";
import { IindexItem } from "../../interfaces";

const Work = (
    {
        slug,
        title,
        img,
        slideImg,
        code,
        live,
        frontend,
        backend,
        excerpt,
        youtube,
        backgroundColor,
        stack,
    }:IindexItem
) => {
    const 
        id = useId(),
        {imgFormat} = useContext(Context)

    return (
        <div 
            className={styles["work-container"]}
            {...(!!slideImg && {'data-hasslides':true})}
            data-sliderid={id}
        >
            {!!youtube && <YoutubePlayer {...{url:youtube,title,backgroundColor}} />}
            {!youtube && !!slideImg && <Slider imgPaths={slideImg} backgroundColor={backgroundColor} id={id} />}
            {!youtube && !slideImg && !!img && imgFormat !== '' && <div className={headerImgStyles['slide-cropped-image']} style={{backgroundColor}}>
                <Image 
                    src={`${cdnPrefix()}/${convertImgFileName(img,imgFormat)}`} 
                    alt={title} fill={true} 
                    className={headerImgStyles['next-image']} 
                />
            </div>}
            <h3>{title}</h3>
            <div className={styles['work-link-container']}>
                <LinkButton link={live || `/work/${slug}/`} title='LIVE' />
                {!!code && <LinkButton link={code} title='CODE' />}
                {!!frontend && <LinkButton link={frontend} title='FRONT END' />}
                {!!backend && <LinkButton link={backend} title='BACK END' />}
            </div>
            <div 
                className={styles['work-content']}
                dangerouslySetInnerHTML={{
                    __html:excerpt
                }}
            />
            <ul className={styles.stack}>
                {stack.map((e,i)=>(
                    <li key={i}>{e}</li>
                ))}
            </ul>
        </div>
    )
}

export default Work