/*
class Notifier {
    constructor() {
        this.registeredObj = {};
    }

    register(GID, callback) {
        // store the function to be called
        this.registeredObj[GID] = callback;
    }

    notify(item) {
        let GID = (item.gid).split("|")[0];

        // callback linked to GID
        this.registeredObj[GID]();
        // remove the GID
        delete this.registeredObj[GID];
    }

}

let myNotifier = new Notifier();
*/

let registeredObj = {};

function registerObj(GID, o, t) {
    // store the function to be called
    registeredObj[GID] = {object: o, type: t};
}

function notifyObj(item) {
    let GID = (item.gid).split("|")[0]; // this works only for 3D models

    // callback linked to GID
    let obj = registeredObj[GID].object;
    let type = registeredObj[GID].type;
    onItemLoaded(obj, type)
    // remove the GID
    //delete registeredObj[GID];
}

function onItemLoaded(me, type) {
    if (type === "MODEL") {
        me.isModelReady = true;
    } else if (type === "TEXTURE") {
        me.isTextureReady = true;
    }
}


class Source {
    constructor() {
        this.ditherAlgo = 0;
        this.glitchAlgo = 0;
        this.isBWOn = false;
        this.isAsciiOn = false;
        this.sampling = 1;

        this.graphCtx;
        this.img = new createImage(DEFAULT_W, DEFAULT_H);
    }

    // Abstract function to update the graphic context and copy it in img
    update() {

    }

    // Applying enabled filters to the img
    render() {
        let retImage;

        if (this.sampling > 1) {
            this.img.resize(DEFAULT_W / this.sampling, DEFAULT_H / this.sampling);
        }

        if (this.isBWOn) {
            this.img.filter(GRAY); 
        }

        if (this.ditherAlgo != 0) {
            ditherIt(this.img, this.ditherAlgo); 
        }
        else if (this.isAsciiOn) {
            asciify(this.img);
        }

        // Upscale back the image
        if (this.sampling > 1) {
            //retImage = createImage(this.img.width * this.sampling, this.img.height * this.sampling);
            retImage = upScale(this.img, retImage, this.sampling);
        } else {
            retImage = this.img.get(); 
        }

        return retImage;
    }
}

const MODEL_PATH = '../model/';

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

        var self = this;
    }



    loadModel(file) {
        this.isModelReady = false;
        console.log(MODEL_PATH + file.name);

        registerObj(MODEL_PATH + file.name, this, "MODEL");
        this.model = loadModel(MODEL_PATH + file.name, true, notifyObj);
    }

    loadTexture(file) {
        this.isTextureReady = false;

        registerObj(MODEL_PATH + file.name, this, "TEXTURE");
        this.texture = loadImage(MODEL_PATH + file.name, notifyObj);
    }

/*
    onModelLoaded(me) {
        me.isModelReady = true;
    }

    onTextureLoaded() {
        this.isTextureReady = true;
    }
*/



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

//new p5();
//var mySource3D = new Source3D();

