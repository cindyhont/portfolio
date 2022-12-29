import React, { useId } from "react";
import { cdnPrefix } from "../../common";
import LinkButton from "./link-button";
import Slider from "./slider";
import YoutubePlayer from "./youtube";
import styles from './styles/IndividualWork.module.scss'
import headerImgStyles from './styles/headerImg.module.scss'

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
        first,
        last,
        backgroundColor,
    }:{
        title:string;
        excerpt?:any;
        img:string;
        slideImg?:string[];
        youtube?:string;
        order:number;
        code?:string;
        live?:string;
        frontend?:string;
        backend?:string;
        slug:string;
        first:boolean;
        last:boolean;
        backgroundColor:string;
    }
) => {
    const id = useId()
    return (
        <div 
            className={styles["work-container"]}
            style={{
                ...(first && {marginTop:'0'}),
                ...(last && {marginBottom:'0'}),
            }}
            {...(!!slideImg && {'data-haswebgl':true})}
            data-canvasid={id}
        >
            {!!youtube && <YoutubePlayer {...{url:youtube,title}} />}
            {!youtube && !!slideImg && <Slider imgPaths={slideImg} backgroundColor={backgroundColor} id={id} />}
            {!youtube && !slideImg && !!img && <div className={headerImgStyles['slide-cropped-image']} style={{backgroundImage:`url(${cdnPrefix()}/${img})`,backgroundColor}}/>}
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
        </div>
    )
}

export default Work