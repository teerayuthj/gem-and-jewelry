# Saving2.html - Technical Documentation

รวบรวมเทคนิคทั้งหมดที่ใช้ใน Gold Saving Calculator V2

---

## 1. Typography & Numbers

### Tabular Numbers (Monospace Numbers)
ใช้ `font-variant-numeric: tabular-nums` เพื่อให้ตัวเลขมีความกว้างเท่ากัน ทำให้ตัวเลขไม่กระโดดเวลาเปลี่ยนค่า

```css
/* liquid-glass-cards.css:675 */
.lg-gold-card .gold-value {
    font-variant-numeric: tabular-nums;
}
```

### Gradient Text
ใช้ `background-clip: text` เพื่อทำให้ข้อความมี gradient สี

```css
/* gold-saving2.css:228-232 */
.amount-value2 {
    background: linear-gradient(to right, #045b96, #002e65);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Animated Gradient Text (Shimmer Effect)
ราคาจะมี animation shimmer ที่ gradient เคลื่อนไหว

```css
/* gold-saving2-modern-luxury.css:319-347 */
#productsGrid2 .supporting-price {
    background: linear-gradient(135deg, #045b96 0%, #002e65 25%, #d4af37 50%, #ffd700 75%, #045b96 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@keyframes shimmerText {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
}
```

### Animated Counter (Numbers Count Up)
ตัวเลขนับขึ้นแบบ smooth พร้อม easing function

```javascript
/* modern-luxury-effects.js:234-272 */
animateCounter(element, targetValue, duration = 1500) {
    const startTime = performance.now();
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function (easeOutExpo)
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        // Format number with commas
        const formatted = currentValue.toLocaleString('th-TH');
    };
}
```

---

## 2. Glassmorphism Effects

### Basic Glassmorphism
การ์ดแบบกระจกฝ้าด้วย `backdrop-filter`

```css
/* liquid-glass-cards.css:9-24 */
.liquid-glass-card {
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.95),
        rgba(255, 255, 255, 0.85));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow:
        0 8px 32px rgba(31, 38, 135, 0.1),
        0 2px 8px rgba(31, 38, 135, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

### Enhanced Glassmorphism 2.0
เวอร์ชั่นขั้นสูงกว่าพร้อม saturation

```css
/* gold-saving2-modern-luxury.css:54-66 */
#productsGrid2 .supporting-card,
#productsGrid2 .hero-card {
    background: rgba(255, 255, 255, 0.95);
    will-change: transform;
}
```

---

## 3. Animation Effects

### 3D Tilt Effect (Perspective)
การ์ดเอียงตามเมาส์ด้วย CSS 3D transform

```css
/* gold-saving2-modern-luxury.css:138-155 */
#productsGrid2 .smart-supporting-grid {
    perspective: 1500px;
}

#productsGrid2 .supporting-card {
    transform-style: preserve-3d;
}

#productsGrid2 .supporting-card:hover {
    transform: translateY(-12px) rotateX(5deg) rotateY(-5deg);
}
```

### Floating Image Animation
รูปภาพลอยขึ้นลงแบบ subtle

```css
/* gold-saving2-modern-luxury.css:201-227 */
#productsGrid2 .supporting-card:hover .supporting-img img {
    transform: scale(1.05) translateY(-4px);
    filter: drop-shadow(0 12px 25px rgba(4, 91, 150, 0.2));
}
```

### Spotlight Effect (Mouse Following)
แสงสปอตไลท์ตามเมาส์

```css
/* gold-saving2-modern-luxury.css:164-195 */
#productsGrid2 .supporting-card .spotlight {
    background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 215, 0, 0.15),
        transparent 40%
    );
}
```

```javascript
/* modern-luxury-effects.js:103-151 */
// ใช้ CSS custom properties เพื่อติดตามตำแหน่งเมาส์
card.style.setProperty('--mouse-x', `${x}px`);
card.style.setProperty('--mouse-y', `${y}px`);
```

### Shimmer Overlay Effect
แสง shimmer วิ่งผ่านการ์ดเมื่อ hover

```css
/* gold-saving2-modern-luxury.css:257-283 */
#productsGrid2 .supporting-card .shimmer-overlay {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        rgba(212, 175, 55, 0.3),
        rgba(255, 255, 255, 0.6),
        transparent
    );
    transform: skewX(-20deg);
}

#productsGrid2 .supporting-card:hover .shimmer-overlay {
    left: 150%;
}
```

### Animated Gradient Border
ขอบการ์ดมี gradient เคลื่อนไหว

```css
/* gold-saving2-modern-luxury.css:68-122 */
#productsGrid2 .supporting-card::before {
    background: linear-gradient(45deg,
        #045b96, #002e65, #d4af37, #ffd700, #045b96
    );
    background-size: 400% 400%;
    animation: gradientFlow 8s ease infinite;
}

@keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

### Fade In Up Animation
การ์ดปรากฏขึ้นมาแบบ stagger

```css
/* gold-saving2.css:1574-1613 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.product-card2:nth-child(1) { animation-delay: 0.1s; }
.product-card2:nth-child(2) { animation-delay: 0.15s; }
/* ... staggered delays */
```

---

## 4. Progress & Status Indicators

### Enhanced Progress Bar with Glow
Progress bar มี glow effect

```css
/* gold-saving2-modern-luxury.css:500-550 */
#productsGrid2 .supporting-progress .progress-fill {
    background: linear-gradient(90deg, #ff9800, #ffc107);
    box-shadow:
        0 0 15px rgba(255, 152, 0, 0.5),
        0 2px 5px rgba(0, 0, 0, 0.2);
}
```

### Status Icon with Pulse
ไอคอนสถานะมี pulse animation

```css
/* gold-saving2-modern-luxury.css:402-448 */
#productsGrid2 .status-icon {
    box-shadow:
        0 4px 15px rgba(0, 0, 0, 0.15),
        0 0 20px rgba(4, 91, 150, 0.2);
}

#productsGrid2 .supporting-card:hover .status-icon {
    transform: scale(1.1);
}
```

---

## 5. Button Effects

### Magnetic Button Effect
ปุ่มเคลื่อนตามเมาส์แบบ subtle

```javascript
/* modern-luxury-effects.js:287-316 */
btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const strength = 0.2;
    btn.style.transform = `translateY(-2px) translate(${x * strength}px, ${y * strength}px)`;
});
```

### Ripple Effect
Ripple effect เมื่อกดปุ่ม

```css
/* gold-saving2-visuals.css:517-531 */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
}

@keyframes rippleEffect {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
```

---

## 6. Celebration Effects

### Confetti Animation
เมื่อถึงเป้าหมายจะมี confetti ตกลงมา

```css
/* gold-saving2-modern-luxury.css:715-768 */
.confetti {
    position: absolute;
    width: 12px;
    height: 12px;
}

@keyframes confettiFall {
    0% {
        opacity: 1;
        transform: translateY(0) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(720deg);
    }
}
```

### Celebration Pulse
การ์ดมี pulse effect เมื่อถึงเป้าหมาย

```css
/* gold-saving2-modern-luxury.css:747-768 */
@keyframes celebrationPulse {
    0% {
        box-shadow:
            0 0 0 0 rgba(76, 175, 80, 0.7),
            0 0 20px rgba(76, 175, 80, 0.5);
    }
    70% {
        box-shadow:
            0 0 0 30px rgba(76, 175, 80, 0),
            0 0 40px rgba(76, 175, 80, 0);
    }
}
```

---

## 7. Image Loading

### Lazy Loading with Blur Effect
รูปภาพโหลดแบบ lazy พร้อม blur effect

```css
/* gold-saving2.css:1621-1632 */
#productsGrid2 .lazy-img {
    filter: blur(12px);
    transform: scale(1.02);
    transition: filter 0.25s ease, transform 0.25s ease;
}

#productsGrid2 .lazy-img.is-loaded {
    filter: none;
    transform: none;
}
```

### Image Lightbox
Lightbox สำหรับดูรูปภาพขนาดใหญ่

```css
/* gold-saving2.css:1699-1890 */
.img-lightbox {
    position: fixed;
    z-index: 10050;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
}

.img-lightbox.active {
    opacity: 1;
    visibility: visible;
}
```

---

## 8. Performance Optimizations

### Scroll Detection for Pausing Animations
หยุด animation ระหว่าง scroll

```css
/* gold-saving2-modern-luxury.css:17-22 */
.is-scrolling #productsGrid2 .supporting-card,
.is-scrolling #productsGrid2 .hero-card {
    animation-play-state: paused !important;
}
```

```javascript
/* modern-luxury-effects.js:71-98 */
setupScrollDetection() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Add class to pause CSS animations during scroll
    document.body.classList.add('is-scrolling');
}
```

### Reduced Motion Support
รองรับผู้ใช้ที่ไม่ต้องการ animation

```css
/* gold-saving2-modern-luxury.css:25-32 */
@media (prefers-reduced-motion: reduce) {
    #productsGrid2 *,
    #productsGrid2 *::before,
    #productsGrid2 *::after {
        animation: none !important;
        transition-duration: 0.01ms !important;
    }
}
```

### Throttled Mouse Events
จำกัด event เพื่อประสิทธิภาพ

```javascript
/* modern-luxury-effects.js:20-21, 127-130 */
this.THROTTLE_MS = 32; // ~30fps for mouse events

// Throttle updates
const now = performance.now();
if (now - this.lastMoveTime < this.THROTTLE_MS) return;
this.lastMoveTime = now;
```

### GPU Acceleration
ใช้ `will-change` สำหรับ GPU acceleration

```css
/* gold-saving2-modern-luxury.css:64-66 */
#productsGrid2 .supporting-card {
    will-change: transform;
}
```

### Performance Mode
โหมดประหยัดทรัพยากร

```javascript
/* modern-luxury-effects.js:481-495 */
setPerformanceMode(enabled) {
    if (enabled) {
        this.spotlightEnabled = false;
        this.tiltEnabled = false;
        this.magneticEnabled = false;
        document.body.classList.add('performance-mode');
    }
}
```

---

## 9. Responsive Design

### Mobile-First Breakpoints
```css
@media (max-width: 1200px) { /* Large tablets */ }
@media (max-width: 1024px) { /* iPad */ }
@media (max-width: 768px)  { /* Small tablets/Large phones */ }
@media (max-width: 480px)  { /* Mobile phones */ }
```

### Simplified Effects on Mobile
```css
/* gold-saving2-modern-luxury.css:688-708 */
@media (max-width: 768px) {
    #productsGrid2 .supporting-card:hover {
        transform: translateY(-6px); /* ลดลงจาก -12px */
    }
}
```

---

## 10. Modal & Overlay

### Variant Modal with Slide Animation
```css
/* gold-saving2.css:2317-2366 */
.variant-modal {
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
}

.variant-modal.active {
    opacity: 1;
    visibility: visible;
}

.variant-modal-content {
    transform: scale(0.9) translateY(20px);
    transition: transform 0.3s;
}

.variant-modal.active .variant-modal-content {
    transform: scale(1) translateY(0);
}
```

---

## 11. Particles Background

### Floating Particles
```css
/* gold-saving2-visuals.css:14-72 */
.particle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg,
        rgba(4, 91, 150, 0.15),
        rgba(212, 175, 55, 0.15));
    animation: float linear infinite;
    filter: blur(1px);
}

@keyframes float {
    0% {
        transform: translateY(100vh) translateX(0) rotate(0deg);
        opacity: 0;
    }
    100% {
        transform: translateY(-100px) translateX(100px) rotate(360deg);
        opacity: 0;
    }
}
```

---

## 12. Toast Notifications

### Slide-in Toast
```css
/* gold-saving2-visuals.css:876-948 */
.toast {
    animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes toastSlideIn {
    0% {
        transform: translateX(100%) scale(0.8);
        opacity: 0;
    }
    100% {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}
```

---

## 13. Special Effects

### Skeleton Loading
```css
/* gold-saving2-modern-luxury.css:665-682 */
#productsGrid2 .skeleton-loading {
    background: linear-gradient(90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: skeletonShimmer 1.5s infinite;
}
```

### Lock Overlay on Locked Products
```css
/* gold-saving2.css:836-848 */
.product-card2.not-affordable .product-img2::after {
    content: "\f023"; /* Font Awesome lock icon */
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2.5rem;
    color: rgba(0, 0, 0, 0.3);
}
```

---

## Summary of Key CSS Properties Used

| Technique | CSS Property |
|-----------|--------------|
| Monospace Numbers | `font-variant-numeric: tabular-nums` |
| Gradient Text | `background-clip: text` |
| Glassmorphism | `backdrop-filter: blur()` |
| 3D Effects | `perspective`, `transform-style: preserve-3d` |
| GPU Acceleration | `will-change: transform` |
| Mouse Tracking | CSS Custom Properties (`--mouse-x`, `--mouse-y`) |
| Smooth Animations | `cubic-bezier()` easing |
| Reduced Motion | `@media (prefers-reduced-motion)` |

---

## Files Referenced

- `assets/css/gold-saving2.css` - Main styles
- `assets/css/gold-saving2-modern-luxury.css` - Modern luxury effects
- `assets/css/gold-saving2-enhancements.css` - E-commerce enhancements
- `assets/css/gold-saving2-visuals.css` - Visual effects (particles, confetti)
- `assets/css/liquid-glass-cards.css` - Glassmorphism cards
- `assets/js/modern-luxury-effects.js` - Interactive JS effects
- `assets/js/calculator/gold-saving-calculator2.js` - Main calculator
