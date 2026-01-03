import { Enemy } from './Enemy.js';
export class ChaserEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, { speed: 1.8, hp: 3, color: "#FF4444" });
    }
    update(px, py, game) {
        super.update(); // 父類別 Enemy 的 update 只需要處理死亡邏輯
        if (!this.isDead) {
            this.moveTowards(px, py);
        }
    }
}