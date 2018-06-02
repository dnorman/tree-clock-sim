import './style.css'
import * as DiscImage from './textures/sprites/disc.png';
import * as THREE from 'three'
import * as Stats from 'stats.js'
import * as dat from 'dat.gui'
import {Slab,SlabSet} from "./slab";
import Memo from './memo'

var camera, scene, renderer, stats, material;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var SLAB_COUNT = 10;

var slabset;
var inflight_memos = [];
var slab_points;
var memo_points;
var PARTICLE_SIZE = 200;

var memo_uniforms;

init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 2, 4000 );
    camera.position.z = 2000;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0001 );

    slabset = new SlabSet( scene );
    slabset.create_random_slabs( SLAB_COUNT );


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    stats = new Stats();
    document.body.appendChild( stats.dom );

    // var gui = new dat.GUI();
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
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}
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

var frame = 0;
function render() {
    // particles.rotation.x += 0.0005;
    // particles.rotation.y += 0.001;

    slabset.update(frame);

    var time = Date.now() * 0.00005;
    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;


    camera.lookAt( scene.position );

    renderer.render( scene, camera );
    frame++;
}