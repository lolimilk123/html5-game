// Enemy.js - 基礎類別
export class Enemy {
    constructor(x, y, stats = {}) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.hp = stats.hp || 3;
        this.maxHp = this.hp;
        this.speed = stats.speed || 1.5;
        this.damage = stats.damage || 10; // 撞擊玩家的傷害
        this.color = stats.color || "red";

        this.isDead = false;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.alpha = 1.0;
    }
    // Enemy.js (請確認你的 Enemy.js 或子類別有這些)
    get centerX() { return this.x + this.w / 2; }
    get centerY() { return this.y + this.h / 2; }
    // 共有方法：受傷與死亡
    takeDamage(amount) {
        this.hp -= amount;
    }

    die(bulletVx, bulletVy) {
        this.isDead = true;
        this.vx = bulletVx * 0.8;
        this.vy = bulletVy * 0.8;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }

    // 更新邏輯：由子類別擴充或覆蓋
    update(px, py, game) {

        if (this.isDead) {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.alpha -= 0.02;
        }
    }
    // 將「移動到某點」獨立出來
    moveTowards(targetX, targetY) {
        if (this.isDead) return 0; // 死亡就不執行主動移動

        // 1. 計算向量與距離
        const dx = targetX - (this.x + this.w / 2);
        const dy = targetY - (this.y + this.h / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 2. 正規化並移動 (距離大於 1 避免抖動)
        if (distance > 1) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        return distance; // 回傳距離，這對子類別判定「是否進入射程」很有用
    }

    draw(ctx) {
        if (this.isDead && this.alpha <= 0) return;

        ctx.save();

        // 1. 如果是精英，先畫腳下光環 (Aura 不隨本體旋轉，所以放在 translate 之前)
        if (this.isElite) {
            this.drawEliteAura(ctx);
        }

        // --- 準備畫本體 ---
        ctx.globalAlpha = this.alpha || 1;

        // 移動中心點到怪物位置，以便進行旋轉
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation); // 應用旋轉角度

        // 2. 畫怪物本體 (座標改為相對中心的 -w/2, -h/2)
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // 如果想增加死亡時的細節，可以在旋轉時畫一個 X 當眼睛
        if (this.isDead) {
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -5); ctx.lineTo(5, 5);
            ctx.moveTo(5, -5); ctx.lineTo(-5, 5);
            ctx.stroke();
        }

        ctx.restore(); // 恢復畫布狀態

        // 3. 繪製血條 (血條通常不跟著旋轉，所以放在 restore 之後)
        if (!this.isDead) {
            this.drawHealthBar(ctx);
        }
    }
    drawHealthBar(ctx) {
        ctx.fillStyle = "#333";
        ctx.fillRect(this.x, this.y - 10, this.w, 4);
        ctx.fillStyle = "#0f0";
        ctx.fillRect(this.x, this.y - 10, (this.hp / this.maxHp) * this.w, 4);
    }
    // 新增：繪製精英光環方法
    drawEliteAura(ctx) {
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;

        // 動態效果計算
        const time = Date.now() * 0.002;
        const pulse = Math.sin(Date.now() * 0.005) * 5; // 呼吸燈效果 (正負 5 像素)
        const radius = (this.w * 0.8) + pulse;

        ctx.save();
        ctx.translate(centerX, centerY);

        // --- 第一層：旋轉虛線環 ---
        ctx.rotate(time);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.6)"; // 金色半透明
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]); // 虛線風格
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // --- 第二層：靜態內圈 (增加層次感) ---
        ctx.rotate(-time * 1.5); // 反向旋轉
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = "rgba(255, 165, 0, 0.4)"; // 橘色
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    } 
    becomeElite() {
        this.isElite = true;

        // 1. 視覺強化：體型變大
        this.w *= 1.3;
        this.h *= 1.3;

        // 2. 數值強化
        this.maxHp *= 5;
        this.hp = this.maxHp;

        // 3. 行動微調：稍微變慢，增加 Boss 感
        this.speed *= 0.85;

        // 你甚至可以在這裡加入精英怪專用的顏色或屬性
    }
}