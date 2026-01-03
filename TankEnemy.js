import { Enemy } from './Enemy.js';

export class TankEnemy extends Enemy {
    constructor(x, y) {
        // 設定較高的 HP (例如 10)，較慢的速度 (0.6)，以及深藍色
        super(x, y, { 
            hp: 10, 
            speed: 0.6, 
            color: "#000088",
            damage: 20 // 撞擊玩家傷害更高
        });
        
        // 讓坦克體型大一點 (48x48)，增加壓迫感
        this.w = 48;
        this.h = 48;
    }

    update(px, py, game) {
        super.update(); // 處理死亡後的噴飛邏輯
        if (!this.isDead) {
            // 坦克敵人持續向玩家位置移動
            this.moveTowards(px, py);
        }
    }
}