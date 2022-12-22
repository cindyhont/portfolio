import React from 'react'
import { closeAllModals } from '../common'

const MenuButtons = ({id}:{id:string}) => {
    const 
        commonFunc = () => {
            closeAllModals();
            (document.getElementById('mobile-menu-checkbox') as HTMLInputElement).checked = false
        },
        toTop = () => {
            if (window.scrollY < window.innerHeight) return
            commonFunc()
            window.scrollTo(0,window.innerHeight)
            window.scrollTo({top:0,behavior:'smooth'})
        },
        toSlides = () => {
            const 
                container = document.getElementById('cinema-container'),
                {top,height} = container.getClientRects()[0],
                flockContainer = document.getElementById('flock-container')
            
            if (top < 0 && top > -height) return
            commonFunc()
            container.scrollIntoView()
            window.scrollBy({top:flockContainer.offsetHeight * 1.1,behavior:'smooth'})
        },
        toDiamonds = () => {
            const 
                container = document.getElementById('diamonds-container'),
                {top,height} = container.getClientRects()[0]
            if (top < 0 && top > -height) return

            commonFunc()

            container.scrollIntoView()
            window.scrollBy({top:window.innerHeight * 2,behavior:'smooth'})
        },
        toContact = () => {
            const 
                container = document.getElementById('bottle-container'),
                {top} = container.getClientRects()[0]

            if (top < 0) return

            commonFunc()

            container.scrollIntoView()
            container.scrollIntoView({block:'end',behavior:'smooth'})
        }
    return (
        <div id={id}>
            <button onClick={toTop}>Home</button>
            <button onClick={toSlides}>Work</button>
            <button onClick={toDiamonds}>About</button>
            <button onClick={toContact}>Contact</button>
        </div>
    )
}

export default MenuButtons