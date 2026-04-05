// Handles dot animation and drawing
export class DotVisualizer {
    constructor(canvas, analyser, dataArray, audioElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.analyser = analyser;
        this.dataArray = dataArray;
        this.audioElement = audioElement;
        this.dot = { x: canvas.width / 2, y: canvas.height / 2, baseRadius: Math.min(canvas.width, canvas.height) * 0.08, color: '#fff' };
        this.morphPhase = 0;
        this.startTime = null;
        this.shapeIndex = 0;
        this.shapes = ['wave', 'dot', 'square', 'triangle', 'star'];
        this.lastShapeIndex = 0;
        this.morphProgress = 0; // 0 = wave, 1 = shape
        this.morphing = false;
        this.lastMorphTime = 0;
        this.morphDuration = 1.8; // seconds
        this.numPoints = 128;
        this.morphToWaveRequested = false;
    }
    resize() {
        this.dot.x = this.canvas.width / 2;
        this.dot.y = this.canvas.height / 2;
        this.dot.baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.08;
    }
    morphToWave() {
        // Always trigger morph to wave, even if already on wave
        if (this.shapeIndex !== 0 || this.morphing) {
            this.lastShapeIndex = this.shapeIndex;
            this.shapeIndex = 0;
            this.morphing = true;
            this.morphProgress = 0;
            this.lastMorphTime = performance.now();
            this.morphToWaveRequested = true;
        }
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        this.analyser.getByteTimeDomainData(this.dataArray);
        const amplitude = this.dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / this.dataArray.length;
        if (!this.audioElement.paused && !this.audioElement.ended) {
            if (!this.startTime) this.startTime = performance.now();
            const elapsed = (performance.now() - this.startTime) / 1000;
            let nextShapeIndex = 0;
            if (elapsed > 10) {
                nextShapeIndex = Math.floor((elapsed - 10) / 4) % this.shapes.length;
            }
            if (nextShapeIndex !== this.shapeIndex && !this.morphToWaveRequested) {
                // Start morph
                this.lastShapeIndex = this.shapeIndex;
                this.shapeIndex = nextShapeIndex;
                this.morphing = true;
                this.morphProgress = 0;
                this.lastMorphTime = performance.now();
            }
            if (this.morphing) {
                const morphElapsed = (performance.now() - this.lastMorphTime) / 1000;
                this.morphProgress = Math.min(1, morphElapsed / this.morphDuration);
                if (this.morphProgress >= 1) {
                    this.morphing = false;
                    this.morphToWaveRequested = false;
                }
            }
            this.morphPhase += 0.04 + amplitude * 0.002;
        } else {
            // Only morph to wave if requested, otherwise stay on wave
            if (this.morphToWaveRequested && this.morphing) {
                const morphElapsed = (performance.now() - this.lastMorphTime) / 1000;
                this.morphProgress = Math.min(1, morphElapsed / this.morphDuration);
                if (this.morphProgress >= 1) {
                    this.morphing = false;
                    this.morphToWaveRequested = false;
                }
            } else {
                this.startTime = null;
                this.shapeIndex = 0;
                this.lastShapeIndex = 0;
                this.morphing = false;
                this.morphProgress = 0;
            }
        }
        this.draw(amplitude);
    }
    getShapePoints(type, amplitude, phase) {
        const points = [];
        const { canvas, dot, numPoints } = this;
        if (type === 'wave') {
            const centerY = canvas.height / 2;
            const startX = canvas.width * 0.05;
            const endX = canvas.width * 0.95;
            for (let i = 0; i < numPoints; i++) {
                const t = i / (numPoints - 1);
                const x = startX + t * (endX - startX);
                const y = centerY + Math.sin(t * Math.PI * 2 + phase) * (canvas.height * 0.25 + amplitude * 1.2);
                points.push({ x, y });
            }
        } else if (type === 'dot') {
            const radius = dot.baseRadius + amplitude * 0.7;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const x = dot.x + Math.cos(angle) * radius;
                const y = dot.y + Math.sin(angle) * radius;
                points.push({ x, y });
            }
        } else if (type === 'square') {
            const size = dot.baseRadius * 2 + amplitude * 1.2;
            for (let i = 0; i < numPoints; i++) {
                const t = i / numPoints;
                let x, y;
                if (t < 0.25) {
                    x = dot.x - size / 2 + t * size * 4;
                    y = dot.y - size / 2;
                } else if (t < 0.5) {
                    x = dot.x + size / 2;
                    y = dot.y - size / 2 + (t - 0.25) * size * 4;
                } else if (t < 0.75) {
                    x = dot.x + size / 2 - (t - 0.5) * size * 4;
                    y = dot.y + size / 2;
                } else {
                    x = dot.x - size / 2;
                    y = dot.y + size / 2 - (t - 0.75) * size * 4;
                }
                points.push({ x, y });
            }
        } else if (type === 'triangle') {
            const size = dot.baseRadius * 2.2 + amplitude * 1.2;
            for (let i = 0; i < numPoints; i++) {
                const t = i / numPoints;
                const a = t * 3;
                let x, y;
                if (a < 1) {
                    x = dot.x + (1 - a) * size * Math.cos(-Math.PI / 2) + a * size * Math.cos(Math.PI / 6);
                    y = dot.y + (1 - a) * size * Math.sin(-Math.PI / 2) + a * size * Math.sin(Math.PI / 6);
                } else if (a < 2) {
                    x = dot.x + (2 - a) * size * Math.cos(Math.PI / 6) + (a - 1) * size * Math.cos(5 * Math.PI / 6);
                    y = dot.y + (2 - a) * size * Math.sin(Math.PI / 6) + (a - 1) * size * Math.sin(5 * Math.PI / 6);
                } else {
                    x = dot.x + (3 - a) * size * Math.cos(5 * Math.PI / 6) + (a - 2) * size * Math.cos(-Math.PI / 2);
                    y = dot.y + (3 - a) * size * Math.sin(5 * Math.PI / 6) + (a - 2) * size * Math.sin(-Math.PI / 2);
                }
                points.push({ x, y });
            }
        } else if (type === 'star') {
            const spikes = 5;
            const outerRadius = dot.baseRadius * 2.5 + amplitude * 1.2;
            const innerRadius = dot.baseRadius * 1.1 + amplitude * 0.6;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const x = dot.x + Math.cos(angle) * (i % (numPoints / (spikes * 2)) < (numPoints / (spikes * 4)) ? outerRadius : innerRadius);
                const y = dot.y + Math.sin(angle) * (i % (numPoints / (spikes * 2)) < (numPoints / (spikes * 4)) ? outerRadius : innerRadius);
                points.push({ x, y });
            }
        }
        return points;
    }
    draw(amplitude) {
        const { ctx, morphPhase, shapes, shapeIndex, lastShapeIndex, morphing, morphProgress, numPoints } = this;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.strokeStyle = this.dot.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.dot.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 0.9;
        // Get points for morphing
        let fromType = morphing ? shapes[lastShapeIndex] : shapes[shapeIndex];
        let toType = shapes[shapeIndex];
        const fromPoints = this.getShapePoints(fromType, amplitude, morphPhase);
        const toPoints = this.getShapePoints(toType, amplitude, morphPhase);
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const t = morphing ? morphProgress : 1;
            const x = fromPoints[i].x * (1 - t) + toPoints[i].x * t;
            const y = fromPoints[i].y * (1 - t) + toPoints[i].y * t;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}
