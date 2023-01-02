import { createRoot, events } from "@react-three/fiber"
import { ReactNode, useEffect, useRef, useState } from "react"

const 
    addLetterSpacing = (title:string,elem:HTMLElement,className:string) => {
        const len = title.length

        for (let i=0; i<len; i++){
            const char = document.createElement('span')
            char.innerText = title[i]
            elem.appendChild(char)
            if (i === len-1) break;
            const gap = document.createElement('div')
            gap.classList.add(className)
            elem.appendChild(gap)
        }
    },
    cdnPrefix = () => `${process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'https://cdn.cindyhodev.com' : ''}`,
    convertImgFileName = (fileName:string,format:'avif'|'webp'|'none') => {
        const fileNameSplit = fileName.split('.')
        if (fileNameSplit.length < 2) return fileName

        else if (['avif','webp'].includes(format)) return [...fileNameSplit.slice(0,fileNameSplit.length-1),format].join('.')
        else return fileName
    },
    delayInSecond = 0,
    hideMobileSidebar = () => {
        const checkbox = document.getElementById('menu-checkbox') as HTMLInputElement
        if (checkbox.checked) checkbox.click()
    }

export {
    cdnPrefix,
    addLetterSpacing,
    convertImgFileName,
    delayInSecond,
    hideMobileSidebar,
}