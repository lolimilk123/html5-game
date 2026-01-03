// UIManager.js
export class UIManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.hoverIndex = -1; // 記錄目前滑鼠懸停的選項索引 (-1 代表沒有)

        this.warningText = {
            content: "",
            timer: 0,
            alpha: 0
        };
    }
    showWarning(text) {
        this.warningText.content = text;
        this.warningText.timer = 120; // 顯示約 2 秒
        this.warningText.alpha = 1.0;
    }

    // UIManager.js

    drawWarning(ctx) {
        if (this.warningText.timer <= 0) return;

        ctx.save();

        // 設定文字屬性
        const fontSize = 24;
        ctx.font = `bold ${fontSize}px 'Consolas', 'Monaco', monospace`; // 使用等寬字體更有科技感
        const text = this.warningText.content;
        const textWidth = ctx.measureText(text).width;

        // 設定位置：畫面頂部經驗條下方 (y = 50)
        const x = 400; // 畫面中心 X
        const y = 55;  // 經驗條高度是 6，所以放 55 剛好在上方區域

        // 繪製一個細長的半透明飾板背景，增加辨識度但不過度遮擋
        const padding = 20;
        ctx.fillStyle = `rgba(0, 0, 0, ${this.warningText.alpha * 0.6})`;
        ctx.fillRect(x - textWidth / 2 - padding, y - fontSize, textWidth + padding * 2, fontSize + 10);

        // 繪製左側橘色裝飾小線段
        ctx.fillStyle = `rgba(255, 100, 0, ${this.warningText.alpha})`;
        ctx.fillRect(x - textWidth / 2 - padding, y - fontSize, 4, fontSize + 10);

        // 繪製文字
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(255, 200, 0, ${this.warningText.alpha})`; // 改用暖橘色，沒那麼刺眼
        ctx.fillText(text, x, y);

        ctx.restore();

        this.warningText.timer--;
        // 讓消失動畫快一點，縮短遮擋時間
        this.warningText.alpha -= 0.015;
    }
    drawHUD(stats, score, bulletsCount, difficulty) {


        const ctx = this.ctx;
        const screenW = 800;

      // --- 1. 極簡經驗條 (恢復到最頂端，維持原本風格) ---
        const expBarHeight = 4; // 縮細一點，更不顯眼
        const expRatio = Math.min(1, stats.exp / stats.nextLevelExp);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // 更透明的底色
        ctx.fillRect(0, 0, screenW, expBarHeight);
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(0, 0, screenW * expRatio, expBarHeight);

        // --- 2. 整合式等級與血條 (左上角，極簡化) ---
        this.drawCompactStatus(ctx, stats, expBarHeight);

        // --- 其他 HUD 資訊 (得分與難度) ---
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.fillText(`SCORE: ${score}`, screenW - 15, 30);

        // 難度顯示
        let dangerColor = "#00FF00";
        if (difficulty > 2.0) dangerColor = "#FFAA00";
        if (difficulty > 4.0) dangerColor = "#FF4444";
        
        ctx.fillStyle = dangerColor;
        ctx.font = "bold 16px Arial";
        ctx.fillText(`DANGER: ${(difficulty * 100).toFixed(0)}%`, screenW - 15, 55);
        this.drawDangerBar(screenW - 115, 65, 100, 4, difficulty);

        // 繪製左側屬性面板
        this.drawStatPanel(stats);

    }

   drawCompactStatus(ctx, stats, topOffset) {
        const x = 15;
        const y = topOffset + 10;
        const hpBarW = 150; // 縮短寬度
        const hpBarH = 10;  // 縮減高度

       

        // 繪製等級 (LV)
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Consolas";
        ctx.fillText(`LV.${stats.level}`, x + 5, y + 18);

        // 繪製血條 (HP)
        const hpX = x + 45;
        const hpY = y + 8;
        const hpPercent = Math.max(0, stats.hp / stats.maxHp);

        // 血條底槽
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(hpX, hpY, hpBarW, hpBarH);

        // 血量顏色 (保持功能性，但降低飽和度)
        if (hpPercent > 0.6) ctx.fillStyle = "rgba(46, 204, 113, 0.8)"; 
        else if (hpPercent > 0.3) ctx.fillStyle = "rgba(241, 196, 15, 0.8)";
        else ctx.fillStyle = "rgba(231, 76, 60, 0.8)";

        ctx.fillRect(hpX, hpY, hpBarW * hpPercent, hpBarH);

        // HP 數值文字 (半透明)
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.ceil(stats.hp)}/${stats.maxHp}`, hpX + hpBarW/2, hpY + 8);
    }

    drawStatPanel(stats) {
        const ctx = this.ctx;
        const x = 10;
        const y = 110;
        const width = 200;
        const lineHeight = 22;
        // --- 1. 準備各分類數據 ---
        const baseStats = [
            { label: "射擊速度", value: (60 / stats.fireRate).toFixed(1) + "/s" },
            { label: "子彈貫穿", value: stats.pierceCount },
            { label: "彈道數量", value: stats.bulletCount },
            { label: "移動速度", value: stats.moveSpeed.toFixed(1) },
            { label: "基礎傷害", value: stats.damage || 1 }
        ];

        const explosionStats = [];
        if (stats.explosionLevel > 0) {
            const baseFromDamage = stats.damage * stats.explosionMult;
            const totalPower = baseFromDamage + stats.explosionDamage;
            explosionStats.push({ label: "爆炸總威力", value: `${totalPower.toFixed(1)} (${baseFromDamage.toFixed(1)}+${stats.explosionDamage})`, color: "#FF4400" });
            explosionStats.push({ label: "爆炸半徑", value: stats.explosionRadius, color: "#FFAA00" });
        }

        const bounceStats = [];
        if (stats.bounceLevel > 0) {
            bounceStats.push({ label: "彈跳次數", value: stats.bounceCount, color: "#00FFFF" });
            bounceStats.push({ label: "彈跳範圍", value: stats.bounceRange, color: "#00FFFF" });
        }
        // --- 2. 計算動態高度 ---
        let rowCount = baseStats.length + 1; // 基礎 + 1標題
        if (explosionStats.length > 0) rowCount += explosionStats.length + 1;
        if (bounceStats.length > 0) rowCount += bounceStats.length + 1;
        const height = 40 + (rowCount * lineHeight);

        // --- 3. 繪製面板背景 ---
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, "rgba(0, 30, 30, 0.85)");
        gradient.addColorStop(1, "rgba(0, 10, 10, 0.6)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // 2. 左側裝飾飾條
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(x, y, 3, height);


        // --- 4. 內部繪製邏輯 ---
        let currentY = y + 22;

        // 繪製分類與屬性的工具函數
        const drawSection = (title, items, titleColor) => {
            if (items.length === 0) return;

            // 繪製小標題
            ctx.textAlign = "left";
            ctx.font = "bold 11px 'Segoe UI', Arial";
            ctx.fillStyle = titleColor;
            ctx.fillText(`[ ${title} ]`, x + 10, currentY);
            currentY += 18;

            // 繪製該屬性清單
            items.forEach(s => {
                ctx.textAlign = "left";
                ctx.font = s.label === "爆炸總威力" ? "10px Arial" : "12px Arial";
                ctx.fillStyle = s.color || "rgba(255, 255, 255, 0.7)";
                ctx.fillText(s.label, x + 15, currentY);

                ctx.textAlign = "right";
                ctx.fillStyle = "#fff";
                ctx.fillText(s.value, x + width - 10, currentY);
                currentY += lineHeight;
            });
            currentY += 8; // 段落間距
        };

        // 繪製標題
        ctx.textAlign = "left";
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.fillText("OPERATIONAL STATS", x + 10, currentY);
        currentY += 25;

        // 執行分類繪製
        drawSection("系統基礎", baseStats, "#aaaaaa");
        drawSection("爆炸模組", explosionStats, "#FF4400");
        drawSection("彈跳模組", bounceStats, "#00CCFF");
        ctx.textAlign = "left";
    }
    drawUpgradeMenu(options, stats) {
        const ctx = this.ctx;
        // --- 修正：從純黑改為半透明 ---
        // 使用 radial gradient (徑向漸層) 讓中心亮一點，邊緣暗一點
        const bgGrad = ctx.createRadialGradient(400, 300, 50, 400, 300, 600);
        bgGrad.addColorStop(0, "rgba(10, 10, 20, 0.7)"); // 中心較透
        bgGrad.addColorStop(1, "rgba(0, 0, 5, 0.9)");    // 邊緣較暗

        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 600);


        ctx.textAlign = "center";
        ctx.fillStyle = "#FFD700";
        ctx.font = "900 32px 'Microsoft JhengHei', sans-serif";
        ctx.fillText("系統強化：選擇組件", 400, 90);

        const cardW = 480;
        const cardH = 100;
        const cardX = 400 - cardW / 2;

        options.forEach((opt, i) => {
            const cardY = 170 + i * 125;
            const isHovered = (i === this.hoverIndex); // 判斷是否被選中
            const rarity = opt.rarity || { name: '普通', color: '#ffffff' };
            const tag = opt.tag || "Basic";

            let brandColor = "#FFFFFF";
            let tagChinese = "基礎";
            if (tag === "Explosion") { brandColor = "#FF4400"; tagChinese = "爆炸"; }
            if (tag === "Bounce") { brandColor = "#00CCFF"; tagChinese = "彈跳"; }

            // --- 1. 卡片底座 ---
            ctx.save();
            ctx.fillStyle = isHovered ? "rgba(45, 45, 55, 1)" : "rgba(25, 25, 30, 1)";
            ctx.strokeStyle = rarity.color;
            ctx.lineWidth = isHovered ? 2 : (rarity.name === '傳說' ? 2 : 1);

            if (isHovered) {
                ctx.shadowBlur = 5;
                ctx.shadowColor = rarity.color;
            }

            ctx.beginPath();
            ctx.moveTo(cardX, cardY);
            ctx.lineTo(cardX + cardW - 20, cardY);
            ctx.lineTo(cardX + cardW, cardY + 20);
            ctx.lineTo(cardX + cardW, cardY + cardH);
            ctx.lineTo(cardX, cardY + cardH);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // --- 2. 右側插槽區域 ---
            const modW = 110;
            const modX = cardX + cardW - modW;
            const slantOffset = 30; // 稍微增加斜度

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(modX + slantOffset, cardY);
            ctx.lineTo(cardX + cardW - 20, cardY);
            ctx.lineTo(cardX + cardW, cardY + 20);
            ctx.lineTo(cardX + cardW, cardY + cardH);
            ctx.lineTo(modX, cardY + cardH);
            ctx.closePath();
            ctx.clip();
            ctx.fillStyle = brandColor + "1A";
            ctx.fill();

            // 下移模組標籤位置，使其對準 Icon 上方
            const textOffset = isHovered ? 5 : 0;
            ctx.textAlign = "left";
            ctx.fillStyle = rarity.color;
            ctx.font = "bold 24px 'Microsoft JhengHei'";
            ctx.fillText(opt.name, cardX + 20 + textOffset, cardY + 55);
            ctx.restore();

            ctx.strokeStyle = brandColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(modX + slantOffset, cardY);
            ctx.lineTo(modX, cardY + cardH);
            ctx.stroke();

            // --- 3. 文字內容 (座標重整) ---
            ctx.textAlign = "left";

            // 稀有度 (微調座標)
            ctx.font = "900 12px 'Microsoft JhengHei'";
            ctx.fillStyle = rarity.color;
            ctx.fillText(rarity.name, cardX + 25, cardY + 28);

            // 主要名稱 (稍微上移，留空間給描述)
            ctx.font = "bold 26px 'Microsoft JhengHei'";
            ctx.fillStyle = rarity.color;
            ctx.fillText(opt.name, cardX + 25, cardY + 60);

            // 描述文字 (增加字體大小，上移避免貼邊)
            // 請替換 UIManager.js 中的描述渲染片段
            const maxW = cardW - modW - 45; // 安全寬度限制
            let desc = typeof opt.description === 'function' ? opt.description(stats) : opt.description;

            ctx.font = "15px 'Microsoft JhengHei'";
            if (desc.includes("→")) {
                const parts = desc.split("→");
                const partA = parts[0];
                const partB = "→ " + parts[1];

                // 測量總長度
                const totalWidth = ctx.measureText(partA + partB).width;

                if (totalWidth > maxW) {
                    // --- 情況 A：文字太長，強制換行 ---
                    ctx.font = "13px 'Microsoft JhengHei'"; // 稍微縮小字體
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.fillText(partA, cardX + 25, cardY + 76); // 第一行上移

                    ctx.fillStyle = rarity.color; // 數值高亮
                    ctx.fillText(partB, cardX + 25, cardY + 93); // 第二行下移
                } else {
                    // --- 情況 B：長度正常，單行顯示 ---
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.fillText(partA, cardX + 25, cardY + 86);

                    ctx.fillStyle = rarity.color;
                    const tw = ctx.measureText(partA).width;
                    ctx.fillText(partB, cardX + 25 + tw, cardY + 86);
                }
            } else {
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.fillText(desc, cardX + 25, cardY + 86, maxW);
            }



            // --- 4. Icon 中心對齊 ---
            const iconCenterX = modX + (modW / 2) + 15;
            const iconCenterY = cardY + (cardH / 2) + 10;

            // 新增：顯示中文標籤
            ctx.save();
            ctx.textAlign = "center";
            ctx.font = "bold 12px 'Microsoft JhengHei'";
            ctx.fillStyle = brandColor;
            // 在圖示上方加上如「[ 爆炸模組 ]」的文字
            ctx.fillText(`[ ${tagChinese} ]`, iconCenterX, iconCenterY - 32);
            ctx.restore();

            this.drawTagIcon(ctx, iconCenterX, iconCenterY, 20, tag, brandColor);
        });
    }
    drawTagIcon(ctx, x, y, size, tag, color) {
        ctx.save();
        ctx.translate(x, y);

        // 設定硬邊幾何風格
        ctx.lineJoin = "miter";
        ctx.lineCap = "square";

        const drawStyledShape = (drawFn, fillColor) => {
            // 1. 底層陰影/發光 (讓圖示沉在卡片裡)
            ctx.shadowBlur = 10;
            ctx.shadowColor = fillColor;

            // 2. 主填色層
            ctx.beginPath();
            drawFn();
            ctx.fillStyle = fillColor;
            ctx.fill();

            // 3. 亮色邊框裝飾 (增加硬度)
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 4. 外圍裝飾虛線 (細節感)
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.3, 0, Math.PI * 0.5);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        switch (tag) {
            case "Explosion":
                drawStyledShape(() => {
                    // 鑽石切角星形
                    for (let i = 0; i < 8; i++) {
                        const r = i % 2 === 0 ? size : size * 0.4;
                        const angle = (Math.PI * 2 / 8) * i;
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                    ctx.closePath();
                }, "#FF4400");
                break;

            case "Bounce":
                drawStyledShape(() => {
                    // 雙箭頭幾何
                    const s = size * 0.8;
                    ctx.moveTo(-s, s);
                    ctx.lineTo(0, -s);
                    ctx.lineTo(s, s);
                    ctx.lineTo(s, 0);
                    ctx.lineTo(0, -s * 1.5);
                    ctx.lineTo(-s, 0);
                    ctx.closePath();
                }, "#00CCFF");
                break;

            case "Basic":
                drawStyledShape(() => {
                    // 科技感六角形
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI * 2 / 6) * i;
                        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                    }
                    ctx.closePath();
                }, "#FFFFFF");
                break;
        }
        ctx.restore();
    }// UIManager.js 內部
    drawGameOver(score) {
        // 1. 繪製全螢幕半透明黑底
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        this.ctx.fillRect(0, 0, 800, 600); // 假設你的畫布是 800x600

        // 2. 繪製 "GAME OVER" 大標題
        this.ctx.fillStyle = "#FF0000";
        this.ctx.font = "bold 60px 'Segoe UI', Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER", 400, 250);

        // 3. 繪製分數
        this.ctx.fillStyle = "white";
        this.ctx.font = "24px 'Segoe UI', Arial";
        this.ctx.fillText(`Final Score: ${score}`, 400, 310);

        // 4. 繪製提示文字
        this.ctx.fillStyle = "#AAA";
        this.ctx.font = "18px 'Segoe UI', Arial";
        this.ctx.fillText("Click anywhere to restart", 400, 380);
    }
    // 輔助方法：畫出難度進度條
    drawDangerBar(x, y, w, h, difficulty) {
        const ctx = this.ctx;

        // 底槽
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x, y, w, h);

        // 進度 (用小數部分表示每一階段的提升進度)
        const progress = difficulty % 1;
        ctx.fillStyle = difficulty > 2.0 ? "#FF4444" : "#FFAA00";
        ctx.fillRect(x, y, w * progress, h);

        // 裝飾用小標籤
        ctx.font = "9px Arial";
        ctx.textAlign = "right";
        ctx.fillText("THREAT GROWTH", x + w, y + 15);
    }


}