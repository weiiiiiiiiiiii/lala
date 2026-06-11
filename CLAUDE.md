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
- 需登入才能建立清單的問題，在components/LalaDetail.js和components/ActionDetail.js裡，還沒登入時可以透過右上角的加入清單按鈕來創建新清單，我想修正這點，若尚未登入時按下加入清單按鈕應該會跳出通知並提醒登入，請參考尚未登入時按下愛心鍵的通知
- 播放器的暫停時Icon顯示問題，在components/WorkoutPlayer.js裡，當觸發暫停時，該介面的返回鍵（繼續運動的左邊）有時會顯示黑色，我想要他一直維持白色的狀態





