// Enemy.js - 敵人行為類別
export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.speed = 1.5; // 移動速度
        this.hp = 3;      // 血量
        this.maxHp = 3;
        this.color = "red";

        this.isDead = false; // 是否已死亡
        this.vx = 0;         // 死亡後的噴飛速度 X
        this.vy = 0;         // 死亡後的噴飛速度 Y
        this.rotation = 0;    // 旋轉角度
        this.rotationSpeed = 0;
        this.alpha = 1.0;    // 消失透明度
    }
    // 擊殺時呼叫的方法
    die(bulletVx, bulletVy) {
        this.isDead = true;
        // 取得子彈的衝擊方向，並加強它（讓它飛得比子彈還快或更有力）
        this.vx = bulletVx * 0.8;
        this.vy = bulletVy * 0.8;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5; // 隨機旋轉
    }
    // 更新邏輯 (類似 Unity 的 Update)
    update(playerX, playerY) {

        if (!this.isDead) {
            // 1. 計算方向向量
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 2. 正規化向量並移動 (避免抖動，當距離大於 1 時才移動)
            if (distance > 1) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        } else {
            // 死亡後的飛走邏輯
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.vx *= 0.95; // 摩擦力，慢慢減速
            this.vy *= 0.95;
            this.alpha -= 0.02; // 慢慢變透明

        }
    }

    // 繪製邏輯 (類似 SpriteRenderer)
    draw(ctx) {
        ctx.save(); // 保存當前狀態（就像 Unity 的 PushMatrix）

        // 1. 設定透明度（用於死亡後的淡出效果）
        ctx.globalAlpha = this.alpha;

        // 2. 處理旋轉與位移
        // 先把畫筆中心移到敵人的中心點，這樣旋轉才會繞著中心轉
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.rotation);

        // 3. 畫出主體 (注意：因為 translate 到了中心，所以座標要從 -w/2, -h/2 開始畫)
        ctx.fillStyle = this.isDead ? "#550000" : this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

        ctx.restore(); // 還原畫筆狀態，確保血條不會跟著旋轉

        // 4. 畫血條 (只有活著的時候才畫)
        if (!this.isDead) {
            const healthBarWidth = this.w;
            const currentHealthWidth = (this.hp / this.maxHp) * healthBarWidth;

            ctx.fillStyle = "#333"; // 背景
            ctx.fillRect(this.x, this.y - 10, healthBarWidth, 4);

            ctx.fillStyle = "#0f0"; // 當前血量
            ctx.fillRect(this.x, this.y - 10, currentHealthWidth, 4);
        }
    }

    // 當敵人受傷時的方法
    takeDamage(amount) {
        this.hp -= amount;
        // 可以在這裡加入受傷效果，例如短暫變白
    }
}