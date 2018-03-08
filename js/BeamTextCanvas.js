// First paint with default size and tekst
var font = new FontFaceObserver('HelveticaInseratLTPro');
font.load().then(function() {
    paintCanvas();
}, function() {
    // console.log('Font is not available');
});
// Repaint the canvas when new text is entered
var textInput = document.getElementsByClassName('set-text');
for (i = 0; i < textInput.length; i++) {
    textInput[i].onkeyup = function() {
        paintCanvas();
    }
}
// Repaint the canvas when a size gets selected
var sizeInput = document.getElementsByClassName('set-option');
for (i = 0; i < sizeInput.length; i++) {
    sizeInput[i].onclick = function() {
        paintCanvas();
    }
}
// Click to save image
var saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', function(e) {
    var canvasDone = document.getElementById("poster");
    var imageName = "voor-elkaar";
    var size = document.querySelector('.set-size:checked').value;
    canvasDone.toBlob(function(blob) {
        saveAs(blob, imageName + size + ".png");
    });
});

function paintCanvas() {
    var canvas = document.getElementById('poster');
    var ctx = canvas.getContext('2d');
    var color1 = '#ec1b23'; // SP Red
    var color2 = '#ffe300'; // Warm yellow
    var color3 = '#ffffff'; // Bright white
    var color4 = '#eeeeee'; // Light grey
    var sizes = document.querySelector('.set-size:checked').value;
    var sizes = sizes.split('x');
    canvas.width = sizes[0];
    canvas.height = sizes[1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var transparentOption = document.querySelector('#set-transparent').checked;
    if (transparentOption == false) {
        ctx.fillStyle = color4;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // More lines
        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.moveTo(canvas.width * .85, 0);
        ctx.lineTo(canvas.width, canvas.height * .7);
        ctx.lineTo(canvas.width, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);
        ctx.lineTo(canvas.width * .15, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    // Define the beam defaults
    var layers = [{
        string: document.getElementById('line1').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        colorFill: color1,
        colorStroke: color2,
        transX: -.5,
        transY: 1,
        scale: .3,
        strokeWidth: 8,
        widthMax: .6,
        heightMax: .15,
    }, {
        string: document.getElementById('line2').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        colorFill: color3,
        colorStroke: color1,
        transX: -.5,
        transY: 1,
        scale: 1,
        strokeWidth: 8,
        widthMax: .8,
        heightMax: .5,
    }, {
        string: document.getElementById('line3').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        colorFill: color1,
        colorStroke: color2,
        transX: .66,
        transY: 1,
        scale: .4,
        strokeWidth: 8,
        widthMax: .6,
        heightMax: .15,
    }];
    // Sizing and positioning
    layers[0] = sizeLayer(ctx, canvas, layers[0]); // top
    layers[1] = sizeLayer(ctx, canvas, layers[1]); // middle
    layers[2] = sizeLayer(ctx, canvas, layers[2]); // bottom
    // Horizontal positioning: Center all
    layers[0].posX = canvas.width / 2 - layers[0].textWidth / 2; // top
    layers[1].posX = canvas.width / 2 - layers[1].textWidth / 2; // middle
    layers[2].posX = canvas.width / 2 - layers[2].textWidth / 2; // bottom
    // Vertical positioning (middle layer deternines rest)
    layers[1].posY = canvas.height / 2 - layers[1].fontSize / 2; // middle
    layers[0].posY = layers[1].posY - layers[0].fontSize * 1.14; // top
    layers[2].posY = layers[1].posY + layers[1].fontSize + layers[1].strokeWidth; // bottom
    // Paint the beams
    paintBeam(ctx, canvas, layers[0]);
    paintBeam(ctx, canvas, layers[1]);
    paintBeam(ctx, canvas, layers[2]);
}

function sizeLayer(ctx, canvas, layer) {
    layer.fontSize = canvas.height * layer.heightMax;
    ctx.font = layer.fontSize + 'px ' + layer.font;
    layer.textWidth = ctx.measureText(layer.string).width;
    var widthMax = canvas.width * layer.widthMax;
    if (layer.textWidth > widthMax) {
        var ratio = layer.fontSize / layer.textWidth;
        layer.fontSize = ratio * widthMax;
        ctx.font = layer.fontSize + 'px ' + layer.font;
        layer.textWidth = ctx.measureText(layer.string).width;
    }
    layer.fontSize = Math.round(layer.fontSize);
    ctx.font = layer.fontSize + 'px ' + layer.font;
    return layer;
}

function paintBeam(ctx, canvas, beam) {
    ctx.font = beam.fontSize + 'px ' + beam.font;
    // Create an offscreen (os) canvas with text dimensions
    var osCanvas = document.createElement('canvas');
    osCanvas.width = beam.textWidth + beam.fontSize;
    osCanvas.height = beam.fontSize + beam.fontSize;
    var osContext = osCanvas.getContext('2d');
    var strokeWidth = canvas.height / 56;
    // Paint once
    osContext.font = ctx.font;
    osContext.textAlign = 'start';
    osContext.textBaseline = 'top';
    osContext.strokeStyle = beam.colorStroke;
    osContext.lineWidth = strokeWidth;
    osContext.strokeText(beam.string, strokeWidth, strokeWidth);
    // Repaint the offsceen canvas many times for the beam
    var curWidth = osCanvas.width;
    var curHeight = osCanvas.height;
    var ratio = curWidth / curHeight;
    var iterations = canvas.height - beam.posY;

    for (i = 0; i < iterations; i++) {
        curWidth -= beam.scale;
        curHeight -= beam.scale / ratio;
        if (curHeight < 0) {
            curHeight = 0;
        }
        if (curWidth < 0) {
            curHeight = 0;
        }
        ctx.drawImage(osCanvas, beam.posX + (beam.transX * i), beam.posY + (beam.transY * i), curWidth, curHeight);
    }
    // Cap
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    ctx.fillStyle = beam.colorFill;
    ctx.fillText(beam.string, beam.posX + strokeWidth, beam.posY + strokeWidth);
}