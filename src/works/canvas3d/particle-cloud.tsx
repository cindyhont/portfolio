import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import EnhancedTrackballControls from '../enhanced-trackball-controls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Context } from '../../context';
import styles from './Canvas.module.scss'

const 
    particlesConfig = {
        count:65000,
        psize:20,
        objsize:1,
        brushRadius:1, 
        brushForceScale:70, 
        brushGravityScale:1, 
        gravityScale:0.99
    },
    joystickConfig = {
        position:'Right',
        rotateSpeed:2,
    },
    tempPos = new THREE.Vector3(),
    vertexShader = `
        precision mediump float;

        uniform mat4 modelViewMatrix, projectionMatrix;
        uniform sampler2D initialPosTexture,tPosition;
        uniform vec3 cameraPos;
        uniform float count, psize, objsize;
        attribute vec2 uv;
        varying float print;

        void main() {
            vec4 pos = texture2D(tPosition,uv);
            if (pos.w >= count) {
                print = 0.;
                gl_Position = vec4(0.);
            } else {
                print = 1.;
                pos.xyz *= objsize;
                gl_PointSize = psize / distance(cameraPos,pos.xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz, 1. );
            }
        }
    `,
    fragmentShader = `
        precision lowp float;
        varying float print;

        void main(){
            if (print == 0.) discard;
            else {
                float d = distance(gl_PointCoord,vec2(0.5));
                float opacity = d < 0.5 ? 0.1 : 0.;
                gl_FragColor = vec4(vec3(1.),opacity);
            }
        }
    `,
    velocityFS = `
        uniform sampler2D original;
        uniform bool moving;
        uniform vec3 mousePos, mouseVel;
        uniform float dt, count, brushRadius, brushForceScale, brushGravityScale, gravityScale;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            vec4 oPos = texture2D( original, uv );

            vec3 pos = texture2D( tPosition, uv ).xyz;
            vec3 vel = texture2D( tVelocity, uv ).xyz;

            vec3 dirToOrigin = oPos.xyz - pos.xyz;

            if (moving){
                vec3 dirToMouse = pos.xyz - mousePos;
                float distToMouse = length(dirToMouse);
                float diffm = max(distToMouse / (brushRadius * 0.1), 3.0);
                float diffm2 = diffm * diffm;
                vec3 brushMoveForce = mouseVel * brushForceScale / diffm2;
                vec3 brushGravity = dirToMouse * brushGravityScale / diffm2;
                vel += brushMoveForce - brushGravity;
            }
            vel = mix(vel, dirToOrigin * gravityScale, dt);
            gl_FragColor = vec4(vel,1.);
        }
    `,
    positionFS = `
        uniform float dt, count;
        uniform sampler2D original;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            vec4 pos = texture2D( tPosition, uv );
            vec3 vel = texture2D( tVelocity, uv ).xyz;
            pos.xyz += vel * dt;
            gl_FragColor = pos;
        }
    `,
    controlPlaneVS = `
        precision mediump float;

        uniform mat4 modelViewMatrix, projectionMatrix;
        attribute vec2 uv;
        attribute vec3 position;
        varying vec2 vUv;

        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );
            vUv = uv;
        }
    `,
    controlPlaneFS = `
        precision lowp float;

        uniform bool uShowJoystick;
        uniform float uJoystickPadDiamater, uJoystickBorder, uJoystickDiameter;
        uniform vec2 uJoystickPadCenter, uJoystickCenter;
        varying vec2 vUv;

        void main(){
            if (uShowJoystick){
                float 
                    dPadCenter = distance(vUv,uJoystickPadCenter),
                    dStickCenter = distance(vUv,uJoystickCenter);
                if (dPadCenter > uJoystickPadDiamater && dPadCenter < uJoystickPadDiamater + uJoystickBorder) {
                    gl_FragColor = vec4(1.);
                    return;
                } else if (dStickCenter < uJoystickDiameter){
                    gl_FragColor = vec4(vec3(1.),0.5);
                    return;
                }
            } else {
                gl_FragColor = vec4(0.);
            }
        }
    `,
    gpuCreateTexture = (
        gpuCompute: GPUComputationRenderer, 
        textureName:string,
        shader:string,
        arr?:Float32Array
    ) => {
        const texture = gpuCompute.createTexture();
        if (!!arr) texture.image.data.set(arr)
        return gpuCompute.addVariable(textureName,shader,texture);
    },
    textureSize = 256,
    Scene = () => {
        const 
            gl = useThree(state=>state.gl),
            camera = useThree(state=>state.camera),
            aspect = useThree(state=>state.viewport.aspect),
            size = useThree(state=>state.size),
            invalidate = useThree(state => state.invalidate),
            controls = useMemo(()=>new EnhancedTrackballControls(camera,gl.domElement),[camera]),
            particleGeometry = new THREE.PlaneGeometry(1,1,textureSize - 1, textureSize - 1),
            joystickPadDiameterPx = useRef(60).current,
            joystickPadMarginPx = useRef(30).current,
            joystickBorderPx = useRef(2).current,
            joystickDiameterPx = useRef(25).current,

            controlPlaneSize = useRef(10000).current,
            getJoystickCenter = (diameter:number,margin:number) => {
                const 
                    camPos = camera.position,
                    fov = (camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * camPos.length() * 2,
                    width = height * aspect,
        
                    joystickCenterY = 0.5 - (height * (size.height * 0.5 - diameter - margin) / size.height) / controlPlaneSize

                let joystickCenterX = 0

                switch (joystickConfig.position.toLowerCase()){
                    case 'left':
                        joystickCenterX = 0.5 - (width * (size.width * 0.5 - diameter - margin) / size.width) / controlPlaneSize;
                        break;
                    case 'center':
                        joystickCenterX = 0.5;
                        break
                    case 'right':
                        joystickCenterX = 0.5 + (width * (size.width * 0.5 - diameter - margin) / size.width) / controlPlaneSize;
                        break;
                }
                    
                return new THREE.Vector2(joystickCenterX,joystickCenterY)
            },
            getJoystickFloat = (input:number) => {
                const 
                    fov = (camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * camera.position.length() * 2
                return (height * input / size.height) / controlPlaneSize
            },
            controlPlaneGeometry = new THREE.PlaneGeometry(controlPlaneSize,controlPlaneSize),
            controlPlaneRef = useRef<THREE.Mesh>(),
            joystickCenter = useRef(getJoystickCenter(joystickPadDiameterPx,joystickPadMarginPx)),
            joystickInitial = useRef(new THREE.Vector2()),
            joystickCurrPos = useRef(new THREE.Vector2()),
            joystickOnMove = useRef(false),
            rotatingOnMouse = useRef(false),
            joystickStatic = useRef(true),
            controlPlaneMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    uShowJoystick:{value:true},
                    uJoystickPadDiamater:{value:0},
                    uJoystickPadCenter:{value:getJoystickCenter(joystickPadDiameterPx,joystickPadMarginPx)},
                    uJoystickBorder:{value:0},
                    uJoystickCenter:{value:joystickCenter.current},
                    uJoystickDiameter:{value:getJoystickFloat(joystickDiameterPx)},
                },
                vertexShader:controlPlaneVS,
                fragmentShader:controlPlaneFS,
                transparent:true
            }),
            particlesOnPress = useRef(false),
            particlesMoving = useRef(false),
            particlesPrev = useRef(new THREE.Vector3()),
            particlesCurr = useRef(new THREE.Vector3()),
            windowVisible = useRef(true),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                invalidate();
            },
            setCurrentPos = (e:ThreeEvent<PointerEvent>) => {
                const pt = e.intersections[0].point
                particlesCurr.current.set(pt.x, pt.y, pt.z)
            },
            onPointerDown = (e:ThreeEvent<PointerEvent> & React.MouseEvent & PointerEvent) => {
                const joystickPressed = joystickCenter.current.distanceTo(e.intersections[0].uv) < getJoystickFloat(joystickDiameterPx)
                
                if (joystickPressed) {
                    joystickOnMove.current = true
                    switch (joystickConfig.position.toLowerCase()){
                        case 'left':
                            joystickInitial.current.set(joystickPadDiameterPx + joystickPadMarginPx,size.height - joystickPadDiameterPx - joystickPadMarginPx)
                            break;
                        case 'center':
                            joystickInitial.current.set(Math.round(size.width * 0.5),size.height - joystickPadDiameterPx - joystickPadMarginPx)
                            break
                        case 'right':
                            joystickInitial.current.set(size.width - joystickPadDiameterPx - joystickPadMarginPx,size.height - joystickPadDiameterPx - joystickPadMarginPx)
                            break;
                    }
                    
                    joystickCurrPos.current.set(e.clientX,e.clientY)
                    controls.joystickActive = true
                } else if (e.pointerType==='mouse' && e.buttons === 2){
                    rotatingOnMouse.current = true
                    joystickInitial.current.set(e.clientX,e.clientY)
                    joystickCurrPos.current.set(e.clientX,e.clientY)
                } else {
                    particlesOnPress.current = true
                    setCurrentPos(e)
                    controls.noRotate = true
                }
            },
            onPointerMove = (e:ThreeEvent<PointerEvent> & React.MouseEvent) => {
                if (joystickOnMove.current){
                    const 
                        uv = e.intersections[0].uv,
                        moveAreaDiameter = getJoystickFloat(joystickPadDiameterPx - joystickDiameterPx),
                        padCenter = getJoystickCenter(joystickPadDiameterPx,joystickPadMarginPx),
                        distanceFromCenter = padCenter.distanceTo(uv)
                    if (distanceFromCenter < moveAreaDiameter) joystickCenter.current.copy(uv)
                    else joystickCenter.current.copy(uv.sub(padCenter).divideScalar(distanceFromCenter).multiplyScalar(moveAreaDiameter).add(padCenter))

                    joystickStatic.current = false

                    joystickCurrPos.current.set(e.clientX,e.clientY)

                    controls.joystickActive = true
                } else if (rotatingOnMouse.current) {
                    joystickCurrPos.current.set(e.clientX,e.clientY)
                } else if (particlesOnPress.current) {
                    particlesPrev.current.set(particlesCurr.current.x, particlesCurr.current.y, particlesCurr.current.z)
                    setCurrentPos(e)
                    particlesMoving.current = true
                    controls.noRotate = true
                }
            },
            onPointerUp = () => {
                particlesMoving.current = false
                particlesOnPress.current = false
                joystickOnMove.current = false
                rotatingOnMouse.current = false
                controls.noRotate = false
                controls.joystickActive = false
            },
            {particlePosArr,initialPosTexture} = useMemo(()=>{
                const 
                    geometry = new THREE.TorusKnotGeometry(1,0.3,200,30),
                    material = new THREE.MeshBasicMaterial(),
                    mesh = new THREE.Mesh(geometry,material),
                    sampler = new MeshSurfaceSampler(mesh).build(),
                    particleCount = textureSize * textureSize,
                    particlePosArr = new Float32Array(particleCount * 4);

                for (let i = 0; i < particleCount; i++){
                    const k = i * 4;
                    sampler.sample(tempPos)
                    particlePosArr[k] = tempPos.x;
                    particlePosArr[k+1] = tempPos.y;
                    particlePosArr[k+2] = tempPos.z;
                    particlePosArr[k+3] = i;
                }

                const initialPosTexture = new THREE.DataTexture(
                    particlePosArr,
                    textureSize,
                    textureSize,
                    THREE.RGBAFormat,
                    THREE.FloatType
                )
                initialPosTexture.needsUpdate = true
                
                return {
                    particlePosArr,
                    initialPosTexture
                };
            },[]),
            particleMaterial = new THREE.RawShaderMaterial({
                uniforms: {
                    initialPosTexture:{value:initialPosTexture},
                    tPosition:{value:null},
                    cameraPos:{value:new THREE.Vector3()},
                    count:{value:particlesConfig.count},
                    psize:{value:particlesConfig.psize},
                    objsize:{value:particlesConfig.objsize}
                },
                vertexShader,
                fragmentShader,
                transparent:true,
                depthTest:false
            }),
            gpuCompute = new GPUComputationRenderer(textureSize,textureSize,gl),
            positionVariable = gpuCreateTexture(gpuCompute,'tPosition',positionFS,particlePosArr),
            velocityVariable = gpuCreateTexture(gpuCompute,'tVelocity',velocityFS),
            particlesOnAnimation = useRef(true),
            keyOnPress = (e:KeyboardEvent) => {
                if (e.key === ' '){
                    e.preventDefault()
                    particlesOnAnimation.current = !particlesOnAnimation.current
                    if (particlesOnAnimation.current) invalidate()
                }
            }

        gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
        gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );

        velocityVariable.material.uniforms.original = {value:initialPosTexture}
        velocityVariable.material.uniforms.moving = {value:false}
        velocityVariable.material.uniforms.mousePos = {value:new THREE.Vector3()}
        velocityVariable.material.uniforms.mouseVel = {value:new THREE.Vector3()}
        velocityVariable.material.uniforms.dt = {value:0}
        velocityVariable.material.uniforms.count = {value:particlesConfig.count}

        velocityVariable.material.uniforms.brushRadius = {value:particlesConfig.brushRadius}
        velocityVariable.material.uniforms.brushForceScale = {value:particlesConfig.brushForceScale}
        velocityVariable.material.uniforms.brushGravityScale = {value:particlesConfig.brushGravityScale}
        velocityVariable.material.uniforms.gravityScale = {value:particlesConfig.gravityScale}

        positionVariable.material.uniforms.dt = {value:0}
        positionVariable.material.uniforms.original = {value:initialPosTexture}
        positionVariable.material.uniforms.count = {value:particlesConfig.count}

        var error = gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }

        controls.setMouseButtons(
            THREE.MOUSE.ROTATE,
            THREE.MOUSE.DOLLY,
            THREE.MOUSE.ROTATE,
        )

        controls.noPan = true

        useEffect(()=>{
            window.addEventListener('keyup',keyOnPress,{passive:true})
            window.addEventListener('resize',windowIsVisible,{passive:true})
            window.addEventListener('focus',windowIsVisible,{passive:true})
            window.addEventListener('blur',windowIsHidden,{passive:true})

            return () => {
                window.removeEventListener('keyup',keyOnPress)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        useFrame(({camera,invalidate},delta)=>{
            if (windowVisible.current) invalidate()
            const 
                camPos = camera.position,
                timeDelta = Math.min(delta,1/30)

            // controlPlaneRef.current?.lookAt(camPos)

            controls.update()

            // joystick
            controlPlaneMaterial.uniforms.uJoystickPadDiamater.value = getJoystickFloat(joystickPadDiameterPx)
            controlPlaneMaterial.uniforms.uJoystickBorder.value = getJoystickFloat(joystickBorderPx)

            const padCenter = getJoystickCenter(joystickPadDiameterPx,joystickPadMarginPx)
            controlPlaneMaterial.uniforms.uJoystickPadCenter.value = padCenter
            
            if (joystickOnMove.current) {
                const currPos = new THREE.Vector2().set(joystickCurrPos.current.x - joystickInitial.current.x,joystickInitial.current.y - joystickCurrPos.current.y)
                controls.handleRotate(new THREE.Vector2(),currPos.multiplyScalar(0.02 * timeDelta))
            } else {
                if (joystickCenter.current.distanceTo(padCenter) > getJoystickFloat(joystickPadDiameterPx - joystickDiameterPx * 0.5)){
                    // if joystick is out of joystick area, for example after screen resize
                    joystickCenter.current.copy(padCenter)
                } else if (joystickCenter.current.x !== padCenter.x || joystickCenter.current.y !== padCenter.y){
                    // after the joystick is released or after screen resize, move joystick back to center
                    if (joystickStatic.current) joystickCenter.current.copy(padCenter)
                    else {
                        const 
                            distance = joystickCenter.current.distanceTo(padCenter),
                            step = getJoystickFloat(5)
                        if (distance < step) {
                            joystickCenter.current.copy(padCenter)
                            joystickStatic.current = true
                        }
                        else joystickCenter.current.sub(padCenter).divideScalar(distance).multiplyScalar(distance - step).add(padCenter)
                    }
                }
            }
                
            controlPlaneMaterial.uniforms.uJoystickCenter.value = joystickCenter.current
            controlPlaneMaterial.uniforms.uJoystickDiameter.value = getJoystickFloat(joystickDiameterPx)

            const camUp = controls.object.up
            controlPlaneRef.current.up.set(camUp.x,camUp.y,camUp.z)
            controlPlaneRef.current?.lookAt(controls.object.position)

            // particles
            if (particlesOnAnimation.current){
                gpuCompute.compute();
                velocityVariable.material.uniforms.moving.value = particlesMoving.current;
                velocityVariable.material.uniforms.mousePos.value = particlesCurr.current
                if (particlesMoving.current) velocityVariable.material.uniforms.mouseVel.value = new THREE.Vector3().subVectors(particlesCurr.current,particlesPrev.current);
                velocityVariable.material.uniforms.dt.value = timeDelta
                velocityVariable.material.uniforms.count.value = particlesConfig.count
                velocityVariable.material.uniforms.brushRadius.value = particlesConfig.brushRadius
                velocityVariable.material.uniforms.brushForceScale.value = particlesConfig.brushForceScale
                velocityVariable.material.uniforms.brushGravityScale.value = particlesConfig.brushGravityScale
                velocityVariable.material.uniforms.gravityScale.value = particlesConfig.gravityScale
    
                positionVariable.material.uniforms.dt.value = timeDelta
                positionVariable.material.uniforms.count.value = particlesConfig.count
    
                particleMaterial.uniforms.tPosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
                particleMaterial.uniforms.cameraPos.value = camPos;
                particleMaterial.uniforms.count.value = particlesConfig.count;
                particleMaterial.uniforms.psize.value = particlesConfig.psize;
                particleMaterial.uniforms.objsize.value = particlesConfig.objsize;
            }

            particlesMoving.current = false

            controls.rotateSpeed = joystickConfig.rotateSpeed
        })

        return (
            <group>
                <mesh 
                    ref={controlPlaneRef}
                    onPointerMove={onPointerMove}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onPointerLeave={onPointerUp}
                    onPointerMissed={onPointerUp}
                    onPointerOut={onPointerUp}
                    args={[controlPlaneGeometry,controlPlaneMaterial]}
                />
                <points args={[particleGeometry,particleMaterial]} />
            </group>
        )
    },
    ParticleCloud = () => {
        useEffect(() => {
            const gui = new GUI();

            gui.add(joystickConfig,'rotateSpeed',1,5,0.01).name('Rotate speed')

            const particlesFolder = gui.addFolder('Particles')
            particlesFolder.add(particlesConfig,'count',0,textureSize * textureSize,1).name('Particle count')
            particlesFolder.add(particlesConfig,'psize',5,30,1).name('Particle size')
            particlesFolder.add(particlesConfig,'objsize',0.1,3,0.1).name('Mesh size')
            particlesFolder.add(particlesConfig,'brushRadius',0.1,3,0.1).name('Brush radius')
            particlesFolder.add(particlesConfig,'brushForceScale',10,200,1).name('Brush force')
            particlesFolder.add(particlesConfig,'brushGravityScale',0,100,0.1).name('Brush gravity')
            particlesFolder.add(particlesConfig,'gravityScale',0,1,0.001).name('Mesh gravity')

            const joystickFolder = gui.addFolder('Joystick')
            joystickFolder.add(joystickConfig,'position',['Left','Center','Right']).name('Position')
            
            gui.close()
        },[])

        return (
            <div className={styles.canvas}>
                <Context.Consumer>{({devicePixelRatio})=>
                    <Canvas dpr={devicePixelRatio} frameloop='demand'>
                        <Scene />
                    </Canvas>
                }</Context.Consumer>
            </div>
        )
    }

export default ParticleCloud;