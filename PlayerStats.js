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


        // 爆炸相關新屬性
        this.explosionLevel = 0;
        this.explosionRadius = 60;
        this.explosionDamage = 0;    // 額外固定傷害
        this.explosionMult = 0.5;    // 繼承基礎傷害的比例 (50%)

        // 彈跳屬性
        this.bounceLevel = 0;      // 0 代表還沒開啟
        this.bounceCount = 0;      // 預設彈跳 1 次
        this.bounceRange = 300;
    }

    // 處理經驗值增加
    gainExp(amount) {
        this.exp += amount;
        let didLevelUp = false;

        // 使用 while 處理連升多級的情況
        while (this.exp >= this.nextLevelExp) {
            if (this.levelUp()) {
                didLevelUp = true;
            }
        }
        return didLevelUp; // 最終告訴 Engine 是否有升級發生
    }

    levelUp() {
        this.level++;
        this.exp -= this.nextLevelExp;
        this.nextLevelExp = Math.floor(this.nextLevelExp * 1.2);
        // 觸發升級時的事件 (例如回血，或是通知 Engine 彈出選單)
        this.hp = this.maxHp;
        console.log("Level Up! Current Level:", this.level);
        // 返回 true 代表觸發了升級選單時機
        return true;
    }
}