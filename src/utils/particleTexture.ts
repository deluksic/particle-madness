import * as THREE from 'three';

/**
 * Calculates side length (pow 2) of a square texture needed for a given number of particles.
 * @param count Number of particles
 */
export function getParticlesTextureSide(count: number): number {
    let x = Math.ceil(Math.sqrt(count)); // this gives us ideal side length,
    return Math.pow(2, Math.ceil(Math.log2(x))); // but we need power of 2
}

/**
 * Generates a grid of positions used as uv coordinates to read particle positions.
 * @param count Number of particles
 */
export function getParticlesTexturePositions(count: number, posTexSide?: number): THREE.Vector3[] {
    let points: THREE.Vector3[] = [];
    let w = posTexSide || getParticlesTextureSide(count);
    outer: for (let i = 0; i < w; ++i) {
        for (let j = 0; j < w; ++j) {
            points.push(new THREE.Vector3(i, j, 0).divideScalar(w));
            if (points.length >= count) {
                break outer;
            }
        }
    }
    return points;
}

/**
 * Generates a new render target to be used for tracking particle locations.
 * 
 * Channels:
 * r: x
 * g: y
 * b: vx
 * a: vy
 * @param partCount Number of particles
 */
export function particlePositionRenderTarget(partCount: number): THREE.WebGLRenderTarget {
    let posTexSide = getParticlesTextureSide(partCount);
    return new THREE.WebGLRenderTarget(posTexSide, posTexSide, {
        anisotropy: 0,
        depthBuffer: false,
        format: THREE.RGBAFormat,
        generateMipmaps: false,
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        stencilBuffer: false,
        type: THREE.FloatType,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
    });
}