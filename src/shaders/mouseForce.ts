import * as THREE from 'three';

let mouseForceShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform vec2 mouse;
        uniform float size;
        uniform float magn;

        varying vec2 vUv;

        void main() {
            vec2 toCenter = vUv - mouse;
            float dist = dot(toCenter, toCenter)/size/size;
            if (dist > 1.0) discard;
            dist = 1.5*(1.0-dist);
            gl_FragColor = vec4(magn*normalize(toCenter)*dist*dist, 0.0, 1.0);
        }`
};

export type MouseForceMaterialUniforms = {
    mouse: { value: THREE.Vector2 },
    size: { value: number },
    magn: { value: number },
}

export class MouseForceMaterial extends THREE.ShaderMaterial {
    public uniforms: MouseForceMaterialUniforms;
    constructor(uniforms: Partial<MouseForceMaterialUniforms>) {
        super({
            ...mouseForceShader,
            blending: THREE.AdditiveBlending
        });
        this.uniforms = {
            magn: { value: 1 },
            size: { value: 10 },
            mouse: { value: new THREE.Vector2(10, 10) },
            ...uniforms
        };
    }
}