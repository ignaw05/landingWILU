/* ================= Partículas interactivas ================= */
(function particles() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let dots = [];
  let w, h;
  const mouse = { x: -9999, y: -9999 };
  const MOUSE_RADIUS = 140;

  // Colores leídos del tema actual (se refrescan al cambiar de tema)
  let dotColor = "rgba(160, 180, 255, 0.5)";
  let lineRGB = "140, 160, 255";
  let lineAlpha = 0.1;

  function refreshColors() {
    const cs = getComputedStyle(document.documentElement);
    const dotRGB = cs.getPropertyValue("--particle-rgb").trim() || "160, 180, 255";
    const dotAlpha = cs.getPropertyValue("--particle-alpha").trim() || "0.5";
    lineRGB = cs.getPropertyValue("--particle-line-rgb").trim() || "140, 160, 255";
    lineAlpha = parseFloat(cs.getPropertyValue("--particle-line-alpha")) || 0.1;
    dotColor = `rgba(${dotRGB}, ${dotAlpha})`;
  }
  refreshColors();
  window.addEventListener("themechange", refreshColors);

  function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((w * h) / 11000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of dots) {
      // Repulsión suave alrededor del mouse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_RADIUS && dist > 0.01) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.9;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Fricción para que vuelvan a su deriva lenta
      p.vx *= 0.96;
      p.vy *= 0.96;
      if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.04;
      if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.04;

      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }

    // Líneas entre partículas cercanas
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${lineRGB}, ${lineAlpha * (1 - d / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", init);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseout", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  init();
  draw();
})();

/* ================= Utilidad: tipeo de texto ================= */
function typeText(el, text, speed = 45) {
  return new Promise((resolve) => {
    el.textContent = "";
    el.classList.add("typing-cursor");
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed + Math.random() * 30);
      } else {
        el.classList.remove("typing-cursor");
        resolve();
      }
    };
    tick();
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= Animación planilla vieja (caos) ================= */
(async function oldSheetLoop() {
  // [texto, clase opcional: "bad" | "warn"]
  const rows = [
    [["12/03"], ["Cables"], ["$45.300"], ["¿pagado?", "warn"]],
    [["13/3"], ["luz??", "warn"], ["$8.20O", "bad"], ["ver mail"]],
    [["??/03", "bad"], ["varios"], ["=SUMA(?", "bad"], ["DUPLICADO", "bad"]],
    [["14/03"], ["nafta"], ["$12.500"], ["efectivo?"]],
  ];
  const rowEls = [1, 2, 3, 5].map((n) => document.getElementById(`cell-row-${n}`));
  const dialog = document.getElementById("error-dialog");

  while (true) {
    dialog.classList.remove("show");
    for (const el of rowEls) {
      el.querySelectorAll("span").forEach((s) => {
        s.textContent = "";
        s.classList.remove("cell-bad", "cell-warn");
      });
    }

    for (let r = 0; r < rowEls.length; r++) {
      const cells = rowEls[r].querySelectorAll("span");
      for (let c = 0; c < cells.length; c++) {
        const [text, mark] = rows[r][c];
        await typeText(cells[c], text, 45);
        if (mark) cells[c].classList.add(`cell-${mark}`);
      }
    }

    await wait(500);
    dialog.classList.add("show");
    await wait(4500);
  }
})();

/* ================= Animación dashboard ================= */
function countUp(el, target, { prefix = "", suffix = "", duration = 1400 } = {}) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString("es-AR") + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

(async function dashboardLoop() {
  const rows = [
    { id: "dash-row-1", text: "Factura #1042 registrada" },
    { id: "dash-row-2", text: "Stock actualizado automáticamente" },
    { id: "dash-row-3", text: "Reporte mensual generado" },
  ];

  const businessRules = [
    "Regla: stock < 10 → orden de compra automática",
    "Regla: factura > $500k → requiere aprobación",
    "Regla: cliente moroso → alerta al vendedor",
    "Regla: precio desactualizado → ajuste por lista",
  ];

  const toast = document.getElementById("rule-toast");
  const toastText = document.getElementById("rule-text");
  let ruleIndex = 0;

  while (true) {
    countUp(document.getElementById("kpi-1"), 1240500, { prefix: "$" });
    countUp(document.getElementById("kpi-2"), 327);
    countUp(document.getElementById("kpi-3"), 98, { suffix: "%" });

    toast.classList.remove("show");

    for (const r of rows) {
      const rowEl = document.getElementById(r.id);
      rowEl.classList.remove("done");
      rowEl.querySelector(".row-text").textContent = "";
    }

    await wait(600);

    for (const r of rows) {
      const rowEl = document.getElementById(r.id);
      await typeText(rowEl.querySelector(".row-text"), r.text, 30);
      rowEl.classList.add("done");
      await wait(300);
    }

    // Una regla de negocio distinta en cada ciclo
    toastText.textContent = businessRules[ruleIndex % businessRules.length];
    ruleIndex++;
    toast.classList.add("show");

    await wait(5000);
  }
})();

/* ================= Chatbot animado ================= */
(async function chatLoop() {
  const body = document.getElementById("chat-body");

  const conversation = [
    { from: "user", text: "Hola, quiero saber cuanta fue la ganancia del mes?" },
    { from: "bot", text: "Claro! Tu ganancia del mes fue de $1.240.500" },
    { from: "user", text: "Y cuanto fue el rendimiento de mi inversion?" },
    { from: "bot", text: "Tu inversion rindió un 23% mensual" },
  ];

  function addMsg(from) {
    const div = document.createElement("div");
    div.className = `msg ${from}`;
    body.appendChild(div);
    while (body.children.length > 4) body.removeChild(body.firstChild);
    return div;
  }

  function addTypingDots() {
    const div = document.createElement("div");
    div.className = "msg bot typing-dots";
    div.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(div);
    return div;
  }

  while (true) {
    body.innerHTML = "";
    for (const msg of conversation) {
      if (msg.from === "bot") {
        const dots = addTypingDots();
        await wait(1100);
        dots.remove();
        const el = addMsg("bot");
        await typeText(el, msg.text, 28);
      } else {
        await wait(700);
        const el = addMsg("user");
        await typeText(el, msg.text, 28);
      }
      await wait(600);
    }
    await wait(5000);
  }
})();

/* ================= WhatsApp: notificaciones de venta ================= */
(async function whatsappLoop() {
  const body = document.getElementById("wa-body");
  if (!body) return;

  const totals = ["$45.300", "$128.900", "$72.450", "$310.000"];
  let i = 0;

  function addTypingDots() {
    const div = document.createElement("div");
    div.className = "wa-msg typing-dots";
    div.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(div);
    return div;
  }

  function trim() {
    while (body.children.length > 3) body.removeChild(body.firstChild);
  }

  while (true) {
    const dots = addTypingDots();
    trim();
    await wait(1200);
    dots.remove();

    const msg = document.createElement("div");
    msg.className = "wa-msg";
    body.appendChild(msg);
    trim();

    const textEl = document.createElement("span");
    msg.appendChild(textEl);
    await typeText(textEl, "🎉 ¡Realizaste una nueva venta!", 26);

    const totalEl = document.createElement("span");
    totalEl.className = "wa-total";
    msg.appendChild(document.createElement("br"));
    msg.appendChild(totalEl);
    await typeText(totalEl, `Total: ${totals[i % totals.length]}`, 30);
    i++;

    const meta = document.createElement("span");
    meta.className = "wa-meta";
    meta.innerHTML = `${10 + (i % 8)}:${String(12 + i * 7 % 48).padStart(2, "0")} <span class="wa-check">✓✓</span>`;
    msg.appendChild(meta);

    await wait(4500);
  }
})();

/* ================= Notaria: animación de auditoría ================= */
(async function auditLoop() {
  const textEl = document.getElementById("audit-text");
  const hashEl = document.getElementById("audit-hash");
  if (!textEl || !hashEl) return;

  const messages = [
    "Usuario A: ¿Confirmás?",
    "Usuario B: Confirmado",
    "Admin: Verificado",
  ];
  const chars = "0123456789abcdef";

  while (true) {
    hashEl.textContent = "";
    for (const msg of messages) {
      textEl.textContent = msg;
      await wait(800);
    }
    const hash = "0x" + Array.from({ length: 48 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    await typeText(hashEl, hash, 14);
    await wait(4500);
  }
})();

/* ================= Contadores de Vency al entrar en vista ================= */
const countObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      countUp(el, Number(el.dataset.target), {
        prefix: el.dataset.prefix || "",
        suffix: el.dataset.suffix || "",
      });
      countObserver.unobserve(el);
    }
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".count").forEach((el) => countObserver.observe(el));

/* ================= Reveal on scroll ================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

/* ================= Navbar mobile ================= */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ================= Scroll suave con inercia ================= */
(function smoothScroll() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  // En touch el momentum nativo ya es bueno; solo mejoramos desktop.
  if (reduceMotion || isTouch) return;

  const NAV_OFFSET = 84;
  const EASE = 0.085; // menor = más suave/lento

  let target = window.scrollY;
  let current = window.scrollY;
  let animating = false;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;
  const clamp = (v) => Math.max(0, Math.min(v, maxScroll()));

  // Desactivamos el smooth nativo para no pelear con el lerp.
  document.documentElement.style.scrollBehavior = "auto";

  function loop() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo(0, current);
      animating = false;
      return;
    }
    window.scrollTo(0, current);
    requestAnimationFrame(loop);
  }

  function start() {
    if (!animating) {
      animating = true;
      requestAnimationFrame(loop);
    }
  }

  // Rueda del mouse → desplazamiento con inercia
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return; // zoom del navegador
      e.preventDefault();
      target = clamp(target + e.deltaY);
      start();
    },
    { passive: false }
  );

  // Si el usuario arrastra la barra o usa teclado, resincronizamos.
  window.addEventListener("scroll", () => {
    if (!animating) {
      target = window.scrollY;
      current = window.scrollY;
    }
  });

  window.addEventListener("resize", () => {
    target = clamp(target);
  });

  // Anclajes internos → animación con offset de navbar
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const dest = document.querySelector(id);
      if (!dest) return;
      e.preventDefault();
      const top = dest.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      target = clamp(top);
      start();
    });
  });
})();

/* ================= Cambio de tema (claro/oscuro) ================= */
(function themeToggle() {
  const btn = document.getElementById("theme-toggle");
  const root = document.documentElement;

  function apply(theme) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    btn.setAttribute("aria-pressed", String(theme === "light"));
    // Avisamos a las partículas para que relean sus colores
    window.dispatchEvent(new Event("themechange"));
  }

  // Preferencia guardada, o el esquema del sistema como punto de partida
  let saved = null;
  try { saved = localStorage.getItem("wilu-theme"); } catch (e) {}
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  apply(saved || (prefersLight ? "light" : "dark"));

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    apply(next);
    try { localStorage.setItem("wilu-theme", next); } catch (e) {}
  });
})();

/* ================= Año del footer ================= */
document.getElementById("year").textContent = new Date().getFullYear();
