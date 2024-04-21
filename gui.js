const DEFAULT_W = 400;
const DEFAULT_H = 400;



let modelReady = false;
let textureReady = false;
let bgReady = false;
let myModel;
let xRot = 0;
let yRot = 0;
let zRot = 0;
let scaleF = 1;
let bgScaleF = 1;

let _3dGraph;
let _2dGraph;

let image2D;
let finalImg;
let myTexture;
let bg;

let mySource3D;

let isAsciiOn, isDitherOn, isBWOn, isMatOn;
let isBgDitherOn, isBgBWOn;
let isMixerOn = false;
let gifBtn;

//function onModelLoaded() {
//    modelReady = true;
//}

function onTextureLoaded() {
    textureReady = true;
}

function modelLoaded(pizza) {
    mySource3D.onModelLoaded();
    console.log("GID="+pizza.gid+"$");
    console.log(pizza);
}

function onBGLoaded() {
    bgReady = true;
    bg.hide();
    bg.volume(0);
    bg.loop();
}


function handle3DFile(file) {
    //modelReady = false;
    //myModel = loadModel(MODEL_PATH + file.name, true, onModelLoaded);
    mySource3D.loadModel(file);
}

function handleTexture(file) {
    textureReady = false;
    myTexture = loadImage(MODEL_PATH + file.name, onTextureLoaded);
}

function handleBGFile(file) {
    bgReady = false;
    bg = createVideo(MODEL_PATH + file.name, onBGLoaded);
}

function guiAddText(message, posX, posY) {
    let fileText;

    fileText = createP(message);
    fileText.style('font-size', '15px');
    fileText.position(posX, posY);
}

function updateXrot() {
    tempVal = this.value();
    xRot = (tempVal !== NaN) ? tempVal : xRot;
}

function updateYrot() {
    tempVal = this.value();
    yRot = (tempVal !== NaN) ? tempVal : xRot;
}

function updateZrot() {
    tempVal = this.value();
    zRot = (tempVal !== NaN)? tempVal : xRot;
}

function updateScale() {
    tempVal = this.value();
    scaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : scaleF;
}

function updateBGScale() {
    tempVal = parseInt(this.value());
    bgScaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : bgScaleF;
}

function updateMadness() {
    tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        updateColorDepth(tempVal);
    }
}


function asciiCheckEvent() {
    isAsciiOn = this.checked();
}

function ditherCheckEvent() {
    isDitherOn = this.checked();
}

function bwCheckEvent() {
    isBWOn = this.checked();
}

function bgDitherCheckEvent() {
    isBgDitherOn = this.checked();
}

function bgBwCheckEvent() {
    isBgBWOn = this.checked();
}

function matCheckEvent() {
    isMatOn = this.checked();
}

function mixCheckEvent() {
    isMixerOn = this.checked();
}

function createGui() {
    let file3DSelector, textureSelector, bgSelector;
    let xRotInput, yRotInput, zRotInput, scaleInput, madInput;
    let checkAScii, checkDither, checkBW, checkMat;
    let bgCheckDither, bgCheckBW;
    let checkMixer;
    
    guiAddText("Select 3D file form Model Folder", DEFAULT_W + 50, 10);
    file3DSelector = createFileInput(handle3DFile);
    file3DSelector.position(DEFAULT_W + 50, 50);

    guiAddText("Select Texture form Model Folder", DEFAULT_W + 50, 80);
    textureSelector = createFileInput(handleTexture);
    textureSelector.position(DEFAULT_W + 50, 120);

    guiAddText("X Rot:", DEFAULT_W + 50, 160);
    xRotInput = createInput('0');
    xRotInput.position(DEFAULT_W + 100, 170);
    xRotInput.size(40);
    xRotInput.input(updateXrot);

    guiAddText("Y Rot:", DEFAULT_W + 160, 160);
    yRotInput = createInput('0');
    yRotInput.position(DEFAULT_W + 210, 170);
    yRotInput.size(40);
    yRotInput.input(updateYrot);

    guiAddText("Z Rot:", DEFAULT_W + 270, 160);
    zRotInput = createInput('0');
    zRotInput.position(DEFAULT_W + 320, 170);
    zRotInput.size(40);
    zRotInput.input(updateZrot);

    guiAddText("Scale Factor:", DEFAULT_W + 50, 200);
    scaleInput = createInput('1');
    scaleInput.position(DEFAULT_W + 140, 222);
    scaleInput.size(40);
    scaleInput.input(updateScale);

    checkAScii = createCheckbox('ASCII', false);
    checkAScii.position(DEFAULT_W + 50, 250);
    checkAScii.changed(asciiCheckEvent);

    checkDither = createCheckbox('Dither FG', false);
    checkDither.position(DEFAULT_W + 50, 275);
    checkDither.changed(ditherCheckEvent);

    checkBW = createCheckbox('B&W FG', false);
    checkBW.position(DEFAULT_W + 50, 300);
    checkBW.changed(bwCheckEvent);

    checkMat = createCheckbox('Material FB', false);
    checkMat.position(DEFAULT_W + 50, 325);
    checkMat.changed(matCheckEvent);

    guiAddText("PAZZIA Factor:", DEFAULT_W + 50, 350);
    madInput = createInput('4');
    madInput.position(DEFAULT_W + 160, 362);
    madInput.size(40);
    madInput.input(updateMadness);

    gifBtn = createButton('SAVE GIF');
    gifBtn.position(DEFAULT_W + 50, 402);

    guiAddText("Select BG file form Model Folder", DEFAULT_W + 50, 420);
    bgSelector = createFileInput(handleBGFile);
    bgSelector.position(DEFAULT_W + 50, 460);

    guiAddText("BG Scale Factor:", DEFAULT_W + 50, 480);
    bgScaleInput = createInput('1');
    bgScaleInput.position(DEFAULT_W + 140, 500);
    bgScaleInput.size(40);
    bgScaleInput.input(updateBGScale);

    bgCheckDither = createCheckbox('Dither BG', false);
    bgCheckDither.position(DEFAULT_W + 50, 525);
    bgCheckDither.changed(bgDitherCheckEvent);

    bgCheckBW = createCheckbox('B&W BG', false);
    bgCheckBW.position(DEFAULT_W + 50, 550);
    bgCheckBW.changed(bgBwCheckEvent);

    checkMixer = createCheckbox('Enable CH mixer', false);
    checkMixer.position(DEFAULT_W + 50, 600);
    checkMixer.changed(mixCheckEvent);
}


function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
}

function setup() {
    pixelDensity(1);
    createCanvas(DEFAULT_W, DEFAULT_H);
    _3dGraph = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);
    _2dGraph = createGraphics(DEFAULT_W, DEFAULT_H);

    mySource3D = new Source3D();

    initFonts(fontImage);
    initNoise();
    createGui();
}


function compute3D() {
    _3dGraph.reset();
    _3dGraph.background(0);
    _3dGraph.ambientLight(255, 255, 255, 255); 
    _3dGraph.directionalLight(255, 255, 255, 0, 0, -1);
    //_3dGraph.lights();
    //_3dGraph.pointLight(255, 255, 255, 100, 100, 100);

    _3dGraph.scale(3); // Scaled to make model fit into canvas
    _3dGraph.rotateX(PI);
    _3dGraph.rotateY(PI/2);
    _3dGraph.rotateX(frameCount * xRot);
    _3dGraph.rotateY(frameCount * yRot);
    _3dGraph.rotateZ(frameCount * zRot);

    if ((isMatOn) || (textureReady !== true)) {
        _3dGraph.normalMaterial();
    } else {
        _3dGraph.texture(myTexture);
    }

    _3dGraph.model(myModel);

    return _3dGraph.get();
}

function compute2D() {
    _2dGraph.image(bg, 0, 0, DEFAULT_W, DEFAULT_H);
    return _2dGraph.get();
}

function startSavingGIF() {
    let xPeriod = (xRot != 0) ? floor(2 * PI / xRot) : 1;
    let yPeriod = (yRot != 0) ? floor(2 * PI / yRot) : 1;
    let zPeriod = (zRot != 0) ? floor(2 * PI / zRot) : 1;

    let hyperPeriod = lcm3(xPeriod, yPeriod, zPeriod);
    console.log("Start saving gif, hyper period: " + hyperPeriod);

    saveGif('gifMatta', hyperPeriod, {  units: 'frames' });
}

function draw() {
    background(0);
    let finalBg;
    let finalFg;

    if(bgReady) {
        let bgImage = compute2D();
        bgImage.resize(DEFAULT_W / bgScaleF, DEFAULT_H / bgScaleF);
      
        if(isBgBWOn) {
            bgImage.filter(GRAY); 
        }

        if (isBgDitherOn) {
            ditherIt(bgImage); 
        }


        finalBg = upScale(bgImage, finalBg, bgScaleF);

        if (isMixerOn === false) {
            image(finalBg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    mySource3D.update();
    finalFg = mySource3D.render();
    image(finalFg, 0, 0, DEFAULT_W, DEFAULT_H);

/*
    if (modelReady) {
        let image2D = compute3D();

        // Downscale the image
        image2D.resize(DEFAULT_W / scaleF, DEFAULT_H / scaleF);
        addAlpha(image2D);

        if(isBWOn) {
            image2D.filter(GRAY); 
        }

        if (isDitherOn) {
            ditherIt(image2D); 
        }
        //else if (isAsciiOn) {
        //    image2D = asciify(image2D, image2D);
        //}

        // Upscale back the image
        finalFg = upScale(image2D, finalFg, scaleF);

        if (isMixerOn === false) {
            image(finalFg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }
*/
    if ((modelReady) && (bgReady) && (isMixerOn)) {
        let mixImage;
        mixImage = mixChannelsNoise(finalFg, finalBg, mixImage);
        image(mixImage, 0, 0, DEFAULT_W, DEFAULT_H);
    }

    gifBtn.mousePressed(startSavingGIF);
}