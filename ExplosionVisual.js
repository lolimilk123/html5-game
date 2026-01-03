// 可以放在 Particle.js 或單獨建立
export class ExplosionVisual {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.maxRadius = radius;
        this.currentRadius = radius * 0.2; // 從 20% 大小開始擴張
        this.alpha = 1.0;                  // 透明度
        this.lifeTime = 1.0;               // 生命週期 (1.0 -> 0)
        this.color = "#FF8800";            // 爆炸主色：橘紅色
    }

    update() {
        // 隨著生命週期減少，半徑變大，透明度變低
        this.lifeTime -= 0.04; 
        this.alpha = this.lifeTime;
        this.currentRadius = this.maxRadius * (1 - Math.pow(this.lifeTime, 3)); // 非線性擴張，更有爆發感
        return this.lifeTime > 0;
    }

    draw(ctx) {
        ctx.save();
        
        // 1. 繪製外圈震波
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 50, ${this.alpha})`;
        ctx.lineWidth = 4 * this.alpha;
        ctx.stroke();

        // 2. 繪製內層核心（填充色塊）
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, ${this.alpha * 0.3})`;
        ctx.fill();

        ctx.restore();
    }
}