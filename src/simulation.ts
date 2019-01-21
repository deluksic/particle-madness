import * as THREE from 'three';
import { RandomInitParticlesMaterial } from './shaders/randomInitParticles';
import { ParticleForceMaterial } from './shaders/particleForce';
import { getParticlesTexturePositions, particlePositionRenderTarget } from './utils/particleTexture';
import { ComputeStepMaterial } from './shaders/computeStep';
import * as _ from 'lodash';
import { MouseForceMaterial } from './shaders/mouseForce';
import { IsoSurfaceMaterial } from './shaders/isoSurface';
import { GUI } from 'dat.gui';

export class Simulation {
    public renderer: THREE.WebGLRenderer;
    public partCount: number;
    public maxPartCount: number;

    public computeStep: THREE.EffectComposer;
    public posRenderTarget: THREE.WebGLRenderTarget;
    public resetPositionPass: THREE.Pass;
    public resetMaterial: RandomInitParticlesMaterial;
    public computeStepPass: THREE.Pass;
    public computeStepMaterial: ComputeStepMaterial;

    public points: THREE.Points;
    public pointsGeometry: THREE.BufferGeometry;
    public scene: THREE.Scene;
    public camera: THREE.OrthographicCamera;

    public computeForce: THREE.EffectComposer;
    public mouseForcePass: THREE.Pass;
    public mouseForceMaterial: MouseForceMaterial;
    public computeForcePass: THREE.Pass;
    public computeForceRenderTarget: THREE.WebGLRenderTarget;
    public computeForceMaterial: ParticleForceMaterial;
    public isoSurfaceMaterial: IsoSurfaceMaterial;

    constructor(
        renderer: THREE.WebGLRenderer,
        partCount = 700,
        forceResolution = { x: 512, y: 512 }
    ) {
        this.renderer = renderer;
        this.renderer.autoClear = false;
        this.renderer.autoClearColor = false;
        this.partCount = partCount;

        // add mouse interaction
        // this.renderer.domElement.addEventListener('mousemove', (ev) => this.handleMouse(ev));
        document.addEventListener('mousemove', (ev) => this.handleMouse(ev));

        this.posRenderTarget = particlePositionRenderTarget(this.partCount);
        this.maxPartCount = this.posRenderTarget.width * this.posRenderTarget.height;
        this.computeForceRenderTarget = new THREE.WebGLRenderTarget(
            forceResolution.x, forceResolution.y, {
                format: THREE.RGBAFormat,
                type: THREE.FloatType
            }
        );

        this.computeStepMaterial = new ComputeStepMaterial({});
        this.resetMaterial = new RandomInitParticlesMaterial({
            minVX: { value: -0.01 },
            minVY: { value: -0.01 },
            maxVX: { value: 0.01 },
            maxVY: { value: 0.01 }
        });

        // compute composer does the calculations
        this.resetPositionPass = new THREE.ShaderPass(this.resetMaterial);
        this.computeStepPass = new THREE.ShaderPass(this.computeStepMaterial, 'posTex');


        this.computeStep = new THREE.EffectComposer(this.renderer, this.posRenderTarget);
        this.computeStep.addPass(this.resetPositionPass); // gets disabled on update
        this.computeStep.addPass(this.computeStepPass);

        // points rendering scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 1, 100);
        this.camera.position.set(0, 0, 5);
        this.camera.zoom = 2;
        this.camera.updateProjectionMatrix();

        this.pointsGeometry = new THREE.BufferGeometry();
        this.pointsGeometry.setFromPoints(getParticlesTexturePositions(this.partCount));
        this.computeForceMaterial = new ParticleForceMaterial({
            size: { value: 50 },
            centerRadius: { value: 1 }
        });
        this.mouseForceMaterial = new MouseForceMaterial({
            size: { value: 0.3 }
        })

        this.points = new THREE.Points(this.pointsGeometry, this.computeForceMaterial);
        this.points.frustumCulled = false;
        this.scene.add(this.points);

        this.computeForce = new THREE.EffectComposer(this.renderer, this.computeForceRenderTarget);
        this.mouseForcePass = new THREE.ShaderPass(this.mouseForceMaterial);
        this.mouseForcePass.needsSwap = true;
        this.computeForcePass = new THREE.RenderPass(this.scene, this.camera);
        this.computeForcePass.needsSwap = false
        this.isoSurfaceMaterial = new IsoSurfaceMaterial({
            low: { value: 1.5 },
            high: { value: 2 }
        });
        this.computeForce.addPass(new (THREE as any).ClearPass(0x0, 0.0));
        this.computeForce.addPass(this.mouseForcePass);
        this.computeForce.addPass(this.computeForcePass);
        let pass = new THREE.ShaderPass(this.isoSurfaceMaterial);
        pass.needsSwap = false;
        this.computeForce.addPass(pass);

        _.last(this.computeForce.passes).renderToScreen = true;

        let gui = new GUI({
            width: 350
        });
        let params = {
            damping: 0.4
        };
        this.computeStepMaterial.setVelocityHalfLife(params.damping);
        gui.add(this, 'partCount', 1, this.maxPartCount).name("Particle count").onChange(() => this.setParticleCount(this.partCount));
        gui.add(this.computeForceMaterial.uniforms.size, 'value', 1, 256).name("Force size");
        gui.add(this.computeForceMaterial.uniforms.magn, 'value', 0.0, 4.0).name("Force magn");
        gui.add(this.computeForceMaterial.uniforms.velocityInfluence, 'value', 0, 10).name("Velocity influence");
        gui.add(this.mouseForceMaterial.uniforms.size, 'value', 0.0, 1.0).name("Mouse force size");
        gui.add(this.mouseForceMaterial.uniforms.magn, 'value', 0.0, 4.0).name("Mouse force magn");
        gui.add(this.isoSurfaceMaterial.uniforms.low, 'value', 0.0, 4.0).name("Iso-surface low");
        gui.add(this.isoSurfaceMaterial.uniforms.high, 'value', 0.0, 4.0).name("Iso-surface high");
        gui.add(this.computeStepMaterial.uniforms.stepSize, 'value', 0.0, 0.1).name("Step size").onChange(() => this.recalcDamping(params.damping));
        gui.add(params, 'damping', 0, 3).name("Velocity half life").onChange((d: number) => this.recalcDamping(d));
        gui.add(this, 'reset').name("Reset");
    }

    protected handleMouse(ev: MouseEvent): any {
        this.mouseForceMaterial.uniforms.mouse.value.set(
            ev.clientX / this.renderer.domElement.width,
            1 - ev.clientY / this.renderer.domElement.height,
        );
    }

    public update(): void {
        // randomize using time
        this.resetMaterial.uniforms.seed.value = (performance.now() / 1000 % 1.0);
        // set up newest particle positions
        this.computeForceMaterial.uniforms.posTex.value = this.computeStep.readBuffer.texture;
        // first compute positions then trails
        this.computeForce.render();
        // set up force field to newest render
        this.computeStepMaterial.uniforms.forceField.value = this.computeForce.readBuffer.texture;
        // compute the single step using computed force field
        this.computeStep.render();
        // turn off reset if it was enabled
        this.resetPositionPass.enabled = false;
    }

    public reset(): void {
        this.resetPositionPass.enabled = true;
    }

    public setParticleCount(count: number) {
        if (count == 0 || count > this.maxPartCount) {
            throw new Error(`Number of particles must be in range [0, ${this.maxPartCount}] for this position texture.`);
        }
        this.partCount = count;
        this.pointsGeometry.setFromPoints(getParticlesTexturePositions(this.partCount));
    }

    public recalcDamping(damping: number) {
        this.computeStepMaterial.setVelocityHalfLife(damping);
    }
}