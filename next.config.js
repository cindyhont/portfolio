const 
  path = require('path'),
  withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      // If you use remark-gfm, you'll need to use next.config.mjs
      // as the package is ESM only
      // https://github.com/remarkjs/remark-gfm#install
      remarkPlugins: [],
      rehypePlugins: [],
      // If you use `MDXProvider`, uncomment the following line.
      providerImportSource: "@mdx-js/react",
    },
  })
  module.exports = withMDX({
    // Append the default value with md extensions
    pageExtensions: ['tsx','ts','js','mdx'],
    images: {
      formats: ['image/avif', 'image/webp'],
      unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**.cindyhodev.com',
        },
      ],
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
      prependData: `@import "-vars.scss";`,
    },
    ...(process.env.NEXT_PUBLIC_NODE_ENV === 'production' && {assetPrefix:'https://cdn.cindyhodev.com'}),
  })