import Memo from './memo'
import * as THREE from "three";
import {BufferGeometry, Scene, Points, Float32BufferAttribute} from "three";
import * as DiscImage from './textures/sprites/disc.png';

var slab_increment = 0;
var all_slabs = [];
var NEIGHBOR_COUNT = 5;

export class Slab {
    id: Number;
    public x: number;
    public y: number;
    public z: number;
    neighbors: Array<Slab>;
    constructor(){
        this.id = slab_increment++;

        this.x = 2000 * Math.random() - 1000;
        this.y = 2000 * Math.random() - 1000;
        this.z = 2000 * Math.random() - 1000;

        this.neighbors = [];

        if ( all_slabs.length > 0 ){
            for ( var i = 0; i < NEIGHBOR_COUNT; i ++ ) {
                var neighbor = all_slabs[Math.floor(Math.random() * all_slabs.length )];
                if (neighbor && this.neighbors.indexOf(neighbor) == -1) {
                    this.neighbors.push(neighbor);
                }
            }
        }
    }
    send_memo() : Memo{
        var neighbor = this.neighbors[Math.floor(Math.random() * this.neighbors.length )];
        return new Memo( this, neighbor )
    }
}
class SlabUniforms{
    time: Number;
    color: Object;
    texture: Object;
    constructor() {
        {
            var sprite = new THREE.TextureLoader().load( DiscImage );

            this.time = 0;
            this.color = { value: new THREE.Color( 0xffffff ) };
            this.texture = { value: sprite };
        }
    }
}

export class SlabSet {
    slabs: Array<Slab>;
    geometry: BufferGeometry;
    uniforms: SlabUniforms;
    points: Points;
    constructor(scene: Scene){
        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute( 'position',    new THREE.Float32BufferAttribute( new Float32Array(10 * 3), 3 ) );
        // slab_geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
        this.geometry.addAttribute( 'size',        new THREE.Float32BufferAttribute( new Float32Array( 10 * 1), 1 ) );

        this.uniforms = new SlabUniforms();
        this.slabs = [];

        var material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'slab_vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            alphaTest: 0.5
        } );

        this.points = new THREE.Points( this.geometry, material );
        scene.add( this.points );
    }

    create_random_slabs( count: number ) {
        for (var i = 0; i < count; i++) {
            var slab = new Slab();
            this.slabs.push(slab);
        }
        this.update_attributes();
    }
    update_attributes(){
        var attributes = this.points.geometry;

        var position = <Float32BufferAttribute> this.geometry.getAttribute('position');
        var size     = <Float32BufferAttribute> this.geometry.getAttribute('size');

        for ( var i = 0, l = this.slabs.length; i < l; i ++ ) {
            var slab = this.slabs[i];
            position.setXYZ(i, slab.x, slab.y, slab.z);
            console.log('setXYZ');
            size.setX(i,200); //Math.max( PARTICLE_SIZE, attributes.size.array[i] * .99 );
        }

        console.log(position.array.length);
        position.needsUpdate = true;
        size.needsUpdate = true;

    }
    update (time: number){

        // var positions = new Float32Array( vertices.length * 3 );
        // var colors = new Float32Array( vertices.length * 3 );
        // var sizes = new Float32Array( vertices.length );
        // for (let slab of this.slabs){
        //     vertices.push( slab.x, slab.y, slab.z );
        //     sizes.push( PARTICLE_SIZE * 0.5 );
        //
        //     // var color = new THREE.Color();
        //     // //color.setHSL( 0.01 + 0.2 * ( i / l ), 1.0, 0.5 );
        //     // color.setHSL( 0.01 + 0.2 * ( slab.id / PARTICLE_COUNT ), 1.0, 0.5 );
        //     // colors.push( color );
        //     // color.toArray( colors, slab.id * 3 );
        // }


        this.uniforms.time = time;


        // if (frame % 10 == 0) {
        //     send_memos();
        // }

    }


        //
        // var memo_geometry = new THREE.BufferGeometry();
        // memo_geometry.addAttribute( 'position',    new THREE.Float32BufferAttribute( starts,       3 ) );
        // memo_geometry.addAttribute( 'destination', new THREE.Float32BufferAttribute( destinations, 3 ) );
        // memo_geometry.addAttribute( 'steps',       new THREE.Float32BufferAttribute( steps_list, 1 ) );
        // memo_geometry.addAttribute( 'start ',      new THREE.Float32BufferAttribute( starts_list, 1 ) );
        //
        //


    // function send_memos(){
    //     var slab_geometry = slab_points.geometry;
    //     var slab_attributes = slab_geometry.attributes;
    //     for (let slab of slabs){
    //         let number = (Math.random() * PARTICLE_COUNT);
    //         if (number < 0.5 ) {
    //             inflight_memos.push(slab.send_memo())
    //             slab_attributes.size.array[slab.id] = PARTICLE_SIZE * 2;
    //         }
    //     }
    // }
}