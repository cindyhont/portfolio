import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera'
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { RawShaderMaterial } from 'three/src/materials/RawShaderMaterial'
import { Vector2 } from 'three/src/math/Vector2'
import { Texture } from 'three/src/textures/Texture'
import { cdnPrefix } from '../../../common'
import { useEventListeners, useLoadThreejs } from '../../../hooks'
import styles from '../styles/IndividualWork.module.scss'

const 
    Scene = ({imgPaths,id}:{imgPaths:string[];id:string}) => {
        const 
            geometry = useThree(e=>{
                const aspect = e.viewport.aspect
                if (isNaN(aspect)) return new PlaneGeometry()

                const
                    camera = e.camera as PerspectiveCamera,
                    fovInRad = camera.fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * camera.position.z * 2,
                    width = height * aspect

                return new PlaneGeometry(width,height,1,1)
            }),
            setFrameloop = useThree(e=>e.setFrameloop),
            setDpr = useThree(e=>e.setDpr),
            invalidate = useThree(e=>e.invalidate),
            textureLoader = useRef(new TextureLoader()).current,
            waterDuDv = useMemo(()=>textureLoader.load(cdnPrefix() + '/waterdudv.jpg'),[]),
            textureSpecs = useRef<{
                texture:Texture;
                offset:Vector2;
                repeat:Vector2;
            }[]>([]),
            blankTextureSpecs = useRef(Array(2).fill({
                texture:new Texture(),
                offset:new Vector2(),
                repeat:new Vector2(),
            })).current,
            aspect = useThree(e=>e.viewport.aspect),
            getTextureSpecs = async () => {
                const 
                    getSpec = (e:string) => new Promise<{
                        texture:Texture;
                        offset:Vector2;
                        repeat:Vector2;
                    }>(resolve=>{
                        textureLoader.load(e,texture=>{
                            const 
                                imageRatio = texture.image.width / texture.image.height,
                                offset = new Vector2(),
                                repeat = new Vector2()

                            if (imageRatio < aspect){
                                offset.set((1 - aspect / imageRatio) / 2, 0)
                                repeat.set(aspect / imageRatio, 1)
                            } else if (imageRatio > aspect){
                                offset.set(0, (1 - imageRatio / aspect) / 2)
                                repeat.set(1, imageRatio / aspect)
                            } else {
                                offset.set(0, 0)
                                repeat.set(1, 1)
                            }

                            resolve({texture,repeat,offset})
                        })
                    })
                textureSpecs.current = await Promise.all(imgPaths.map(e=>getSpec(`${cdnPrefix()}/${e}`)))
                invalidate()
            },
            material = new RawShaderMaterial({
                uniforms:{
                    textureSets:{value:blankTextureSpecs},
                    waterDuDv:{value:waterDuDv},
                    aspect:{value:aspect || 1},
                    progress:{value:0},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position;
                    attribute vec2 uv;
                    varying vec2 vUv;
            
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader:`
                    precision lowp float;

                    struct TextureSet {
                        sampler2D texture;
                        vec2 offset, repeat;
                    };
            
                    uniform TextureSet textureSets[2];
                    uniform sampler2D waterDuDv;
                    uniform float aspect, progress;
                    varying vec2 vUv;

                    void main(){
                        float du;
                        if (aspect > 1.) du = texture2D(waterDuDv,vec2(fract(vUv.x * aspect),vUv.y)).x * 0.2;
                        else du = texture2D(waterDuDv,vec2(vUv.x,fract(vUv.y * aspect))).x * 0.2;

                        float duA = du * textureSets[0].repeat.x;
                        float duB = du * textureSets[1].repeat.x;

                        float e = smoothstep(0.,1.,progress);
                        float e1 = 1. - e;

                        vec2 uvA = vUv * textureSets[0].repeat + textureSets[0].offset + vec2(e * duA, 0.);
                        vec2 uvB = vUv * textureSets[1].repeat + textureSets[1].offset - vec2(e1 * duB, 0.);

                        vec3 imgA = texture2D( textureSets[0].texture, uvA ).xyz;
                        vec3 imgB = texture2D( textureSets[1].texture, uvB ).xyz;

                        gl_FragColor = vec4(mix(imgA,imgB,e),1.);
                    }
                `,
            }),
            direction = useRef(0),
            progress = useRef(0),
            imgIdx = useRef(0),
            buttonOnClick = (e:CustomEvent) => {
                const dir = e.detail as 1|-1
                if (!!progress.current && dir === direction.current){
                    if (dir===1) {
                        progress.current = 0
                        imgIdx.current = (imgIdx.current + 1) % imgPaths .length
                    } else {
                        progress.current = 1
                        imgIdx.current = (imgPaths .length + imgIdx.current - 1) % imgPaths .length
                    }
                } else if (!progress.current && dir === -1) {
                    progress.current = 1
                    imgIdx.current = (imgPaths .length + imgIdx.current - 1) % imgPaths .length
                }
                direction.current = dir
                invalidate()
            }

        useFrame(({invalidate},delta)=>{
            if (direction.current !== 0){
                progress.current += Math.min(delta,0.03333) * 1.5 * direction.current
                if (progress.current < 0 || progress.current > 1){
                    if (progress.current > 1) imgIdx.current = (imgIdx.current + 1) % imgPaths .length
                    progress.current = 0
                    direction.current = 0
                }
            }
            const secondImgIdx = (imgIdx.current + 1) % imgPaths .length
            if (!!textureSpecs.current.length && !!textureSpecs.current[imgIdx.current] && !!textureSpecs.current[secondImgIdx]) {
                material.uniforms.progress.value = progress.current
                material.uniforms.textureSets.value = [
                    textureSpecs.current[imgIdx.current],
                    textureSpecs.current[secondImgIdx],
                ]
            }
            
            if (direction.current !== 0) invalidate()
        })

        useEffect(()=>{
            setFrameloop('demand')
            setDpr(Math.min(2,Math.floor(devicePixelRatio)))
        },[])

        useEventListeners([
            {elem:document.getElementById(id),evt:'swipe',func:buttonOnClick},
        ])

        useEffect(()=>{
            if (!isNaN(aspect)) getTextureSpecs()
        },[aspect])

        return (
            <mesh args={[geometry, material]} />
        )
    },
    WebglSlider = ({imgPaths,id}:{imgPaths:string[];id:string}) => {
        const 
            container = useRef<HTMLDivElement>(),
            canvasRef = useRef<HTMLCanvasElement>()

            useLoadThreejs(
                container.current,
                canvasRef.current,
                <Scene {...{imgPaths,id}} />,
            )

        return (
            <div ref={container} className={styles['canvas-container']}>
                <canvas ref={canvasRef} />
            </div>
        )
    }

export default WebglSlider