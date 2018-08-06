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
    index: number;
    public color: THREE.Color;
    public delivered: boolean;
    constructor( from_slab: Slab, to_slab: Slab, emit_time: number, color: THREE.Color, index: number ){
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
        this.index = index;
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
    max_allocated_index: number;
    geometry: BufferGeometry;
    uniforms: MemoUniforms;
    points: Points;
    pool_size: number;
    status: Object;
    positionAttribute: THREE.BufferAttribute;
    customColorAttribute: THREE.Float32BufferAttribute;
    destinationAttribute: THREE.Float32BufferAttribute;
    emitTimeAttribute: THREE.Float32BufferAttribute;
    durationAttribute: THREE.Float32BufferAttribute;

    constructor(scene: Scene, status: Object) {
        this.pool_size = 100000;
        this.status = status;
        this.max_allocated_index = -1;

        this.memo_free_slots = new Array(this.pool_size);
        for (let i=0;i<this.pool_size;i++){
            this.memo_free_slots[i] = (this.pool_size - i) - 1;
        }

        this.geometry = new THREE.BufferGeometry();

        this.positionAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3);
        this.positionAttribute.dynamic = true;
        this.geometry.addAttribute('position',  this.positionAttribute);

        this.customColorAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3);
        this.customColorAttribute.dynamic = true;
        this.geometry.addAttribute('customColor', this.customColorAttribute );

        this.destinationAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 3), 3);
        this.destinationAttribute.dynamic = true;
        this.geometry.addAttribute('destination', this.destinationAttribute);

        this.emitTimeAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 1), 1);
        this.emitTimeAttribute.dynamic = true;
        this.geometry.addAttribute('emit_time', this.emitTimeAttribute );

        this.durationAttribute = new THREE.Float32BufferAttribute(new Float32Array(this.pool_size * 1), 1);
        this.durationAttribute.dynamic = true;
        this.geometry.addAttribute('duration', this.durationAttribute );

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
    update_attributes(memo){

        var index : number = memo.index;
        var from_slab = memo.from_slab;
        var to_slab   = memo.to_slab;

        this.positionAttribute.setXYZ(index, from_slab.x, from_slab.y, from_slab.z);
        this.destinationAttribute.setXYZ(index, to_slab.x, to_slab.y, to_slab.z);
        this.emitTimeAttribute.setX(index, memo.emit_time );
        this.durationAttribute.setX(index, memo.duration );
        this.customColorAttribute.setXYZ(index, memo.color.r, memo.color.g, memo.color.b);

        // this.update_range =


        var ur = this.positionAttribute.updateRange;

        // TODO: this is pretty ugly. Clean it up
        if (ur.count == -1){
            ur.offset = index;
            ur.count = 1;
        }else if (index < ur.offset){
            // EG: offset was 10, count was 2
            // index is 9, new count should be 3, and offset = 9
            ur.count = ur.count + (ur.offset - index);
            ur.offset = index;
        }else if ( ur.offset + Math.max(ur.count,0) < index ){
            // EG: offset was 9, count was 3
            // index was 13, new count should be 4
            ur.count = ur.count + ( index - (ur.offset + ur.count) );
        }

        // = this.update_range;
        this.destinationAttribute.updateRange  = ur;
        this.emitTimeAttribute.updateRange = ur;
        this.durationAttribute.updateRange = ur;
        this.customColorAttribute.updateRange = ur;

        //
        this.positionAttribute.needsUpdate = true;
        this.destinationAttribute.needsUpdate = true;
        this.emitTimeAttribute.needsUpdate = true;
        this.durationAttribute.needsUpdate = true;
        this.customColorAttribute.needsUpdate = true;
        //
        // this.positionAttribute.updateRange  = {offset:0, count: 2};
        // this.destinationAttribute.updateRange = {offset:0, count: 2};
        // this.emitTimeAttribute.updateRange = {offset:0, count: 2};
        // this.durationAttribute.updateRange = {offset:0, count: 2};
        // this.customColorAttribute.updateRange = {offset:0, count: 2};


    }
    update (time: number) {
        for (let i=0; i < this.memos.length; i++){
            var memo = this.memos[i];
            if (time > memo.emit_time + memo.duration){ // will need to extend this if there's any delivery flourish
                memo.deliver();
                this.deallocate(i);
            }
        }
        var uniforms: any = this.uniforms;
        uniforms.time.value = time;
    }
    reset_all_colors(){
        var customColor = <Float32BufferAttribute> this.geometry.getAttribute('customColor');
        var memo;

        var newcolor = new THREE.Color(0xffffff);
        for ( var i = 0, l = this.memos.length; i < l; i ++ ) {
            memo = this.memos[i];
            memo.color = newcolor.clone();
            customColor.setXYZ(i, memo.color.r, memo.color.g, memo.color.b);
        }
        // Using the big hammer here, because this is the only place we should ever update the whole lot of 'em
        customColor.needsUpdate = true;
    }
    send_memo(from_slab: Slab, to_slab: Slab, emit_time: number, color: THREE.Color){ // color is a cheap analog for tree clock fragment
        var index = this.allocate();
        if (typeof index == 'undefined'){
            var status : any = this.status;
            status.run = false;
            alert("Exceeded maximum memo inflight buffer size");
            return;
        }

        var memo = new Memo(from_slab, to_slab, emit_time, color, index);
        this.memos[index] = memo;

        this.update_attributes(memo);
    }
    allocate() {
        var index = this.memo_free_slots.pop();
        if (index > this.max_allocated_index) {
            this.max_allocated_index = index;
            //this.geometry.setDrawRange( 0, this.max_allocated_index + 1 );
        }
        return index;
    }
    deallocate(index: number) {
        this.memo_free_slots.push(index);

        // TODO: more efficiently manage this so we don't have to iterate the active slots to update max_allocated_index downward
        //
        //this.geometry.setDrawRange( 0, this.max_allocated_index + 1 );

    }
}