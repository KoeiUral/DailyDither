
const FONT_SIZE = 26;
const INCREMENT = 0.1;
const COLOR_MAX = 255;

let COLOR_DEPTH = 4;
let fontImage;
let fontMap = [];

let noiseGen;
let zOff;


function updateColorDepth(depth) {
    if (depth >= 1) {
        COLOR_DEPTH = depth;
    }
}

/**
 * This function up scale a source image without alliasing not blurring, pixel are replicated scaleFactor times
 * 
 * @param {*} srcImg Source image
 * @param {*} dstImg Result image
 * @param {*} scaleFactor Scale factor
 * @returns 
 */
function upScale(srcImg, dstImg, scaleFactor, depthOffset) {
    let sx, sy, dx, dy;
    let si, di;
    let colorDepth = depthOffset;

    dstImg = createImage(srcImg.width * scaleFactor, srcImg.height * scaleFactor);

    srcImg.loadPixels();
    dstImg.loadPixels();

    // Iterate over the source image
    for (sy = 0; sy < srcImg.height; sy++) {
        for (sx = 0; sx < srcImg.width; sx++) {
            si = (sx + sy * srcImg.width) * colorDepth;//COLOR_DEPTH;

            // Copy into the upscaled dest pixel
            for (dy = 0; dy < scaleFactor; dy++) {
                for (dx = 0; dx < scaleFactor; dx++) {
                    di = ((sx * scaleFactor + dx) + (sy * scaleFactor + dy) * dstImg.width) * colorDepth;//COLOR_DEPTH

                    dstImg.pixels[di] = srcImg.pixels[si];
                    dstImg.pixels[di + 1] = srcImg.pixels[si + 1];
                    dstImg.pixels[di + 2] = srcImg.pixels[si + 2];
                    dstImg.pixels[di + 3] = srcImg.pixels[si + 3];
                }
            }
        }
    }

    dstImg.updatePixels(); 
    return dstImg;
}




/**
 * The function applies a dither filter on the image
 * 
 * @param {*} srcImg Source Image to be dithered
 */
function ditherIt(srcImg, greyScale, depthOffset) {
    const xOffset = [1, -1, 0, 1];
    const yOffset = [0, 1, 1, 1];
    const weigth = [7, 3, 5, 1];
    const COLOR_CH_NBR = 1; //COLOR_CH_NBR^3 colors, with 2 => 8 colors

    let r, g, b, newR, newG, newB, errR, errG, errB, grey;
    let i, iNext;
    let colorScale = round (255 / (pow(2, COLOR_CH_NBR) - 1));
    let colorDepth = depthOffset;
    
    srcImg.loadPixels();
    
    // Iterate over each pixel 
    for (let y = 0; y < srcImg.height - 1; y++) {
        for (let x = 1; x < srcImg.width - 1; x++) { 
          i = (x + y * srcImg.width) * colorDepth; //COLOR_DEPTH;
  
          r = srcImg.pixels[i + 0];
          g = srcImg.pixels[i + 1];
          b = srcImg.pixels[i + 2];

          if(greyScale) {
            grey = round((r + g + b) / 3);
            r = grey;
            g = grey;
            b = grey;
          }

          newR =  (r >> (8 - COLOR_CH_NBR)) * colorScale;
          newG =  (g >> (8 - COLOR_CH_NBR)) * colorScale;
          newB =  (b >> (8 - COLOR_CH_NBR)) * colorScale;

          errR = r - newR;
          errG = g - newG;
          errB = b - newB;
          
          srcImg.pixels[i + 0] = newR;
          srcImg.pixels[i + 1] = newG;
          srcImg.pixels[i + 2] = newB;

          for (let j = 0; j < 4; j++) {
            iNext = ((x + xOffset[j]) + (y + yOffset[j]) * srcImg.width) * colorDepth;
            r = srcImg.pixels[iNext + 0];
            g = srcImg.pixels[iNext + 1];
            b = srcImg.pixels[iNext + 2];
            r = r + errR * weigth[j]/16;
            g = g + errG * weigth[j]/16;
            b = b + errB * weigth[j]/16;
            srcImg.pixels[iNext + 0] = r;
            srcImg.pixels[iNext + 1] = g;
            srcImg.pixels[iNext + 2] = b;          
          }

        }
    }
    
    srcImg.updatePixels();
}

/**
 * The function initializes a ascii set starting from a font image
 * 
 * @param {*} fontImg image containg all the fonts to be used
 */
function initFonts(fontImg) {
    const rowNbr = floor((fontImg.height) / FONT_SIZE);
    const colNbr = floor((fontImg.width) / FONT_SIZE);
    let i, j;
    let x, y;
    let startX, startY;
    let endX, endY;
    let pId;
    let brightCntr;

    fontImg.loadPixels();

    for (i = 0; i < rowNbr; i++) {
        for (j = 0; j < colNbr; j++) {
            startX = j * FONT_SIZE + 2;
            startY = i * FONT_SIZE + 2;
            endX = startX + FONT_SIZE;
            endY = startY + FONT_SIZE;
            brightCntr = 0;            

            for (y = startY; y < endY; y++) {
                for (x = startX; x < endX; x++) {
                    pId = (x + y * fontImg.width) * COLOR_DEPTH;

                    if ((fontImg.pixels[pId] === 255) && (fontImg.pixels[pId+1] === 255) && (fontImg.pixels[pId+2] === 255)) {
                        brightCntr++;
                    }
                }
            }

            fontMap.push({r: i, c: j, x: startX, y: startY, br: brightCntr});
        }
    }


    fontMap.sort((a, b) => {
        return a.br - b.br;
    });



}

function addAlpha(srcImg) {
    let x, y;

    srcImg.loadPixels();

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            if ((srcImg.pixels[i] === 0)&&(srcImg.pixels[i+1] === 0)&&(srcImg.pixels[i+2] === 0)) {
                srcImg.pixels[i+3] = 0;
            } else {
                srcImg.pixels[i+3] = 255;
            }
        }
    }
    srcImg.updatePixels();
}


function asciify(srcImg, dstImage) {
    let x, y;
    let grayLevel;
    let fontId;

    let fontW = width / srcImg.width;
    let fontH = height / srcImg.height;

    srcImg.loadPixels();
    dstImage = new createImage(width, height);

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            if ((srcImg.pixels[i+3] === 255) && (! ((srcImg.pixels[i] === 0)&&(srcImg.pixels[i+1] === 0)&&(srcImg.pixels[i+2] === 0)))) {
                grayLevel = round(0.21 * srcImg.pixels[i] + 0.72 * srcImg.pixels[i + 1] + 0.07 * srcImg.pixels[i + 2]);
                fontId = ceil((fontMap.length - 1) * (grayLevel / 255));
            
                dstImage.copy(fontImage, fontMap[fontId].x, fontMap[fontId].y, 24, 24, x * fontW, y * fontH, fontW, fontH);
            }
        }
    }

    return dstImage;
}


const grayRamp = ' _.,-=+:;cba!?0123456789$W#@Ñ';
const rampLength = grayRamp.length;
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];

function textify(grayLevel, x, y, w, h, grayFlag) {
    let pixelChar;

    pixelChar = getCharacterForGrayScale(grayLevel);
    grayLevel = (grayFlag) ? grayLevel : 255;

    fill(0);
    rect(x * w, y * h, w, h);
    fill(grayLevel);
    textSize(w);
    textAlign(CENTER, CENTER);
    text(pixelChar, x * w + w * 0.5, y * h + h * 0.5);  
}

function asciifyIt(srcImg) {
    let x, y;
    let grayLevel;

    let w = width / srcImg.width;
    let h = height / srcImg.height;

    srcImg.loadPixels();
    noStroke();

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            grayLevel = toGrayScale(srcImg.pixels[i], srcImg.pixels[i + 1], srcImg.pixels[i + 2]);

            if (srcImg.pixels[i+3]===255) {
                textify (grayLevel, x, y, w, h, FG_GRAY_SCALE);
            }
        }
    }

}




function initNoise() {
    noiseGen = new OpenSimplexNoise(Date.now());
    zOff = 0;
}

function computeSimplexNoise(srcImg, asciiFlag, grayFlag) {
    let xOff = 0;
    let yOff = 0;
    let x, y, i;
    let grayLevel;

    let w = width / srcImg.width;
    let h = height / srcImg.height;
    let maxLevel = (grayFlag) ? 255 : 360;;

    srcImg.loadPixels();

    for (y = 0; y < srcImg.height; y++) {
        xOff = 0;
        for (x = 0; x < srcImg.width; x++) {
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            grayLevel = floor(map(noiseGen.noise3D(xOff, yOff, zOff), -1, 1, 0, maxLevel));

            if (asciiFlag) {
                textify(grayLevel, x, y, w, h, grayFlag);
            }
            else if (grayFlag) {
                srcImg.pixels[i] = grayLevel;
                srcImg.pixels[i + 1] = grayLevel;
                srcImg.pixels[i + 2] = grayLevel;
                srcImg.pixels[i + 3] = 255;
            }
            else {
                [srcImg.pixels[i], srcImg.pixels[i+1], srcImg.pixels[i+2]]= hsv2rgb(grayLevel, 1, 1);
                srcImg.pixels[i + 3] = 255;
            }

            xOff += INCREMENT;
        }
        yOff += INCREMENT;
    }

    zOff += INCREMENT;

    if (asciiFlag === false) {
        srcImg.updatePixels();
    }
}

function mixChannelsNoise(imgA, imgB, imgResult) {
    let xOff = 0;
    let yOff = 0;
    let x, y, i;
    let grayLevel;

    let w = width / imgA.width;
    let h = height / imgA.height;

    imgResult = createImage(imgA.width, imgA.height);

    imgA.loadPixels();
    imgB.loadPixels();
    imgResult.loadPixels();

    for (y = 0; y < imgA.height; y++) {
        xOff = 0;
        for (x = 0; x < imgA.width; x++) {
            i = (x + y * imgA.width) * COLOR_DEPTH;

            grayLevel = floor(map(noiseGen.noise3D(xOff, yOff, zOff), -1, 1, 0, 255));

            if (grayLevel >= 127) {
                imgResult.pixels[i] = imgB.pixels[i];
                imgResult.pixels[i + 1] = imgB.pixels[i + 1];
                imgResult.pixels[i + 2] = imgB.pixels[i + 2];
                imgResult.pixels[i + 3] = 255
            }
            else if (imgA.pixels[i + 3] != 0) {
                imgResult.pixels[i] = imgA.pixels[i];
                imgResult.pixels[i + 1] = imgA.pixels[i + 1];
                imgResult.pixels[i + 2] = imgA.pixels[i + 2];
                imgResult.pixels[i + 3] = 255
            }
            else if (random() < 0.8){
                imgResult.pixels[i] = imgB.pixels[i];
                imgResult.pixels[i + 1] = imgB.pixels[i + 1];
                imgResult.pixels[i + 2] = imgB.pixels[i + 2];
                imgResult.pixels[i + 3] = 255
            }

            xOff += 0.01;//INCREMENT;
        }
        yOff += 0.01;//INCREMENT;
    }

    zOff += 0.1;//INCREMENT;

    imgResult.updatePixels(); 
    return imgResult;
}



/**
 * HELPER functions to convert from RGB to HSV
 */
 function rgb2hsv(r, g, b) {
    r = r / COLOR_MAX;
    g = g / COLOR_MAX;
    b = b / COLOR_MAX;

    let cMax = Math.max(r, g, b);
    let cMin = Math.min(r, g, b);
    let delta = cMax - cMin;
    let h, s, v;

    if (delta == 0) {
        h = 0;
    } else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    } else if (cMax == g) {
        h = 60 * ((b - r) / delta + 2);
    } else {
        h = 60 * ((r - g) / delta + 4);
    }

    if (cMax == 0) {
        s = 0;
    } else {
        s = delta / cMax;
    }

    v = cMax;

    return [h, s, v];
}

/**
 * HELPER functions to convert from HSV to RGB
 */
function hsv2rgb(h, s, v) {
    if (s == 0.0) {
        v *= COLOR_MAX;
        return [v, v, v];
    } 
    
    let i = Math.round(h / 360 * 6.0);
    let f = (h / 360 * 6.0) - i;

    let [p, q, t] = [Math.round(COLOR_MAX*(v*(1.0-s))), Math.round(COLOR_MAX*(v*(1.0-s*f))), Math.round(COLOR_MAX*(v*(1.0-s*(1.0-f))))];

    v*=COLOR_MAX; 
    i = i % 6;

    if (i == 0) {
        return [v, t, p];
    } else if (i == 1) {
        return [q, v, p];
    } else if (i == 2) {
        return [p, v, t];
    } else if (i == 3) {
        return [p, q, v];
    } else if (i == 4) {
        return [t, p, v];
    } else if (i == 5) {
        return [v, p, q];
    } else {
        return [0, 0, 0];
    }
}



function ShiftHue(srcImg, offset, flashRange, satValue) {
    // Load the pixel arrays
    srcImg.loadPixels();

    offset += random(flashRange);

    // Iterate over each pixel 
    for (let i = 0; i < COLOR_DEPTH * (srcImg.width * srcImg.height); i += COLOR_DEPTH) {
        // Process the pixel if it is not trasparent, i.e. alpha ch != 0
        if (srcImg.pixels[i + 3] == COLOR_MAX) {
            // Get the HSV coords.
            let [h,s,v] = rgb2hsv(srcImg.pixels[i], srcImg.pixels[i + 1], srcImg.pixels[i + 2]);

            // Add an offset to the h, rember the wrap around 2PI
            h += offset;

            if (h < 0) {
                h = 360 + h;
            } else if (h > 360) {
                h = h - 360;
            }

            if (satValue != 0) {
                s = s + (satValue)*(1-s);
            }

            // Set back to RGB
            [srcImg.pixels[i], srcImg.pixels[i + 1], srcImg.pixels[i + 2]] = hsv2rgb(h, s, v);
        }
    }

    srcImg.updatePixels();
}

function ShiftHueCopy(srcImg, dstImg, offset) {

    dstImg.copy(srcImg, 0, 0, srcImg.width, srcImg.height, 0, 0, dstImg.width, dstImg.height);

    // Load the pixel arrays
    srcImg.loadPixels();
    dstImg.loadPixels();

    // Iterate over each pixel 
    for (let i = 0; i < COLOR_DEPTH * (srcImg.width * srcImg.height); i += COLOR_DEPTH) {
        // Process the pixel if it is not trasparent, i.e. alpha ch != 0
        if (srcImg.pixels[i + 3] == COLOR_MAX) {
            // Get the HSV coords.
            let [h,s,v] = rgb2hsv(srcImg.pixels[i], srcImg.pixels[i + 1], srcImg.pixels[i + 2]);

            // Add an offset to the h, rember the wrap around 2PI
            h += offset;

            if (h < 0) {
                h = 360 + h;
            } else if (h > 360) {
                h = h - 360;
            }

            // Set back to RGB
            [dstImg.pixels[i], dstImg.pixels[i + 1], dstImg.pixels[i + 2]]= hsv2rgb(h, s, v);
        }
    }

    dstImg.updatePixels();
}


/** ---------------------------------------------------------------------
 *                            GLITCH PART
 *  ---------------------------------------------------------------------
 */

function GlitchScanner(srcImg, direction, startX, startY) {
	if (direction <= 0.5) {
		//horizontal: random - x
		srcImg.copy(srcImg, startX, 0, 1, srcImg.height, 
                    startX, 0, srcImg.width - startX, srcImg.height);
	}
	else {
		//vertical: random  -y
		srcImg.copy(srcImg, 0, startY, srcImg.width, 1,
                    0, startY, srcImg.width, srcImg.height - startY);
	}
}

function GlitchScramble(srcImg, holes, factor) {

	for (let  i = 0; i < holes.length; i++) {	
		srcImg.copy(srcImg, holes[i].sx * factor, holes[i].sy * factor, holes[i].sw * factor, holes[i].sh * factor,
                            holes[i].dx * factor, holes[i].dy * factor, holes[i].dw * factor, holes[i].dh * factor);
	}
}


function GlitchWarp(srcImg, maxOffset) {
	//var maxOffset = floor(random(1,width/2));
	srcImg.loadPixels();

	//for (let x = maxOffset; x < (srcImg.width - maxOffset); x++) {
    for (let x = 0; x < srcImg.width; x++) {
		for (let y = 0; y < srcImg.height; y++) {
			let i = (x + y * srcImg.width) * COLOR_DEPTH;
			let offset = floor(maxOffset * noise( x / (srcImg.width*0.1), y / (srcImg.height * 0.1)));

			srcImg.pixels[i] = srcImg.pixels[i + COLOR_DEPTH * offset];
			srcImg.pixels[i + 1] = srcImg.pixels[i + (COLOR_DEPTH * offset + 1)];
			srcImg.pixels[i + 2] = srcImg.pixels[i + (COLOR_DEPTH * offset + 2)];
		}
	}
	srcImg.updatePixels();
}


function GlitchPixelBurn(srcImg, thresholdColor) {
	//var thresholdColor = [random(255),random(255),random(255)];
	srcImg.loadPixels();

    for (let x = 0; x < srcImg.width; x++) {
		for (let y = 0; y < srcImg.height; y++) {
			let i = (x + y * srcImg.width) * COLOR_DEPTH;

			srcImg.pixels[i]     = (srcImg.pixels[i]     > thresholdColor[0]) ? srcImg.pixels[i] : 255;
			srcImg.pixels[i + 1] = (srcImg.pixels[i + 1] > thresholdColor[1]) ? srcImg.pixels[i + 1] : 255;
			srcImg.pixels[i + 2] = (srcImg.pixels[i + 2] > thresholdColor[2]) ? srcImg.pixels[i + 2] : 255;
		}
	}
	srcImg.updatePixels();
}