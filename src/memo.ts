import {Slab} from './slab'
import {BufferGeometry, Float32BufferAttribute, Points, Scene, Vector3} from "three";
import * as THREE from "three";
import * as DiscImage from './textures/sprites/disc.png';

let speed = 5.0;

export class Memo {
    from_slab: Slab;
    to_slab: Slab;
    emit_time: number;
    distance: number;
    duration: number;
    public color: THREE.Color;
    public delivered: boolean;
    constructor( from_slab: Slab, to_slab: Slab, emit_time: number, color: THREE.Color ){
        var q = from_slab;
        var p = to_slab;

        // how many frames should this memo be inflight?
        this.color = color;//new THREE.Color( 0xffffff );
        this.emit_time = emit_time;
        this.distance = Math.sqrt( ((q.x - p.x)**2) + ((q.y - p.y)**2) + ((q.z - p.z)**2) );
        this.duration = Math.floor(this.distance / speed );
        this.from_slab = from_slab;
        this.to_slab = to_slab;
        this.delivered = false;
    }
    deliver(){
        this.to_slab.deliver(this);
        this.delivered = true;
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
            this.color = { value: new THREE.Color( 0xcccccc ) };
            this.texture = { value: sprite };
        }
    }
}

export class MemoSet {
    memos: Array<Memo>;
    memo_free_slots: Array<number>;
    geometry: BufferGeometry;
    uniforms: MemoUniforms;
    points: Points;
    pool_size: number;
    status: Object;
    constructor(scene: Scene, status: Object) {
        this.pool_size = 10000;
        this.status = status;

        this.memo_free_slots = new Array(this.pool_size);
        for (let i=0;i<this.pool_size;i++){
            this.memo_free_slots[i] = (this.pool_size - i) - 1;
        }

        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute('position',      new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3));
        this.geometry.addAttribute('customColor', new THREE.Float32BufferAttribute( new Float32Array( this.pool_size * 3), 3 ) );

        this.geometry.addAttribute('destination', new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3));

        this.geometry.addAttribute('emit_time',    new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 1), 1));
        this.geometry.addAttribute('duration', new THREE.Float32BufferAttribute( new Float32Array(this.pool_size * 1), 1));

        this.uniforms = new MemoUniforms();
        this.memos = [];

        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById('memo_vertexshader').textContent,
            fragmentShader: document.getElementById('memo_fragmentshader').textContent,
            alphaTest: 0.5
        });

        this.points = new THREE.Points(this.geometry, material);
        this.points.frustumCulled = false;
        scene.add(this.points);
    }
    update_attributes(){
        var attributes = this.points.geometry;


        var position    = <Float32BufferAttribute> this.geometry.getAttribute('position');
        var destination = <Float32BufferAttribute> this.geometry.getAttribute('destination');
        var emit_time   = <Float32BufferAttribute> this.geometry.getAttribute('emit_time');
        var duration    = <Float32BufferAttribute> this.geometry.getAttribute('duration');
        var customColor = <Float32BufferAttribute> this.geometry.getAttribute('customColor');


        var from_slab;
        var to_slab;

        for ( var i = 0, l = this.pool_size; i < l; i ++ ) {
            var memo = this.memos[i];
            if (!memo) continue;

            from_slab = memo.from_slab;
            to_slab   = memo.to_slab;
            position.setXYZ(i, from_slab.x, from_slab.y, from_slab.z);
            destination.setXYZ(i, to_slab.x, to_slab.y, to_slab.z);
            emit_time.setX(i, memo.emit_time );
            duration.setX(i, memo.duration );
            customColor.setXYZ(i, memo.color.r, memo.color.g, memo.color.b);
        }
        
        position.needsUpdate = true;
        destination.needsUpdate = true;
        emit_time.needsUpdate = true;
        duration.needsUpdate = true;
        customColor.needsUpdate = true;

    }
    update (time: number) {
        for (let i=0; i < this.memos.length; i++){
            var memo = this.memos[i];
            if (time > memo.emit_time + memo.duration){ // will need to extend this if there's any delivery flourish
                memo.deliver();
                this.memo_free_slots.push(i);
            }
        }
        var uniforms: any = this.uniforms;
        uniforms.time.value = time;
    }
    reset_all_colors(){

        for (let memo of this.memos) {
            memo.color = new THREE.Color(0xffffff);
        }
        this.update_attributes();
    }
    send_memo(from_slab: Slab, to_slab: Slab, emit_time: number, color: THREE.Color){ // color is a cheap analog for tree clock fragment
        var memo = new Memo(from_slab, to_slab, emit_time, color);

        var index = this.memo_free_slots.pop();

        if (typeof index == 'undefined'){
            var status : any = this.status;
            status.run = false;
            alert("Exceeded maximum memo inflight buffer size");
            return;
        }

        this.memos[index] = memo;
        this.update_attributes();
    }
}