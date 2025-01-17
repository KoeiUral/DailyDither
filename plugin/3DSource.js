
const MODEL_PATH = './media/model/';
const MAX_TARGETS = 3;


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

        let modelId = floor(random(modelFiles.length));
        this.loadModel(modelFiles[modelId]);

        // Apply a texture 
        if (random() < 0.5) {
            let texPath;
            // Choose Video vs Image
            if ((random() < 0.2)) {
                let videoId = floor(random(videoFiles.length));
                texPath = videoFiles[videoId];
            } else {
                let imageId = floor(random(imageFiles.length));
                texPath = imageFiles[imageId];
            }

            this.loadTexture(texPath);
        }

        this.xRot = random(0.3) * (random() < 0.5);
        this.yRot = random(0.3) * (random() < 0.5);
        this.zRot = random(0.3) * (random() < 0.5);

        let pointsNbr = floor(random(10));
        for (let i = 0; i < pointsNbr; i++) {
            let xValue = floor(random(DEFAULT_W));
            let yValue = floor(random(DEFAULT_H));
            let zValue = floor(random(-800, -200));
            this.addTransaltionTarget(xValue, yValue, zValue);
        }
    }

    loadModel(path, file) {
        let fileName = (typeof file !== "undefined") ? file.name : path;
        
        this.isModelReady = false;
        this.model = loadModel(MODEL_PATH + fileName, true, this.onModelLoaded.bind(this));
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