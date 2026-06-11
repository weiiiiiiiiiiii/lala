## 禁止事項
- 不要任意改動現有UI的排版、顏色、和按鈕卡片的微互動設計
- 不要任意改動現在app裡的已有邏輯，若有要更動前請先跟我說
- 做完請在終端機輸入 npx expo start --go 測試有無報錯，並修正到無錯誤為止，若一直跑出錯誤且修正沒用，請停止並與我討論錯誤內容。

## 重要資料夾
- app  — 主要渲染components的畫面
- components  — 各個不同功能的頁面
- store - 放useListStore.js的資料夾，主要做全域變數的管理
- package.json - 依賴的套件

## 要完成的功能
- 個人頁面（components/Profile.js）的時間調整功能，更改休息時間、預設運動時間、姿勢準備倒計時會影響到每個動作頁面（components/LalaDetail.js, components/EmptyList.js 的時間顯示）和動作播放的時間長度
- store/useListStore.js要可以算出清單內動作的總時長（包含休息時間）並顯示在 components/MyList.js 上（現在只有顯示約XX分鐘）



