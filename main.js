

function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
}

function mouseClicked() {
    if ((mouseClickEnable) && (mouseX < myCanvas.width) && (mouseY < myCanvas.height)) {
        let zValue = parseInt(random(-800, -200));
        addTransaltionTarget(mouseX, mouseY, zValue);
    }
}


function setup() {
    init_engine();
    create_gui();
}

function draw() {
    background(0);
    render();
}