// Classic ASCII Rotating Donut Boot Animation (all green, C version)
const intro = document.createElement('div');
intro.id = 'ascii-donut-intro';
intro.style.position = 'fixed';
intro.style.top = '0';
intro.style.left = '0';
intro.style.width = '100vw';
intro.style.height = '100vh';
intro.style.background = 'black';
intro.style.zIndex = '9999';
intro.style.display = 'flex';
intro.style.alignItems = 'center';
intro.style.justifyContent = 'center';
intro.style.transition = 'opacity 1s';
intro.innerHTML = `<pre id="donut-pre" style="color:#00ff00;font-family:monospace;font-size:1.7vw;line-height:1.05;text-align:center;margin:0;user-select:none;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:black;"></pre>`;
document.body.appendChild(intro);

const pre = document.getElementById('donut-pre');
const mainApp = document.getElementById('visualizer-container');
if (mainApp) mainApp.style.visibility = 'hidden';

// Donut parameters (C version)
let A = 0, B = 0;
const width = 80, height = 22;
const duration = 3500; // ms
let start = null;

function renderDonut(ts) {
    if (!start) start = ts;
    let t = ts - start;
    let b = Array(width * height).fill(' ');
    let z = Array(width * height).fill(0);
    for (let j = 0; j < 6.28; j += 0.07) {
        for (let i = 0; i < 6.28; i += 0.02) {
            let c = Math.sin(i), d = Math.cos(j), e = Math.sin(A), f = Math.sin(j), g = Math.cos(A), h = d + 2, D = 1 / (c * h * e + f * g + 5), l = Math.cos(i), m = Math.cos(B), n = Math.sin(B), tX = c * h * g - f * e, x = Math.floor(40 + 30 * D * (l * h * m - tX * n)), y = Math.floor(12 + 15 * D * (l * h * n + tX * m)), o = x + width * y, N = Math.floor(8 * ((f * e - c * d * g - l * d * n) * m - c * d * e - f * g - l * d * n));
            if (y < height && y > 0 && x > 0 && x < width && D > z[o]) {
                z[o] = D;
                b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0];
            }
        }
    }
    let frame = '';
    for (let k = 0; k < width * height; k++) {
        frame += (k % width ? b[k] : '\n');
    }
    pre.textContent = frame;
    A += 0.04;
    B += 0.02;
    if (t < duration) {
        requestAnimationFrame(renderDonut);
    } else {
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.remove();
        }, 1000);
        if (mainApp) mainApp.style.visibility = '';
    }
}
requestAnimationFrame(renderDonut);
