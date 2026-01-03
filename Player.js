export class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 32; this.h = 32;
        this.hp = 100;
        this.speed = 4;
        this.floatingTexts = [];
        this.invincibleTimer = 0;
    }

    get centerX() {
        return this.x + this.w / 2;
    }
    get centerY() {
        return this.y + this.h / 2;
    }

    // 修改受傷邏輯
    takeDamage(amount) {
        if (this.invincibleTimer > 0) return false; // 無敵中，不扣血也不彈開

        this.hp -= amount;
        this.invincibleTimer = 60; // 給予約 1 秒無敵 (假設 60FPS)
        return true; // 回傳 true 代表受傷成功
    }
    update(input) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
        }
        if (input.up) this.y -= this.speed;
        if (input.down) this.y += this.speed;
        if (input.left) this.x -= this.speed;
        if (input.right) this.x += this.speed;

        // 更新浮動文字狀態
        this.floatingTexts.forEach(t => {
            t.yOffset -= 1; // 向上飄
            t.alpha -= 0.015; // 漸隱
            t.life--;
        });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
    }
  draw(ctx) {
        ctx.save(); // 保存目前的畫布狀態

        // 1. 處理無敵閃爍效果
        // 改用 this.invincibleTimer，並在繪製矩形「之前」設定透明度
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.3; // 變半透明
        }

        // 2. 繪製玩家主體
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        ctx.restore(); // 恢復畫布狀態（重置 globalAlpha），確保不會影響到浮動文字

        // 3. 繪製浮動文字
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 18px 'Microsoft JhengHei'";
        this.floatingTexts.forEach(t => {
            ctx.fillStyle = `rgba(${t.color}, ${t.alpha})`;
            // 使用 this.w / 2 置中文字
            ctx.fillText(t.text, this.x + this.w / 2, this.y - 20 + t.yOffset);
        });
        ctx.restore();
    }
    // 新增一個方法來產生文字
    addFloatingText(text, color) {
        this.floatingTexts.push({
            text: text,
            color: color,
            yOffset: 0,     // 向上飄的位移
            alpha: 1.0,     // 透明度
            life: 60        // 持續幀數
        });
    }
}