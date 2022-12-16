import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => {
    return (
        <Html style={{backgroundColor:'#000'}} lang="en">
            <Head>
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