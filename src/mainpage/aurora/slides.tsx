import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import * as THREE from 'three';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { Context, IndexContext } from '../../context';
import { closeAllModals } from '../../common';

const 
    mix = (x:number,y:number,a:number) => x*(1-a)+y*a,
    heightMapFS = `
        uniform bool cursorMoving;
        uniform vec2 cursorCoord, cellSize;

        #define CURSOR_R 2.0
        #define VISCOSITY 0.9

        void main(){
            vec2 uv = gl_FragCoord.xy * cellSize;
            vec2 prevHeightMapXY = texture2D( heightMap, uv ).xy;

            float north = texture2D( heightMap, uv + vec2( 0.0, cellSize.y ) ).x;
            float south = texture2D( heightMap, uv + vec2( 0.0, - cellSize.y ) ).x;
            float east = texture2D( heightMap, uv + vec2( cellSize.x, 0.0 ) ).x;
            float west = texture2D( heightMap, uv + vec2( - cellSize.x, 0.0 ) ).x;

            float newHeight = ( ( north + south + east + west ) * 0.5 - prevHeightMapXY.y ) * VISCOSITY;

            if (cursorMoving){
                float dCursor = distance(cursorCoord,gl_FragCoord.xy);
                if (dCursor < CURSOR_R) newHeight = (CURSOR_R - dCursor) / CURSOR_R;
            }

            gl_FragColor = vec4(newHeight, prevHeightMapXY.x, 0., 0.);
        }
    `,
    SceneWithRipple = (
        {
            imageIdList,
            start,
            end
        }:{
            imageIdList:{img:string;id:string}[];
            start:number;
            end:number;
        }
    ) => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            slideSize = useThree(state=>{
                const 
                    {camera:{position},size} = state,
                    fov = (state.camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * position.z * 2
                
                return new THREE.Vector2(
                    Math.min(size.width *0.8,400),
                    Math.min(size.height * 0.8,400)
                ).multiplyScalar(height / size.height)
            }),
            scrHeight = useThree(state => state.size.height),
            slideResolution = useThree(state => new THREE.Vector2(Math.min(state.size.width *0.8,400),Math.min(state.size.height * 0.8,400))),
            currOffset = useRef(0),
            prevOffset = useRef(0),
            extent = useRef(0),
            groupRef = useRef<THREE.Group>(),
            hoverSlide = useRef(-1),
            hoverCoord = useRef(new THREE.Vector2()),
            srcMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                    uExtent:{value:0},
                    uSize:{value:new THREE.Vector2()},
                    uMap:{value:null},
                    offset:{value:new THREE.Vector2()},
                    repeat:{value:new THREE.Vector2()},
                    uTime:{value:0},
                    heightMap:{value:null},
                    cellSize:{value:new THREE.Vector2(1,1).divide(slideResolution)}
                },
                vertexShader:`
                    precision mediump float;

                    attribute vec3 position;
                    attribute vec2 uv;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform vec2 uSize;
                    uniform float uExtent, uTime;
                    varying vec2 vUv, vExtent;

                    void main(){
                        vUv = uv;
                        vExtent = vec2(uExtent * cos(uTime),0.);

                        vec3 p = position;
                        float uvY = uv.y - 0.5;
                        p.x += uExtent * (1. - 4. * uvY * uvY) * uSize.x;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform sampler2D uMap, heightMap;
                    uniform vec2 offset, repeat, cellSize;
                    varying vec2 vUv, vExtent;

                    #define REFRACTION 0.9

                    void main(){
                        float eastHeight = texture2D( heightMap, vUv + vec2(cellSize.x,0.) ).x;
                        float northHeight = texture2D( heightMap, vUv + vec2(0.,cellSize.y) ).x;

                        // vUv * repeat + offset = position of image
                        vec2 uv = fract(vUv * repeat + offset + vec2(eastHeight,northHeight) * REFRACTION);

                        float r = texture2D( uMap, uv + vExtent).r;
                        float g = texture2D( uMap, uv).g;
                        float b = texture2D( uMap, uv - vExtent).b;

                        gl_FragColor = vec4(r,g,b,1.);
                    }
                `,
                transparent:true,
            }),
            textures = useMemo(()=>{
                const textureLoader = new THREE.TextureLoader()
                return imageIdList.map(e=>textureLoader.load(`/${e.img}`))
            },[]),
            texturesOK = useRef(false),

            meshes = useMemo(()=>{
                let result:THREE.Mesh[] = []

                const 
                    len = imageIdList.length,
                    srcGeometry = new THREE.PlaneGeometry(slideSize.x,slideSize.y,1,64),
                    meshRatio = slideSize.x / slideSize.y;

                for (let i = 0; i < len; i++){
                    const 
                        texture = textures[i],
                        material = srcMaterial.clone(),
                        geometry = srcGeometry.clone()

                    material.uniforms.heightMap.value = null
                    material.uniforms.uMap.value = texture;
                    material.uniforms.uSize.value = slideSize;

                    if (!!texture.image){
                        const imageRatio = texture.image.width / texture.image.height;
                        if (imageRatio > meshRatio){
                            material.uniforms.offset.value = new THREE.Vector2((1 - meshRatio / imageRatio) / 2, 0);
                            material.uniforms.repeat.value = new THREE.Vector2(meshRatio / imageRatio, 1);
                        } else if (imageRatio < meshRatio){
                            material.uniforms.offset.value = new THREE.Vector2(0, (1 - imageRatio / meshRatio) / 2);
                            material.uniforms.repeat.value = new THREE.Vector2(1, imageRatio / meshRatio);
                        } else {
                            material.uniforms.offset.value = new THREE.Vector2(0, 0);
                            material.uniforms.repeat.value = new THREE.Vector2(1, 1);
                        }
                    }
                    
                    const mesh = new THREE.Mesh(geometry,material);
                    mesh.position.x = i === 0 ? 0 : i * 1.5 * slideSize.x;
                    mesh.name = imageIdList[i].id

                    result.push(mesh)
                }

                return result
            },[slideSize]),
            gl = useThree(state => state.gl),
            heightMapPxMultiplier = useRef(0.5).current,
            getGpuTextureSize = (e:number) => Math.floor(e * heightMapPxMultiplier),
            gpuCompute = useMemo(()=>new GPUComputationRenderer( getGpuTextureSize(slideResolution.x), getGpuTextureSize(slideResolution.y), gl ),[slideResolution]),
            heightMapVariables = useMemo(()=>{
                const len = imageIdList.length
                let result:Variable[] = []
                for (let i = 0; i < len; i++){
                    const 
                        heightMap = gpuCompute.createTexture(),
                        heightMapVariable = gpuCompute.addVariable( 'heightMap', heightMapFS, heightMap )

                    heightMapVariable.material.uniforms.cellSize = {value:new THREE.Vector2(1 / getGpuTextureSize(slideResolution.x),1 / getGpuTextureSize(slideResolution.y))}
                    heightMapVariable.material.uniforms.cursorCoord = {value:new THREE.Vector2()}
                    heightMapVariable.material.uniforms.cursorMoving = {value:false}

                    gpuCompute.setVariableDependencies( heightMapVariable, [ heightMapVariable ] );

                    result.push(heightMapVariable)
                }
                return result
            },[gpuCompute]),
            updateMeshesTextures = () => {
                const len = imageIdList.length
                for (let i = 0; i < len; i++){
                    const 
                        texture = textures[i],
                        meshRatio = slideSize.x / slideSize.y,
                        imageRatio = texture.image.width / texture.image.height,
                        m = meshes[i].material as THREE.RawShaderMaterial
                    if (imageRatio > meshRatio){
                        m.uniforms.offset.value = new THREE.Vector2((1 - meshRatio / imageRatio) / 2, 0);
                        m.uniforms.repeat.value = new THREE.Vector2(meshRatio / imageRatio, 1);
                    } else if (imageRatio < meshRatio){
                        m.uniforms.offset.value = new THREE.Vector2(0, (1 - imageRatio / meshRatio) / 2);
                        m.uniforms.repeat.value = new THREE.Vector2(1, imageRatio / meshRatio);
                    } else {
                        m.uniforms.offset.value = new THREE.Vector2(0, 0);
                        m.uniforms.repeat.value = new THREE.Vector2(1, 1);
                    }
                }
                texturesOK.current = true
            },
            onClick = (e:ThreeEvent<PointerEvent>) => document.getElementById(e.intersections[0].object.name)?.click(),
            onPointerMove = (e:ThreeEvent<PointerEvent>) => {
                document.body.style.cursor = "pointer"

                const  
                    intersection = e.intersections[0],
                    slideName = intersection.object.name
                hoverSlide.current = imageIdList.findIndex(f=>f.id===slideName)
                hoverCoord.current.copy(intersection.uv.multiply(slideResolution).multiplyScalar(heightMapPxMultiplier))
            },
            onPointerLeave = () => document.body.style.cursor = "default",
            onScroll = () => currOffset.current = window.pageYOffset,
            invalidate = useThree(state => state.invalidate),
            windowVisible = useRef(true),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                hoverSlide.current = -1
                extent.current = 0
                invalidate();
            },
            inRange = useRef(false),
            isInRange = () => {
                inRange.current = true
                extent.current = 0
                invalidate()
            },
            notInRange = () => {
                inRange.current = false
                extent.current = 0
            },
            modalOn = useRef(false),
            modalStatusOnChange = (e:CustomEvent) => {
                modalOn.current = e.detail
                if (!e.detail) invalidate()
            }

        var error = gpuCompute.init();

        if ( error !== null ) {
            console.error( error );
        }

        useEffect(()=>{
            const container = document.getElementById('aurora-container')
            container.addEventListener('modal',modalStatusOnChange)
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)
            
            return () => {
                container.removeEventListener('modal',modalStatusOnChange)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        useEffect(()=>{
            const 
                triggerFade = ScrollTrigger.create({
                    animation:gsap.to(groupRef.current.position,{x:-1.5 * slideSize.x * (imageIdList.length - 1)}),
                    trigger:document.body,
                    start:`top -${start}%`,
                    end:`top -${end}%`,
                    scrub:true,
                    onUpdate:onScroll,
                }),
                triggerAnimate = ScrollTrigger.create({
                    trigger:document.body,
                    start:`top -${start - 100}%`,
                    end:`top -${end + 100}%`,
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                })
            return () => {
                triggerFade.kill()
                triggerAnimate.kill()
            }
        },[slideSize])

        useFrame(({invalidate},delta)=>{
            if (windowVisible.current && inRange.current && !modalOn.current) invalidate();
            if (!texturesOK.current && textures.every(e=>!!e.image)) updateMeshesTextures()

            // ripples
            const len = heightMapVariables.length
            for (let i=0; i<len; i++){
                heightMapVariables[i].material.uniforms.cursorMoving.value = hoverSlide.current === i
                heightMapVariables[i].material.uniforms.cursorCoord.value = hoverCoord.current
            }
            gpuCompute.compute();

            if (currOffset.current !== prevOffset.current){
                const a = Math.max(Math.min((prevOffset.current - currOffset.current) / scrHeight,0.05),-0.05)
                if (
                    Math.abs(a) > Math.abs(extent.current) && Math.sign(a) === Math.sign(extent.current) 
                    || Math.sign(a) !== Math.sign(extent.current)
                ) extent.current = a

                prevOffset.current = currOffset.current
            }

            meshes.forEach((m,i)=>{
                const material = m.material as THREE.RawShaderMaterial
                material.uniforms.uExtent.value = extent.current;
                material.uniforms.uTime.value += delta * 200;
                material.uniforms.cellSize.value = new THREE.Vector2(1,1).divide(slideResolution)
                material.uniforms.heightMap.value = gpuCompute.getCurrentRenderTarget( heightMapVariables[i] ).texture;
            })
            
            extent.current = mix(extent.current,0,delta * 10)

            hoverSlide.current = -1
        })

        return (
            <group ref={groupRef}>
                {meshes.map((i,j)=>(
                    <primitive 
                        object={i} 
                        key={j} 
                        onClick={onClick}
                        onPointerMove={onPointerMove}
                        onPointerLeave={onPointerLeave}
                    />
                ))}
            </group>
        )
    },
    SceneNoRipple = (
        {
            imageIdList,
            start,
            end
        }:{
            imageIdList:{img:string;id:string}[];
            start:number;
            end:number;
        }
    ) => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            slideSize = useThree(state=>{
                const 
                    {camera:{position},size} = state,
                    fov = (state.camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * position.z * 2
                
                return new THREE.Vector2(
                    Math.min(size.width *0.8,400),
                    Math.min(size.height * 0.8,400)
                ).multiplyScalar(height / size.height)
            }),
            scrHeight = useThree(state => state.size.height),
            slideResolution = useThree(state => new THREE.Vector2(Math.min(state.size.width *0.8,400),Math.min(state.size.height * 0.8,400))),
            currOffset = useRef(0),
            prevOffset = useRef(0),
            extent = useRef(0),
            groupRef = useRef<THREE.Group>(),
            hoverSlide = useRef(-1),
            srcMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                    uExtent:{value:0},
                    uSize:{value:new THREE.Vector2()},
                    uMap:{value:null},
                    offset:{value:new THREE.Vector2()},
                    repeat:{value:new THREE.Vector2()},
                    uTime:{value:0},
                },
                vertexShader:`
                    precision mediump float;

                    attribute vec3 position;
                    attribute vec2 uv;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform vec2 uSize;
                    uniform float uExtent, uTime;
                    varying vec2 vUv, vExtent;

                    void main(){
                        vUv = uv;
                        vExtent = vec2(uExtent * cos(uTime),0.);

                        vec3 p = position;
                        float uvY = uv.y - 0.5;
                        p.x += uExtent * (1. - 4. * uvY * uvY) * uSize.x;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform sampler2D uMap;
                    uniform vec2 offset, repeat;
                    varying vec2 vUv, vExtent;

                    #define REFRACTION 0.9

                    void main(){
                        vec2 uv = vUv * repeat + offset;

                        float r = texture2D( uMap, uv + vExtent).r;
                        float g = texture2D( uMap, uv).g;
                        float b = texture2D( uMap, uv - vExtent).b;

                        gl_FragColor = vec4(r,g,b,1.);
                    }
                `,
                transparent:true,
            }),
            textures = useMemo(()=>{
                const textureLoader = new THREE.TextureLoader()
                return imageIdList.map(e=>textureLoader.load(`/${e.img}`))
            },[]),
            texturesOK = useRef(false),

            meshes = useMemo(()=>{
                let result:THREE.Mesh[] = []

                const 
                    len = imageIdList.length,
                    srcGeometry = new THREE.PlaneGeometry(slideSize.x,slideSize.y,1,64),
                    meshRatio = slideSize.x / slideSize.y;

                for (let i = 0; i < len; i++){
                    const 
                        texture = textures[i],
                        material = srcMaterial.clone(),
                        geometry = srcGeometry.clone()

                    material.uniforms.uMap.value = texture;
                    material.uniforms.uSize.value = slideSize;

                    if (!!texture.image){
                        const imageRatio = texture.image.width / texture.image.height;
                        if (imageRatio > meshRatio){
                            material.uniforms.offset.value = new THREE.Vector2((1 - meshRatio / imageRatio) / 2, 0);
                            material.uniforms.repeat.value = new THREE.Vector2(meshRatio / imageRatio, 1);
                        } else if (imageRatio < meshRatio){
                            material.uniforms.offset.value = new THREE.Vector2(0, (1 - imageRatio / meshRatio) / 2);
                            material.uniforms.repeat.value = new THREE.Vector2(1, imageRatio / meshRatio);
                        } else {
                            material.uniforms.offset.value = new THREE.Vector2(0, 0);
                            material.uniforms.repeat.value = new THREE.Vector2(1, 1);
                        }
                    }
                    
                    const mesh = new THREE.Mesh(geometry,material);
                    mesh.position.x = i === 0 ? 0 : i * 1.5 * slideSize.x;
                    mesh.name = imageIdList[i].id

                    result.push(mesh)
                }

                return result
            },[slideSize]),
            updateMeshesTextures = () => {
                const len = imageIdList.length
                for (let i = 0; i < len; i++){
                    const 
                        texture = textures[i],
                        meshRatio = slideSize.x / slideSize.y,
                        imageRatio = texture.image.width / texture.image.height,
                        m = meshes[i].material as THREE.RawShaderMaterial
                    if (imageRatio > meshRatio){
                        m.uniforms.offset.value = new THREE.Vector2((1 - meshRatio / imageRatio) / 2, 0);
                        m.uniforms.repeat.value = new THREE.Vector2(meshRatio / imageRatio, 1);
                    } else if (imageRatio < meshRatio){
                        m.uniforms.offset.value = new THREE.Vector2(0, (1 - imageRatio / meshRatio) / 2);
                        m.uniforms.repeat.value = new THREE.Vector2(1, imageRatio / meshRatio);
                    } else {
                        m.uniforms.offset.value = new THREE.Vector2(0, 0);
                        m.uniforms.repeat.value = new THREE.Vector2(1, 1);
                    }
                }
                texturesOK.current = true
            },
            onClick = (e:ThreeEvent<PointerEvent>) => document.getElementById(e.intersections[0].object.name)?.click(),
            onPointerMove = (e:ThreeEvent<PointerEvent>) => document.body.style.cursor = "pointer",
            onPointerLeave = () => document.body.style.cursor = "default",
            onScroll = () => currOffset.current = window.pageYOffset,
            invalidate = useThree(state => state.invalidate),
            windowVisible = useRef(true),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                hoverSlide.current = -1
                extent.current = 0
                invalidate();
            },
            inRange = useRef(false),
            isInRange = () => {
                inRange.current = true
                extent.current = 0
                invalidate()
            },
            notInRange = () => {
                inRange.current = false
                extent.current = 0
            },
            modalOn = useRef(false),
            modalStatusOnChange = (e:CustomEvent) => {
                modalOn.current = e.detail
                if (!e.detail) invalidate()
            }

        useEffect(()=>{
            const container = document.getElementById('aurora-container')
            container.addEventListener('modal',modalStatusOnChange)
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)
            
            return () => {
                container.removeEventListener('modal',modalStatusOnChange)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        useEffect(()=>{
            const 
                triggerFade = ScrollTrigger.create({
                    animation:gsap.to(groupRef.current.position,{x:-1.5 * slideSize.x * (imageIdList.length - 1)}),
                    trigger:document.body,
                    start:`top -${start}%`,
                    end:`top -${end}%`,
                    scrub:true,
                    onUpdate:onScroll,
                }),
                triggerAnimate = ScrollTrigger.create({
                    trigger:document.body,
                    start:`top -${start - 100}%`,
                    end:`top -${end + 100}%`,
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                })
            return () => {
                triggerFade.kill()
                triggerAnimate.kill()
            }
        },[slideSize])

        useFrame(({invalidate},delta)=>{
            if (windowVisible.current && inRange.current && !modalOn.current) invalidate();
            if (!texturesOK.current && textures.every(e=>!!e.image)) updateMeshesTextures()

            if (currOffset.current !== prevOffset.current){
                const a = Math.max(Math.min((prevOffset.current - currOffset.current) / scrHeight,0.05),-0.05)
                if (
                    Math.abs(a) > Math.abs(extent.current) && Math.sign(a) === Math.sign(extent.current) 
                    || Math.sign(a) !== Math.sign(extent.current)
                ) extent.current = a

                prevOffset.current = currOffset.current
            }

            meshes.forEach((m,i)=>{
                const material = m.material as THREE.RawShaderMaterial
                material.uniforms.uExtent.value = extent.current;
                material.uniforms.uTime.value += delta * 200;
            })
            
            extent.current = mix(extent.current,0,delta * 10)

            hoverSlide.current = -1
        })

        return (
            <group ref={groupRef}>
                {meshes.map((i,j)=>(
                    <primitive 
                        object={i} 
                        key={j} 
                        onClick={onClick}
                        onPointerMove={onPointerMove}
                        onPointerLeave={onPointerLeave}
                    />
                ))}
            </group>
        )
    },
    Slides = (
        {
            start,
            end
        }:{
            start:number;
            end:number;
        }
    ) => {
        gsap.registerPlugin(ScrollTrigger);
        const 
            {works} = useContext(IndexContext),
            imageIdList = works.map(e=>({img:e.img,id:e.slug})),
            canvasRef = useRef(),
            transitionDuration = 100 / (end - start),
            fullOpacityDuration = 1 - transitionDuration * 2

        useEffect(()=>{
            gsap.timeline({
                scrollTrigger:{
                    trigger:'#aurora-container',
                    start:`top -${start}%`,
                    end:`top -${end}%`,
                    scrub:true,
                    onLeaveBack:closeAllModals,
                    onLeave:closeAllModals,
                }
            })
            .from(canvasRef.current,{
                autoAlpha:0,
                duration:transitionDuration
            })
            .to(canvasRef.current,{
                autoAlpha:1,
                duration:fullOpacityDuration
            })
            .to(canvasRef.current,{
                autoAlpha:0,
                duration:transitionDuration
            })
        },[])
            
        return (
            <div ref={canvasRef}>
                <Context.Consumer>{({devicePixelRatio,mobile,isSafari})=>
                    <Canvas dpr={devicePixelRatio} style={{position:'absolute'}} frameloop='demand'>
                        {(mobile || isSafari) 
                        ? <SceneNoRipple imageIdList={imageIdList} start={start+200} end={end} />
                        : <SceneWithRipple imageIdList={imageIdList} start={start+200} end={end} />}
                    </Canvas>
                }</Context.Consumer>
            </div>
        )
    }

export default Slides;