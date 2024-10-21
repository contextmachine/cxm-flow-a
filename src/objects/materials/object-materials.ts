import * as THREE from "three";


export const selectedColor = '#C0E8FF'
export const lineSelectedColor = "#279EFF"

export const defaultMeshColor = '#888888'

export const transparentColor = "#000000"

export const disabledColor = '#ffffff'
export const lineDisabledColor = '#767676'
export const selectedGroupBoxHelperColor = '#279EFF'
export const activeGroupBoxHelperColor = 'orange'


export const wireframeMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x000000,
  transparent: true,
  opacity: 0.006,
});


export const selectedMaterial = new THREE.MeshStandardMaterial({
  color: selectedColor,
  side: THREE.DoubleSide,
});

export const lineSelectedMaterial = new THREE.LineBasicMaterial({
  color: lineSelectedColor,
} as any);





export const meshDefaultMaterial = new THREE.MeshBasicMaterial({
  color: defaultMeshColor,
  side: THREE.DoubleSide,
});

export const lineDefaultMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
} as any);



export const disabledMaterial = new THREE.MeshStandardMaterial({
  color: disabledColor,
  side: THREE.DoubleSide,
});

export const lineDisabledMaterial = new THREE.LineBasicMaterial({
  color: lineDisabledColor,
} as any);




const vertexShader = /*glsl*/ `
  void main() {
    
  }
`;

const fragmentShader = /*glsl*/ `
  void main() {
      discard;
  }
`;

export const transparentMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

// export const lineDefaultMaterial = new THREE.LineBasicMaterial({
//     color: 0x000000,
// });

// export const lineSelectedMaterial = new MeshLineMaterial({
//     color: lineSelectedColor,
//     resolution: new THREE.Vector2(1, 1)
// })





// const lineVertexShader = /*glsl*/`
// attribute vec3 center;
// varying vec3 vCenter;

// void main() {
//     vCenter = center;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
// }
// `;

// const lineFragmentShader = /*glsl*/`
// varying vec3 vCenter;
// uniform float lineWidth;

// float edgeFactorTri() {
//   vec3 d = fwidth( vCenter.xyz );
//   vec3 a3 = smoothstep( vec3( 0.0 ), d * lineWidth, vCenter.xyz );
//   return min( min( a3.x, a3.y ), a3.z ); }

// void main() {
//   float factor = edgeFactorTri();

//   if ( factor > 0.8 ) discard;

//   gl_FragColor.rgb = mix( vec3( 1.0 ), vec3( 0.2 ), factor);
//   gl_FragColor.a = 1.0;
// }
// `;

// export const lineSelectedMaterial = new THREE.ShaderMaterial({
//     fragmentShader: lineFragmentShader,
//     vertexShader: lineVertexShader,
//     uniforms: {
//         lineWidth: {
//             value: 100
//         }
//     },
//     side: THREE.DoubleSide,
//     linewidth: 10,
// })

// lineSelectedMaterial.extensions.derivatives = true

const testVertexShader = /*glsl*/ `
attribute vec4 color;
varying vec4 myColor;

void main() {
  myColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const testfragmentShader = /*glsl*/ `
varying vec4 myColor;

void main() {
  gl_FragColor = myColor;
}
`;


export const testMaterial = new THREE.ShaderMaterial({
  fragmentShader: testfragmentShader,
  vertexShader: testVertexShader,
  side: THREE.DoubleSide,
})


export const testMaterial2 = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  transparent: true


})