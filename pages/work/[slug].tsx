import React from "react"
import Head from 'next/head';
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { GetStaticProps, GetStaticPaths } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import ParticleAnimation from "../../src/works/canvas3d/particle-animation"
import ParticleCloud from "../../src/works/canvas3d/particle-cloud"
import ExternalLink from "../../src/works/components/external-link";
import FullScreenAbout from "../../src/works/full-screen-about";
import FpsCounter from "../../src/mainpage/fps-counter";

const 
  root = join (process.cwd (), 'src', 'works', 'mdx'),
  excerptSeparator = '<!-- excerpt end -->'

export const getStaticPaths:GetStaticPaths = () => {
  const listing = fs.readdirSync(root)
  return {
    paths:listing.map(e=>({params:{slug:e.replace('.mdx','')}})),
    fallback:false
  }
}

export const getStaticProps:GetStaticProps = async({params}) => {
  const 
    buf = fs.readFileSync(join(root,[params.slug as string,'.mdx'].join(''))),
    m = matter(buf,{excerpt_separator: excerptSeparator}),
    data = m.data

  let content = m.content

  if (content.includes(excerptSeparator)){
    content = content.slice(content.indexOf(excerptSeparator) + excerptSeparator.length)
  }

  const mdxSource = await serialize(content)

  return {
    props:{
      data:{
        ...data,
        content:mdxSource
      }
    }
  }
}

const 
  components = {
    ParticleAnimation,
    ParticleCloud,
    FullScreenAbout,
    ExternalLink,
    FpsCounter
  },
  PageTemplate = ({data}:{data:any}) => (
    <>
    <Head>
      <title>{`${data.title} - Portfolio - Cindy Ho`}</title>
      <link rel="canonical" href={`https://cindyhodev.com/work/${data.slug}`} />
    </Head>
    <MDXRemote {...data.content} components={components} />
    </>
  )

export default PageTemplate;