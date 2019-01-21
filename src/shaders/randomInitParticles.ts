import * as THREE from 'three';

let randomInitParticlesShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform float seed;
        uniform float minX;
        uniform float maxX;
        uniform float minY;
        uniform float maxY;
        uniform float minVX;
        uniform float maxVX;
        uniform float minVY;
        uniform float maxVY;
        varying vec2 vUv;

        float random(const vec2 co) {
            float t = dot(vec2(12.9898, 78.233), co);
            return fract(sin(t) * (123.567 + t));
        }

        void main() {
            vec4 particle;
            particle.x = mix(minX, maxX, random(vUv + seed + 5.0));
            particle.y = mix(minY, maxY, random(3.0*vUv - seed + 6.0));
            particle.z = mix(minVX, maxVX, random(3.0*vUv + 2.0*seed + 7.0));
            particle.w = mix(minVY, maxVY, random(3.0*vUv - 2.0*seed + 8.0));
            gl_FragColor = particle;
        }`
};

export type RandomInitParticlesMaterialUniforms = {
    seed: { value: number },
    minX: { value: number },
    maxX: { value: number },
    minY: { value: number },
    maxY: { value: number },
    minVX: { value: number },
    maxVX: { value: number },
    minVY: { value: number },
    maxVY: { value: number },
}

export class RandomInitParticlesMaterial extends THREE.ShaderMaterial {
    public uniforms: RandomInitParticlesMaterialUniforms;
    constructor(uniforms: Partial<RandomInitParticlesMaterialUniforms>) {
        super({
            ...randomInitParticlesShader,
            blending: THREE.NoBlending
        });
        this.uniforms = {
            seed: { value: 0 },
            minX: { value: 0 },
            maxX: { value: 1 },
            minY: { value: 0 },
            maxY: { value: 1 },
            minVX: { value: -0.1 },
            maxVX: { value: 0.1 },
            minVY: { value: -0.1 },
            maxVY: { value: 0.1 },
            ...uniforms
        };
    }
}