document.body.classList.add('locked-screen');
AOS.init({ duration: 1200, once: true });

/* ===== تصحيح: تعريف عناصر DOM اللي بنستخدمها كتير ===== */
const passInput = document.getElementById('passInput');
const bgMusic = document.getElementById('bgMusic');

/* ===== وظيفة التحقق من كلمة السر (كما هي) ===== */
function checkPassword() {
    const pass = document.getElementById('passInput').value;
    if (pass.trim() === "23/7/2025") {
        document.getElementById('lock-screen').style.transform = 'translateY(-100%)';
        setTimeout(() => {
            document.getElementById('lock-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('bgMusic').play().catch(e => console.log("Interaction required for music"));
        }, 1000);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

function openLetter() {
    document.querySelector('.letter-container').classList.toggle('open');
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    music.paused ? music.play() : music.pause();
}

/// 1. دالة إطلاق الألعاب النارية (مستقلة)
function launchFireworks() {
    const duration = 15 * 1000; // مدة الاحتفال 15 ثانية
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // إطلاق مفرقعات من زوايا مختلفة فوق الهيدر
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
    }, 250);
}

// 1. دالة إطلاق الألعاب النارية (مستقلة)
function launchFireworks() {
    // === ملاحظة: هذه النسخة الأخيرة ستكون هي المستخدمة (تعريف لاحق يطغى على سابقه) ===
    const duration = 15 * 1000; // مدة الاحتفال 15 ثانية
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // لو مكتبة confetti موجودة استخدمها، وإلا استخدم بديل canvas داخلي
    if (typeof confetti !== 'function') {
        console.warn('canvas-confetti not found — using local canvas fallback for fireworks.');
        startCanvasFireworks(duration);
        return;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = Math.floor(50 * (timeLeft / duration));
        // إطلاق مفرقعات من زوايا مختلفة فوق الهيدر
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);
}

/* ===== بديل بسيط للألعاب النارية باستخدام canvas (يعمل لو مش موجود confetti) ===== */
function startCanvasFireworks(duration = 15000) {
    // أنشئ canvas مؤقت
    const canvas = document.createElement('canvas');
    canvas.id = '__fallback_fireworks_canvas';
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let particles = [];
    function rand(min, max) { return Math.random() * (max - min) + min; }

    class P {
        constructor(x, y, vx, vy, life, color) {
            this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.life = life; this.color = color;
            this.alpha = 1;
        }
        step() {
            this.x += this.vx; this.y += this.vy;
            this.vy += 0.05;
            this.vx *= 0.99; this.vy *= 0.99;
            this.life--;
            this.alpha = Math.max(0, this.life / 60);
            return this.life <= 0;
        }
        draw(ctx) {
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, Math.max(1, this.alpha * 3), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    let running = true;
    const startTime = Date.now();
    function step() {
        if (!running) return;
        requestAnimationFrame(step);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // spawn occasional bursts
        if (Math.random() < 0.12) {
            const cx = rand(canvas.width * 0.1, canvas.width * 0.9);
            const cy = rand(canvas.height * 0.1, canvas.height * 0.5);
            const color = `hsl(${Math.floor(rand(0,360))} 80% 60%)`;
            for (let i = 0; i < 60; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = rand(1, 6);
                particles.push(new P(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.floor(rand(20, 80)), color));
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            if (p.step()) particles.splice(i, 1);
            else p.draw(ctx);
        }

        if (Date.now() - startTime > duration) {
            running = false;
            // fade out then remove
            setTimeout(() => {
                try { window.removeEventListener('resize', resize); } catch (e) {}
                if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }, 800);
        }
    }
    step();
}

/* 2. تحديث دالة العداد اللي عندك (استبدال لسطر التاريخ الثابت بديناميكي) */
function getNextJanFirst() {
    const now = new Date();
    const year = now.getFullYear();
    const candidate = new Date(year, 0, 1, 0, 0, 0, 0); // 1 يناير نفس السنة (00:00)
    return now < candidate ? candidate.getTime() : new Date(year + 1, 0, 1, 0, 0, 0, 0).getTime();
}

let targetTime = getNextJanFirst();

function startCountdown() {
    const timerElement = document.getElementById('timer');
    const nextYear = new Date('1 Jan 2026 00:00:00').getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = nextYear - now;

        if (!timerElement) return;

        if (diff <= 0) {
            // أول مرة يوصل الصفر: الاحتفال
            if (!timerElement.classList.contains('celebrating')) {
                timerElement.innerHTML = `<div> 🎉 بدأت سنتنا الجديده 2026 وانا معي اجمل بنوته ف الدنيا 🎉 </div>`;
                timerElement.classList.add('celebrating');
                launchFireworks();
                document.body.classList.remove('locked-screen');
            }

            clearInterval(interval); // أهم خطوة: إيقاف العداد نهائيًا
            return;
        }

        // حساب الوقت المتبقي
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        timerElement.innerHTML = `
            <div>${days} يوم</div>
            <div>${hours} ساعة</div>
            <div>${mins} دقيقة</div>
            <div>${secs} ثانية</div>
        `;
    }, 1000);
}

startCountdown();




const messages = [
    "أحبك اليوم أكثر من أمس 💖",
    "أنتِ سبب ابتسامتي 😊",
    "قلبي ملكك فقط ❤️",
    "لو قصيتي شعرك هنفخك✨",
    "هاي مزتي 🌹",
    "وجودك يدفئ أيامي 🔥",
    "خلي بالك من رسمتي 😍",
    "أنتِ ملكة قلبي 👑",
    "حبي لك لا ينتهي ♾️",
    "كل يوم أحبك أكثر 💞",
    "خلي بالك من هديتي دي انا تعبان فيها ❤️",
    "معك الدنيا أحلى 🌸",
    " انا جعان ي مزتي🥹",
    "أنتِ أمنيتي الجميلة ✨",
    "كل لحظة بدونك ناقصة 💕",
    "ضحكتك تغني عن أي كلمات 😍",
    "أنتِ الفرح في حياتي 🌹",
    "مفيش حضن كدا ولا بوسه تدفيني ف الجو دا ي بنوتي💓",
    "أنتِ الأمان والحنان 🌟",
    "كل ثانية معك ذكرى جميلة ⏳",
    "بردو مش عايزه تديني بوسه 😘",
    "أنتِ ضوء أيامي المظلمة 🌞",
    "متسهريش كتير .بشوفك فاتحه بالليل💖",
    "نو تويست نو ريدبول ❤️",
    "يوم جديد لاجمل ام يوسف ف الدنيا💕",
    "كل يوم أحبك أكثر وأكثر 🥰",
    "نينينينيني 🌸",
    "أنتِ سبب كل سعادتي 🌟",
    "بجبككككك ي كتكوتي ",
    "تقلي ع نفسك ي بنوتي متخففيش ف الشتا دي ❤️"
];

function showDailyMessage() {
    const startDate = new Date(2025, 6, 23); // 23/7/2025
    const now = new Date();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const index = diffDays % messages.length; // يظهر رسالة جديدة كل يوم بشكل دائري
    const msgEl = document.getElementById("message");
    if (msgEl) msgEl.innerText = messages[index];
}

showDailyMessage();
setInterval(showDailyMessage, 1000 * 60 * 60); // تحديث كل ساعة فقط لضمان الرسالة اليومية


function updateLoveCounter() {
    const startDate = new Date(2025, 6, 23, 0, 0, 0); // 23/7/2025 (الشهر يبدأ من 0)
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const diffMs = now - startDate;
    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;

    const loveEl = document.getElementById("loveTimer");
    if (loveEl) {
        loveEl.innerHTML = `
            <div>${years} سنة</div>
            <div>${months} شهر</div>
            <div>${days} يوم</div>
            <div>${hours} ساعة</div>
            <div>${minutes} دقيقة</div>
            <div>${seconds} ثانية</div>
        `;
    }
}

setInterval(updateLoveCounter, 1000);
updateLoveCounter();

setInterval(updateCountdown, 1000); // تحديث كل ثانية

// -------------------------------------------------------------------------------------------------------
// منع كليك يمين
document.addEventListener("contextmenu", e => e.preventDefault());

// منع اختصارات Inspect و View Source
document.addEventListener("keydown", function (e) {

    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I / J / C
    if (e.ctrlKey && e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
});

(function () {
    let devtoolsOpen = false;

    setInterval(() => {
        const start = performance.now();
        try { debugger; } catch (e) { }
        const end = performance.now();

        if (end - start > 100 && !devtoolsOpen) {
            devtoolsOpen = true;
            console.warn("DevTools detected - some protections are active.");
            // non-destructive banner instead of replacing whole body
            const bannerId = "devtools-warning-banner";
            if (!document.getElementById(bannerId)) {
                const banner = document.createElement('div');
                banner.id = bannerId;
                banner.style.position = 'fixed';
                banner.style.top = '0';
                banner.style.left = '0';
                banner.style.right = '0';
                banner.style.padding = '12px';
                banner.style.background = 'rgba(255,0,0,0.85)';
                banner.style.color = '#fff';
                banner.style.zIndex = '10000';
                banner.style.textAlign = 'center';
                banner.textContent = 'Access detection: DevTools open — بعض الحمايات مفعّلة';
                document.body.appendChild(banner);
            }
        }
    }, 1000);
})();

// منع النسخ والقص واللصق
document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());
document.addEventListener("paste", e => e.preventDefault());

// منع Ctrl + C / X / V / A
document.addEventListener("keydown", function (e) {

    if (e.ctrlKey && (
        e.keyCode === 67 || // C
        e.keyCode === 88 || // X
        e.keyCode === 86 || // V
        e.keyCode === 65    // A
    )) {
        e.preventDefault();
        return false;
    }
});

function nextPage(current) {
    const curr = document.getElementById("page" + current);
    if (curr) curr.style.display = 'none';
    let next = current + 1;
    const nextEl = document.getElementById("page" + next);
    if (nextEl) {
        nextEl.style.display = 'flex';
    }
}

function goToLock() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('lock-screen').style.display = 'flex';
    if (passInput) passInput.focus();
}

function nextPage(current) {
    const curr = document.getElementById("page" + current);
    if (curr) curr.style.display = "none";

    const next = document.getElementById("page" + (current + 1));
    if (next) next.style.display = "flex";
}

function goToLock() {
    document.getElementById("interactive-pages").style.display = "none";
    document.getElementById("lock-screen").style.display = "flex";
    document.getElementById("passInput").focus();
}



function showSpecialMessage() {
    // أولاً: نخفي كل الصفحات الموجودة
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });

    // ثانياً: نظهر صفحة الرسالة الخاصة فقط
    const specialPage = document.getElementById('specialMessagePage');
    if (specialPage) {
        specialPage.style.display = 'flex';
    }
}

// تأكد أن دالة nextPage لا تزال موجودة لديك لتبديل الصفحات عند الرفض
function nextPage(currentPageNumber) {
    // إخفاء الصفحة الحالية
    document.getElementById('page' + currentPageNumber).style.display = 'none';
    // إظهار الصفحة التالية
    const next = document.getElementById('page' + (currentPageNumber + 1));
    if (next) {
        next.style.display = 'flex';
    }
} function checkPassword() {
    const pass = document.getElementById("passInput").value;

    if (pass === "23/7/2025") {
        const lockScreen = document.getElementById("lock-screen");
        const mainContent = document.getElementById("main-content");

        // 1. ابدأ بتشغيل الموسيقى
        document.getElementById("bgMusic").play().catch(() => { });

        // 2. إضافة تأثير الاختفاء لشاشة القفل
        lockScreen.classList.add('fade-out');

        // 3. تجهيز المحتوى الرئيسي للظهور (بدون opacity في البداية)
        mainContent.style.display = "block";

        // 4. بعد ثانية (وقت الـ fade-out) نخفي القفل تماماً ونظهر المحتوى
        setTimeout(() => {
            lockScreen.style.display = "none";
            mainContent.classList.add('show');

            // تفعيل AOS لإعادة حساب الأنميشين بعد الظهور
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, 1000); // 1000 مللي ثانية تساوي 1 ثانية

    } else {
        document.getElementById("error-msg").style.display = "block";
    }
}

