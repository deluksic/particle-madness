import * as THREE from 'three';

let particleForceShader = {
    vertexShader: `
        uniform sampler2D posTex;
        uniform float size;

        void main() {
            vec2 pos = texture2D(posTex, position.xy).xy;
            gl_Position = vec4(pos*2.0-1.0, 0.0, 1.0);
            gl_PointSize = size;
        }`,
    fragmentShader: `
        uniform float size;
        uniform float magn;
        uniform float centerRadius;

        void main() {
            vec2 toCenter = gl_PointCoord - vec2(0.5,0.5);
            float dist = dot(toCenter, toCenter);
            float mindist = centerRadius/size;
            if (dist > 0.25 || dist < mindist*mindist) discard;
            dist *= 4.0;
            dist = 1.5*(1.0-dist);
            vec2 force = magn*normalize(toCenter)*dist*dist;
            force.x = -force.x;
            gl_FragColor = vec4(force, 0.0, 1.0);
        }`
};

export type ParticleForceMaterialUniforms = {
    posTex: { value: THREE.Texture | undefined },
    size: { value: number },
    centerRadius: { value: number },
    magn: { value: number },
}

export class ParticleForceMaterial extends THREE.ShaderMaterial {
    public uniforms: ParticleForceMaterialUniforms;
    constructor(uniforms: Partial<ParticleForceMaterialUniforms>) {
        super({
            ...particleForceShader,
            blending: THREE.AdditiveBlending
        });
        this.uniforms = {
            magn: { value: 1 },
            size: { value: 10 },
            centerRadius: { value: 2 },
            posTex: { value: undefined },
            ...uniforms
        };
    }
}