import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import React, { useEffect, useMemo, useRef } from 'react';
import {Context} from '../../context';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const 
    moonMaterialMaster = new THREE.RawShaderMaterial({
        uniforms:{
            moonTexture:{value:null},
            uOpacity:{value:0},
        },
        vertexShader:`
            precision mediump float;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            attribute vec3 position;
            attribute vec2 uv;
            varying vec2 vUv;

            void main(){
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                vUv = uv;
            }
        `,
        fragmentShader:`
            precision lowp float;
            uniform sampler2D moonTexture;
            uniform float uOpacity;
            varying vec2 vUv;

            void main(){
                float distanceFromCenter = distance(vUv,vec2(0.5));
                float shadeOpacity = smoothstep(0.5,0.45,distanceFromCenter);
                vec4 moonColor = texture2D(moonTexture,vUv * 1.1 -0.05);
                moonColor.a = (moonColor.r + moonColor.g + moonColor.b) / 3.0;
                vec4 finalColor = moonColor + vec4(vec3(shadeOpacity * 0.25),shadeOpacity);
                finalColor.a *= uOpacity;
                gl_FragColor = finalColor;
            }
        `,
        transparent:true,
    }),
    starMaterialMaster = new THREE.RawShaderMaterial({
        uniforms: {
            time:{value:0},
            uOpacity:{value:1}
        },
        vertexShader:`
            precision mediump float;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float time;
            attribute vec3 position;
            attribute float size;
            attribute float start;
            attribute float frequency;
            varying float vOpacity;

            void main(){
                gl_PointSize = size;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                vOpacity = pow(abs(cos(frequency * time + frequency * start)),20.);
            }
        `,
        fragmentShader:`
            precision lowp float;
            uniform float uOpacity;
            varying float vOpacity;

            void main(){
                float distanceFromCenter = distance(vec2(0.5),gl_PointCoord);
                float gradientOpacity = smoothstep(0.5,0.0,distanceFromCenter);
                gl_FragColor = vec4(1.,1.,1.,gradientOpacity * vOpacity * uOpacity);
            }
        `,
        transparent:true,
    }),
    
    Scene = () => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            moonColorMap = useMemo(()=>new THREE.TextureLoader().load('/fullmoon.jpg'),[]),
            waterNormalTexture = useMemo(()=>new THREE.TextureLoader().load('/waternormals.jpg'),[]),
            paperMap = useMemo(()=>new THREE.TextureLoader().load('/paper.png'),[]),
            corkMap = useMemo(()=>new THREE.TextureLoader().load('/cork_color.jpg'),[]),
            waterDuDv = useMemo(()=>new THREE.TextureLoader().load('/waterdudv.jpg'),[]),
            bottleModel = useLoader(GLTFLoader,'bottle.glb',loader=>{
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('/draco/gltf/');
                loader.setDRACOLoader(dracoLoader);
            }),
            bottleMeshes = useMemo(()=>bottleModel.scene.children as THREE.Mesh[],[]),
            bottle = bottleMeshes.find(child=>child.name==='bottle'),
            paper = bottleMeshes.find(child=>child.name==='paper'),
            cork = bottleMeshes.find(child=>child.name==='cork'),
            {size,dpr,aspect,position,fov} = useThree(state=>{
                const 
                    {size,viewport:{dpr,aspect},camera} = state,
                    {position,fov} = camera as THREE.PerspectiveCamera
                return {size,dpr,aspect,position,fov}
            }),
            renderTarget = useMemo(()=>new THREE.WebGLRenderTarget(size.width * dpr,size.height * dpr),[size.width,size.height]),
            seaGeometry = useMemo(()=>{
                const 
                    zBack = -5,
                    maxY = Math.tan(fov * 0.5 * Math.PI / 180) * (position.z - zBack),
                    maxX = maxY * size.width / size.height,
                    geometry = new THREE.PlaneGeometry(maxX * 2,Math.abs(zBack) * 2);
                
                geometry.computeTangents()
                return geometry
            },[size.height,size.width,dpr,fov]),
            moonMaterial = moonMaterialMaster.clone(),
            [moonGeometry,starGeometry] = useMemo(()=>{
                const 
                    fovAngle = fov * 0.5,
                    moonZ = -5,
                    maxY = Math.tan(fovAngle * Math.PI / 180) * Math.abs(position.z - moonZ),
                    maxX = maxY * size.width / size.height,
                    moonY = maxY * 0.5;

                let moonRadius = 0;
                if (size.height > size.width){
                    moonRadius = Math.tan(fovAngle * Math.PI / 180) * Math.abs(position.z - moonZ) * (Math.min(250,size.width * 0.6)/size.height);
                } else {
                    moonRadius = Math.tan(fovAngle * Math.PI / 180) * Math.abs(position.z - moonZ) * Math.min(250,size.height * 0.5) / size.height;
                }
                const moongeometry = new THREE.PlaneGeometry(moonRadius * 2,moonRadius * 2).translate(0,moonY,moonZ);

                // star
                const
                    starGeometry = new THREE.BufferGeometry(),
                    starMinY = -0.5,
                    starCount = Math.floor((maxY * 2 + starMinY) * maxX - Math.pow(moonRadius,2)) * Math.floor(Math.sqrt(size.width * size.height) * 0.015);

                starGeometry.setAttribute(
                    'position',
                    new THREE.BufferAttribute(
                        new Float32Array(Array.from(Array(starCount),()=>{
                            let
                                x = Math.random() * maxX * 2 - maxX,
                                y = Math.random() * maxY * 2 - maxY;

                            while (Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) < moonRadius || y < starMinY - moonY){
                                x = Math.random() * maxX * 2 - maxX;
                                y = Math.random() * maxY * 2 - maxY;
                            }
                            return [x,y+moonY,moonZ];
                        }).flat()),
                        3
                    )
                );

                starGeometry.setAttribute(
                    'size',
                    new THREE.BufferAttribute(
                        new Float32Array(Array.from(Array(starCount),()=>Math.floor(Math.random() * 3 + Math.random() * 3 + 4))),
                        1
                    )
                );

                starGeometry.setAttribute(
                    'start',
                    new THREE.BufferAttribute(
                        new Float32Array(Array.from(Array(starCount),()=>Math.random() * 100)),
                        1
                    )
                );

                starGeometry.setAttribute(
                    'frequency',
                    new THREE.BufferAttribute(
                        new Float32Array(Array.from(Array(starCount),()=>Math.random() * 0.5 + 0.2)),
                        1
                    )
                );

                return [moongeometry,starGeometry];
            },[size.height,size.width,fov]),
            starMaterial = starMaterialMaster.clone(),
            seaMaterial = new THREE.RawShaderMaterial({
                uniforms: {

                    'color': {
                        value: null
                    },
            
                    'tDiffuse': {
                        value: null
                    },
            
                    'textureMatrix': {
                        value: null
                    },
                    normalMap:{value:waterNormalTexture},
                    waterDuDv:{value:waterDuDv},
                    uCameraPos:{value:new THREE.Vector3()},
                    uTime:{value:0},
                    uAspect:{value:1},
                    uWaveReflection:{value:Array.from(Array(4),()=>Math.random() + 0.5)},
                    uWaveSpeed:{value:Array.from(Array(8),()=>Math.random() * 0.5 + 0.8)}
                },
            
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelMatrix;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform mat4 textureMatrix;
                    attribute vec4 tangent;
                    attribute vec3 position;
                    attribute vec2 uv;
                    attribute vec3 normal;
                    varying vec2 varyingUV;
                    varying vec4 vUv;
                    varying mat3 tbn;
                    varying vec3 vPosition;
                    #include <common>
                    #include <logdepthbuf_pars_vertex>
                    void main() {
                        vUv = textureMatrix * vec4( position, 1.0 );
                        varyingUV = uv;
                        vec3 T = normalize(vec3(modelMatrix * tangent));
                        vec3 N = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
                        T = normalize(T - dot(T, N) * N);
                        vec3 B = normalize(cross(N, T));
                        tbn = mat3(T, B, N);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        vPosition = position;
                        #include <logdepthbuf_vertex>
                    }`,
            
                fragmentShader:`
                    precision lowp float;
                    uniform vec3 color, uCameraPos;
                    uniform float uTime, uAspect;
                    uniform sampler2D tDiffuse, waterDuDv, normalMap;
                    uniform float uWaveReflection[4];
                    uniform float uWaveSpeed[8];
                    varying vec2 varyingUV;
                    varying vec4 vUv;
                    varying mat3 tbn;
                    varying vec3 vPosition;
                    #include <logdepthbuf_pars_fragment>

                    #define LIGHT_SPREAD 100.0

                    vec3 getTexture(vec2 uv){
                        return texture2D(normalMap, fract(uv)).rgb*2.0-1.0;
                    }

                    void main() {
                        #include <logdepthbuf_fragment>
                        vec2 dudv = texture2D(normalMap,fract(vec2(varyingUV.x + uTime * 1.5,varyingUV.y - uTime * 0.5))).xy * 2. - 1.;
                        vec4 base = texture2DProj( tDiffuse, vec4(
                            vUv.x + dudv.x * 0.03,
                            vUv.y + dudv.y * 0.03,
                            vUv.z,
                            vUv.w
                        ));

                        vec3 toTopRight = getTexture(vec2(varyingUV.x * uAspect + uTime * uWaveSpeed[0],varyingUV.y + uTime * uWaveSpeed[1]));
                        vec3 toTopLeft = getTexture(vec2(varyingUV.x * uAspect - uTime * uWaveSpeed[2],varyingUV.y + uTime * uWaveSpeed[3]));
                        vec3 toBottomLeft = getTexture(vec2(varyingUV.x - uTime * uWaveSpeed[4],varyingUV.y - uTime * uWaveSpeed[5]));
                        vec3 toBottomRight = getTexture(vec2(varyingUV.x + uTime * uWaveSpeed[6],varyingUV.y - uTime * uWaveSpeed[7]));
                        vec3 normal = normalize(tbn * normalize(
                            toTopRight.rgb * uWaveReflection[0] 
                            + toTopLeft.rgb * uWaveReflection[1] 
                            + toBottomLeft.rgb * uWaveReflection[2] 
                            + toBottomRight.rgb * uWaveReflection[3]
                        ));

                        // moonlight
                        float moonlightStrength = pow(1.-mix(0.,1.,clamp(abs(varyingUV.x - 0.5) * 23. * uAspect,0.,1.)),0.8);

                        // wave reflection
                        float waveReflectionStrength = pow(dot(normal,uCameraPos),2.) * (0.75 + moonlightStrength * 2.3);
                        vec3 seaColor = vec3(0.01,0.054,0.102) + base.rgb * 7. * (varyingUV.y - 0.03);//vec3(0.078,0.122,0.17);
                        vec3 seaReflectLight = vec3(1.,1.,0.985) * 0.35;
                        gl_FragColor = vec4(mix(seaColor,seaReflectLight,waveReflectionStrength + moonlightStrength * 0.03),1.);
                    }
                `,
                depthTest:false,
                side:THREE.DoubleSide
            }),
            bottleScale = useMemo(()=>aspect > 1 ? 2 : 1.5,[aspect]),
            bottlePosition = useRef(new THREE.Vector3(-0.2,-0.5,3.5)).current,
            bottleMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    uLightPosition:{value:Array.from(Array(9),()=>new THREE.Vector3())},
                    uStrength:{value:[0.7,0.7,0.7,0.5,0.1,0.3,0.3,0.1,0.1]},
                    uScale:{value:bottleScale},
                    uTranslate:{value:bottlePosition},
                    uCameraPos:{value:position},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform float uScale;
                    uniform vec3 uTranslate;
                    attribute vec3 position;
                    attribute vec3 normal;
                    varying vec3 vPosition;
                    varying vec3 vNormal;
                    
                    void main() {
                        vPosition = position * uScale + uTranslate;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
                        vNormal = normal;
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform vec3 uLightPosition[9];
                    uniform float uStrength[9];
                    uniform vec3 uCameraPos;
                    uniform mat4 modelMatrix;
                    varying vec3 vPosition;
                    varying vec3 vNormal;

                    #define LIGHT_SPREAD 40.

                    void main(){
                        if ( vPosition.y < -0.5 ) {
                            discard;
                        } 
                        float reflection = 0.;
                        for (int i=0; i<9; i++){
                            vec3 lightDirection = normalize(uLightPosition[i] - vPosition);
                            vec3 viewDirection = normalize(uCameraPos - vPosition);
                            vec3 halfwayDirection = normalize(lightDirection + viewDirection);
                            float spec = pow(max(dot(vNormal, halfwayDirection), 0.), LIGHT_SPREAD);
                            reflection += spec * uStrength[i];
                        }
                        gl_FragColor = mix(vec4(vec3(0.0),0.4),vec4(1.,1.,0.985,0.9),reflection);  
                    }
                `,
                transparent:true,
            }),
            updateScreenSize = () => {
                const 
                    fovAngle = fov * 0.5,
                    moonZ = -5,
                    maxY = Math.tan(fovAngle * Math.PI / 180) * Math.abs(position.z - moonZ),
                    moonY = maxY * 0.5;

                bottleMaterial.uniforms.uLightPosition.value = [
                    new THREE.Vector3(-8,moonY,moonZ),
                    new THREE.Vector3(-4.5,moonY,moonZ),
                    new THREE.Vector3(-2.5,moonY * 1.4,moonZ),
                    new THREE.Vector3(1,moonY,moonZ),
                    new THREE.Vector3(3.7,-moonY,moonZ),
                    new THREE.Vector3(3,-moonY,moonZ),
                    new THREE.Vector3(5,-moonY,moonZ),
                    new THREE.Vector3(0,5,2),
                    new THREE.Vector3(0,3,5),
                ];
            },
            paperMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    paperMap:{value:paperMap},
                    uScale:{value:bottleScale},
                    uTranslate:{value:bottlePosition},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform float uScale;
                    uniform vec3 uTranslate;
                    attribute vec3 position;
                    attribute vec2 uv;
                    attribute vec3 normal;
                    varying vec2 vUv;
                    varying vec3 vNormal;

                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position * uScale + uTranslate, 1.0 );
                        vUv = uv;
                        vNormal = normalize(normal);
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform sampler2D paperMap;
                    varying vec2 vUv;
                    varying vec3 vNormal;

                    void main(){
                        if (vUv.x > 0.3 || vNormal.z > 0.) discard;
                        vec3 texture = texture2D(paperMap,vUv).rgb * (vUv.x + 0.05) * 3.;
                        gl_FragColor = vec4(texture,1.);
                    }
                `,
                side:THREE.DoubleSide,
                depthFunc:THREE.GreaterDepth,
                transparent:true
            }),
            corkMaterial = new THREE.ShaderMaterial({
                uniforms:{
                    colorMap:{value:corkMap},
                    uScale:{value:bottleScale},
                    uTranslate:{value:bottlePosition},
                },
                vertexShader:`
                    uniform float uScale;
                    uniform vec3 uTranslate;
                    varying vec2 vUv;
                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position * uScale + uTranslate, 1.0 );
                        vUv = uv;
                    }
                `,
                fragmentShader:`
                    uniform sampler2D colorMap;
                    varying vec2 vUv;

                    void main(){
                        gl_FragColor = vec4(texture2D( colorMap, vUv).rgb * pow(1.35-vUv.x,3.),1.);
                    }
                `
            }),
            invalidate = useThree(state => state.invalidate),
            windowVisible = useRef(true),
            inRange = useRef(false),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                invalidate();
            },
            isInRange = () => {
                inRange.current = true
                invalidate()
            },
            notInRange = () => {
                inRange.current = false
            }

        moonMaterial.uniforms.moonTexture.value = moonColorMap;
        moonMaterial.uniforms.uOpacity.value = 0.4;

        const 
            rtSceneRef = useRef<THREE.Scene>(), 
            seaMeshRef = useRef<THREE.Mesh>(),
            deltaTotal = useRef(0);

        const reflectorPlane = new THREE.Plane();
        const normal = new THREE.Vector3();
        const reflectorWorldPosition = new THREE.Vector3();
        const cameraWorldPosition = new THREE.Vector3();
        const rotationMatrix = new THREE.Matrix4();
        const lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
        const clipPlane = new THREE.Vector4();

        const view = new THREE.Vector3();
        const target = new THREE.Vector3();
        const q = new THREE.Vector4();

        const textureMatrix = new THREE.Matrix4();
        const virtualCamera = new THREE.PerspectiveCamera();

        seaMaterial.uniforms[ 'tDiffuse' ].value = renderTarget.texture;
        seaMaterial.uniforms[ 'color' ].value = new THREE.Color( 0x7F7F7F );
        seaMaterial.uniforms[ 'textureMatrix' ].value = textureMatrix;

        useEffect(()=>{
            const triggerAnimate = ScrollTrigger.create({
                trigger:'#bottle-container',
                start:`top 0%`,
                end:`top -200%`,
                scrub:true,
                onEnter:isInRange,
                onLeaveBack:notInRange,
            })
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)

            return () => {
                triggerAnimate.kill()
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])
        
        useFrame(({gl,camera,viewport:{aspect},invalidate},delta)=>{
            if (windowVisible.current && inRange.current) invalidate()

            updateScreenSize();
            
            const 
                cameraPos = camera.position.clone(),
                bottleCameraPos = cameraPos.clone();
            bottleMaterial.uniforms.uCameraPos.value = bottleCameraPos;

            cameraPos.y += 1;
            seaMaterial.uniforms.uCameraPos.value = cameraPos.normalize();
            seaMaterial.uniforms.uTime.value += delta * 0.008;
            seaMaterial.uniforms.uAspect.value = aspect;

            deltaTotal.current += delta * 2;
            const bottleMvmt = Math.sin(deltaTotal.current) * 0.0002;
            [bottleMaterial,paperMaterial,corkMaterial].forEach(mesh=>mesh.uniforms.uTranslate.value.y += bottleMvmt)

            starMaterial.uniforms.time.value += delta * 0.8;


            
            reflectorWorldPosition.setFromMatrixPosition( seaMeshRef.current.matrixWorld );
            cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

            rotationMatrix.extractRotation( seaMeshRef.current.matrixWorld );

            normal.set( 0, 0, 1 );
            normal.applyMatrix4( rotationMatrix );

            view.subVectors( reflectorWorldPosition, cameraWorldPosition );

            // Avoid rendering when reflector is facing away
            if ( view.dot( normal ) > 0 ) return;

            view.reflect( normal ).negate();
            view.add( reflectorWorldPosition );

            rotationMatrix.extractRotation( camera.matrixWorld );

            lookAtPosition.set( 0, 0, - 1 );
            lookAtPosition.applyMatrix4( rotationMatrix );
            lookAtPosition.add( cameraWorldPosition );

            target.subVectors( reflectorWorldPosition, lookAtPosition );
            target.reflect( normal ).negate();
            target.add( reflectorWorldPosition );

            virtualCamera.position.copy( view );
            virtualCamera.up.set( 0, 1, 0 );
            virtualCamera.up.applyMatrix4( rotationMatrix );
            virtualCamera.up.reflect( normal );
            virtualCamera.lookAt( target );

            virtualCamera.far = camera.far; // Used in WebGLBackground

            virtualCamera.updateMatrixWorld();
            virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

            // Update the texture matrix
            textureMatrix.set(
                0.5, 0.0, 0.0, 0.5,
                0.0, 0.5, 0.0, 0.5,
                0.0, 0.0, 0.5, 0.5,
                0.0, 0.0, 0.0, 1.0
            );
            textureMatrix.multiply( virtualCamera.projectionMatrix );
            textureMatrix.multiply( virtualCamera.matrixWorldInverse );
            textureMatrix.multiply( seaMeshRef.current.matrixWorld );

            // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
            // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
            reflectorPlane.setFromNormalAndCoplanarPoint( normal, reflectorWorldPosition );
            reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

            clipPlane.set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant );

            const projectionMatrix = virtualCamera.projectionMatrix;

            q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = - 1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            // Calculate the scaled plane vector
            clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

            // Replacing the third row of the projection matrix
            projectionMatrix.elements[ 2 ] = clipPlane.x;
            projectionMatrix.elements[ 6 ] = clipPlane.y;
            projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - 0; // clipPlane.z + 1.0  - clipBias;
            projectionMatrix.elements[ 14 ] = clipPlane.w;

            // Render

            renderTarget.texture.encoding = gl.outputEncoding;

            seaMeshRef.current.visible = false;

            const currentRenderTarget = gl.getRenderTarget();

            const currentXrEnabled = gl.xr.enabled;
            const currentShadowAutoUpdate = gl.shadowMap.autoUpdate;

            gl.xr.enabled = false; // Avoid camera modification
            gl.shadowMap.autoUpdate = false; // Avoid re-computing shadows

            gl.setRenderTarget( renderTarget );

            gl.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

            if ( gl.autoClear === false ) gl.clear();
            
            // renderer.render( scene, virtualCamera );

            gl.render( rtSceneRef.current, virtualCamera );

            gl.xr.enabled = currentXrEnabled;
            gl.shadowMap.autoUpdate = currentShadowAutoUpdate;

            gl.setRenderTarget( currentRenderTarget );

            // Restore viewport

            const viewport = (camera as THREE.Camera && {viewport:undefined}).viewport;

            if ( viewport !== undefined ) {

                gl.state.viewport( viewport );

            }

            seaMeshRef.current.visible = true;
        })
        
        return (
            <>
            <group>
                <points args={[starGeometry,starMaterial]} />
                <mesh args={[moonGeometry,moonMaterial]} />
                <mesh args={[seaGeometry,seaMaterial]} position={[0,-0.5,0]} rotation={[-Math.PI / 2,0,0]} ref={seaMeshRef} />
            </group>
            <scene ref={rtSceneRef}>
                <mesh args={[bottle.geometry,bottleMaterial]} />
                <mesh args={[paper.geometry,paperMaterial]} />
                <mesh args={[cork.geometry,corkMaterial]} />
            </scene>
            </>
        )
    },
    Background = () => (
        <Context.Consumer>{({devicePixelRatio})=>
            <Canvas 
                dpr={devicePixelRatio} 
                frameloop='demand' 
                gl={{antialias:true}}
                style={{position:'fixed',height:'100vh',width:'100vw',top:'0px'}}
            >
                <Scene />
            </Canvas>
        }</Context.Consumer>
    )

export default Background;