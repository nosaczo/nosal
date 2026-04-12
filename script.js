const backgrounds = ['black.png','garaz.webp','kuchnia.jpg','piwnica.webp','pokoj.webp','white.png'];
const templates = ['ameno.jpg','detuche-room.png','dlaczego.jpg','dura-lex.webp','helmud2.jpg','helmud.webp','komputerowy-piniondz.webp','nah.png','narwany-morderca.png','nerved.png','nosacz-brain.webp','pajak.webp','papiez.png','private.png','warum.jpg'];
const characters = ['anger2.webp','anger.png','brzezina.png','ciemiezyciel.png','dlaczego.png','janusz1.png','janusz2.png','janusz3.png','janusz4.png','janusz-idzie1.png','janusz-idzie2.png','janusz-sad2.png','janusz-sad3.png','janusz-sad4.png','janusz-sad.png','janusz-siedzi1.png','janusz-siedzi2.png','krol-szczurow.webp','lot1.png','lot2.png','lot3.png','pioter2.png','pioter.png','satrapa2.png','satrapa.png','szczur-krolow.webp'];
const items = ['beczka1.png','chleb.png','cukiernica.png','dialog1.png','dialog2.png','dialog3.png','drabina.png','dywan.webp','flaga.webp','herbata.png','komputer.webp','krzeslo.webp','kwiatek1.webp','kwiatek2.webp','laczki.png','lza.png','mulczowanie.png','parkside.png','saturator.webp','stol.webp','topex.png','wigry.png','wrzeciono.png','wurst.png','yato.webp','ytong.png','zegar.webp'];

function loadImages(arr, folder, containerId, clickHandler) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  // Add fake image upload button
  const fakeImg = document.createElement('img');
  fakeImg.src = 'data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" rx="10" fill="%23ccc"/><text x="30" y="35" font-size="32" text-anchor="middle" fill="%23777" font-family="Arial" dy="0">+</text></svg>';
  fakeImg.style.cursor = 'pointer';
  fakeImg.title = "Upload image";
  fakeImg.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      if (containerId === "backgrounds" || containerId === "templates") {
        clickHandler(url); // setBackground
      } else {
        clickHandler(url); // addOverlay
      }
    };
    input.click();
  };
  container.appendChild(fakeImg);

  arr.forEach(name => {
    const img = document.createElement('img');
    img.src = `images/${folder}/${name}`;
    img.draggable = false;
    img.onclick = () => clickHandler(img.src);
    container.appendChild(img);
  });
}

const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

let bgImg = new window.Image();
let bgRatio = 1;
let overlays = [];
let draggingOverlay = null;
let dragOffset = {x:0, y:0};
let resizingOverlay = null;
let resizeStart = {x:0, y:0, w:0, h:0};
let showOutline = true;
let selectedOverlayIdx = -1;

// default background = black.png
bgImg.src = 'images/backgrounds/black.png';
bgImg.onload = () => {
  bgRatio = bgImg.width / bgImg.height;
  resizeCanvas();
  drawMeme();
};

function setBackground(src) {
  bgImg = new window.Image();
  bgImg.src = src;
  bgImg.onload = () => {
    bgRatio = bgImg.width / bgImg.height;
    resizeCanvas();
    drawMeme();
  };
}

function resizeCanvas() {
  let maxW = window.innerWidth * 0.8;
  let maxH = window.innerHeight * 0.6;
  let w = bgRatio * maxH;
  let h = maxH;
  if(w > maxW) {
    w = maxW;
    h = w / bgRatio;
  }
  canvas.width = w;
  canvas.height = h;
  updateCanvasSizeLabel();
}

function addOverlay(src) {
  const img = new window.Image();
  img.src = src;
  img.onload = () => {
    let scale = 0.25;
    let w = canvas.width * scale;
    let h = img.height * w / img.width;
    overlays.push({
      type: 'img',
      img, x: (canvas.width-w)/2, y: (canvas.height-h)/2,
      w, h, flipX: false
    });
    drawMeme();
  };
}

// Free text as object
function addTextObject() {
  const text = document.getElementById('freeTextArea').value;
  if(!text) return;
  const fontSize = parseInt(document.getElementById('fontSize').value, 10) || 40;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontWeight = document.getElementById('fontWeight').value;
  const fontColor = document.getElementById('fontColor').value;
  overlays.push({
    type: 'text',
    text,
    x: canvas.width/2-60, y: canvas.height/2-20,
    w: 120, h: fontSize+10,
    fontSize, fontFamily, fontWeight, fontColor,
    flipX: false
  });
  drawMeme();
}

function drawMeme() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  }
  overlays.forEach((o, i) => drawOverlay(o, i));
  drawText();
}

function drawOverlay(o, idx) {
  ctx.save();
  ctx.translate(o.x, o.y);

  // Only flip for drawing image/text
  if(o.flipX) {
    ctx.translate(o.w, 0);
    ctx.scale(-1, 1);
  }

  if(o.type==='img') {
    ctx.drawImage(o.img, 0, 0, o.w, o.h);
  } else if(o.type==='text') {
    ctx.font = `${o.fontWeight} ${o.fontSize}px ${o.fontFamily}`;
    ctx.fillStyle = o.fontColor;
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.ceil(o.fontSize/12);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = o.text.split('\n');
    lines.forEach((line, i) => {
      const y = o.h/2 + (i - (lines.length-1)/2) * o.fontSize * 1.1;
      ctx.strokeText(line, o.w/2, y);
      ctx.fillText(line, o.w/2, y);
    });
  }
  ctx.restore();
  if(showOutline) drawOverlayBorder(o, idx);
}

function drawText() {
  const top = document.getElementById('topText').value;
  const bottom = document.getElementById('bottomText').value;
  const fontSize = parseInt(document.getElementById('fontSize').value, 10) || 40;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontWeight = document.getElementById('fontWeight').value;
  const fontColor = document.getElementById('fontColor').value;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = fontColor;
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.ceil(fontSize/12);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if(top)
    drawMemeTextLine(top, canvas.width/2, 10, fontColor, fontSize, fontFamily, fontWeight);
  if(bottom)
    drawMemeTextLine(bottom, canvas.width/2, canvas.height - fontSize - 10, fontColor, fontSize, fontFamily, fontWeight);
}
function drawMemeTextLine(text, x, y, color, fontSize, fontFamily, fontWeight) {
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawOverlayBorder(o, idx) {
  ctx.save();
  ctx.translate(o.x, o.y);

  // DO NOT FLIP for handles

  // Border
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, o.w, o.h);

  // Resize handle (yellow, bottom-right)
  ctx.fillStyle = 'yellow';
  ctx.fillRect(o.w-14, o.h-14, 14, 14);

  // Remove handle (purple, top-right)
  ctx.fillStyle = 'purple';
  ctx.fillRect(o.w-14, 0, 14, 14);

  // Flip handle (green, top-left)
  ctx.fillStyle = 'limegreen';
  ctx.fillRect(0, 0, 14, 14);

  ctx.restore();
}

// Board controls
function resetBoard() {
  overlays = [];
  drawMeme();
  selectedOverlayIdx = -1;
}

function generateImage() {
  const link = document.getElementById('downloadLink');
  link.href = canvas.toDataURL('image/png');
  link.download = 'meme.png';
  link.click();
}

function toggleOutline() {
  showOutline = !showOutline;
  const btn = document.getElementById('outlineBtn');
  if(showOutline) {
    btn.classList.remove('outline-off');
  } else {
    btn.classList.add('outline-off');
  }
  drawMeme();
}

function updateCanvasSizeLabel() {
  document.getElementById('canvasSize').textContent = `${canvas.width} x ${canvas.height}`;
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const btn = document.getElementById('themeBtn');
  const isDark = document.body.classList.contains('dark');
  btn.textContent = isDark ? "☀️" : "🌙";

  // if current bg is one of the solid defaults, swap it
  const src = bgImg && bgImg.src ? bgImg.src : '';
  const isBlack = src.includes('black.png');
  const isWhite = src.includes('white.png');

  if (isDark && isWhite) {
    setBackground('images/backgrounds/black.png');
  } else if (!isDark && isBlack) {
    setBackground('images/backgrounds/white.png');
  } else {
    drawMeme();
  }
}

// Overlay interaction

canvas.onmousedown = function(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX-rect.left, my = e.clientY-rect.top;
  for(let i=overlays.length-1;i>=0;i--) {
    let o = overlays[i];
    // Transform mouse to overlay local coords (NO flip for handle logic)
    let local = {
      x: mx - o.x,
      y: my - o.y
    };
    // Flip handle (green, top-left)
    if(local.x > 0 && local.x < 14 && local.y > 0 && local.y < 14) {
      o.flipX = !o.flipX;
      drawMeme();
      return;
    }
    // Remove handle (purple, top-right)
    if(local.x > o.w-14 && local.x < o.w && local.y > 0 && local.y < 14) {
      overlays.splice(i,1);
      drawMeme();
      selectedOverlayIdx = -1;
      return;
    }
    // Resize handle (yellow, bottom-right)
    if(local.x > o.w-14 && local.x < o.w && local.y > o.h-14 && local.y < o.h) {
      resizingOverlay = o;
      resizeStart = {x: local.x, y: local.y, w: o.w, h: o.h};
      selectedOverlayIdx = i;
      drawMeme();
      return;
    }
    // Inside overlay for drag
    if(local.x > 0 && local.x < o.w && local.y > 0 && local.y < o.h) {
      draggingOverlay = o;
      dragOffset = {x: local.x, y: local.y};
      overlays.push(overlays.splice(i,1)[0]);
      selectedOverlayIdx = overlays.length-1;
      drawMeme();
      return;
    }
  }
};

canvas.onmousemove = function(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX-rect.left, my = e.clientY-rect.top;
  if(draggingOverlay) {
    const o = draggingOverlay;
    o.x = mx - dragOffset.x;
    o.y = my - dragOffset.y;
    drawMeme();
  }
  if(resizingOverlay) {
    const o = resizingOverlay;
    let local = {
      x: mx - o.x,
      y: my - o.y
    };
    let dx = local.x - resizeStart.x;
    let newW = Math.max(30, resizeStart.w+dx);
    let newH = o.type==='img'
      ? o.img.height * newW / o.img.width
      : o.h;
    o.w = newW;
    o.h = newH;
    drawMeme();
  }
};

canvas.onmouseup = function() {
  draggingOverlay = null;
  resizingOverlay = null;
};
canvas.onmouseleave = function() {
  draggingOverlay = null;
  resizingOverlay = null;
};

canvas.onclick = function(e) {
  // Select overlay for outline
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX-rect.left, my = e.clientY-rect.top;
  let found = false;
  for(let i=overlays.length-1;i>=0;i--) {
    let o = overlays[i];
    let local = globalToLocal(mx, my, o);
    if(local.x > 0 && local.x < o.w && local.y > 0 && local.y < o.h) {
      selectedOverlayIdx = i;
      drawMeme();
      found = true;
      break;
    }
  }
  if(!found) {
    selectedOverlayIdx = -1;
    drawMeme();
  }
};

// Convert global canvas coords to overlay-local coords (with flip)
function globalToLocal(mx, my, o) {
  let x = mx - o.x;
  let y = my - o.y;
  if(o.flipX) x = o.w - x;
  return {
    x: x,
    y: y
  };
}

// Responsive canvas
window.addEventListener('resize', ()=>{
  if(bgImg) {
    resizeCanvas();
    drawMeme();
  }
});

// Load images into grids
loadImages(backgrounds, 'backgrounds', 'backgrounds', setBackground);
loadImages(templates, 'templates', 'templates', setBackground);
loadImages(characters, 'characters', 'characters', addOverlay);
loadImages(items, 'items', 'items', addOverlay);

// update shape
updateCanvasSizeLabel();
