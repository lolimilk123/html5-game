import { Enemy } from './Enemy.js';

export class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, { speed: 1.2, hp: 2, color: "#AA00FF" });
        this.fireTimer = 0;
        this.fireRate = 100; // 射擊間隔
        this.idealDistance = 250; // 想保持的距離
    }

    update(px, py, game) { // 改成 px, py 接收座標
        if (this.isDead) {
            super.update(); // 注意父類別 update 不需要參數
            return;
        }

        const dist = this.moveTowards(px, py); // 使用傳進來的座標

        if (dist < this.idealDistance) {
            this.speed = 0;
        } else {
            this.speed = 1.2;
        }

        this.fireTimer++;
        if (this.fireTimer >= this.fireRate) {
            this.shoot(px, py, game); // 傳入座標進行射擊
            this.fireTimer = 0;
        }
    }

    // ShooterEnemy.js 內部
    shoot(px, py, game) { // 改成接收座標
        // 計算從敵人中心到玩家中心的角度
        const angle = Math.atan2(py - (this.y + 16), px - (this.x + 16));
        game.enemyBullets.push({
            x: this.x + 16,
            y: this.y + 16,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            damage: 10
        });
    }
}