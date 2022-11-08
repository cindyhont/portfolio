import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => {
    return (
        <Html style={{backgroundColor:'#000'}}>
            <Head>
                <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/favicon/android-chrome-512x512.png" />
                <link rel="icon" type="image/png" sizes="180x180" href="/favicon/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
                <link rel="icon" sizes="48x48" href="/favicon/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

export default Document