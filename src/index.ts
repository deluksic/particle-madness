import * as THREE from 'three';
import { Simulation } from "./simulation";
import { RenderableVertex } from 'three';

require('three/examples/js/controls/OrbitControls');
require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/TexturePass');
require('three/examples/js/postprocessing/ClearPass');
require('three/examples/js/shaders/CopyShader');

let canvas: HTMLCanvasElement;
let simulation: Simulation;
let renderer: THREE.WebGLRenderer;

function init() {
    canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
    if (!canvas) {
        throw new Error("No canvas found.");
    }
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
    });
    renderer.context.getExtension('EXT_color_buffer_float');
    simulation = new Simulation(renderer);
}

function loop() {
    simulation.update();
    requestAnimationFrame(loop);
}

init();
loop();
