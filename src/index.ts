import './style.css'
import * as DiscImage from './textures/sprites/disc.png';
import * as THREE from 'three'
import * as Stats from 'stats.js'
import * as dat from 'dat.gui'
import {Slab,SlabSet} from "./slab";
import DragControls from 'three-dragcontrols';
import * as TrackballControls from 'three-trackballcontrols';


var camera, scene, renderer, stats, material;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var SLAB_COUNT = 1000;

var slabset;
var frame = 0;
var status = {
    run: true,
    "3D": false,
    dropper: function(){}
};
var mouse;
var trackBallControls;
var dragControls;

init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 2, 4000 );
    camera.position.z = 2000;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.01 );

    mouse = new THREE.Vector2();
    renderer = new THREE.WebGLRenderer();

    slabset = new SlabSet( scene, SLAB_COUNT );
    slabset.create_random_slabs( SLAB_COUNT, status["3D"] );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    stats = new Stats();
    document.body.appendChild( stats.dom );

    trackBallControls = new TrackballControls( camera );
    trackBallControls.rotateSpeed = 1.0;
    trackBallControls.zoomSpeed = 1.2;
    trackBallControls.panSpeed = 0.8;
    trackBallControls.noZoom = false;
    trackBallControls.noPan = false;
    trackBallControls.staticMoving = true;
    trackBallControls.dynamicDampingFactor = 0.3;


    dragControls = new DragControls([], camera, renderer.domElement);

    dragControls.addEventListener( 'dragstart', function ( event ) { trackBallControls.enabled = false; } );
    dragControls.addEventListener( 'dragend', function ( event ) { trackBallControls.enabled = true; } );

    var gui = new dat.GUI();

    gui.add(status,'run');
    gui.add(status,'3D').onChange(function(){
        scene.remove.apply(scene, scene.children);
        slabset = new SlabSet( scene, SLAB_COUNT );
        slabset.create_random_slabs( SLAB_COUNT, status["3D"] );
    });

    gui.add(status,'dropper').onChange(function(){
        var slab = slabset.select_random_slab();
        slab.color = new THREE.Color(0xff0000 );
        slabset.update_attributes();
    });
    // gui.add( material, 'sizeAttenuation' ).onChange( function() {
    //     material.needsUpdate = true;
    // } );
    // gui.open();


    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// function onDocumentMouseMove( event ) {
//     mouseX = event.clientX - windowHalfX;
//     mouseY = event.clientY - windowHalfY;
// }
function onDocumentTouchStart( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}
function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

function render() {

    camera.lookAt( scene.position );

    if (status.run){
        slabset.update(frame);
    }

    trackBallControls.update();
    renderer.render( scene, camera );

    if (status.run) {
        frame++;
    }
}