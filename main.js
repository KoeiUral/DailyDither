let myMixer;
let myCanvas;
let recDuration = 100;

const WIDGET_SIZE = 20;
const DEBUG = false;

function preload() {
    myFont = loadFont(FONT_PATH);

}

function mouseClicked() {

}

function updateGifPeriod() {
    let tempVal = parseInt(this.value());
    recDuration = (isNaN(tempVal)) ? 0 : tempVal;
}

function startSavingGIF() {
    saveGif('gifMatta', recDuration, {  units: 'frames', silent: false, notificationDuration: 1});
}

function startSavingWEBM() {

}


function createGui() {
    /* Hook the canvas */
    myCanvas = createCanvas(DEFAULT_W, DEFAULT_H);
    myCanvas.parent('html_canvas');

    gifDurationInput =  createInput('100');
    gifDurationInput.size(WIDGET_SIZE);
    gifDurationInput.input(updateGifPeriod);

    gifBtn = createButton('SAVE GIF');
    gifBtn.mousePressed(startSavingGIF);

    /* Hook widget to html */
    gifDurationInput.parent('html_gifDurInput');
    gifBtn.parent('html_gifBtn');
}



function setup() {
    // Init graphic lib
    initGraphLib();

    myMixer = new Mixer();
    myMixer.addRandomSources();
    //myMixer.setTestProp();

    createGui();
}

function draw() {
    background(0);

    myMixer.compose();
    myMixer.render();

    if (DEBUG) {
        let fps = round(frameRate());
        text(fps, 50, 50);
    }
}