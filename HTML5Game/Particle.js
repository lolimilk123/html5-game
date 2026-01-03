// Particle.js
export class Particle {
    // 增加 baseSize 和 speedRange 參數
    constructor(x, y, color, baseSize = 3, speedRange = 6) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * baseSize + 1;
        this.speedX = (Math.random() - 0.5) * speedRange;
        this.speedY = (Math.random() - 0.5) * speedRange;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}