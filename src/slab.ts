import {Memo,MemoSet} from './memo'
import * as THREE from "three";
import {BufferGeometry, Scene, Camera, Color, Points, Float32BufferAttribute, Raycaster} from "three";
import * as DiscImage from './textures/sprites/disc.png';

var NEIGHBOR_COUNT = 10;

export class Slab {
    id: number;
    public x: number;
    public y: number;
    public z: number;
    public color: Color;
    neighbors: Array<Slab>;
    slabset: SlabSet;
    constructor(slabset: SlabSet, id: number, threedim: boolean){
        this.id = id;

        this.x = 2000 * Math.random() - 1000;
        this.y = 2000 * Math.random() - 1000;
        if (threedim) {
            this.z = 2000 * Math.random() - 1000;
        }else{
            this.z = 0;
        }
        this.color = new THREE.Color( 0xffffff );

        this.slabset = slabset;

        this.neighbors = [];

        if ( slabset.slabs.length > 0 ){
            for ( var i = 0; i < NEIGHBOR_COUNT; i ++ ) {
                var neighbor = slabset.slabs[Math.floor(Math.random() * slabset.slabs.length )];
                if (neighbor && this.neighbors.indexOf(neighbor) == -1) {
                    this.neighbors.push(neighbor);
                }
            }
        }
    }
    select_peer(){
        var peer = this.neighbors[Math.floor(Math.random() * this.neighbors.length )];
        return peer;
    }
    deliver(memo: Memo) {
        this.update_color( this.color.multiply(memo.color) );
    }
    update_color (color){
        this.color = color;
        var customColor = <Float32BufferAttribute> this.slabset.geometry.getAttribute('customColor');
        customColor.setXYZ(this.id, color.r, color.g, color.b);
        customColor.needsUpdate = true;
    }
}
class SlabUniforms{
    time: Object;
    color: Object;
    texture: Object;
    constructor() {
        {
            var sprite = new THREE.TextureLoader().load( DiscImage );

            this.time = { value: 0 };
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
    memoset: MemoSet;
    raycaster: Raycaster;
    constructor(scene: Scene, slab_count: number ){
        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute( 'position',    new THREE.Float32BufferAttribute( new Float32Array(slab_count * 3), 3 ) );
        this.geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( new Float32Array(slab_count * 3), 3 ) );
        this.geometry.addAttribute( 'last_memo_time', new THREE.Float32BufferAttribute( new Float32Array( slab_count * 1), 1 ) );

        this.uniforms = new SlabUniforms();
        this.slabs = [];

        var material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'slab_vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            alphaTest: 0.5
        } );

        this.raycaster = new THREE.Raycaster();
        this.points = new THREE.Points( this.geometry, material );
        scene.add( this.points );

        this.memoset = new MemoSet(scene);
    }

    create_random_slabs( count: number, threedim: boolean ) {
        for (var i = 0; i < count; i++) {
            var slab = new Slab(this, i, threedim);
            this.slabs.push(slab);
        }
        this.update_attributes();
    }
    select_random_slab() : Slab {
        return this.slabs[Math.floor(Math.random() * this.slabs.length )];
    }
    update_attributes(){
        var attributes = this.points.geometry;

        var position = <Float32BufferAttribute> this.geometry.getAttribute('position');
        var customColor = <Float32BufferAttribute> this.geometry.getAttribute('customColor');

        for ( var i = 0, l = this.slabs.length; i < l; i ++ ) {
            var slab = this.slabs[i];
            position.setXYZ(i, slab.x, slab.y, slab.z);
            customColor.setXYZ(i, slab.color.r, slab.color.g, slab.color.b);
            // console.log('setXYZ');
            // size.setX(i,200); //Math.max( PARTICLE_SIZE, attributes.size.array[i] * .99 );
        }

        console.log(position.array.length);
        position.needsUpdate = true;
        customColor.needsUpdate = true;

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

        var uniforms : any = this.uniforms;
        uniforms.time.value = time;

        //if (time % 10 == 0) {
            this.send_memos(time);
        //}

        this.memoset.update(time);
    }
    send_memos(time){

        var last_memo_time = <Float32BufferAttribute> this.geometry.getAttribute('last_memo_time');
        var other_slab;
        for (let slab of this.slabs){
            let number = (Math.random() * 20 );//this.slabs.length);
            if (number < 0.5 ) {
                other_slab = slab.select_peer();
                if (other_slab) {
                    //last_memo_time.setX(slab.id, time);
                    this.memoset.send_memo(slab, other_slab,time, slab.color);
                }
            }
        }
        //last_memo_time.needsUpdate = true;
    }
        //
        // var memo_geometry = new THREE.BufferGeometry();
        // memo_geometry.addAttribute( 'position',    new THREE.Float32BufferAttribute( starts,       3 ) );
        // memo_geometry.addAttribute( 'destination', new THREE.Float32BufferAttribute( destinations, 3 ) );
        // memo_geometry.addAttribute( 'steps',       new THREE.Float32BufferAttribute( steps_list, 1 ) );
        // memo_geometry.addAttribute( 'start ',      new THREE.Float32BufferAttribute( starts_list, 1 ) );
        //
        //



}