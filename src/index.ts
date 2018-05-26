import './style.css'
import * as DiscImage from './textures/sprites/disc.png';
import * as THREE from 'three'
import * as Stats from 'stats.js'
import * as dat from 'dat.gui'

var camera, scene, renderer, stats, material;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var PARTICLE_COUNT = 100;
var particles;
var PARTICLE_SIZE = 200;

init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 2, 4000 );
    camera.position.z = 2000;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0001 );

    var sprite = new THREE.TextureLoader().load( DiscImage );

    var vertices = [];
    var colors = [];
    var sizes = [];

    // var positions = new Float32Array( vertices.length * 3 );
    // var colors = new Float32Array( vertices.length * 3 );
    // var sizes = new Float32Array( vertices.length );

    for ( var i = 0; i < PARTICLE_COUNT; i ++ ) {
        var x = 2000 * Math.random() - 1000;
        var y = 2000 * Math.random() - 1000;
        var z = 2000 * Math.random() - 1000;

        vertices.push( x, y, z );


        sizes.push( PARTICLE_SIZE * 0.5 );

        var color = new THREE.Color();
        //color.setHSL( 0.01 + 0.2 * ( i / l ), 1.0, 0.5 );
        color.setHSL( 0.01 + 0.2 * ( i / PARTICLE_COUNT ), 1.0, 0.5 );
        colors.push( color );
        color.toArray( colors, i * 3 );

    }

    // var geometry = new THREE.BufferGeometry();
    // geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    // geometry.addAttribute( 'size',     new THREE.BufferAttribute( sizes, 1 ) );

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position',    new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'size',        new THREE.Float32BufferAttribute( sizes, 1 ) );


    //material = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
    //material.color.setHSL( 1.0, 0.3, 0.7 );

    var material = new THREE.ShaderMaterial( {
        uniforms: {
            color:   { value: new THREE.Color( 0xffffff ) },
            texture: { value: sprite }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        alphaTest: 0.5
    } );

    particles = new THREE.Points( geometry, material );
    scene.add( particles );
    //
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

    var geometry = particles.geometry;
    var attributes = geometry.attributes;

    var time = Date.now() * 0.00005;
    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;


    camera.lookAt( scene.position );
    //var h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
    //material.color.setHSL( h, 0.5, 0.5 );


    for ( var i = 0, l = attributes.size.array.length; i < l; i ++ ) {

        attributes.size.array[i] = Math.max( PARTICLE_SIZE, attributes.size.array[i] * .99 );
        //if ((frame + 1) % 200 == 0){
            //attributes.size.array[i] = PARTICLE_SIZE;
        //}
        if (frame % 10 == 0){
            let number = (Math.random() * PARTICLE_COUNT);
            if (number < 1.1 ) {
                attributes.size.array[i] = PARTICLE_SIZE * 2;
            }
        }
    }

    attributes.size.needsUpdate = true;

    renderer.render( scene, camera );
    frame++;
}