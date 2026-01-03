
export const UPGRADE_TAG = {
    EXPLOSION: 'Explosion',
    BOUNCE: 'Bounce',
    BASIC: 'Basic'
};
// 定義升級類型常數，方便管理
export const UPGRADE_TYPE = {
    STAT: '基礎數值', // 如：傷害、射速、移速
    MOD: '武器改裝'   // 如：爆炸、彈跳、分裂
};
export const RARITY = {
    COMMON: { name: '普通', color: '#E0E0E0', weight: 70 },   // 亮灰
    RARE: { name: '稀有', color: '#00D1FF', weight: 20 },     // 電子藍
    EPIC: { name: '史詩', color: '#A335EE', weight: 8 },      // 虛幻紫
    LEGENDARY: { name: '傳說', color: '#FFD700', weight: 2 }  // 純金色 (對齊亮黃色文字)
};
export const UPGRADE_POOL = [
    // --- 基礎數值類 (STAT) ---
    {

        id: 'fireRate',
        tag: UPGRADE_TAG.BASIC, // 屬於基礎類
        type: UPGRADE_TYPE.STAT,
        name: '急速射擊',
        rarity: RARITY.LEGENDARY,
        description: (stats) => {
            const current = (60 / stats.fireRate).toFixed(1);
            const next = (60 / Math.max(2, stats.fireRate - 2)).toFixed(1);
            return `射擊頻率：${current}/s → ${next}/s`;
        },
        action: (stats) => { stats.fireRate = Math.max(2, stats.fireRate - 2); }
    },
    {
        id: 'pierce',
        tag: UPGRADE_TAG.BASIC, // 屬於基礎類
        type: UPGRADE_TYPE.STAT,
        name: '強力貫穿',
        rarity: RARITY.COMMON,
        description: (stats) => `子彈貫穿次數：${stats.pierceCount} → ${stats.pierceCount + 1}`,
        action: (stats) => { stats.pierceCount += 1; }
    },
    {
        id: 'bulletCount',
        tag: UPGRADE_TAG.BASIC, // 屬於基礎類
        type: UPGRADE_TYPE.STAT,
        name: '多重彈道',
        rarity: RARITY.EPIC,
        description: (stats) => `每次射擊彈頭：${stats.bulletCount} → ${stats.bulletCount + 1}`,
        action: (stats) => { stats.bulletCount += 1; }
    },
    {
        id: 'moveSpeed',
        tag: UPGRADE_TAG.BASIC, // 屬於基礎類
        type: UPGRADE_TYPE.STAT,
        name: '輕盈腳步',
        rarity: RARITY.COMMON,
        description: (stats) => `移動速度提升：${stats.moveSpeed.toFixed(1)} → ${(stats.moveSpeed + 0.5).toFixed(1)}`,
        action: (stats) => { stats.moveSpeed += 0.5; }
    },
    {
        id: 'damage',
        tag: UPGRADE_TAG.BASIC, // 屬於基礎類
        type: UPGRADE_TYPE.STAT,
        name: '強烈打擊',
        rarity: RARITY.COMMON,
        description: (stats) => `基礎傷害提升：${stats.damage} → ${stats.damage + 1}`,
        action: (stats) => { stats.damage += 1; }
    }

    ,

    // --- 武器改裝類  ---

    // --- 爆炸系列 ---
    {
        id: 'explosion',
        tag: UPGRADE_TAG.EXPLOSION, // 屬於爆炸系列
        type: UPGRADE_TYPE.MOD,
        name: '連鎖爆炸',
        rarity: RARITY.RARE,
        // 核心解鎖只有在還沒解鎖時出現 (或者你想讓它升級範圍就留著)
        condition: (stats) => true,
        // Upgrades.js 中的例子
        description: (stats) => {
            // 計算總威力
            const totalDmg = (stats.damage * stats.explosionMult + stats.explosionDamage).toFixed(1);
            // 轉換為整數百分比顯示
            const percent = (stats.explosionMult * 100).toFixed(0);

            if (stats.explosionLevel === 0) {
                // 用中文解釋來源，取代純數學公式
                return `解鎖擊中爆炸：威力 → ${totalDmg} (繼承 ${percent}% 基礎傷害)`;
            }
            return `爆炸半徑：${stats.explosionRadius} → ${stats.explosionRadius + 20}`;
        },
        action: (stats) => {

            if (stats.explosionLevel != 0) {
                stats.explosionRadius += 20;
            }
            stats.explosionLevel += 1;

        }
    },
    //爆炸強化 提升繼承的基礎攻擊力
    {
        id: 'explosion_mult',
        tag: UPGRADE_TAG.EXPLOSION, // 屬於爆炸系列
        type: UPGRADE_TYPE.MOD,
        name: '高能導火索',
        rarity: RARITY.COMMON,
        condition: (stats) => stats.explosionLevel > 0,
        description: (stats) => {
            const curM = (stats.explosionMult * 100).toFixed(0);
            const nxtM = ((stats.explosionMult + 0.2) * 100).toFixed(0);
            const nxtD = (stats.damage * (stats.explosionMult + 0.2)).toFixed(1);

            // 縮減字數：移除「提升後威力」，直接用括號表示
            return `爆炸繼承：${curM}% → ${nxtM}% (威力: ${nxtD})`;
        },
        action: (stats) => {
            stats.explosionMult += 0.2;
        }
    },

    // 2. 爆炸強化 提升固定加成 (適合前期直接增加傷害)
    {
        id: 'explosion_flat',
        tag: UPGRADE_TAG.EXPLOSION, // 屬於爆炸系列
        type: UPGRADE_TYPE.MOD,
        name: '精煉火藥',
        rarity: RARITY.COMMON,
        condition: (stats) => stats.explosionLevel > 0,
        // 讓玩家清楚知道這是加在「右邊」那個數字
        description: (stats) => `爆炸固定傷害：${stats.explosionDamage} → ${stats.explosionDamage + 1} (額外爆炸加成)`,
        action: (stats) => { stats.explosionDamage += 1; }
    },

    // --- 彈跳系列 ---
    {
        id: 'bounce',
        tag: UPGRADE_TAG.BOUNCE, // 屬於彈跳系列
        type: UPGRADE_TYPE.MOD,
        name: '彈射子彈',
        rarity: RARITY.RARE,
        condition: (stats) => true,
        description: (stats) => `子彈彈射次數：${stats.bounceCount} → ${stats.bounceCount + 1}`,
        action: (stats) => {
            stats.bounceLevel += 1;
            stats.bounceCount += 1;
        }
    },

    {
        id: 'bounce_range',
        tag: UPGRADE_TAG.BOUNCE, // 屬於彈跳系列
        type: UPGRADE_TYPE.MOD,
        name: '連鎖增幅',
        rarity: RARITY.RARE,
        condition: (stats) => stats.bounceLevel > 0,
        description: (stats) => `彈射搜尋範圍：${stats.bounceRange} → ${stats.bounceRange + 50}`,
        action: (stats) => {
            stats.bounceRange += 50;
        }
    }

];