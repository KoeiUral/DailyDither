
const MODEL_PATH = './media/model/';
const MAX_TARGETS = 3;

const TEXT_P = 0.5;
const TEXT_VID_P = 0.2;
const ROT_X_P = 0.5;
const ROT_Y_P = 0.5;
const ROT_Z_P = 0.5;
const ROT_MAX = 0.3;
const TRAN_POINT_P = 0.5;
const TRAN_POINT_MAX = 10;
const TRAN_Z_MIN = -800;
const TRAN_Z_MAX = -200;


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

        this.targets = [];
        this.targetsInUse = [];
        this.targetUsed = 0;
        this.targetIndex = 0;
        this.targetSpeed = 0.1; // TODO: Remove magic

        // Init the target positions
        for (let i = 0; i < MAX_TARGETS; i++) {
            this.targets.push(createVector(0, 0, 0));
            this.targetsInUse.push(false);
        }
        this.currentPos = createVector(0, 0, 0);

        this.model;
        this.texture;
    }

    setSpecificProperties() {
        // Pick up a random model
        let modelFiles = getFiles(MODEL_PATH);
        let videoFiles = getFiles(VIDEO_PATH);
        let imageFiles = getFiles(IMAGE_PATH);
        let texPath = '';

        let modelId = floor(random(modelFiles.length));
        this.loadModel(modelFiles[modelId]);

        // Apply a texture 
        if (random() < TEXT_P) {
            // Choose Video vs Image
            if ((random() < TEXT_VID_P)) {
                let videoId = floor(random(videoFiles.length));
                texPath = videoFiles[videoId];
            } else {
                let imageId = floor(random(imageFiles.length));
                texPath = imageFiles[imageId];
            }

            this.loadTexture(texPath);
        }

        this.xRot = random(ROT_MAX) * (random() < ROT_X_P);
        this.yRot = random(ROT_MAX) * (random() < ROT_Y_P);
        this.zRot = random(ROT_MAX) * (random() < ROT_Z_P);

        let pointsNbr = floor(random(TRAN_POINT_MAX)) * (random() < TRAN_POINT_P);
        for (let i = 0; i < pointsNbr; i++) {
            let xValue = floor(random(DEFAULT_W));
            let yValue = floor(random(DEFAULT_H));
            let zValue = floor(random(TRAN_Z_MIN, TRAN_Z_MAX));
            this.addTransaltionTarget(xValue, yValue, zValue);
        }

        console.log("     3D - model: %s, texture: %s, rotX: %f, rotY: %f, rotZ: %f, transPoints: %d", modelFiles[modelId], texPath, this.xRot, this.yRot, this.zRot, pointsNbr);
    }

    loadModel(path, file) {
        let fileName = (typeof file !== "undefined") ? file.name : path;
        
        this.isModelReady = false;
        this.model = loadModel(MODEL_PATH + fileName, true, this.onModelLoaded.bind(this), this.onModelFailed.bind(this), '.obj');
    }

    loadTexture(path, file) {
        let fileName = (typeof file !== "undefined") ? file.name : path;
        let fileExt = fileName.split('.').pop();
        
        this.isTextureReady = false;
        if ((fileExt === 'jpg') || (fileExt === 'jpeg') || (fileExt === 'png') || (fileExt === 'gif')) {
            this.texture = loadImage(IMAGE_PATH + fileName, this.onTextureLoaded.bind(this));
            this.myTexIsVideo = false;
        } else if ((fileExt === 'mp4') || (fileExt === 'avi') || (fileExt === 'mov') || (fileExt === 'webm') || (fileExt === 'mkv')) {
            this.texture = createVideo(VIDEO_PATH + fileName, this.onTextureLoaded.bind(this));
            this.myTexIsVideo = true;    
        }
    }

    onModelLoaded() {
        this.isModelReady = true;
    }
    
    onModelFailed() {
        console.log("Error loading the 3D model!");
        this.isModelReady = false;
    }

    onTextureLoaded() {
        this.isTextureReady = true;

        if (this.myTexIsVideo) {
            this.texture.hide();
            this.texture.volume(0);
            this.texture.loop();
        }
    }


    addTransaltionTarget(xPoint, yPoint, zPoint) {
        this.targets.push(createVector(xPoint - DEFAULT_W / 2, yPoint - DEFAULT_H / 2, zPoint));
        this.targetsInUse.push(true);
        this.targetUsed++;
    }
    
    clearTransalationTargets() {
        this.targets.length = 0;
        this.targetsInUse.length = 0;
        this.targetUsed = 0;
        this.targetIndex = 0;
    }

    checkTargetReached() {
        let diff = p5.Vector.sub(this.currentPos, this.targets[this.targetIndex]);
    
        if (diff.mag() < 5) {
            /* Move to the next target in use within the array */
            do {
                this.targetIndex = (this.targetIndex + 1) % this.targets.length;
            } while (this.targetsInUse[this.targetIndex] == false);       
        }
    }

    update(){
        if (this.isModelReady) {
            this.graphCtx.reset();
            this.graphCtx.background(0, 0);
            this.graphCtx.ambientLight(255, 255, 255, 255); 
            this.graphCtx.directionalLight(255, 255, 255, 0, 0, -1);
        
            this.graphCtx.scale(3 / 800 * DEFAULT_W); // Scaled to make model fit into canvas

            /* Apply translation */
            if (this.targetUsed > 1) {
                this.currentPos = p5.Vector.lerp(this.currentPos, this.targets[this.targetIndex], this.targetSpeed);
                this.graphCtx.translate(this.currentPos);
                this.checkTargetReached();
            }

            /* Apply custom rotation */
            this.graphCtx.rotateX(PI);
            this.graphCtx.rotateY(PI/2);
            this.graphCtx.rotateX(frameCount * this.xRot);
            this.graphCtx.rotateY(frameCount * this.yRot);
            this.graphCtx.rotateZ(frameCount * this.zRot);
        
            if (this.isTextureReady === true) {
                this.graphCtx.texture(this.texture);
            } else {
                this.graphCtx.normalMaterial();
            }
        
            this.graphCtx.model(this.model);
        
            this.img = this.graphCtx.get();
        }
    }
}