import React, { ChangeEvent } from 'react'
import { IndexContext } from '../../context'

const 
    Modals = () => (
        <IndexContext.Consumer>{({works})=>(
            <>
            {works.map(e=>(
                <Modal key={e.slug} {...e} />
            ))}
            </>
        )}</IndexContext.Consumer>
    ),
    Modal = (
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
            youtube
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
        }
    ) => {
        const modalStatusOnChange = (e:ChangeEvent<HTMLInputElement>) => {
            const 
                checked = e.target.checked,
                label = document.querySelector("label[for='mobile-menu-checkbox']") as HTMLElement,
                aboutSceneSliders = document.getElementsByClassName('about-scene-container') as HTMLCollectionOf<HTMLDivElement>,
                sliderLen = aboutSceneSliders.length

            document.body.style.overflowY = checked ? 'hidden' : null

            if (!!label) label.style.display = checked ? 'none' : null

            for (let i=0; i<sliderLen; i++){
                aboutSceneSliders.item(i).style.visibility = checked ? 'hidden' : 'visible'
            }

            if (checked){
                const 
                    modals = document.getElementsByClassName('modal-box') as HTMLCollectionOf<HTMLDivElement>,
                    modalLen = modals.length

                for (let i=0; i<modalLen; i++){
                    modals.item(i).scrollTo(0,0)
                }
            }

            document.getElementById('desktop-menu').style.display = checked ? 'none' : null

            // document.getElementById('cinema-container').dispatchEvent(new CustomEvent('modal',{detail:checked}))
        }

        return (
            <div className='modal-container'>
                <input className="modal-input" id={slug} type="checkbox" onChange={modalStatusOnChange} />
                <div className='slide-modal'>
                    <label htmlFor={slug} />
                    <div className='modal-box'>
                        <div className='modal-title'>
                            <h2>{title}</h2>
                            <label htmlFor={slug} style={{margin:'auto 0',cursor:'pointer',height:'30px'}}>
                                <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="20" y1="80" x2="80" y2="20" strokeWidth="8" strokeLinecap='round' stroke="#fff"/>
                                    <line x1="20" y1="20" x2="80" y2="80" strokeWidth="8" strokeLinecap='round' stroke="#fff"/>
                                </svg>
                            </label>
                        </div>
                        {!!youtube && <YoutubePlayer {...{url:youtube,title}} />}
                        {!youtube && !!slideImg && <div className='modal-slider-container'>
                            {slideImg.map((fileName,j)=>(<ModalImgSlider {...{id:slug,j,fileName,slideImg}} key={j} />))}
                        </div>}
                        {!youtube && !slideImg && !!img && <div className='slide-cropped-image' style={{backgroundImage:`url(/${img})`}}/>}
                        <div className='modal-link-container'>
                            {slug!=='portfolio' && <a href={live || `/work/${slug}/`} className='modal-link' target='_blank' rel="noreferrer">LIVE</a>}
                            {!!code && <a href={code} className='modal-link' target='_blank' rel="noreferrer">CODE</a>}
                            {!!frontend && <a href={frontend} className='modal-link'>FRONT END</a>}
                            {!!backend && <a href={backend} className='modal-link'>BACK END</a>}
                        </div>
                        <div 
                            style={{padding:'0 min(5vw,25px)',textAlign:'left'}} 
                            dangerouslySetInnerHTML={{
                                __html:excerpt
                            }}
                        />
                    </div>
                </div>
            </div>
        )
    },
    ModalImgSlider = (
        {
            id,
            j,
            fileName,
            slideImg
        }:{
            id:string;
            j:number;
            fileName:string;
            slideImg:string[];
        }
    ) => (
        <>
        <input type='radio' id={`${id}-${j}`} name={id} defaultChecked={j===0} className="modal-slider-input" hidden />
        <div className='modal-slider-img' style={{backgroundImage:`url(/${fileName})`}}>
            <label htmlFor={`${id}-${j > 0 ? j - 1 : slideImg.length - 1}`} className='modal-slider-arrow'>
                <svg height='30' width='50'>
                    <polyline points='29,3 20,15 29,27' />
                </svg>
            </label>
            <label htmlFor={`${id}-${j < slideImg.length - 1 ? j + 1 : 0}`} className='modal-slider-arrow'>
                <svg height='30' width='50'>
                    <polyline points='20,3 29,15 20,27' />
                </svg>
            </label>
        </div>
        </>
    ),
    YoutubePlayer = ({url,title}:{url:string;title:string;}) => (
        <iframe 
            src={url}
            title={title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className='slide-cropped-image'
        />
    )

export default Modals;