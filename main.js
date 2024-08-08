

function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
}

function setup() {
    init_engine();
    create_gui();
}


function draw() {
    background(0);
    render();
}