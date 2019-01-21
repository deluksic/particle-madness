import * as THREE from 'three';

let computeStepShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform sampler2D posTex;
        uniform sampler2D forceField;
        uniform float timeScale;
        uniform float stepSize;
        uniform float damping;
        varying vec2 vUv;

        void main() {
            vec4 particle = texture2D(posTex, vUv);
            vec2 pos = particle.xy;
            vec2 vel = particle.zw;
            vec4 acc = texture2D(forceField, pos);
            pos += (vel + acc.xy*0.5*stepSize)*stepSize;
            vel += acc.xy*stepSize;
            vel *= damping;
            if(pos.x < 0.0 || pos.x > 1.0){
                pos.x = clamp(pos.x, 0.0, 1.0);
                vel.x *= -1.0;
            }
            if(pos.y < 0.0 || pos.y > 1.0){
                pos.y = clamp(pos.y, 0.0, 1.0);
                vel.y *= -1.0;
            }
            // pos.x = mod(pos.x+2.0,1.0);
            // pos.y = mod(pos.y+2.0,1.0);
            particle.xy = pos;
            particle.zw = vel;
            gl_FragColor = particle;
        }`
};

export type ComputeStepMaterialUniforms = {
    posTex: { value: THREE.Texture | undefined },
    forceField: { value: THREE.Texture | undefined },
    stepSize: { value: number },
    damping: { value: number },
}

export class ComputeStepMaterial extends THREE.ShaderMaterial {
    public uniforms: ComputeStepMaterialUniforms;
    constructor(uniforms: Partial<ComputeStepMaterialUniforms>) {
        super(computeStepShader);
        this.uniforms = {
            posTex: { value: undefined },
            forceField: { value: undefined },
            stepSize: { value: 1 / 60 },
            damping: { value: 1.0 },
            ...uniforms
        };
    }

    public setVelocityHalfLife(halflife: number): void {
        this.uniforms.damping.value = Math.exp(Math.log(0.5) / (halflife / this.uniforms.stepSize.value));
    }
}