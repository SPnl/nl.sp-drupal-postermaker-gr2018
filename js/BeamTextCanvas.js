// First paint with default size and tekst
var font = new FontFaceObserver('HelveticaInseratLTPro');

font.load().then(function () {
paintCanvas();
}, function () {
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
// document.getElementById("pictureInput").addEventListener("change", readFile);
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
    }
    // Define the beam defaults
    var layers = [{
        string: document.getElementById('line1').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        fontSize: 48,
        colorFill: color1,
        colorStroke: color2,
        transX: 1,
        transY: .64,
        scale: .3,
        strokeWidth: 8,
        spaceMax: .66,
    }, {
        string: document.getElementById('line2').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        fontSize: 180,
        colorFill: color3,
        colorStroke: color1,
        transX: -1,
        transY: 1,
        scale: 1,
        strokeWidth: 12,
        spaceMax: .9,
    }, {
        string: document.getElementById('line3').value.toUpperCase(),
        font: 'HelveticaInseratLTPro',
        fontSize: 62,
        colorFill: color1,
        colorStroke: color2,
        transX: .64,
        transY: 1,
        scale: .3,
        strokeWidth: 8,
        spaceMax: .66,
    }];

    // Sizing and positioning
    layers[0] = sizeLayer(ctx,canvas,layers[0]);
    layers[1] = sizeLayer(ctx,canvas,layers[1]);
    layers[2] = sizeLayer(ctx,canvas,layers[2]);

    layers[0].posX = canvas.width / 2 - layers[0].textWidth / 2;
    layers[1].posX = canvas.width / 2 - layers[1].textWidth / 2;
    layers[2].posX = canvas.width / 2 - layers[2].textWidth / 2;
  
    layers[1].posY = canvas.height / 2 - layers[1].fontSize / 2;
    layers[0].posY = layers[1].posY - layers[0].fontSize * 1.14;
    layers[2].posY = layers[1].posY + layers[1].fontSize;

    if(layers[0].posY < 12) {
      layers[0].posY = 12;
    }

    if(layers[2].posY > canvas.height - layers[2].fontSize - 12 ) {
      layers[2].posY = canvas.height - layers[2].fontSize - 12;
    }

    
    paintBeam(ctx, canvas, layers[0]);
    paintBeam(ctx, canvas, layers[1]);
    paintBeam(ctx, canvas, layers[2]);
}

function sizeLayer(ctx,canvas,layer) {
    ctx.font = layer.fontSize + 'px ' + layer.font;
    layer.textWidth = ctx.measureText(layer.string).width;
    while(layer.textWidth > canvas.width * layer.spaceMax) {
      layer.fontSize --;
      ctx.font = layer.fontSize + 'px ' + layer.font;
      layer.textWidth = ctx.measureText(layer.string).width;
    }
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
    // Paint once
    osContext.font = ctx.font;
    osContext.textAlign = 'start';
    osContext.textBaseline = 'top';
    osContext.strokeStyle = beam.colorStroke;
    osContext.lineWidth = beam.strokeWidth;
    osContext.strokeText(beam.string, beam.strokeWidth, beam.strokeWidth);
    // Repaint the offsceen canvas many times for the beam
    var curWidth = osCanvas.width;
    var curHeight = osCanvas.height;
    var ratio = curWidth / curHeight;
    for (i = 0; i < canvas.width; i++) {
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
    ctx.fillText(beam.string, beam.posX + beam.strokeWidth, beam.posY + beam.strokeWidth);
}

function readFile() {
    if (this.files && this.files[0]) {
        var FR = new FileReader();
        FR.addEventListener("load", function(e) {
            //document.getElementById("img").src       = e.target.result;
            //document.getElementById("b64").innerHTML = e.target.result;
        });
        FR.readAsDataURL(this.files[0]);
    }
}
