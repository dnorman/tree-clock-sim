import {Slab} from './slab'

export default class Memo {
    from_slab: Slab;
    to_slab: Slab;
    remaining_frames: Number;
    constructor( from_slab: Slab, to_slab: Slab ){
        var q = from_slab;
        var p = to_slab;

        // how many frames should this memo be inflight?
        var distance = Math.sqrt( ((q.x - p.x)^2) + ((q.y - p.y)^2) + ((q.z - p.z)^2) );

        // how far in each direction should we travel per frame?
        // this.unit_vector = ?
        // this.remaining_frames = Math.floor(distance)
        // this.from_slab = from_slab;
        // this.to_slab = to_slab;
    }
    update() {

    }
}



//material = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
//material.color.setHSL( 1.0, 0.3, 0.7 );
//
// memo_uniforms = {
//     time:    { value: 1.0 },
//     color:   { value: new THREE.Color( 0xffffff ) },
//     texture: { value: sprite },
// };
//
// var memo_material = new THREE.ShaderMaterial( {
//     uniforms: memo_uniforms,
//     vertexShader: document.getElementById( 'memo_vertexshader' ).textContent,
//     fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
//     alphaTest: 0.5
// } );
//
// memo_points = new THREE.Points( slab_geometry, memo_material );


// scene.add( memo_points );
//