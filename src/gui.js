
/**
 * Global visibility Widgets
 */
let mouseClickEnable = false;

const WIDGET_SIZE = 50;

let file3DSelector, textureSelector, bgSelector;
let xRotInput, yRotInput, zRotInput;
let p1Check, p2Check, p3Check;
let xP1Input, yP1Input, zP1Input, xP2Input, yP2Input, zP2Input, xP3Input, yP3Input, zP3Input;
let pointMouseCheck, trSpeedSlider;
let scaleInput, bgScaleInput, madInput, madInputFg, madInputBg;
let hueOffInput, hueIncInput, hueMadInput, hueOffInputBg, hueIncInputBg, hueMadInputBg;
let fgSatSlider, bgSatSlider;
let checkDither, checkBW;
let bgCheckDither, bgCheckBW;
let fgGlitchTriggerBtn; // fgGlitchSelect, fgGlitchDurInput are already defined in engine.js boooo!
let glitchPreCheck, glitchLoopCheck, glitchTriggerBtn, glitchRandomBtn;
let checkMixer;
let gifDurationInput;
let gifBtn, webmBtn;


/**
 * Create the Gui: create widgets and set them up
 */

function handle3DFile(file) {
    modelReady = false;
    myModel = loadModel(MODEL_PATH + file.name, true, onModelLoaded);

    console.log("File Path" + MODEL_PATH + file.name);
}

function handleTexture(file) {
    textureReady = false;
    let fileExt = file.name.split('.').pop();

    if ((fileExt === 'jpg') || (fileExt === 'jpeg') || (fileExt === 'png') || (fileExt === 'gif')) {
        myTexture = loadImage(IMAGE_PATH + file.name, onTextureLoaded);
        myTexIsVideo = false;
    } else if ((fileExt === 'mp4') || (fileExt === 'avi') || (fileExt === 'mov') || (fileExt === 'webm') || (fileExt === 'mkv')) {
        myTexture = createVideo(VIDEO_PATH + file.name, onTextureLoaded);
        myTexIsVideo = true;    
    }


}

function handleBGFile(file) {
    bgReady = false;
    let fileExt = file.name.split('.').pop();

    if ((fileExt === 'jpg') || (fileExt === 'jpeg') || (fileExt === 'png') || (fileExt === 'gif')) {
        bg = loadImage(IMAGE_PATH + file.name, onBGLoaded);
        myBgIsVideo = false;
    } else if ((fileExt === 'mp4') || (fileExt === 'avi') || (fileExt === 'mov') || (fileExt === 'webm') || (fileExt === 'mkv')) {
        bg = createVideo(VIDEO_PATH + file.name, onBGLoaded);
        myBgIsVideo = true;    
    }



}



function updateXrot() {
    let tempVal = parseFloat(this.value());
    xRot = (isNaN(tempVal)) ? xRot : tempVal;
    console.log(tempVal + " -> " + xRot);
}

function updateYrot() {
    let tempVal = parseFloat(this.value());
    yRot = (isNaN(tempVal)) ? yRot : tempVal;
}

function updateZrot() {
    let tempVal = parseFloat(this.value());
    zRot = (isNaN(tempVal)) ? zRot : tempVal;
}

function p1CheckEvent() {
    let inc = (this.checked()) ? +1 : -1;
    targetsInUse[0] = this.checked();;
    targetUsed = targetUsed + inc;
}

function p2CheckEvent() {
    let inc = (this.checked()) ? +1 : -1;
    targetsInUse[1] = this.checked();;
    targetUsed = targetUsed + inc;    
}

function p3CheckEvent() {
    let inc = (this.checked()) ? +1 : -1;
    targetsInUse[2] = this.checked();;
    targetUsed = targetUsed + inc;
}

function updateXP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(0, tempVal);
    }
}

function updateYP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(1, tempVal);
    }
}

function updateZP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(2, tempVal);
    }
}

function updateXP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(3, tempVal);
    }
}

function updateYP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(4, tempVal);
    }
}

function updateZP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(5, tempVal);
    }
}

function updateXP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(6, tempVal);
    }
}

function updateYP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(7, tempVal);
    }
}

function updateZP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(8, tempVal);
    }
}


function checkPointMouse() {
    mouseClickEnable = this.checked();
}

function updateTrSpeed() {
    targetSpeed = this.value();
}

function clearTargets() {
    clearTransalationTargets();
}



function updateHue() {
    let tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffset = tempVal;
    }
}

function updateHueInc() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        hueInc = tempVal;
    }
}

function updateFlash() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffset = tempVal;
    }
}

function updateFgSaturation() {
    satLevelFg = this.value();
}

function updateHueBg() {
    let tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffsetBg = tempVal;
    }
}

function updateHueIncBg() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        hueIncBg = tempVal;
    }
}

function updateFlashBg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffsetBg = tempVal;
    }
}

function updateBgSaturation() {
    satLevelBg = this.value();
}

function updateScale() {
    let tempVal = this.value();
    scaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : scaleF;
}

function updateBGScale() {
    let tempVal = parseInt(this.value());
    bgScaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : bgScaleF;
}

function updateMadness() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        updateColorDepth(tempVal);
    }
}

function updateMadnessFg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthFg = tempVal;
    }
}

function updateMadnessBg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthBg = tempVal;
    }
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

function mixCheckEvent() {
    isMixerOn = this.checked();
}

function preGlitchFgCheckEvent() {
    isPreGlitchOnFg = this.checked();
}

function preGlitchCheckEvent() {
    isPreGlitchOn = this.checked();
}

function glitchAutoLoopCheckEvent() {
    glitchAutoLoop = this.checked();
}

function activateAutoSequence() {
    createGlitchSequence(glitchLoopCheck.checked());
}


function updateGifPeriof() {
    let tempVal = parseInt(this.value());
    recDuration = (isNaN(tempVal)) ? 0 : tempVal;
}

function generateRandomModel() {
    // Get files in folders
    let modelFiles = getFiles(MODEL_PATH);
    let imageFiles = getFiles(IMAGE_PATH);
    let videoFiles = getFiles(VIDEO_PATH);

    // Pick a random 3d model
    let modelId = floor(random(modelFiles.length));
    myModel = loadModel(MODEL_PATH + modelFiles[modelId], true, onModelLoaded);

    // Apply texture 
    if (random() < 0.5) {
        myTexIsVideo = (random() < 0.2) ;
        // Choose Video vs Image
        if (myTexIsVideo) {
            let videoId = floor(random(videoFiles.length));
            myTexture = createVideo(VIDEO_PATH + videoFiles[videoId], onTextureLoaded);
        } else {
            let imageId = floor(random(imageFiles.length));
            myTexture = loadImage(IMAGE_PATH + imageFiles[imageId], onTextureLoaded);
        }
    }

    // Apply 3d random settings
    xRot = random(0.3) * (random() < 0.5);
    yRot = random(0.3) * (random() < 0.5);
    zRot = random(0.3) * (random() < 0.5); // = 100% / PROB  -> (this case 50%), anzi no!
    xRotInput.value(xRot);
    yRotInput.value(yRot);
    zRotInput.value(zRot);
    scaleF = 1 + floor(random(1, 4)) * (random() < 0.5);
    hueOffset = floor(random(0, 100)) * (random() < 0.5);
    hueInc = floor(random(0, 15)) * (random() < 0.5);
    flashOffset = floor(random(0, 20)) * (random() < 0.5);
    satLevelFg = floor(random()) * (random() < 0.5);
    isDitherOn = (random() < 0.7);
    isBWOn = (random() < 0.3);

    scaleInput.value(scaleF);
    hueOffInput.value(hueOffset);
    hueIncInput.value(hueInc);
    hueMadInput.value(flashOffset);
    fgSatSlider.value(satLevelFg);
    checkDither.value(isDitherOn);  // NOT WORKING for check box
    checkBW.value(isBWOn);  // NOT WORKING for check box

    let pointsNbr = floor(random(10));
    for (let i = 0; i < pointsNbr; i++) {
        let xValue = floor(random(DEFAULT_W));
        let yValue = floor(random(DEFAULT_H));
        let zValue = floor(random(-800, -200));
        addTransaltionTarget(xValue, yValue, zValue);
    }

    // Pick up a random BG
    myBgIsVideo = (random() < 0.8) ;
    // Choose Video vs Image
    if (myBgIsVideo) {
        let videoId = floor(random(videoFiles.length));
        bg = createVideo(VIDEO_PATH + videoFiles[videoId], onBGLoaded);
    } else {
        let imageId = floor(random(imageFiles.length));
        bg = loadImage(IMAGE_PATH + imageFiles[imageId], onBGLoaded);
    }

    bgScaleF = 1 + floor(random(1, 4)) * (random() < 0.5);
    hueOffsetBg = floor(random(0, 100)) * (random() < 0.5);
    hueIncBg = floor(random(0, 15)) * (random() < 0.5);
    flashOffsetBg = floor(random(0, 20)) * (random() < 0.5);
    satLevelBg = floor(random()) * (random() < 0.5);
    isBgDitherOn = (random() < 0.7);
    isBgBWOn =  (random() < 0.3);

    bgScaleInput.value(bgScaleF);
    hueOffInputBg.value(hueOffsetBg);
    hueIncInputBg.value(hueIncBg);
    hueMadInputBg.value(flashOffsetBg);
    bgSatSlider.value(satLevelBg);
    bgCheckDither.value(isBgDitherOn);  // NOT WORKING for check box
    bgCheckBW.value(isBgBWOn);  // NOT WORKING for check box

    createGlitchSequence(true);
}

/**
 * Create the Gui: create widgets and set them up
 */

function create_gui() {

    /* Hook the canvas */
    myCanvas.parent('html_canvas');
    
    /* ------ FG SECTION ------ */
    file3DSelector = createFileInput(handle3DFile);
    textureSelector = createFileInput(handleTexture);

    xRotInput = createInput('0');
    xRotInput.size(WIDGET_SIZE);
    xRotInput.input(updateXrot);
    yRotInput = createInput('0');
    yRotInput.size(WIDGET_SIZE);
    yRotInput.input(updateYrot);
    zRotInput = createInput('0');
    zRotInput.size(WIDGET_SIZE);
    zRotInput.input(updateZrot);

    p1Check = createCheckbox('Point 1 (x, y, z):', false);
    p1Check.changed(p1CheckEvent);
    xP1Input = createInput((targets[0].x + DEFAULT_W / 2).toString());
    xP1Input.size(WIDGET_SIZE);
    xP1Input.input(updateXP1);
    yP1Input = createInput((targets[0].y + DEFAULT_H / 2).toString());
    yP1Input.size(WIDGET_SIZE);
    yP1Input.input(updateYP1);
    zP1Input = createInput((targets[0].z).toString());
    zP1Input.size(WIDGET_SIZE);
    zP1Input.input(updateZP1);

    p2Check = createCheckbox('Point 2 (x, y, z):', false);
    p2Check.changed(p2CheckEvent);
    xP2Input = createInput((targets[1].x + DEFAULT_W / 2).toString());
    xP2Input.size(WIDGET_SIZE);
    xP2Input.input(updateXP2);
    yP2Input = createInput((targets[1].y + DEFAULT_H / 2).toString());
    yP2Input.size(WIDGET_SIZE);
    yP2Input.input(updateYP2);
    zP2Input = createInput((targets[1].z).toString());
    zP2Input.size(WIDGET_SIZE);
    zP2Input.input(updateZP2);

    p3Check = createCheckbox('Point 3 (x, y, z):', false);
    p3Check.changed(p3CheckEvent);
    xP3Input = createInput((targets[2].x + DEFAULT_W / 2).toString());
    xP3Input.size(WIDGET_SIZE);
    xP3Input.input(updateXP3);
    yP3Input = createInput((targets[2].y + DEFAULT_H / 2).toString());
    yP3Input.size(WIDGET_SIZE);
    yP3Input.input(updateYP3);
    zP3Input = createInput((targets[2].z).toString());
    zP3Input.size(WIDGET_SIZE);
    zP3Input.input(updateZP3);

    pointMouseCheck = createCheckbox('Enable mouse points', false);
    pointMouseCheck.changed(checkPointMouse); 
    pointClearBtn = createButton('Clear Points');
    pointClearBtn.mousePressed(clearTargets);
    trSpeedSlider = createSlider(0.05, 0.8, 0.1, 0.01);
    trSpeedSlider.size(120);
    trSpeedSlider.changed(updateTrSpeed);

    scaleInput = createInput('1');
    scaleInput.size(WIDGET_SIZE);
    scaleInput.input(updateScale);
    checkDither = createCheckbox('Dither FG', false);
    checkDither.changed(ditherCheckEvent);
    checkBW = createCheckbox('B&W FG', false);
    checkBW.changed(bwCheckEvent);

    hueOffInput = createInput('0');
    hueOffInput.size(WIDGET_SIZE);
    hueOffInput.input(updateHue);
    hueIncInput = createInput('0');
    hueIncInput.size(WIDGET_SIZE);
    hueIncInput.input(updateHueInc);
    hueMadInput = createInput('0');
    hueMadInput.size(WIDGET_SIZE);
    hueMadInput.input(updateFlash);
    fgSatSlider = createSlider(0, 1, 0, 0.05);
    fgSatSlider.size(120);
    fgSatSlider.changed(updateFgSaturation);


    fgGlitchSelect = createSelect(true);
    fgGlitchSelect.option('SCAN', 1);
    fgGlitchSelect.option('SCRAMBLE', 2);
    fgGlitchSelect.option('WARP', 3);
    fgGlitchSelect.option('BURN', 4);
    fgGlitchSelect.option('NEG', 5);
    fgGlitchDurInput = createInput('0');
    fgGlitchDurInput.size(WIDGET_SIZE);
    fgGlitchPreCheck = createCheckbox('PreGlitch', true);
    fgGlitchPreCheck.changed(preGlitchFgCheckEvent);
    fgGlitchTriggerBtn = createButton('TRIGGER');
    fgGlitchTriggerBtn.mousePressed(startFgGlitch);

    /* Hook widget to html */
    file3DSelector.parent('html_file3DSelector');
    textureSelector.parent('html_fileTexSelector');
    xRotInput.parent('html_xRotInput');
    yRotInput.parent('html_yRotInput');
    zRotInput.parent('html_zRotInput');
    p1Check.parent('html_p1Check');
    p2Check.parent('html_p2Check');
    p3Check.parent('html_p3Check');
    xP1Input.parent('html_xP1Input');
    yP1Input.parent('html_yP1Input');
    zP1Input.parent('html_zP1Input');
    xP2Input.parent('html_xP2Input');
    yP2Input.parent('html_yP2Input');
    zP2Input.parent('html_zP2Input');
    xP3Input.parent('html_xP3Input');
    yP3Input.parent('html_yP3Input');
    zP3Input.parent('html_zP3Input');
    pointMouseCheck.parent('html_pointMouseCheck');
    pointClearBtn.parent('html_pointClearBtn');
    trSpeedSlider.parent('html_trSpeedSlider');
    checkDither.parent('html_fgCheckDither');
    checkBW.parent('html_fgCheckBW');
    scaleInput.parent('html_fgScaleInput');
    hueOffInput.parent('html_fgHueInput');
    hueIncInput.parent('html_fgHueIncInput');
    hueMadInput.parent('html_fgFlashInput');
    fgSatSlider.parent('html_fgSatSlider');
    fgGlitchSelect.parent('html_fgGlitchSelect');
    fgGlitchDurInput.parent('html_fgGlitchDurInput');
    fgGlitchPreCheck.parent('html_fgGlitchPreCheck');
    fgGlitchTriggerBtn.parent('html_fgGlitchTriggerBtn');


    /* ------ PAZZIA SECTION ------ */
    madInput = createInput('4');
    madInput.size(WIDGET_SIZE);
    madInput.input(updateMadness);
    madInputFg = createInput('4');
    madInputFg.size(WIDGET_SIZE);
    madInputFg.input(updateMadnessFg);
    madInputBg = createInput('4');
    madInputBg.size(WIDGET_SIZE);
    madInputBg.input(updateMadnessBg);

    /* Hook widget to html */
    madInput.parent('html_madInput');
    madInputFg.parent('html_madInputFg');
    madInputBg.parent('html_madInputBg');


    /* ------ BG SECTION ------ */
    bgSelector = createFileInput(handleBGFile);

    bgScaleInput = createInput('1');
    bgScaleInput.size(WIDGET_SIZE);
    bgScaleInput.input(updateBGScale);
    bgCheckDither = createCheckbox('Dither BG', false);
    bgCheckDither.changed(bgDitherCheckEvent);
    bgCheckBW = createCheckbox('B&W BG', false);
    bgCheckBW.changed(bgBwCheckEvent);

    hueOffInputBg = createInput('0');
    hueOffInputBg.size(WIDGET_SIZE);
    hueOffInputBg.input(updateHueBg);
    hueIncInputBg = createInput('0');
    hueIncInputBg.size(WIDGET_SIZE);
    hueIncInputBg.input(updateHueIncBg);
    hueMadInputBg = createInput('0');
    hueMadInputBg.size(WIDGET_SIZE);
    hueMadInputBg.input(updateFlashBg);
    bgSatSlider = createSlider(0, 1, 0, 0.05);
    bgSatSlider.size(120);
    bgSatSlider.changed(updateBgSaturation);

    glitchSelect = createSelect(true);
    glitchSelect.option('SCAN', 1);
    glitchSelect.option('SCRAMBLE', 2);
    glitchSelect.option('WARP', 3);
    glitchSelect.option('BURN', 4);
    glitchSelect.option('NEG', 5);
    glitchDurInput = createInput('0');
    glitchDurInput.size(WIDGET_SIZE);
    glitchPreCheck = createCheckbox('PreGlitch', true);
    glitchPreCheck.changed(preGlitchCheckEvent);
    glitchLoopCheck = createCheckbox('AutoLoop', false);
    glitchLoopCheck.changed(glitchAutoLoopCheckEvent);
    glitchTriggerBtn = createButton('TRIGGER');
    glitchTriggerBtn.mousePressed(startGlitch);
    glitchRandomBtn = createButton('RANDOM');
    glitchRandomBtn.mousePressed(activateAutoSequence);

    /* Hook widget to html */
    bgSelector.parent('html_bgSelector');
    bgCheckDither.parent('html_bgCheckDither');
    bgCheckBW.parent('html_bgCheckBW');
    bgScaleInput.parent('html_bgScaleInput');
    hueOffInputBg.parent('html_bgHueInput');
    hueIncInputBg.parent('html_bgHueIncInput');
    hueMadInputBg.parent('html_bgFlashInput');
    bgSatSlider.parent('html_bgSatSlider');
    glitchSelect.parent('html_bgGlitchSelect');
    glitchDurInput.parent('html_bgGlitchDurInput');
    glitchPreCheck.parent('html_bgGlitchPreCheck');
    glitchLoopCheck.parent('html_bgGlitchLoopCheck');  
    glitchTriggerBtn.parent('html_bgGlitchTriggerBtn');
    glitchRandomBtn.parent('html_bgGlitchRandomBtn');

    /* ------ EXPORT SECTION ------ */
    genBtn = createButton('GENERATE');
    genBtn.mousePressed(generateRandomModel);

    checkMixer = createCheckbox('Enable CH mixer', false);
    checkMixer.changed(mixCheckEvent);

    gifDurationInput =  createInput('0');
    gifDurationInput.size(WIDGET_SIZE);
    gifDurationInput.input(updateGifPeriof);

    gifBtn = createButton('SAVE GIF');
    gifBtn.mousePressed(startSavingGIF);

    webmBtn = createButton('SAVE WEBM');
    webmBtn.mousePressed(startSavingWEBM);

    /* Hook widget to html */
    genBtn.parent('html_generateBtn');
    checkMixer.parent('html_checkMixer');
    gifDurationInput.parent('html_gifDurInput');
    gifBtn.parent('html_gifBtn');
    webmBtn.parent('html_webmBtn');
}