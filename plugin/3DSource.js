
class Source3D extends Source {
    constructor() {
        super();
        this.graphCtx = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);

        this.xRot = 0;
        this.yRot = 0;
        this.zRot = 0;
        this.isMatOn = false;
        this.isModelReady = false;
        this.isTextureReady = false;

        this.model;
        this.texture;
    }

    loadModel(file) {
        this.isModelReady = false;
        this.model = loadModel(MODEL_PATH + file.name, true, this.onModelLoaded.bind(this));
    }

    loadTexture(file) {
        this.isTextureReady = false;
        this.texture = loadImage(MODEL_PATH + file.name, this.onTextureLoaded.bind(this));
    }


    onModelLoaded() {
        this.isModelReady = true;
    }

    onTextureLoaded() {
        this.isTextureReady = true;
    }

    update(){
        if (this.isModelReady) {
            this.graphCtx.reset();
            this.graphCtx.background(0, 0);
            this.graphCtx.ambientLight(255, 255, 255, 255); 
            this.graphCtx.directionalLight(255, 255, 255, 0, 0, -1);
        
            this.graphCtx.scale(3 / 800 * DEFAULT_W); // Scaled to make model fit into canvas
            this.graphCtx.rotateX(PI);
            this.graphCtx.rotateY(PI/2);
            this.graphCtx.rotateX(frameCount * this.xRot);
            this.graphCtx.rotateY(frameCount * this.yRot);
            this.graphCtx.rotateZ(frameCount * this.zRot);
        
            if ((this.isMatOn) || (this.isTextureReady !== true)) {
                this.graphCtx.normalMaterial();
            } else {
                this.graphCtx.texture(this.texture);
            }
        
            this.graphCtx.model(this.model);
        
            this.img = this.graphCtx.get();
        }
    }
}