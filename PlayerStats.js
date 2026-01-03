// PlayerStats.js
export class PlayerStats {
    constructor() {
        // --- 基礎屬性 ---
        this.level = 1;
        this.exp = 0;
        this.nextLevelExp = 100;

        // --- 戰鬥屬性 (可以動態增加) ---
        this.maxHp = 100;
        this.hp = 100;
        this.damage = 1;       // 攻擊力
        this.fireRate = 10;    // 射擊冷卻 (越小越快)
        this.pierceCount = 1;  // 貫穿數量
        this.moveSpeed = 4;    // 移動速度
        this.bulletCount = 1; // 預設 1 條彈道
        this.spreadAngle = 20 * (Math.PI / 180); // 子彈間的間隔角度 (轉為弧度，約 20 度)
    }

    // 處理經驗值增加
    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.nextLevelExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.nextLevelExp;
        this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2);
        // 觸發升級時的事件 (例如回血，或是通知 Engine 彈出選單)
        this.hp = this.maxHp;
        console.log("Level Up! Current Level:", this.level);
    }
}