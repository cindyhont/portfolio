import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { Context } from '../../context';

class BlurEffect {
    renderer:THREE.WebGLRenderer;
    scene:THREE.Scene;
    dummyCamera:THREE.OrthographicCamera;
    geometry:THREE.BufferGeometry;
    resolution:THREE.Vector2;
    target:THREE.WebGLRenderTarget;
    material:THREE.RawShaderMaterial;
    triangle:THREE.Mesh;
    fbmTexture:THREE.Texture;
    constructor(renderer:THREE.WebGLRenderer, fbmTexture:THREE.Texture){
        this.renderer = renderer;
        this.fbmTexture = fbmTexture;
        this.scene = new THREE.Scene();
        this.dummyCamera = new THREE.OrthographicCamera()
        this.geometry = new THREE.BufferGeometry()

        const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
        this.resolution = new THREE.Vector2()

        this.renderer.getDrawingBufferSize(this.resolution)

        this.target = new THREE.WebGLRenderTarget(this.resolution.x, this.resolution.y, {
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false
        })

        this.material = new THREE.RawShaderMaterial({
            uniforms: {
                uScene: { value: this.target.texture },
                uResolution: { value: this.resolution },
                uFBM:{value:this.fbmTexture},
                row:{value:Math.random()},
            },
            vertexShader:`
                precision mediump float;
                attribute vec2 position;
                
                void main(){
                    gl_Position = vec4(position, 1.0, 1.0);
                }
            `,
            fragmentShader:`
                precision lowp float;
                
                // https://iquilezles.org/articles/gamma/

                uniform sampler2D uScene, uFBM;
                uniform vec2 uResolution;
                uniform float row;

                void main(){
                    vec2 uv = gl_FragCoord.xy / uResolution.xy;

                    float hillHeight = texture2D(uFBM,vec2(uv.x,row)).x * 0.3;

                    if (uv.y < hillHeight) discard;
                    else {
                        vec4 color;

                        if (uv.y > 0.4){
                            vec4 tot;
                            for (int i=0; i<21; i++){
                                vec2 st = ( gl_FragCoord.xy + vec2(i - 11,0.) ) / uResolution.xy;
                                vec4 co = texture2D( uScene, st );
                                tot += pow(co,vec4(2.2));
                            }
                            
                            color = pow(tot/21.,vec4(1./2.2));
                        } else {
                            vec2 st = gl_FragCoord.xy / uResolution.xy;
                            vec4 co = texture2D( uScene, st );
                            color = pow(pow(co,vec4(2.2)),vec4(1./2.2));
                        }
                        color *= smoothstep( 0.005, 0.006, abs(uv.x-1.01) );
                        color *= smoothstep( 0.005, 0.0, uv.x-2.0 );
                        color *= smoothstep( 0.005, 0.0, uv.y-1.0 );

                        color.xyz = mix(vec3(0.7),color.xyz,pow(clamp((uv.y - hillHeight) * 30.,0.,1.),0.1));
    
                        gl_FragColor = color;
                    }
                }
            `,
            transparent:true,
        })

        this.triangle = new THREE.Mesh(this.geometry, this.material)
        this.triangle.frustumCulled = false
        this.scene.add(this.triangle)
    }

    render(scene:THREE.Scene, camera:THREE.Camera) {
        this.renderer.setRenderTarget(this.target)
        this.renderer.render(scene, camera)
        this.renderer.setRenderTarget(null)
        this.renderer.render(this.scene, this.dummyCamera)
    }
}

const 
    Blur = () => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            { gl, scene, camera, invalidate } = useThree(),
            {isSafari} = useContext(Context),
            fbmTexture = useMemo(()=>new THREE.TextureLoader().load('/fog.jpg'),[]),
            renderer = new BlurEffect(gl, fbmTexture),
            windowVisible = useRef(true),
            inRange = useRef(false),
            windowIsHidden = () => {
                if (!safariRender.current) return
                windowVisible.current = false
            },
            windowIsVisible = () => {
                if (!safariRender.current) return
                windowVisible.current = true;
                invalidate();
            },
            isInRange = () => {
                if (!safariRender.current) return
                inRange.current = true
                invalidate()
            },
            notInRange = () => {
                if (!safariRender.current) return
                inRange.current = false
            },
            modalOn = useRef(false),
            modalStatusOnChange = (e:CustomEvent) => {
                if (!safariRender.current) return
                modalOn.current = e.detail
                if (!e.detail && safariRender.current) invalidate()
            },
            safariRender = useRef(true)

        useEffect(()=>{
            const 
                triggerAnimate = ScrollTrigger.create({
                    trigger:'#aurora-container',
                    start:`top 0%`,
                    end:'bottom 0%',
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                }),
                container = document.getElementById('aurora-container')

            container.addEventListener('modal',modalStatusOnChange)
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)

            return () => {
                triggerAnimate.kill()
                container.removeEventListener('modal',modalStatusOnChange)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        return useFrame(() => {
            if (safariRender.current && windowVisible.current && inRange.current && !modalOn.current) renderer.render(scene, camera)
            if (windowVisible.current && inRange.current && !modalOn.current && isSafari) safariRender.current = false
        }, 1)
    },
    Scene = ({pn,tSize}:{pn:Uint8Array;tSize:number;}) => {
        const 
            {isSafari} = useContext(Context),
            invalidate = useThree(state => state.invalidate),
            noise = useMemo(()=>{
                const t = new THREE.DataTexture(pn,tSize,tSize)
                t.needsUpdate = true
                return t
            },[pn]),
            fbmTexture = useMemo(()=>new THREE.TextureLoader().load('/fog.jpg'),[]),
            geometry = useMemo(()=>{
                const 
                    srcGeom = new THREE.PlaneGeometry(30,15,tSize - 1,1),
                    instancedGeom = new THREE.InstancedBufferGeometry().copy(srcGeom),
                    translateX = [
                        -35,
                        -20,
                        -12,
                        -8,
                        -4,
                        -1,
                        1,
                        4,
                        8,
                        12,
                        20,
                        35
                    ],
                    f = translateX.length;

                instancedGeom.instanceCount = f;

                instancedGeom.setAttribute('rotationY',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f).keys(),(i)=>(i > f * 0.5 ? 1 : -1) * Math.PI * ((i === 0 || i === f-1 ? 0.35 : 0.45) + Math.random() * 0.1))),1,false,1));
                instancedGeom.setAttribute('translateX',new THREE.InstancedBufferAttribute(new Float32Array(translateX),1,false,1));
                instancedGeom.setAttribute('r1',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 0.2 + 0.2)),1,false,1))
                instancedGeom.setAttribute('r2',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 0.2 + 0.2)),1,false,1))
                instancedGeom.setAttribute('r3',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 0.1 + 0.3)),1,false,1))
                instancedGeom.setAttribute('r4',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 15 + 3)),1,false,1))
                instancedGeom.setAttribute('r5',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 2 + 3)),1,false,1))
                instancedGeom.setAttribute('r6',new THREE.InstancedBufferAttribute(new Float32Array(Array.from(Array(f),()=>Math.random() * 0.5)),1,false,1))

                return instancedGeom
            },[]),
            material = new THREE.RawShaderMaterial({
                uniforms: {
                    tNoise:{value:noise},
                    uTime:{value:0},
                    fbmTexture:{value:fbmTexture},
                },
                vertexShader:`
                    precision mediump float;
                    attribute vec3 position;
                    attribute vec2 uv;
                    attribute float rotationY, r1, r2, r3, r4, r5, r6, translateX;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform sampler2D tNoise;
                    uniform float uTime;
                    varying vec2 vUv;
                    varying float vTime, vR1, vR2, vR3, vR4, vR5, vR6, diminish;

                    void main(){
                        vUv = uv;
                        vTime = uTime * 0.5;
                        vR1 = r1;
                        vR2 = r2;
                        vR3 = r3;
                        vR4 = r4;
                        vR5 = r5;
                        vR6 = r6;
                        vec3 p = position;
                        p.z = texture2D(tNoise,fract(uv + vec2(r3 + r6,uTime * r2 + r1))).w * 2. - 1.;
                        float c = cos(rotationY);
                        float s = sin(rotationY);
                        p.xz *= mat2(c,-s,s,c);

                        float f = -0.3;
                        c = cos(f);
                        s = sin(f);
                        p.yz *= mat2(c,-s,s,c);

                        diminish = smoothstep(0.,1.,(p.z + 25.) / 2.);
                        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p + vec3(translateX,8.,-10.),1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform sampler2D fbmTexture;
                    varying vec2 vUv;
                    varying float vTime, vR1, vR2, vR3, vR4, vR5, vR6, diminish;

                    void main(){
                        float strength = texture2D(fbmTexture,fract(vec2(vUv.x,vTime + vR1))).x 
                                * texture2D(fbmTexture,fract(vec2(vTime + vR1,vUv.x))).x
                                * texture2D(fbmTexture,fract(vec2(1.-vUv.x,vTime + vR2))).x
                                * min(vUv.y * 20.,exp(-vUv.y * vR5));
                        strength -= 0.05;//-= 0.06;
                        strength *= vR4;//5.;
                        strength *= diminish;
                        vec3 color = mix(vec3(0.,1.,vR6),vec3(1.,0.3,0.8),pow(vUv.y,vR3));
                        gl_FragColor = vec4(color,strength);
                    }
                `,
                side:THREE.DoubleSide,
                transparent:true,
                depthTest:false
            }),
            skyMaterial = new THREE.RawShaderMaterial({
                vertexShader:`
                    precision mediump float;

                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position;
                    varying float darkness;

                    void main() {
                        darkness = smoothstep(-30.0,50.0,position.y);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    varying float darkness;

                    void main(){
                        vec3 color = mix(vec3(0.11,0.14,0.22),vec3(0.042,0.052,0.054),darkness);
                        gl_FragColor = vec4(color,1.);
                    }
                `,
                side:THREE.BackSide
            }),
            sphereGeom = new THREE.SphereGeometry(100,12,12),
            windowVisible = useRef(true),
            inRange = useRef(false),
            windowIsHidden = () => {
                if (!safariRender.current) return
                windowVisible.current = false
            },
            windowIsVisible = () => {
                if (!safariRender.current) return
                windowVisible.current = true;
                invalidate();
            },
            isInRange = () => {
                if (!safariRender.current) return
                inRange.current = true
                invalidate()
            },
            notInRange = () => {
                if (!safariRender.current) return
                inRange.current = false
            },
            modalOn = useRef(false),
            modalStatusOnChange = (e:CustomEvent) => {
                modalOn.current = e.detail
                if (!e.detail && safariRender.current) invalidate()
            },
            safariRender = useRef(true)

        useEffect(()=>{
            const 
                triggerAnimate = ScrollTrigger.create({
                    trigger:'#aurora-container',
                    start:`top 0%`,
                    end:'bottom 0%',
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                }),
                container = document.getElementById('aurora-container')

            container.addEventListener('modal',modalStatusOnChange)
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)

            return () => {
                triggerAnimate.kill()
                container.removeEventListener('modal',modalStatusOnChange)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        useFrame(({invalidate},delta)=>{
            if (safariRender.current && windowVisible.current && inRange.current && !modalOn.current) invalidate();
            material.uniforms.uTime.value += delta * 0.1
            if (isSafari && !!pn.length) safariRender.current = false
        })

        return (
            <group>
                <mesh args={[geometry,material]} />
                <mesh args={[sphereGeom,skyMaterial]} />
            </group>
        )
    },
    Background = () => {
        const 
            pnSpec = useRef({px:512,size:8}).current,
            [pn,setPN] = useState<Uint8Array>(new Uint8Array(4 * pnSpec.px * pnSpec.px))

        useEffect(()=>{
            const worker = new Worker(new URL('../perlin-noise-worker.ts',import.meta.url))
            worker.postMessage(pnSpec)
            worker.addEventListener('message',e=>setPN(e.data.result as Uint8Array))
        },[])

        return (
            <div style={{position:'fixed',height:'100vh',width:'100vw',bottom:'0px',left:'0px'}}>
                <Canvas dpr={1} frameloop='demand'>
                    <Scene {...{pn,tSize:pnSpec.px}} />
                    <Blur />
                </Canvas>
            </div>
        )
    }

export default Background