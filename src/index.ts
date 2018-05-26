import './style.css'
import * as SparkImage from './textures/sprites/spark1.png';
import * as THREE from 'three'
import * as Stats from 'stats.js'

var renderer, scene, camera, stats;
var sphere;
var noise = [];
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
init();

animate();

function init() {
    camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
    camera.position.z = 300;
    scene = new THREE.Scene();
    var amount = 100000;
    var radius = 200;
    var positions = new Float32Array( amount * 3 );
    var colors = new Float32Array( amount * 3 );
    var sizes = new Float32Array( amount );
    var vertex = new THREE.Vector3();
    var color = new THREE.Color( 0xffffff );
    for ( var i = 0; i < amount; i ++ ) {
        vertex.x = ( Math.random() * 2 - 1 ) * radius;
        vertex.y = ( Math.random() * 2 - 1 ) * radius;
        vertex.z = ( Math.random() * 2 - 1 ) * radius;
        vertex.toArray( positions, i * 3 );
        if ( vertex.x < 0 ) {
            color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
        } else {
            color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
        }
        color.toArray( colors, i * 3 );
        sizes[ i ] = 10;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
    //
    var material = new THREE.ShaderMaterial( {
        uniforms: {
            amplitude: { value: 1.0 },
            color:     { value: new THREE.Color( 0xffffff ) },
            texture:   { value: new THREE.TextureLoader().load( SparkImage ) }
        },
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        blending:       THREE.AdditiveBlending,
        depthTest:      false,
        transparent:    true
    });
    //
    sphere = new THREE.Points( geometry, material );
    scene.add( sphere );
    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT );
    var container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );
    stats = new Stats();
    container.appendChild( stats.dom );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}
function render() {
    var time = Date.now() * 0.005;
    sphere.rotation.z = 0.01 * time;
    var geometry = sphere.geometry;
    var attributes = geometry.attributes;
    for ( var i = 0; i < attributes.size.array.length; i++ ) {
        attributes.size.array[ i ] = 14 + 13 * Math.sin( 0.1 * i + time );
    }
    attributes.size.needsUpdate = true;
    renderer.render( scene, camera );
}


// // create the scene
// let scene = new THREE.Scene()
//
// // create the camera
// let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
//
// let renderer = new THREE.WebGLRenderer()
//
// // set size
// renderer.setSize(window.innerWidth, window.innerHeight)
//
// // add canvas to dom
// document.body.appendChild(renderer.domElement)
//
// // add axis to the scene
// let axis = new THREE.AxesHelper(10)
//
// scene.add(axis)
//
// // add lights
// let light = new THREE.DirectionalLight(0xffffff, 1.0)
//
// light.position.set(100, 100, 100)
//
// scene.add(light)
//
// let light2 = new THREE.DirectionalLight(0xffffff, 1.0)
//
// light2.position.set(-100, 100, -100)
//
// scene.add(light2)
//
// let material = new THREE.MeshBasicMaterial({
// 	color: 0xaaaaaa,
// 	wireframe: true
// })
//
// // create a box and add it to the scene
// let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
//
// scene.add(box)
//
// box.position.x = 0.5
// box.rotation.y = 0.5
//
// camera.position.x = 5
// camera.position.y = 5
// camera.position.z = 5
//
// camera.lookAt(scene.position)
//
// function animate(): void {
// 	requestAnimationFrame(animate)
// 	render()
// }
//
// function render(): void {
// 	let timer = 0.002 * Date.now()
// 	box.position.y = 0.5 + 0.5 * Math.sin(timer)
// 	box.rotation.x += 0.1
// 	renderer.render(scene, camera)
// }
//
// animate()
