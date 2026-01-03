import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js'; // 假設你也拆分了 Enemy
import { PhysicsSystem } from './PhysicsSystem.js';
import { Particle } from './Particle.js'; // <--- 檢查有沒有這一行！
import { CameraSystem } from './CameraSystem.js';
import { PlayerStats } from './PlayerStats.js';
import { UPGRADE_POOL } from './Upgrades.js';
import { UIManager } from './UIManager.js';
import { ExplosionVisual } from './ExplosionVisual.js';
import { EffectManager } from './EffectManager.js';
import { CombatLogic } from './CombatLogic.js';
import { ChaserEnemy } from './ChaserEnemy.js';
import { ShooterEnemy } from './ShooterEnemy.js';
import { TankEnemy } from './TankEnemy.js'; //
import { EnemyManager } from './EnemyManager.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(400, 300);
        this.bullets = [];
        // this.enemies = [];
        this.input = { up: false, down: false, left: false, right: false };
        this.mouse = { x: 0, y: 0, isDown: false };
        this.fireTimer = 0;
        this.particles = [];
        this.score = 0; // <--- 補上這行
        this.camera = new CameraSystem();
        this.stats = new PlayerStats(); // 建立屬性管理器
        this.uiManager = new UIManager(this.ctx);
        this.freezeTimer = 0; // 控制畫面凍結的剩餘幀數
        this.isSelectingUpgrade = false; //判斷是否在升級選單
        this.upgradeOptions = [];
        this.enemyBullets = []; // <--- 務必補上這行，否則 ShooterEnemy 會報錯
        this.enemyManager = new EnemyManager(this);
        this.isGameOver = false;
        this.init();

    }
    init() {



        window.onkeydown = e => {
            const key = e.key.toLowerCase();
            if (key === 'w') this.input.up = true;
            if (key === 's') this.input.down = true;
            if (key === 'a') this.input.left = true;
            if (key === 'd') this.input.right = true;


            if (key === '1') {
                this.stats.explosionLevel = 1;     // 開啟爆炸功能
                this.stats.explosionRadius = 100;   // 給一個超大範圍方便肉眼觀察
                this.stats.fireRate = 10;           // 射速稍微調快
                console.log("測試模式：開啟大範圍爆炸彈");
                this.testMode = "爆炸測試";
            }
            // GameEngine.js 中的 init() window.onkeydown 內
            if (key === '2') {
                this.stats.bounceLevel = 1;      // 開啟彈射等級
                this.stats.bounceCount = 3;      // 設定單發子彈可彈射 3 次
                this.stats.pierceCount = 1;      // 彈射通常搭配低貫穿，測試彈射路徑
                this.stats.fireRate = 20;        // 射速放慢一點點，方便觀察子彈飛向誰
                this.stats.bulletCount = 1;      // 單發比較好觀察路徑
                console.log("測試模式：開啟多重彈射彈 (3次)");
                this.testMode = "彈射測試";
            }
        };

        window.onkeyup = e => {
            const key = e.key.toLowerCase();
            if (key === 'w') this.input.up = false;
            if (key === 's') this.input.down = false;
            if (key === 'a') this.input.left = false;
            if (key === 'd') this.input.right = false;
        };

        //滑鼠按下監聽
        this.canvas.onmousedown = (e) => {

            if (this.isGameOver) {
                location.reload();
                return;
            }
            if (this.isSelectingUpgrade) {
                if (this.uiManager.hoverIndex !== -1) {
                    this.applyUpgrade(this.uiManager.hoverIndex);
                }
            } else {
                this.mouse.isDown = true;
            }
        };

        //滑鼠放開監聽
        window.onmouseup = () => this.mouse.isDown = false;


        //滑鼠移動監聽
        this.canvas.onmousemove = e => {
            const r = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;

            // 如果正在選技能，進行碰撞檢查
            if (this.isSelectingUpgrade) {
                const cardW = 480; // 需與 UIManager 寬度一致
                const cardH = 100;
                const cardX = 400 - cardW / 2;

                let found = -1;
                for (let i = 0; i < 3; i++) {
                    const cardY = 170 + i * 125; // 需與 UIManager 座標一致
                    if (this.mouse.x >= cardX && this.mouse.x <= cardX + cardW &&
                        this.mouse.y >= cardY && this.mouse.y <= cardY + cardH) {
                        found = i;
                        break;
                    }
                }
                this.uiManager.hoverIndex = found; // 更新 UIManager 的狀態
            }
        };
        this.loop();
    }

    update() {

        if (this.isGameOver) return;
        if (this.isSelectingUpgrade) return; // 如果正在選技能，停止所有更新
        // --- 新增：檢查升級存摺 ---
        if (this.stats.pendingUpgradeCount > 0) {
            this.stats.pendingUpgradeCount--; // 消耗一次升級機會
            this.showUpgradeMenu();           // 彈出選單
            return; // 這一幀暫停，等待玩家選擇
        }
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

        // 2. --- 強制邊界限制 ---
        // 限制 X 軸 (0 ~ 畫布寬度減去角色寬度)
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.w));

        // 限制 Y 軸 (0 ~ 畫布高度減去角色高度)
        this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.h));



        // 射擊邏輯
        if (this.mouse.isDown && this.fireTimer <= 0) {
            const count = this.stats.bulletCount;
            const spread = this.stats.spreadAngle;

            // 1. 計算玩家到滑鼠的基礎角度
            const baseAngle = Math.atan2(this.mouse.y - (this.player.centerY), this.mouse.x - (this.player.centerX));

            // 2. 根據子彈數量進行扇形發射
            for (let i = 0; i < count; i++) {
                // 計算每顆子彈的角度偏移：讓子彈以 baseAngle 為中心對稱展開
                // 如果只有 1 顆，offset 為 0
                // 如果有 3 顆，offset 分別為 -spread, 0, +spread
                const angleOffset = (i - (count - 1) / 2) * spread;
                const finalAngle = baseAngle + angleOffset;

                // 3. 計算目標點 (利用極座標轉成目標 X, Y 傳給 Bullet)
                const tx = (this.player.centerX) + Math.cos(finalAngle) * 100;
                const ty = (this.player.centerY) + Math.sin(finalAngle) * 100;

                // GameEngine.js 中的 update() 射擊部分
                this.bullets.push(new Bullet(
                    this.player.centerX,
                    this.player.centerY,
                    tx,
                    ty,
                    this.stats.pierceCount,
                    this.stats.bounceCount // <--- 傳入當前等級的彈跳次數
                ));
            }

            this.fireTimer = this.stats.fireRate;
        }
        if (this.fireTimer > 0) this.fireTimer--;


        this.enemyManager.update(this.player.centerX, this.player.centerY);

        // 4. 更新所有物件位置
        this.bullets.forEach(b => b.update());


        // 新增：處理敵人子彈的移動與碰撞
        this.enemyBullets = this.enemyBullets.filter(eb => {
            eb.x += eb.vx;
            eb.y += eb.vy;

            // 檢查與玩家碰撞
            const dist = Math.sqrt((eb.x - (this.player.centerX)) ** 2 + (eb.y - (this.player.centerY)) ** 2);
            if (dist < 20) {
                this.handlePlayerDamage(eb.damage || 5);
                return false;
            }
            // 超出螢幕回收
            return eb.x > -50 && eb.x < 850 && eb.y > -50 && eb.y < 650;
        });

        // game.js 內的 PhysicsSystem.updateCollisions 區塊

        PhysicsSystem.updateCollisions(this.bullets, this.enemyManager.enemies, (bullet, enemy) => {
            if (enemy.isDead || bullet.lifeTime <= 0) return;

            // --- 關鍵修正 1：檢查命中紀錄 ---
            if (!bullet.hitHistory) bullet.hitHistory = new Set();
            if (bullet.hitHistory.has(enemy)) return; // 如果這顆子彈撞過這隻怪，直接跳過

            // --- 關鍵修正 2：立即加入紀錄 ---
            bullet.hitHistory.add(enemy);

            // 1. 觸發爆炸 (現在因為有 hitHistory 擋住，同一隻怪只會炸一次)
            if (this.stats.explosionLevel > 0) {
                CombatLogic.handleExplosion(this, bullet.x, bullet.y, this.stats.explosionRadius, bullet);
            }


             // 3. 基礎傷害處理 (如果沒彈跳)
            enemy.takeDamage(this.stats.damage);
            if (enemy.hp <= 0) {
                this.handleEnemyDeath(enemy, bullet);
            } else {
                EffectManager.createHitEffect(this.particles, bullet.x, bullet.y);
            }
            // 2. 處理彈跳
            if (this.stats.bounceLevel > 0 && bullet.bounceCount > 0) {
                const didBounce = CombatLogic.handleBounce(this, bullet, enemy);
                if (didBounce) {
                    bullet.bounceCount--;
                    // 彈跳成功後，不執行穿透扣除，直接 return 讓子彈飛往新方向
                    return;
                }
            }

           

            // 4. 處理穿透
            bullet.pierce--;
            if (bullet.pierce <= 0) bullet.lifeTime = 0;
        });

        // 確保傳入的是 enemyManager 裡的敵人陣列
        PhysicsSystem.checkPlayerEnemyCollisions(this.player, this.enemyManager.enemies, this);




        // GameEngine.js 內的 update() 第 6 點
        // 6. 回收過期物件
        this.bullets = this.bullets.filter(b => b.lifeTime > 0);

        // 粒子更新與過濾邏輯優化
        this.particles = this.particles.filter(p => {
            const isStillActive = p.update();

            // 如果是舊的 Particle 類別，可能沒有回傳值，我們用 alpha 補強判斷
            if (isStillActive === undefined) {
                return p.alpha > 0;
            }
            return isStillActive;
        });

        EffectManager.updateOverlay(); // 讓特效自行處理冷卻


    }



    draw() {
        // A. 徹底清空畫布（防止殘影）
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.camera.apply(this.ctx);

        // 背景
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(-50, -50, this.canvas.width + 100, this.canvas.height + 100);

        // 1. 玩家
        this.player.draw(this.ctx);

        // 2. 子彈
        this.bullets.forEach(b => b.draw(this.ctx));

        // 3. 敵人 (管理員會處理活著與死亡的順序)
        this.enemyManager.draw(this.ctx);

        // 4. 粒子與其他
        this.particles.forEach(p => p.draw(this.ctx));

        // 敵人子彈
        this.enemyBullets.forEach(eb => {
            this.ctx.fillStyle = "#FF00FF";
            this.ctx.beginPath();
            this.ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // E. 恢復鏡頭（結束震動影響）
        this.camera.restore(this.ctx);

        EffectManager.drawOverlay(this.ctx, this.canvas);


        this.uiManager.drawWarning(this.ctx); // 繪製文字提示

        // F. 繪製 UI（UI 不應受震動影響）
        this.drawHUD();

        // 如果遊戲結束，最後畫出死亡 UI
        if (this.isGameOver) {
            this.uiManager.drawGameOver(this.score);
        }
    }
    drawHUD() {

        // 無論何時都畫 HUD
        this.uiManager.drawHUD(this.stats, this.score, this.bullets.length, this.enemyManager.difficulty);


        // 只有升級時才畫選單
        if (this.isSelectingUpgrade) {
            this.uiManager.drawUpgradeMenu(this.upgradeOptions, this.stats);
        }

    }
    loop() {
        this.update(); this.draw();
        requestAnimationFrame(() => this.loop());
    }
    getRandomUpgrades(count = 3) {
        // 1. 先根據目前玩家狀態過濾掉不符合 condition 的技能
        const availablePool = UPGRADE_POOL.filter(upgrade => {
            // 如果 upgrade 有定義 condition，執行它；否則預設為 true
            if (typeof upgrade.condition === 'function') {
                return upgrade.condition(this.stats);
            }
            return true;
        });

        const selections = [];
        // 建立一個臨時池副本，避免重複抽選
        let tempPool = [...availablePool];

        // 抽取的數量不能超過可用池的大小
        const actualCount = Math.min(count, tempPool.length);

        for (let i = 0; i < actualCount; i++) {
            // 2. 計算目前臨時池的總權重
            const totalWeight = tempPool.reduce((sum, upgrade) => sum + upgrade.rarity.weight, 0);

            // 3. 產生隨機數
            let random = Math.random() * totalWeight;

            // 4. 根據權重區間找出技能
            for (let j = 0; j < tempPool.length; j++) {
                const upgrade = tempPool[j];
                if (random < upgrade.rarity.weight) {
                    selections.push(upgrade);
                    // 從臨時池移除已抽中的技能，確保不會抽到重複的
                    tempPool.splice(j, 1);
                    break;
                }
                random -= upgrade.rarity.weight;
            }
        }

        return selections;
    }

    showUpgradeMenu() {
        this.isSelectingUpgrade = true;

        // 1. 取得原始隨機選項 (getRandomUpgrades 內已有 condition 過濾)
        let options = this.getRandomUpgrades(3);

        // 2. 保底邏輯：玩家完全沒有武器模組時觸發
        const hasModule = this.stats.explosionLevel > 0 || this.stats.bounceLevel > 0;

        if (!hasModule) {
            // 從池子裡篩選符合標籤「且」符合條件的武器
            const weaponModules = UPGRADE_POOL.filter(u => {
                const isWeapon = (u.tag === "Explosion" || u.tag === "Bounce");
                const passCondition = typeof u.condition === 'function' ? u.condition(this.stats) : true;
                return isWeapon && passCondition;
            });

            // 如果目前的選項裡剛好都沒抽到武器，且池子裡還有可用武器
            const alreadyHasWeapon = options.some(opt => opt.tag === "Explosion" || opt.tag === "Bounce");

            if (!alreadyHasWeapon && weaponModules.length > 0) {
                // 強行把第一個選項換成符合條件的武器
                options[0] = weaponModules[Math.floor(Math.random() * weaponModules.length)];
            }
        }

        this.upgradeOptions = options;
    }
    applyUpgrade(index) {
        const selected = this.upgradeOptions[index];
        selected.action(this.stats);

        // --- 新增：玩家頭上跳字 ---
        // 將十六進位顏色轉換為 rgba 格式 (簡單處理可用 white 或從 rarity 提取)
        const color = selected.rarity.color;
        this.player.addFloatingText(`★ ${selected.name} UP!`, "255, 215, 0");

        this.isSelectingUpgrade = false;
        this.upgradeOptions = [];
        this.uiManager.hoverIndex = -1; // 記得重設懸停索引
    }


    // 在 GameEngine 類別內新增此方法
    handleEnemyDeath(enemy, bullet = null) {
        if (enemy.isDead) return;

        // 1. 觸發死亡視覺效果
        EffectManager.createDeathEffect(this.particles, enemy.centerX, enemy.centerY);
        this.camera.shake(8, 5);
        this.freezeTimer = 1;

        // 2. 敵人死亡邏輯 (帶入擊殺方向)
        const dx = bullet ? bullet.dx : 0;
        const dy = bullet ? bullet.dy : 0;
        enemy.die(dx, dy);

        // 3. 獎勵邏輯
        if (enemy.isElite) {
            // 1. 金色特效文字
            this.player.addFloatingText("★ ELITE ELIMINATED ★", "255, 215, 0");

            // 2. 噴出更多金色的粒子 (可選)
            for (let i = 0; i < 20; i++) {
                EffectManager.createHitEffect(this.particles, enemy.centerX, enemy.centerY, "#FFD700");
            }

            // 3. 獎勵
            this.score += 150;
            this.stats.gainExp(100);
            this.camera.shake(25, 12); // 強烈震動
        } else {
            // 普通怪獎勵
            this.score += 10;
            this.stats.gainExp(20);
        }
    }
    // game.js 內部修改
    handlePlayerDamage(amount) {
        // 呼叫 player 的受傷方法（這會處理無敵時間與彈開）
        const success = this.player.takeDamage(amount);

        if (success) {
            // 同步血量給 stats (如果你希望 UI 繼續讀取 stats.hp)
            this.stats.hp = this.player.hp;

            EffectManager.triggerDamageFlash();
            this.camera.shake(10, 5);
            this.player.addFloatingText(`-${amount}`, "255, 0, 0");

            if (this.player.hp <= 0) {
                this.gameOver();
            }
        }
    }
    gameOver() {
        this.isGameOver = true;
        // 震動一下強調死亡感
        this.camera.shake(20, 15);
    }
}

new GameEngine();

