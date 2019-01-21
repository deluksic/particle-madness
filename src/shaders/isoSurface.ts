import * as THREE from 'three';

let isoSurfaceShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float low;
        uniform float high;

        varying vec2 vUv;

        vec3 hsv2rgb(vec3 c)
        {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            float magnSq = dot(texel.xy, texel.xy);
            float dir = atan(texel.y, texel.x) / 3.14159 * 0.5;
            float low2 = low*low;
            float high2 = high*high;
            if(magnSq < low2) discard;
            if(magnSq > high2) discard;
            // float k = (magnSq - low2) / (high2 - low2);
            // gl_FragColor = vec4(hsv2rgb(vec3(dir, 1.0, mix(0.0, 1.0, k))), 1.0);
            gl_FragColor = vec4(hsv2rgb(vec3(dir, 1.0, clamp(magnSq * 10.0, 0.0, 1.0))), 1.0);
        }`
};

export type IsoSurfaceMaterialUniforms = {
    tDiffuse: { value: THREE.Texture },
    low: { value: number },
    high: { value: number }
}

export class IsoSurfaceMaterial extends THREE.ShaderMaterial {
    public uniforms: IsoSurfaceMaterialUniforms;
    constructor(uniforms: Partial<IsoSurfaceMaterialUniforms>) {
        super(isoSurfaceShader);
        this.uniforms = {
            tDiffuse: { value: null },
            low: { value: 0.8 },
            high: { value: 1.0 },
            ...uniforms
        };
    }
}