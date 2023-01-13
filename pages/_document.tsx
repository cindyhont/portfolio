import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

const Document = () => {
    return (
        <Html lang="en">
            <Head>
                <Script 
                    strategy='beforeInteractive' 
                    id='before-interactive'
                    dangerouslySetInnerHTML={{__html:`let dark=false;const prevDark=localStorage.getItem('dark'),systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches,htmlTag=document.getElementsByTagName('html')[0];htmlTag.style.setProperty('--vh',window.innerHeight/100+'px');htmlTag.style.setProperty('--current-actual-height',window.innerHeight+'px');htmlTag.style.setProperty('--landscape-height',Math.min(window.innerHeight,window.innerWidth)+'px');htmlTag.style.setProperty('--portrait-height',Math.max(window.innerHeight,window.innerWidth)+'px');if(!!prevDark){dark=prevDark==='true';if(dark===systemDark){localStorage.removeItem('dark')}}else{dark=systemDark}if(dark){htmlTag.dataset.theme='dark'}else{htmlTag.dataset.theme='light'}if(window.location.pathname==='/'){htmlTag.style.backgroundColor=dark?'#333':'#eee';htmlTag.style.transition='background-color 0.5s'}`}}
                />
                <link rel="icon" type="image/png" sizes="192x192" href="https://cdn.cindyhodev.com/favicon/android-chrome-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="https://cdn.cindyhodev.com/favicon/android-chrome-512x512.png" />
                <link rel="icon" type="image/png" sizes="180x180" href="https://cdn.cindyhodev.com/favicon/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="https://cdn.cindyhodev.com/favicon/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="https://cdn.cindyhodev.com/favicon/favicon-16x16.png" />
                <link rel="icon" sizes="48x48" href="https://cdn.cindyhodev.com/favicon/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

export default Document