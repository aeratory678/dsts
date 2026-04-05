// Custom clock overlay for top right
const clockDiv = document.getElementById('custom-clock-overlay');

const HOURS = [
  'twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'
];
const MINUTES = [
  'zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty',
  'twentyone','twentytwo','twentythree','twentyfour','twentyfive','twentysix','twentyseven','twentyeight','twentynine','thirty','thirtyone','thirtytwo','thirtythree','thirtyfour','thirtyfive','thirtysix','thirtyseven','thirtyeight','thirtynine','forty','fortyone','fortytwo','fortythree','fortyfour','fortyfive','fortysix','fortyseven','fortyeight','fortynine','fifty','fiftyone','fiftytwo','fiftythree','fiftyfour','fiftyfive','fiftysix','fiftyseven','fiftyeight','fiftynine'
];

function pad2(n) { return n.toString().padStart(2,'0'); }

function getLineAroundScreen(sec) {
  // The line grows along the edge as seconds increase, resets at 60
  const len = 60; // thickness
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let style = 'position:fixed;background:#c45252;z-index:10002;';
  let html = '';
  if (sec < 15) {
    // Top edge, grows left to right
    const w = Math.round((sec + 1) / 15 * vw);
    style += `top:0;left:0;width:${w}px;height:2px;`;
    html = `<div id='clock-moving-line' style="${style}"></div>`;
  } else if (sec < 30) {
    // Right edge, grows top to bottom
    const h = Math.round((sec - 14) / 15 * vh);
    style += `top:0;right:0;width:2px;height:${h}px;`;
    html = `<div id='clock-moving-line' style="${style}"></div>`;
  } else if (sec < 45) {
    // Bottom edge, grows right to left
    const w = Math.round((45 - sec) / 15 * vw);
    style += `bottom:0;left:0;width:${w}px;height:2px;`;
    html = `<div id='clock-moving-line' style="${style}"></div>`;
  } else {
    // Left edge, grows bottom to top
    const h = Math.round((60 - sec) / 15 * vh);
    style += `bottom:0;left:0;width:2px;height:${h}px;`;
    html = `<div id='clock-moving-line' style="${style}"></div>`;
  }
  return html;
}

function renderClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  let ampm = h < 12 ? 'am' : 'pm';
  let hourWord = HOURS[h % 12];
  let minWord = MINUTES[m];
  let day = pad2(now.getDate());
  let month = pad2(now.getMonth() + 1);
  clockDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;font-family:Montserrat,Arial,sans-serif;font-weight:100;font-size:1.3em;color:#fff;letter-spacing:1px;">
      <span>${hourWord}</span><span style="font-size:0.8em;opacity:0.7;">${ampm}</span>
    </div>
    <div style="font-family:Montserrat,Arial,sans-serif;font-weight:100;font-size:1.1em;color:#fff;letter-spacing:1px;">${minWord}</div>
    <div style="font-family:monospace;font-size:1.1em;color:#c45252;">${pad2(s)}s</div>
    <div style="font-family:monospace;font-size:1em;color:#fff;opacity:0.7;">${day}/${month}</div>
  `;
  // Remove previous line
  const oldLine = document.getElementById('clock-moving-line');
  if (oldLine) oldLine.remove();
  // Add new line
  document.body.insertAdjacentHTML('beforeend', getLineAroundScreen(s));
}
setInterval(renderClock, 1000);
renderClock();
