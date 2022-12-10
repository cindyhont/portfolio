import React from "react";
import {Context} from "./context";

const 
    closeAllModals = () => {
        const 
            elem = document.getElementsByClassName('modal-input') as HTMLCollectionOf<HTMLInputElement>,
            len = elem.length;
        
        for (let i = 0; i < len; i++) elem[i].checked = false;

        const 
            label = document.querySelector("label[for='mobile-menu-checkbox']") as HTMLElement,
            aboutSceneSliders = document.getElementsByClassName('about-scene-container') as HTMLCollectionOf<HTMLDivElement>,
            sliderLen = aboutSceneSliders.length

        if (!!label) label.style.display = null

        for (let i=0; i<sliderLen; i++){
            aboutSceneSliders.item(i).style.visibility = 'visible'
        }

        document.getElementById('desktop-menu').style.display = null

        document.getElementById('cinema-container').dispatchEvent(new CustomEvent('modal',{detail:false}))
    },
    AboutSceneTabSVG = () => (
        <div>
            <svg height='180' width='30'>
                <polygon fill='#555' points='0,0 0,180 30,180 30,30' />
                <text x="0" y="0" fill='#fff'>About this scene</text>
            </svg>
        </div>
    ),
    AboutSceneContent = (
        {
            codeURL,
            children
        }:{
            codeURL:string;
            children:JSX.Element;
        }
    ) => (
        <div className='about-scene-content'>
            {children}
            <a href={codeURL} target="_blank" rel="noreferrer">
                <img src='/github.svg' />
            </a>
        </div>
    ),
    AboutSceneTab = (
        {
            id,
            codeURL,
            children,
        }:{
            id:string;
            codeURL:string;
            children:JSX.Element;
        }
    ) => (
        <Context.Consumer>{({mobile})=>
            mobile ? (
                <>
                <input type='checkbox' className='about-scene-checkbox' id={id} />
                <label htmlFor={id} className='about-scene-mobile-label' />
                <div className='about-scene-container'>
                    <AboutSceneContent {...{codeURL,children}} />
                    <label htmlFor={id}>
                        <AboutSceneTabSVG />
                    </label>
                </div>
                </>
            ) : (
                <div className='about-scene-container'>
                    <AboutSceneContent {...{codeURL,children}} />
                    <AboutSceneTabSVG />
                </div>
            )
        }</Context.Consumer>
    ),
    canvasIsLoaded = () => document.getElementById('home').dispatchEvent(new CustomEvent('canvasLoaded',{detail:true}))

export {
    closeAllModals,
    AboutSceneTab,
    canvasIsLoaded,
}