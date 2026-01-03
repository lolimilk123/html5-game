export class Bullet {
    constructor(x, y, tx, ty, pierce = 1, bounceCount = 0) {
        this.x = x; this.y = y;
        this.radius = 4;
        this.speed = 10;
        const angle = Math.atan2(ty - y, tx - x);
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.lifeTime = 60;

        // --- 新增：命中紀錄 ---
        // 使用 Set 可以快速檢查某個敵人是否已經被這顆子彈撞過
        this.hitHistory = new Set();
        // --- 設定貫穿次數 ---
        this.pierce = pierce;
        this.bounceCount = bounceCount; // <--- 必須接收這個數值

    }
    update() { this.x += this.dx; this.y += this.dy; this.lifeTime--; }
    draw(ctx) {
        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        
    }
}