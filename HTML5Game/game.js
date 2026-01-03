import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js'; // 假設你也拆分了 Enemy
import { PhysicsSystem } from './PhysicsSystem.js';
import { Particle } from './Particle.js'; // <--- 檢查有沒有這一行！
import { CameraSystem } from './CameraSystem.js';
import { PlayerStats } from './PlayerStats.js';
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(400, 300);
        this.bullets = [];
        this.enemies = [];
        this.input = { up: false, down: false, left: false, right: false };
        this.mouse = { x: 0, y: 0, isDown: false };
        this.fireTimer = 0;
        this.particles = [];
        this.score = 0; // <--- 補上這行
        this.camera = new CameraSystem();
        this.stats = new PlayerStats(); // 建立屬性管理器
        this.freezeTimer = 0; // 控制畫面凍結的剩餘幀數
        this.init();
    }
    init() {
        window.onkeydown = e => {
            const key = e.key.toLowerCase();
            if (key === 'w') this.input.up = true;
            if (key === 's') this.input.down = true;
            if (key === 'a') this.input.left = true;
            if (key === 'd') this.input.right = true;

            // 按下數字鍵 1：變成機關槍模式
            if (key === '1') {
                this.stats.fireRate = 5;
                this.stats.pierceCount = 1;
                this.stats.bulletCount = 1;
                console.log("切換至：極速模式");
                this.testMode="機關槍";
            }

            // 按下數字鍵 2：變成貫穿模式
            if (key === '2') {
                this.stats.fireRate = 15;
                this.stats.pierceCount = 20;
                  this.stats.bulletCount = 1;
                console.log("切換至：貫穿模式");
                this.testMode="貫穿";
            }
            // 按下數字鍵 3：變成雙彈道模式
            if (key === '3') {
                this.stats.fireRate = 5;
                this.stats.pierceCount = 1;
                  this.stats.bulletCount = 2;
                console.log("切換至：雙彈道模式");
                this.testMode="雙彈道";
            }
        };

        window.onkeyup = e => {
            const key = e.key.toLowerCase();
            if (key === 'w') this.input.up = false;
            if (key === 's') this.input.down = false;
            if (key === 'a') this.input.left = false;
            if (key === 'd') this.input.right = false;
        };

        this.canvas.onmousedown = () => this.mouse.isDown = true;
        window.onmouseup = () => this.mouse.isDown = false;
        this.canvas.onmousemove = e => {
            const r = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;
        };
        // --- 測試專用：大幅提升射速 ---
        // 原本是 10 (每 10 幀射一發)，改為 2 (每 2 幀一發，接近機關槍)
        //  this.stats.fireRate = 2;
        // 讓一發子彈可以穿透 10 個敵人
        this.stats.pierceCount = 10;
        this.loop();
    }

    update() {
        // 如果凍結計時器大於 0，減少計時器並跳過後續的物理與移動邏輯
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            return;
        }
        this.camera.update(); // 更新鏡頭震動狀態
        // 1. 處理玩家移動
        // 玩家移動現在使用 stats 裡的數值
        this.player.speed = this.stats.moveSpeed;
        this.player.update(this.input);

        // 射擊邏輯
        if (this.mouse.isDown && this.fireTimer <= 0) {
            const count = this.stats.bulletCount;
            const spread = this.stats.spreadAngle;

            // 1. 計算玩家到滑鼠的基礎角度
            const baseAngle = Math.atan2(this.mouse.y - (this.player.y + 16), this.mouse.x - (this.player.x + 16));

            // 2. 根據子彈數量進行扇形發射
            for (let i = 0; i < count; i++) {
                // 計算每顆子彈的角度偏移：讓子彈以 baseAngle 為中心對稱展開
                // 如果只有 1 顆，offset 為 0
                // 如果有 3 顆，offset 分別為 -spread, 0, +spread
                const angleOffset = (i - (count - 1) / 2) * spread;
                const finalAngle = baseAngle + angleOffset;

                // 3. 計算目標點 (利用極座標轉成目標 X, Y 傳給 Bullet)
                const tx = (this.player.x + 16) + Math.cos(finalAngle) * 100;
                const ty = (this.player.y + 16) + Math.sin(finalAngle) * 100;

                this.bullets.push(new Bullet(
                    this.player.x + 16,
                    this.player.y + 16,
                    tx,
                    ty,
                    this.stats.pierceCount
                ));
            }

            this.fireTimer = this.stats.fireRate;
        }
        if (this.fireTimer > 0) this.fireTimer--;

        // 3. 生成敵人
        if (Math.random() < 0.05) {
            this.enemies.push(new Enemy(Math.random() * 800, -30));
        }

        // 4. 更新所有物件位置 (類似 Unity 的 Update)
        this.bullets.forEach(b => b.update());
        this.enemies.forEach(e => e.update(this.player.x, this.player.y));

        // 5. 統一處理碰撞偵測 (類似 Unity 的 LateUpdate 或物理運算階段)
        PhysicsSystem.updateCollisions(this.bullets, this.enemies, (bullet, enemy, bIdx, eIdx) => {
            // 1. 如果敵人已經死了或子彈已經失效，跳過
            if (enemy.isDead || bullet.lifeTime <= 0) return;
            // 2. 敵人受傷並觸發死亡/擊中效果
            this.camera.shake(5, 10);

            enemy.takeDamage(1);

            if (bullet.pierce !== undefined) {
                bullet.pierce--;
                if (bullet.pierce <= 0) bullet.lifeTime = 0;
            } else {
                bullet.lifeTime = 0; // 防止舊版 Bullet 沒設定 pierce 導致卡死
            }
            if (enemy.hp > 0) {
                // --- 效果 A: 僅擊中 (輕微震動 + 少許小粒子) ---
                this.camera.shake(3, 5); // 震動強度 3, 持續 5 幀

                for (let i = 0; i < 3; i++) {
                    // 噴出細小的紅色火花
                    this.particles.push(new Particle(bullet.x, bullet.y, "#FF4444", 2, 4));
                }

            } else {
                // --- 效果 B: 擊殺 (強烈震動 + 大量大粒子噴發) ---
                this.camera.shake(8, 5); // 震動強度 8, 持續 10 幀

                for (let i = 0; i < 15; i++) {
                    // 噴出較大、噴射速度較快的鮮紅碎片
                    this.particles.push(new Particle(enemy.x + 16, enemy.y + 16, "#FF0000", 5, 10));
                }
                // 設定凍結 3~5 幀即可（約 0.05~0.08 秒），這在視覺上非常強烈了
                this.freezeTimer = 1;
                enemy.die(bullet.dx, bullet.dy);    //敵人死亡
                this.stats.gainExp(20); // 增加經驗值
                this.score += 10;
            }
        });

        // 6. 回收過期物件 (垃圾回收)
        this.bullets = this.bullets.filter(b => b.lifeTime > 0);
        // 別忘了在 update 裡更新粒子並回收
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.alpha > 0); // 改成 alpha
        // --- 修正：根據 alpha 回收敵人 (確保能看到飛走消失的過程) ---
        this.enemies = this.enemies.filter(e => e.alpha > 0);

    }



    draw() {
        // 1. 套用鏡頭效果 (就像 Unity Camera 的 Render 過程)
        this.camera.apply(this.ctx);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, 800, 600);
        // 先畫屍體 (背景層)
        this.enemies.filter(e => e.isDead).forEach(e => e.draw(this.ctx));

        // 再畫玩家、活怪和子彈
        this.player.draw(this.ctx);
        this.enemies.filter(e => !e.isDead).forEach(e => e.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));

        this.camera.restore(this.ctx);
        // 注意：UI 通常不放在 camera.apply 之後，這樣 UI 才不會跟著震動
        this.drawUI();

    }
    drawUI() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, 20);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 40);
        this.ctx.fillText(`Score: ${this.score}`, 10, 60);
        // UI 顯示直接對應 stats
        this.ctx.fillText(`LV: ${this.stats.level}`, 10, 80);
        this.ctx.fillText(`EXP: ${this.stats.exp}/${this.stats.nextLevelExp}`, 10, 100);
        this.ctx.fillText(`HP: ${this.stats.hp}/${this.stats.maxHp}`, 10, 120);

        this.ctx.fillText(`TestMode: ${this.testMode}`, 10, 140);
    }
    loop() {
        this.update(); this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

new GameEngine();