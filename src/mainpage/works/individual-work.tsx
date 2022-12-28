import React, { useId } from "react";
import { cdnPrefix } from "../../common";
import LinkButton from "./link-button";
import Slider from "./slider";
import YoutubePlayer from "./youtube";

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
    }
) => {
    const id = useId()
    return (
        <div 
            className="work-container"
            style={{
                ...(first && {marginTop:'0'}),
                ...(last && {marginBottom:'0'}),
            }}
            {...(!!slideImg && {'data-haswebgl':true})}
            data-canvasid={id}
        >
            {!!youtube && <YoutubePlayer {...{url:youtube,title}} />}
            {!youtube && !!slideImg && <Slider imgPaths={slideImg} bgColor='#000' id={id} />}
            {!youtube && !slideImg && !!img && <div className='slide-cropped-image' style={{backgroundImage:`url(${cdnPrefix()}/${img})`}}/>}
            <h3>{title}</h3>
            <div className='work-link-container'>
                <LinkButton link={live || `/work/${slug}/`} title='LIVE' />
                {!!code && <LinkButton link={code} title='CODE' />}
                {!!frontend && <LinkButton link={frontend} title='FRONT END' />}
                {!!backend && <LinkButton link={backend} title='BACK END' />}
            </div>
            <div 
                className='work-content'
                dangerouslySetInnerHTML={{
                    __html:excerpt
                }}
            />
        </div>
    )
}

export default Work