# ⚡ PULSE//LIVE 2026 — VIRTUAL CONCERT STADIUM EXPERIENCE

> **FEEL THE SOUND. BECOME THE SHOW.**  
> *CITY OF SOUND · Trải nghiệm Đại Nhạc Hội Thực Tế Ảo 3D Tương Tác Trực Tuyến*

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://tran-thanh24.github.io/pulse-live/)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite 5](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌐 TRẢI NGHIỆM TRỰC TIẾP (LIVE DEMO)

Bất kỳ ai cũng có thể truy cập và tương tác trực tiếp trên trình duyệt máy tính & di động mà không cần cài đặt:

👉 **[https://tran-thanh24.github.io/pulse-live/](https://tran-thanh24.github.io/pulse-live/)**

---

## 🌟 TỔNG QUAN DỰ ÁN

**PULSE//LIVE 2026 (City of Sound)** là nền tảng đại nhạc hội ảo (Virtual 3D Concert) thế hệ mới được xây dựng trên nền tảng **WebGL**, **Three.js** và **React Three Fiber**. Dự án mô phỏng chân thực một sân vận động âm nhạc mái vòm với sức chứa hàng nghìn khán giả, kết hợp hệ thống biểu diễn của nhóm nghệ sĩ **CORTIS**, hiệu ứng ánh sáng, pháo hoa, laser sân khấu, và đặc biệt là hệ thống trình chiếu đa phương tiện (Dual LED Media Engine) tích hợp YouTube và Video thời gian thực.

---

## 💎 ĐIỂM MẠNH & TÍNH NĂNG CỐT LÕI

### 1. 📺 Hệ Thống Đa Màn Hình LED Tiên Tiến (Dual LED Media Engine)
Hệ thống quản lý màn hình kiến trúc hỗ trợ 5 kênh độc lập:
- **5 Kênh màn hình riêng biệt**: `MAIN_LED` (màn hình chính trung tâm), `LEFT_LED` (cánh trái), `RIGHT_LED` (cánh phải), `PULSE_CORE` (vòng năng lượng trung tâm), `B_STAGE_LED` (sân khấu phụ).
- **Hỗ trợ 2 Chế độ nguồn chính song song**:
  - **YouTube 3D Mode**: Chiếu trực tiếp video/MV từ YouTube lên màn hình LED 3D bằng công nghệ căn chỉnh phối cảnh (3D Perspective Alignment). Hỗ trợ nhúng bất kỳ URL hoặc Video ID nào, tự động xử lý Autoplay Policy của trình duyệt.
  - **Native Video Mode**: Trình phát video MP4/WebM nội bộ giải mã bằng phần cứng với `THREE.VideoTexture`, hỗ trợ chế độ căn tỷ lệ (`Cover` / `Contain`) và điều chỉnh độ sáng trực tiếp.
- **Audio-Reactive Canvas Fallback**: Khi không chạy video hoặc đang đệm, màn hình tự động chuyển sang chế độ visualizer trực quan hóa phổ âm thanh (Bass, Mid, Treble) và tên bài hát đang biểu diễn theo nhịp điệu của Web Audio API.

### 2. 🎤 Nhóm Nghệ Sĩ Biểu Diễn CORTIS & Sân Khấu Sống Động
- Biểu diễn trực tiếp các bài hát hit của **CORTIS**:
  1. *What You Want* (MV YouTube: `e2OpbOv_JiQ`)
  2. *Acai* (MV YouTube: `nCElUD0jvgo`)
  3. *Joyride* (MV YouTube: `8QZeXvOjgGE`)
  4. *Money Money Money* (MV YouTube: `OhdvNHmJDsw`)
- **Vũ đạo và biểu diễn đồng bộ**: Nhân vật nghệ sĩ trên sân khấu chuyển động theo timeline kịch bản (Singing, Hip-hop Dance, Crowd Cheering, Final Pose) và tự động di chuyển qua các điểm sân khấu: **Main Stage $\leftrightarrow$ Runway $\leftrightarrow$ B-Stage**.

### 3. 👤 Hệ Thống Nhân Vật & Tùy Chỉnh Avatar (Character System)
- **Tùy biến đa dạng**: Lựa chọn giới tính Nam/Nữ, 6 bộ preset phong cách, đổi màu trang phục, kiểu tóc và phụ kiện vòng phát sáng (Glow Accessories).
- **Điều khiển góc nhìn thứ 3 (Third-Person Controller)**: Di chuyển linh hoạt, chạy nhanh (Sprint), nhảy (Jump), xoay camera tự do 360 độ.
- **Va chạm vật lý (Collision Boundary)**: Hệ thống ngăn xuyên tường, giới hạn ranh giới sân khấu, khu Fanzone, FOH và khán đài VIP.

### 4. 👥 Đám Đông Khán Giả Thông Minh (Smart Crowd System)
- Mô phỏng hàng nghìn khán giả hòa cùng đại nhạc hội bằng kỹ thuật `InstancedMesh`, giúp hiển thị số lượng lớn nhân vật chỉ với **1–2 Draw Calls**, đạt hiệu suất khung hình tối đa.
- **Gậy cổ vũ (Lightstick) đồng bộ**: Khán giả cầm lightstick đổi màu theo từng phân đoạn bài hát (Chorus, Verse, Drop) và tạo sóng ánh sáng toàn sân vận động (*Center-Out, Left-To-Right, Stage-To-Back*).
- **Audience Energy System**: Khi khán giả cổ vũ đạt đỉnh (>80%), sân khấu kích hoạt trạng thái **PULSE CORE OVERLOAD** với hiệu ứng bùng nổ toàn bộ khán đài.

### 5. 🎛️ Chế Độ Đạo Diễn Sân Khấu (Studio Director Mode - F2)
Dành cho người vận hành và đạo diễn ánh sáng/âm thanh chuyên nghiệp:
- **Điều khiển ánh sáng (Lighting Scenes)**: `INTRO`, `VERSE`, `CHORUS`, `DROP`, `BALLAD`, `ENCORE`, `BLACKOUT`.
- **Kích hoạt hiệu ứng đặc biệt (Stage FX)**: Phun khói CO2 lạnh, hệ thống Laser đa tia, Pháo giấy Confetti, Pháo hoa rực trời.
- **Bàn điều khiển LED Studio**: Chọn từng màn hình (Main/Left/Right), đổi nguồn sang YouTube, nạp file MP4 cá nhân từ máy tính, chỉnh Brightness, Mute, Volume, Master Blackout.
- **Đạo diễn góc quay (Camera Director)**: Tự động chuyển đổi góc quay theo nhịp hoặc chọn thủ công: *Wide Stage, Artist Close, Crane, Runway, B-Stage, Drone, Fanzone*.
- **Timeline Editor**: Quản lý và kích hoạt các điểm Cue kịch bản chương trình theo thời gian thực.

### 6. 🚀 Tối Ưu Hiệu Năng V1 (Performance Engine)
- **Adaptive Quality Manager**: Tự động nhận diện thiết bị và cân đối đồ họa theo 3 cấp độ (`LOW`, `MEDIUM`, `HIGH`) hoặc `AUTO` dựa trên FPS thực tế.
- **Ổn định GPU WebGL**: Cơ chế cố định DPR (Device Pixel Ratio) chống giật và ngăn chặn lỗi `WebGLRenderer: Context Lost`.
- **Performance HUD**: Hiển thị bảng đo lường chuẩn thời gian thực (FPS, Frame Time ms, Draw Calls, Triangles, Geometries, Active Video).

### 7. 📸 Memory Booth & Digital Card
- **Chế độ Photo Mode**: Căn chỉnh góc chụp tự do, hiệu ứng chiều sâu (Depth of Field), chụp lại khoảnh khắc đẹp nhất cùng thần tượng trên sân khấu.
- **Xuất thẻ kỷ niệm (Digital Concert Pass)**: Tạo và tải về thẻ tham dự concert độc bản mang dấu ấn riêng của bạn.

---

## 🎮 HƯỚNG DẪN ĐIỀU KHIỂN & PHÍM TẮT

| Phím / Thao Tác | Chức Năng |
| :--- | :--- |
| `W`, `A`, `S`, `D` / `Phím Mũi Tên` | Di chuyển nhân vật trong sân vận động |
| `Shift` (Giữ) | Chạy nhanh (Sprint) |
| `Space` | Nhảy (Jump) |
| `Kéo Chuột Trái` | Xoay góc nhìn camera 360° |
| `Cuộn Chuột` | Phóng to / Thu nhỏ khoảng cách góc nhìn |
| `C` | Đổi góc nhìn (Góc nhìn thứ 3 / Cận cảnh / Tự do) |
| `L` | Bật / Đổi chế độ gậy phát sáng Lightstick |
| `F` | Cổ vũ / Reo hò / Tương tác năng lượng |
| `F2` | Bật / Tắt **Studio Director Mode** (Bàn đạo diễn sân khấu) |
| `H` | Ẩn / Hiện giao diện HUD thông số |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend Core**: React 18, Vite 5, JavaScript (ESNext)
- **3D Graphics & Physics**: Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`)
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, Synthesizer clock)
- **State Management**: Zustand
- **Animation**: Three.js AnimationClip & Mixer, SkinnedMesh Retargeting
- **Styling & UI**: Tailwind CSS, Lucide React Icons
- **CI/CD & Deployment**: GitHub Actions, GitHub Pages

---

## 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN CỤC BỘ

### Yêu cầu hệ thống:
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node 20 LTS)
- **npm**: Phiên bản 9 trở lên

### 1. Clone repository về máy:
```bash
git clone git@github.com:tran-thanh24/pulse-live.git
cd pulse-live
```

### 2. Cài đặt các gói phụ thuộc (Dependencies):
```bash
npm install
```

### 3. Khởi chạy máy chủ phát triển (Development Server):
```bash
npm run dev
```
Truy cập đường dẫn hiển thị trên terminal: [http://localhost:5173/](http://localhost:5173/)

### 4. Build sản phẩm (Production Build):
```bash
npm run build
```
Bản build tối ưu hóa sẽ được tạo ra tại thư mục `./dist`.

### 5. Kiểm tra bản build cục bộ (Preview):
```bash
npm run preview
```
Mở [http://localhost:4173/](http://localhost:4173/) để trải nghiệm bản build hoàn thiện trước khi đưa lên môi trường server.

---

## 🚀 QUY TRÌNH DEPLOY LÊN GITHUB PAGES

Dự án đã được tích hợp quy trình CI/CD hoàn toàn tự động qua GitHub Actions trong file [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml).

### Các bước kích hoạt:
1. Vào repository GitHub của bạn: `https://github.com/<username>/<repo-name>`.
2. Truy cập **Settings** $\rightarrow$ **Pages**.
3. Tại mục **Build and deployment** $\rightarrow$ **Source**, chọn: **GitHub Actions**.
4. Mỗi khi bạn đẩy commit mới lên nhánh `main`:
   ```bash
   git add -A
   git commit -m "feat: cập nhật tính năng mới"
   git push origin main
   ```
5. GitHub Actions sẽ tự động cài đặt gói, chạy `npm run build` và deploy website lên trang:
   ```
   https://<username>.github.io/<repo-name>/
   ```

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Concert/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD tự động deploy GitHub Pages
├── public/
│   ├── audio/                  # File âm thanh gốc (.m4a, .mp3)
│   ├── timelines/              # JSON kịch bản bài hát (what-you-want, acai, joyride...)
│   └── favicon.svg             # Icon website
├── src/
│   ├── characters/             # Nhân vật: CharacterController, Animation, Avatar Customizer
│   │   └── npc/                # Quản lý đám đông khán giả InstancedMesh (CrowdManager)
│   ├── core/                   # Hạt nhân: SceneManager, MusicEngine, EventBus, AudioManager
│   ├── data/                   # Dữ liệu: musicManifest (bài hát & YouTube ID), concertConfig
│   ├── store/                  # Trạng thái toàn cục (Zustand: concertStore, userStore)
│   ├── systems/                # Hệ thống logic:
│   │   ├── LEDMediaManager.js  # Bộ điều phối đa nguồn LED (YouTube, Video, Canvas)
│   │   ├── PerformanceManager.js # Điều phối hiệu năng thông minh và thích ứng
│   │   ├── ShowDirector.js     # Đạo diễn kịch bản toàn show diễn
│   │   └── led/                # Các Media Source (YouTube, NativeVideo, Image, AudioReactive)
│   ├── ui/                     # Giao diện người dùng: HUD, StudioPanel, PerformanceHUD...
│   ├── utils/                  # Tiện ích: assetUrl (hỗ trợ base path GitHub Pages)
│   ├── world/                  # Không gian 3D: Stage, LEDVideoPlayer, PulseCore, Stadium
│   ├── App.jsx                 # Ứng dụng chính React
│   └── main.jsx                # Entry point
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js              # Cấu hình Vite tự động tương thích GitHub Pages base URL
```

---

## 📜 GIẤY PHÉP (LICENSE)

Dự án phát hành dưới giấy phép **MIT License**.  
Bản quyền thuộc về đội ngũ phát triển **PULSE//LIVE 2026 — City of Sound**.
