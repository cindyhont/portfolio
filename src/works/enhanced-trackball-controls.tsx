import * as THREE from 'three';

// copied from TrackballControls in three.js
const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class EnhancedTrackballControls extends THREE.EventDispatcher {
    object:THREE.PerspectiveCamera;
    domElement:HTMLElement
    enabled:boolean;
    screen:{left:number;top:number;width:number;height:number};
    rotateSpeed:number;
    zoomSpeed:number;
    panSpeed:number;
    joystickActive:boolean;
    noRotate:boolean;
    noZoom:boolean;
    noPan:boolean;
    staticMoving:boolean;
    dynamicDampingFactor:number;
    minDistance:number;
    maxDistance:number;
    keys:string[];
    mouseButtons:{LEFT:number;MIDDLE:number;RIGHT:number;}
    target:THREE.Vector3;
    target0:THREE.Vector3;
    position0:THREE.Vector3;
    up0:THREE.Vector3;
    zoom0:number;
    handleResize:()=>void;
    // getMouseOnScreen:(pageX:number,pageY:number)=>THREE.Vector2;
    // getMouseOnCircle:(pageX:number,pageY:number)=>THREE.Vector2;
    rotateCamera:()=>void;
    zoomCamera:()=>void;
    panCamera:()=>void;
    checkDistances:()=>void;
    update:()=>void;
    reset:()=>void;
    dispose:()=>void;
    handleRotate:(prev:THREE.Vector2,curr:THREE.Vector2)=>void;
    setMouseButtons:(left:number,middle:number,right:number)=>void;
    constructor(object,domElement){
        super();
        const scope = this;
		const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

        this.enabled = true;

		this.screen = { left: 0, top: 0, width: 0, height: 0 };

		this.rotateSpeed = 1.0;
		this.zoomSpeed = 1.2;
		this.panSpeed = 0.3;

        this.joystickActive = false;
		this.noRotate = false;
		this.noZoom = false;
		this.noPan = false;

		this.staticMoving = false;
		this.dynamicDampingFactor = 0.2;

		this.minDistance = 0;
		this.maxDistance = Infinity;

        this.keys = [ 'KeyA' /*A*/, 'KeyS' /*S*/, 'KeyD' /*D*/ ];

		this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

		// internals

		this.target = new THREE.Vector3();

		const EPS = 0.000001;

		const lastPosition = new THREE.Vector3();
		let lastZoom = 1;

        let _state = STATE.NONE,
			_keyState = STATE.NONE,

			_touchZoomDistanceStart = 0,
			_touchZoomDistanceEnd = 0,

			_lastAngle = 0;

		const _eye = new THREE.Vector3(),

			_movePrev = new THREE.Vector2(),
			_moveCurr = new THREE.Vector2(),

			_lastAxis = new THREE.Vector3(),

			_zoomStart = new THREE.Vector2(),
			_zoomEnd = new THREE.Vector2(),

			_panStart = new THREE.Vector2(),
			_panEnd = new THREE.Vector2(),

			_pointers = [],
			_pointerPositions = {};

        this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.up0 = this.object.up.clone();
		this.zoom0 = this.object.zoom;

        this.handleResize = () => {

			const box = scope.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			const d = scope.domElement.ownerDocument.documentElement;
			scope.screen.left = box.left + window.pageXOffset - d.clientLeft;
			scope.screen.top = box.top + window.pageYOffset - d.clientTop;
			scope.screen.width = box.width;
			scope.screen.height = box.height;

		};

        const getMouseOnScreen = (pageX:number, pageY:number) => {
            const vector = new THREE.Vector2();
            vector.set(
                ( pageX - scope.screen.left ) / scope.screen.width,
                ( pageY - scope.screen.top ) / scope.screen.height
            );

            return vector;
        }

        const getMouseOnCircle = (pageX:number, pageY:number) => {
            const vector = new THREE.Vector2();

            vector.set(
                ( ( pageX - scope.screen.width * 0.5 - scope.screen.left ) / ( scope.screen.width * 0.5 ) ),
                ( ( scope.screen.height + 2 * ( scope.screen.top - pageY ) ) / scope.screen.width ) // screen.width intentional
            );

            return vector;
        }
        
        this.rotateCamera = () => {
            const axis = new THREE.Vector3(),
				quaternion = new THREE.Quaternion(),
				eyeDirection = new THREE.Vector3(),
				objectUpDirection = new THREE.Vector3(),
				objectSidewaysDirection = new THREE.Vector3(),
				moveDirection = new THREE.Vector3();

            moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
            let angle = moveDirection.length();

            if ( angle ) {

                _eye.copy( scope.object.position ).sub( scope.target );

                eyeDirection.copy( _eye ).normalize();
                objectUpDirection.copy( scope.object.up ).normalize();
                objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

                objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
                objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

                moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

                axis.crossVectors( moveDirection, _eye ).normalize();

                angle *= scope.rotateSpeed;
                quaternion.setFromAxisAngle( axis, angle );

                _eye.applyQuaternion( quaternion );
                scope.object.up.applyQuaternion( quaternion );

                _lastAxis.copy( axis );
                _lastAngle = angle;

            } else if ( ! scope.staticMoving && _lastAngle ) {

                _lastAngle *= Math.sqrt( 1.0 - scope.dynamicDampingFactor );
                _eye.copy( scope.object.position ).sub( scope.target );
                quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
                _eye.applyQuaternion( quaternion );
                scope.object.up.applyQuaternion( quaternion );

            }

            _movePrev.copy( _moveCurr );
        }

        this.zoomCamera = () => {
            let factor;

			if ( _state === STATE.TOUCH_ZOOM_PAN ) {

				factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
				_touchZoomDistanceStart = _touchZoomDistanceEnd;

				_eye.multiplyScalar( factor );

			} else {

				factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * scope.zoomSpeed;

				if ( factor !== 1.0 && factor > 0.0 ) {

					_eye.multiplyScalar( factor );
				}

				if ( scope.staticMoving ) {

					_zoomStart.copy( _zoomEnd );

				} else {

					_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

				}

			}
        }

        this.panCamera = () => {
            const mouseChange = new THREE.Vector2(),
				objectUp = new THREE.Vector3(),
				pan = new THREE.Vector3();

                mouseChange.copy( _panEnd ).sub( _panStart );

            if ( mouseChange.lengthSq() ) {

                mouseChange.multiplyScalar( _eye.length() * scope.panSpeed );

                pan.copy( _eye ).cross( scope.object.up ).setLength( mouseChange.x );
                pan.add( objectUp.copy( scope.object.up ).setLength( mouseChange.y ) );

                scope.object.position.add( pan );
                scope.target.add( pan );

                if ( scope.staticMoving ) {

                    _panStart.copy( _panEnd );

                } else {

                    _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( scope.dynamicDampingFactor ) );

                }

            }
        }

        this.checkDistances = () => {
            if ( ! scope.noZoom || ! scope.noPan ) {

				if ( _eye.lengthSq() > scope.maxDistance * scope.maxDistance ) {

					scope.object.position.addVectors( scope.target, _eye.setLength( scope.maxDistance ) );
					_zoomStart.copy( _zoomEnd );

				}

				if ( _eye.lengthSq() < scope.minDistance * scope.minDistance ) {

					scope.object.position.addVectors( scope.target, _eye.setLength( scope.minDistance ) );
					_zoomStart.copy( _zoomEnd );

				}

			}
        }

        this.update = () => {
            _eye.subVectors( scope.object.position, scope.target );

			if ( ! scope.noRotate ) {

				scope.rotateCamera();

			}

			if ( ! scope.noZoom ) {

				scope.zoomCamera();

			}

			if ( ! scope.noPan ) {

				scope.panCamera();

			}

			scope.object.position.addVectors( scope.target, _eye );

			scope.checkDistances();

            scope.object.lookAt( scope.target );

            if ( lastPosition.distanceToSquared( scope.object.position ) > EPS ) {

                scope.dispatchEvent( _changeEvent );

                lastPosition.copy( scope.object.position );

            }

        }

        this.reset = () => {
            _state = STATE.NONE;
			_keyState = STATE.NONE;

			scope.target.copy( scope.target0 );
			scope.object.position.copy( scope.position0 );
			scope.object.up.copy( scope.up0 );
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();

			_eye.subVectors( scope.object.position, scope.target );

			scope.object.lookAt( scope.target );

			scope.dispatchEvent( _changeEvent );

			lastPosition.copy( scope.object.position );
			lastZoom = scope.object.zoom;
        }

        this.handleRotate = (prev:THREE.Vector2,curr:THREE.Vector2) => {
            _movePrev.copy( prev );
            _moveCurr.copy( curr );
        }

        this.setMouseButtons = (left:number,middle:number,right:number) => {
            scope.mouseButtons = {
                LEFT:left,
                MIDDLE:middle,
                RIGHT:right
            }
        }

        /*
        
        function onMouseMove( event ) {

			const state = ( _keyState !== STATE.NONE ) ? _keyState : _state;

			if ( state === STATE.ROTATE && ! scope.noRotate ) {

				_movePrev.copy( _moveCurr );
				_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

			} else if ( state === STATE.ZOOM && ! scope.noZoom ) {

				_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

			} else if ( state === STATE.PAN && ! scope.noPan ) {

				_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

			}

		}
        
        */

        // listeners

        function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			if ( _pointers.length === 0 ) {

				scope.domElement.setPointerCapture( event.pointerId );

				scope.domElement.addEventListener( 'pointermove', onPointerMove,{passive:true} );
				scope.domElement.addEventListener( 'pointerup', onPointerUp,{passive:true} );

			}

			//

			addPointer( event );

			if ( event.pointerType === 'touch' ) {

				onTouchStart( event );

			} else {

				onMouseDown( event );

			}

		}

        function onPointerMove( event ) {
			if ( scope.enabled === false ) return;

			if ( event.pointerType === 'touch' ) {

				onTouchMove( event );

			} else {

				onMouseMove( event );

			}

		}

		function onPointerUp( event ) {

			if ( scope.enabled === false ) return;

			if ( event.pointerType === 'touch' ) {

				onTouchEnd( event );

			} else {

				onMouseUp();

			}

			//

			removePointer( event );

			if ( _pointers.length === 0 ) {

				scope.domElement.releasePointerCapture( event.pointerId );

				scope.domElement.removeEventListener( 'pointermove', onPointerMove );
				scope.domElement.removeEventListener( 'pointerup', onPointerUp );

			}


		}

		function onPointerCancel( event ) {

			removePointer( event );

		}

		function keydown( event ) {

			if ( scope.enabled === false ) return;

			window.removeEventListener( 'keydown', keydown );

			if ( _keyState !== STATE.NONE ) {

				return;

			} else if ( event.code === scope.keys[ STATE.ROTATE ] && ! scope.noRotate ) {

				_keyState = STATE.ROTATE;

			} else if ( event.code === scope.keys[ STATE.ZOOM ] && ! scope.noZoom ) {

				_keyState = STATE.ZOOM;

			} else if ( event.code === scope.keys[ STATE.PAN ] && ! scope.noPan ) {

				_keyState = STATE.PAN;

			}

		}

		function keyup() {

			if ( scope.enabled === false ) return;

			_keyState = STATE.NONE;

			window.addEventListener( 'keydown', keydown,{passive:true} );

		}

		function onMouseDown( event ) {
            
			if ( _state === STATE.NONE ) {
				switch ( event.button ) {

					case 0:
                        _state = scope.mouseButtons.LEFT;
						break;

					case 1:
						_state = scope.mouseButtons.MIDDLE;
						break;

					case 2:
						_state = scope.mouseButtons.RIGHT;
						break;

				}

			}

			const state = ( _keyState !== STATE.NONE ) ? _keyState : _state;
            
			if ( state === STATE.ROTATE && ! scope.noRotate && !scope.joystickActive ) {

				_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
				_movePrev.copy( _moveCurr );

			} else if ( state === STATE.ZOOM && ! scope.noZoom ) {

				_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
				_zoomEnd.copy( _zoomStart );

			} else if ( state === STATE.PAN && ! scope.noPan ) {

				_panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
				_panEnd.copy( _panStart );

			}

			scope.dispatchEvent( _startEvent );

		}

		function onMouseMove( event ) {
			const state = ( _keyState !== STATE.NONE ) ? _keyState : _state;
            
			if ( state === STATE.ROTATE && ! scope.noRotate && !scope.joystickActive ) {

				_movePrev.copy( _moveCurr );
				_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

			} else if ( state === STATE.ZOOM && ! scope.noZoom ) {

				_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

			} else if ( state === STATE.PAN && ! scope.noPan ) {

				_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

			}

		}

		function onMouseUp() {

			_state = STATE.NONE;

			scope.dispatchEvent( _endEvent );

		}

		function onMouseWheel( event ) {

			if ( scope.enabled === false ) return;

			if ( scope.noZoom === true ) return;

			event.preventDefault();

			switch ( event.deltaMode ) {

				case 2:
					// Zoom in pages
					_zoomStart.y -= event.deltaY * 0.025;
					break;

				case 1:
					// Zoom in lines
					_zoomStart.y -= event.deltaY * 0.01;
					break;

				default:
					// undefined, 0, assume pixels
					_zoomStart.y -= event.deltaY * 0.00025;
					break;

			}

			scope.dispatchEvent( _startEvent );
			scope.dispatchEvent( _endEvent );

		}

		function onTouchStart( event ) {

			trackPointer( event );

			switch ( _pointers.length ) {

				case 1:
					_state = STATE.TOUCH_ROTATE;
                    if (!scope.joystickActive){
                        _moveCurr.copy( getMouseOnCircle( _pointers[ 0 ].pageX, _pointers[ 0 ].pageY ) );
                        _movePrev.copy( _moveCurr );
                    }
					break;

				default: // 2 or more
					_state = STATE.TOUCH_ZOOM_PAN;
					const dx = _pointers[ 0 ].pageX - _pointers[ 1 ].pageX;
					const dy = _pointers[ 0 ].pageY - _pointers[ 1 ].pageY;
					_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

					const x = ( _pointers[ 0 ].pageX + _pointers[ 1 ].pageX ) / 2;
					const y = ( _pointers[ 0 ].pageY + _pointers[ 1 ].pageY ) / 2;
					_panStart.copy( getMouseOnScreen( x, y ) );
					_panEnd.copy( _panStart );
					break;

			}

			scope.dispatchEvent( _startEvent );

		}

		function onTouchMove( event ) {

			trackPointer( event );

			switch ( _pointers.length ) {

				case 1:
                    if (!scope.joystickActive){
                        _movePrev.copy( _moveCurr );
                        _moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
                    }
					break;

				default: // 2 or more

					const position = getSecondPointerPosition( event );

					const dx = event.pageX - position.x;
					const dy = event.pageY - position.y;
					_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

					const x = ( event.pageX + position.x ) / 2;
					const y = ( event.pageY + position.y ) / 2;
					_panEnd.copy( getMouseOnScreen( x, y ) );
					break;

			}

		}

		function onTouchEnd( event ) {

			switch ( _pointers.length ) {

				case 0:
					_state = STATE.NONE;
					break;

				case 1:
					_state = STATE.TOUCH_ROTATE;
					_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
					_movePrev.copy( _moveCurr );
					break;

				case 2:
					_state = STATE.TOUCH_ZOOM_PAN;

					for ( let i = 0; i < _pointers.length; i ++ ) {

						if ( _pointers[ i ].pointerId !== event.pointerId ) {

							const position = _pointerPositions[ _pointers[ i ].pointerId ];
							_moveCurr.copy( getMouseOnCircle( position.x, position.y ) );
							_movePrev.copy( _moveCurr );
							break;

						}

					}

					break;

			}

			scope.dispatchEvent( _endEvent );

		}

		function contextmenu( event ) {

			if ( scope.enabled === false ) return;

			event.preventDefault();

		}

		function addPointer( event ) {

			_pointers.push( event );

		}

		function removePointer( event ) {

			delete _pointerPositions[ event.pointerId ];

			for ( let i = 0; i < _pointers.length; i ++ ) {

				if ( _pointers[ i ].pointerId == event.pointerId ) {

					_pointers.splice( i, 1 );
					return;

				}

			}

		}

		function trackPointer( event ) {

			let position = _pointerPositions[ event.pointerId ];

			if ( position === undefined ) {

				position = new THREE.Vector2();
				_pointerPositions[ event.pointerId ] = position;

			}

			position.set( event.pageX, event.pageY );

		}

		function getSecondPointerPosition( event ) {

			const pointer = ( event.pointerId === _pointers[ 0 ].pointerId ) ? _pointers[ 1 ] : _pointers[ 0 ];

			return _pointerPositions[ pointer.pointerId ];

		}

		this.dispose = () => {

			scope.domElement.removeEventListener( 'contextmenu', contextmenu );

			scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
			scope.domElement.removeEventListener( 'pointercancel', onPointerCancel );
			scope.domElement.removeEventListener( 'wheel', onMouseWheel );

			scope.domElement.removeEventListener( 'pointermove', onPointerMove );
			scope.domElement.removeEventListener( 'pointerup', onPointerUp );

			window.removeEventListener( 'keydown', keydown );
			window.removeEventListener( 'keyup', keyup );

		};

		this.domElement.addEventListener( 'contextmenu', contextmenu,{passive:true} );

		this.domElement.addEventListener( 'pointerdown', onPointerDown,{passive:true} );
		this.domElement.addEventListener( 'pointercancel', onPointerCancel,{passive:true} );
		this.domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );


		window.addEventListener( 'keydown', keydown,{passive:true} );
		window.addEventListener( 'keyup', keyup,{passive:true} );

		this.handleResize();

		// force an update at start
		this.update();
    }
}

export default EnhancedTrackballControls