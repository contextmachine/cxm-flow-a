import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import * as THREE from "three"
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass"

class ComposerPipe {
    public composer: EffectComposer
    public renderPass: RenderPass

    private _renderer: THREE.WebGLRenderer
    private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
    private _scene: THREE.Scene

    constructor(
        renderer: THREE.WebGLRenderer,
        camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
        scene: THREE.Scene,
    ) {
        this._renderer = renderer
        renderer.autoClear = false
        this._camera = camera
        this._scene = scene

        const { composer, renderPass } = this.setupComposer()

        this.composer = composer
        this.renderPass = renderPass
    }

    public get wh(): THREE.Vector2 {
        const t = new THREE.Vector2()
        this._renderer.getSize(t)
        return t
    }

    public resize(): void {
        const [width, height] = [...this.wh.toArray()]
        if (this._camera instanceof THREE.PerspectiveCamera) {
            this._camera.aspect = width / height
        } else {
            Object.assign(this._camera, {
                left: -width / 2,
                right: width / 2,
                top: height / 2,
                bottom: -height / 2
            })
        }
        this.composer.setSize(width, height)
        this._camera.updateProjectionMatrix()
    }

    private setupComposer() {
        const [width, height] = [...this.wh.toArray()]
        const renderTarget = new THREE.WebGLRenderTarget(width, height, {})
        renderTarget.samples = 10

        const composer = new EffectComposer(this._renderer, renderTarget)
        const renderPass = new RenderPass(this._scene, this._camera)

        const ratio = this._renderer.getPixelRatio()
        const smaaPass = new SMAAPass(window.innerWidth * ratio, window.innerHeight * ratio)

        composer.addPass(renderPass)
        // composer.addPass(smaaPass)

        return ({ composer, renderPass })
    }
}

export default ComposerPipe