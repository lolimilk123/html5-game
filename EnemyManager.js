// EnemyManager.js
import { ChaserEnemy } from './ChaserEnemy.js';
import { ShooterEnemy } from './ShooterEnemy.js';
import { TankEnemy } from './TankEnemy.js';

import { EffectManager } from './EffectManager.js';

export class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.spawnTimer = 0;
        this.startTime = Date.now();
        this.lastDifficultyInt = 1; // 記錄上一次難度的整數部分

        // EnemyManager.js 內部 constructor
        this.config = {
            baseSpawnRate: 60,   // 初始 1 秒一隻
            minSpawnRate: 8,     // 最快提升到 0.13 秒一隻 (大幅加快密度)
            baseMaxEnemies: 15,  // 初始最大數量

            // --- 提升速度的關鍵參數 ---
            timeWeight: 1.5,     // 每分鐘難度 +0.8 (原為 0.5)
            levelWeight: 0.3,   // 每升一級難度 +0.15 (原為 0.05，現在升級很有感)
            killWeight: 0.001  // 每 1000 分難度 +0.3 (原為 0.1)
        };
    }
    // --- 多維度難度計算 ---
    get elapsedMinutes() {
        return (Date.now() - this.startTime) / 60000;
    }

    get difficulty() {
        // A. 時間基礎：1.0 + 分鐘 * 權重
        const timeFactor = this.elapsedMinutes * this.config.timeWeight;

        // B. 玩家強度：等級 * 權重
        const levelFactor = (this.game.stats.level-1)* this.config.levelWeight;

        // C. 殺敵表現：分數 * 權重
        const scoreFactor = this.game.score * this.config.killWeight;

        // 總難度 = 1.0 (基礎) + 三大因子
        return 1.0 + timeFactor + levelFactor + scoreFactor;
    }

    // --- 根據難度動態調整環境 ---
    get currentSpawnRate() {
        // 難度越高，生怪間隔越短
        return Math.max(this.config.minSpawnRate, this.config.baseSpawnRate / this.difficulty);
    }

    get currentMaxEnemies() {
        // 難度越高，場上怪越多
        return Math.floor(this.config.baseMaxEnemies * this.difficulty);
    }

    // --- 強化敵人的具體數值 ---
    applyScaling(enemy) {
        const diff = this.difficulty;
        enemy.maxHp = Math.floor(enemy.hp * diff);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.floor(enemy.damage * (1 + (diff - 1) * 0.2));
        const speedBonus = Math.min(1.5, 1 + (diff - 1) * 0.05);
        enemy.speed *= speedBonus;
    }


    // --- 邏輯封裝：取得當前生怪門檻 ---
    get currentSpawnRate() {
        return Math.max(this.config.minSpawnRate, this.config.baseSpawnRate - (this.elapsedMinutes * 6));
    }

    get currentMaxEnemies() {
        return Math.floor(this.config.baseMaxEnemies * this.difficulty);
    }
    getRandomSpawnPosition() {
        const padding = 50;
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = Math.random() * width; y = -padding; break;
            case 1: x = width + padding; y = Math.random() * height; break;
            case 2: x = Math.random() * width; y = height + padding; break;
            case 3: x = -padding; y = Math.random() * height; break;
        }
        return { x, y };
    }

    update(px, py) {
        const currentDiff = this.difficulty;
        // 偵測難度整數跳號 (例如從 1.9 變成 2.0)
        if (Math.floor(currentDiff) > this.lastDifficultyInt) {
            this.lastDifficultyInt = Math.floor(currentDiff);
            this.triggerDifficultyEvent();
        }

        // 1. 處理生怪計時
        this.spawnTimer++;
        const activeEnemies = this.enemies.filter(e => !e.isDead);

        if (this.spawnTimer >= this.currentSpawnRate && activeEnemies.length < this.currentMaxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        // 2. 更新敵人並清理
        this.enemies.forEach(enemy => enemy.update(px, py, this.game));
        this.enemies = this.enemies.filter(enemy => !enemy.isDead || enemy.alpha > 0);
    }

    draw(ctx) {
        this.enemies.filter(e => e.isDead).forEach(e => e.draw(ctx));
        this.enemies.filter(e => !e.isDead).forEach(e => e.draw(ctx));
    }

    spawnEnemy() {
        const pos = this.getRandomSpawnPosition();
        const diff = this.difficulty; // 這是你目前的多維度難度係數
        let enemy;

        // --- 修改後的判定邏輯：階梯式機率 ---
        const roll = Math.random(); // 產生 0.0 ~ 1.0 之間的純隨機數

        if (diff > 5.0 && roll < 0.2) {
            // 難度超過 5，且 20% 機率抽中時
            enemy = new TankEnemy(pos.x, pos.y);
        }
        else if (diff > 2.0 && roll < 0.4) {
            // 難度超過 2，且 40% 機率抽中時 (非常有感的出現頻率)
            enemy = new ShooterEnemy(pos.x, pos.y);
        }
        else {
            // 其餘情況或是難度未達標，生成基本追逐怪
            enemy = new ChaserEnemy(pos.x, pos.y);
        }

        // --- 關鍵修改：應用數值縮放與精英怪轉化 ---
        this.applyScaling(enemy); // 處理隨難度成長的血量等

        if (Math.random() < 0.1) {
            enemy.becomeElite(); // 直接呼叫 enemy 自己的方法
        }

        this.enemies.push(enemy);
    }
    triggerDifficultyEvent() {


        // 3. 觸發 UI 文字警告
        this.game.uiManager.showWarning(`DANGER LEVEL: ${Math.floor(this.difficulty * 100)}%`);
    }

}