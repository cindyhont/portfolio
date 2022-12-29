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
    cdnPrefix = () => `${process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'https://cdn.cindyhodev.com' : ''}`

export {
    cdnPrefix,
    addLetterSpacing,
}