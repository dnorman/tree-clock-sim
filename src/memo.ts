import {Slab} from './slab'
import {BufferGeometry, Float32BufferAttribute, Points, Scene} from "three";
import * as THREE from "three";
import * as DiscImage from './textures/sprites/disc.png';


export class Memo {
    from_slab: Slab;
    to_slab: Slab;
    emit_time: number;
    distance: number;
    constructor( from_slab: Slab, to_slab: Slab, emit_time: number ){
        var q = from_slab;
        var p = to_slab;

        // how many frames should this memo be inflight?
        this.emit_time = emit_time;
        this.distance = Math.sqrt( ((q.x - p.x)**2) + ((q.y - p.y)**2) + ((q.z - p.z)**2) );
        this.from_slab = from_slab;
        this.to_slab = to_slab;
    }
}
class MemoUniforms{
    time: Object;
    color: Object;
    texture: Object;
    constructor() {
        {
            var sprite = new THREE.TextureLoader().load( DiscImage );

            this.time = { value: 0 };
            this.color = { value: new THREE.Color( 0xff3333 ) };
            this.texture = { value: sprite };
        }
    }
}

export class MemoSet {
    memos: Array<Memo>;
    geometry: BufferGeometry;
    uniforms: MemoUniforms;
    points: Points;
    pool_size: number;
    constructor(scene: Scene) {
        this.pool_size = 1000;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute('position',      new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3));
        this.geometry.addAttribute('destination', new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3));

        // slab_geometry.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
        this.geometry.addAttribute('emit_time',    new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 1), 1));
        this.geometry.addAttribute('duration', new THREE.Float32BufferAttribute( new Float32Array(this.pool_size * 1), 1));

        this.uniforms = new MemoUniforms();
        this.memos = [];

        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById('memo_vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            alphaTest: 0.5
        });

        this.points = new THREE.Points(this.geometry, material);
        this.points.frustumCulled = false;
        scene.add(this.points);
    }
    update_attributes(){
        var attributes = this.points.geometry;


        var position      = <Float32BufferAttribute> this.geometry.getAttribute('position');
        var destination = <Float32BufferAttribute> this.geometry.getAttribute('destination');
        var emit_time   = <Float32BufferAttribute> this.geometry.getAttribute('emit_time');
        var duration    = <Float32BufferAttribute> this.geometry.getAttribute('duration');

        var from_slab;
        var to_slab;

        for ( var i = 0, l = this.pool_size; i < l; i ++ ) {
            var memo = this.memos[i];
            if (!memo) continue;

            from_slab = memo.from_slab;
            to_slab   = memo.to_slab;
            //console.log("MEOW", from_slab.x, to_slab.x, memo.emit_time, memo.distance);
            position.setXYZ(i, from_slab.x, from_slab.y, from_slab.z);
            destination.setXYZ(i, to_slab.x, to_slab.y, to_slab.z);
            emit_time.setX(i, memo.emit_time );
            duration.setX(i, Math.floor(memo.distance) );

            // console.log('setXYZ');
            // size.setX(i,200); //Math.max( PARTICLE_SIZE, attributes.size.array[i] * .99 );
        }
        
        position.needsUpdate = true;
        destination.needsUpdate = true;
        emit_time.needsUpdate = true;
        duration.needsUpdate = true;

    }
    update (time: number) {
        var uniforms: any = this.uniforms;
        uniforms.time.value = time;
    }
    send_memo(from_slab: Slab, to_slab: Slab, emit_time: number){
        var memo = new Memo(from_slab, to_slab, emit_time);
        this.memos.push( memo );
        this.update_attributes();
    }
}