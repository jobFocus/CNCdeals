/* CNC Canvas Animations for Reel Grid */
(function () {
  function startSparks(canvas) {
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = canvas.clientWidth);
    var h = (canvas.height = canvas.clientHeight);
    var particles = [];
    function resize() {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    window.addEventListener("resize", resize);
    for (var i = 0; i < 60; i++) {
      particles.push({
        x: w * 0.5 + (Math.random() - 0.5) * 40,
        y: h * 0.4,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4 - 1,
        life: Math.random(),
        size: Math.random() * 3 + 1,
        hue: Math.random() * 40 + 20,
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Background glow
      var grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, 60);
      grad.addColorStop(0, "rgba(255, 150, 50, 0.15)");
      grad.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Metal workpiece
      ctx.fillStyle = "#334155";
      ctx.fillRect(w * 0.2, h * 0.35, w * 0.6, h * 0.15);
      ctx.fillStyle = "#475569";
      ctx.fillRect(w * 0.22, h * 0.37, w * 0.56, h * 0.11);
      // Tool
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(w * 0.48, h * 0.1, w * 0.04, h * 0.28);
      ctx.beginPath();
      ctx.moveTo(w * 0.48, h * 0.38);
      ctx.lineTo(w * 0.44, h * 0.45);
      ctx.lineTo(w * 0.56, h * 0.45);
      ctx.closePath();
      ctx.fillStyle = "#64748b";
      ctx.fill();
      // Sparks
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life += 0.02;
        if (p.life > 1) {
          p.x = w * 0.5 + (Math.random() - 0.5) * 30;
          p.y = h * 0.4;
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = -Math.random() * 5 - 2;
          p.life = 0;
          p.size = Math.random() * 3 + 1;
          p.hue = Math.random() * 40 + 20;
        }
        var alpha = 1 - p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ", 100%, 60%, " + alpha + ")";
        ctx.fill();
        // Trail
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 0.5, p.y - p.vy * 0.5, p.size * 0.4 * (1 - p.life * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + (p.hue + 20) + ", 80%, 40%, " + alpha * 0.4 + ")";
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function startToolpath(canvas) {
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = canvas.clientWidth);
    var h = (canvas.height = canvas.clientHeight);
    var t = 0;
    function resize() {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    window.addEventListener("resize", resize);
    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      // Grid background
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (var x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (var y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Toolpath - spiral/circle pattern
      var cx = w * 0.5, cy = h * 0.5;
      var maxR = Math.min(w, h) * 0.32;
      ctx.beginPath();
      for (var i = 0; i < t * 20; i += 0.1) {
        var angle = i * 0.3;
        var r = maxR * (0.3 + 0.7 * (i / (t * 20)));
        var px = cx + Math.cos(angle) * r;
        var py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "rgba(54, 170, 245, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Active tool head
      var endAngle = (t * 20) * 0.3;
      var endR = maxR * (0.3 + 0.7 * Math.min((t * 20) / (t * 20), 1));
      var ex = cx + Math.cos(endAngle) * endR;
      var ey = cy + Math.sin(endAngle) * endR;
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#36aaf5";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex, ey, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(54, 170, 245, 0.2)";
      ctx.fill();
      // Mill bit
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(ex - 2, ey + 6, 4, 20);
      ctx.beginPath();
      ctx.moveTo(ex - 4, ey + 26);
      ctx.lineTo(ex, ey + 34);
      ctx.lineTo(ex + 4, ey + 26);
      ctx.closePath();
      ctx.fillStyle = "#64748b";
      ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
  }

  function startLathe(canvas) {
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = canvas.clientWidth);
    var h = (canvas.height = canvas.clientHeight);
    var angle = 0;
    function resize() {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    window.addEventListener("resize", resize);
    function draw() {
      angle += 0.05;
      ctx.clearRect(0, 0, w, h);
      // Rotating cylinder
      var cx = w * 0.35, cy = h * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      // Body
      var grad = ctx.createLinearGradient(0, -h * 0.3, 0, h * 0.3);
      grad.addColorStop(0, "#94a3b8");
      grad.addColorStop(0.3, "#cbd5e1");
      grad.addColorStop(0.5, "#f1f5f9");
      grad.addColorStop(0.7, "#cbd5e1");
      grad.addColorStop(1, "#64748b");
      ctx.fillStyle = grad;
      ctx.fillRect(-h * 0.08, -h * 0.3, h * 0.16, h * 0.6);
      // Rotation lines
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      for (var i = 0; i < 8; i++) {
        var a = angle + (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * h * 0.08, -h * 0.3);
        ctx.lineTo(Math.cos(a) * h * 0.08, h * 0.3);
        ctx.stroke();
      }
      ctx.restore();
      // Cutting tool
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(w * 0.55, cy - h * 0.05);
      ctx.lineTo(w * 0.7, cy - h * 0.12);
      ctx.lineTo(w * 0.7, cy - h * 0.08);
      ctx.lineTo(w * 0.58, cy - h * 0.02);
      ctx.closePath();
      ctx.fill();
      // Chips/particles
      for (var i = 0; i < 5; i++) {
        var px = w * 0.6 + Math.random() * 30;
        var py = cy - h * 0.1 + Math.random() * 20;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(45, 80%, 60%, " + (0.3 + Math.random() * 0.5) + ")";
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function startPlasma(canvas) {
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = canvas.clientWidth);
    var h = (canvas.height = canvas.clientHeight);
    var t = 0;
    function resize() {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    window.addEventListener("resize", resize);
    function draw() {
      t += 0.03;
      ctx.clearRect(0, 0, w, h);
      // Metal sheet
      ctx.fillStyle = "#334155";
      ctx.fillRect(w * 0.1, h * 0.25, w * 0.8, h * 0.5);
      ctx.fillStyle = "#475569";
      ctx.fillRect(w * 0.12, h * 0.27, w * 0.76, h * 0.46);
      // Cut line
      var cx = w * 0.5;
      var cy = h * 0.5;
      var r = Math.min(w, h) * 0.2;
      ctx.beginPath();
      for (var i = 0; i < t * 3; i += 0.05) {
        var a = i * 0.15;
        var px = cx + Math.cos(a) * r * (0.8 + 0.2 * Math.sin(i * 0.5));
        var py = cy + Math.sin(a) * r * 0.6;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Glow
      ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 12;
      ctx.stroke();
      // Plasma torch head
      var ta = (t * 3) * 0.15;
      var tx = cx + Math.cos(ta) * r * (0.8 + 0.2 * Math.sin(ta * 0.5));
      var ty = cy + Math.sin(ta) * r * 0.6;
      ctx.fillStyle = "#64748b";
      ctx.fillRect(tx - 4, ty - 40, 8, 28);
      ctx.beginPath();
      ctx.moveTo(tx - 6, ty - 12);
      ctx.lineTo(tx + 6, ty - 12);
      ctx.lineTo(tx + 3, ty);
      ctx.lineTo(tx - 3, ty);
      ctx.closePath();
      ctx.fillStyle = "#475569";
      ctx.fill();
      // Plasma flame
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty);
      ctx.lineTo(tx + 3, ty);
      ctx.lineTo(tx + 8, ty + 15);
      ctx.lineTo(tx - 8, ty + 15);
      ctx.closePath();
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.fill();
      // Glow around cut point
      var grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 30);
      grad.addColorStop(0, "rgba(251, 191, 36, 0.4)");
      grad.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(tx - 30, ty - 30, 60, 60);
      // Sparks
      for (var s = 0; s < 8; s++) {
        var sx = tx + (Math.random() - 0.5) * 40;
        var sy = ty + Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + (35 + Math.random() * 20) + ", 100%, " + (50 + Math.random() * 30) + "%, " + (0.4 + Math.random() * 0.6) + ")";
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initReelCanvases() {
    var cards = document.querySelectorAll(".reel-card");
    if (!cards.length) return;
    var anims = [startSparks, startToolpath, startLathe, startPlasma];
    cards.forEach(function (card, i) {
      var canvas = document.createElement("canvas");
      canvas.className = "reel-canvas";
      card.insertBefore(canvas, card.firstChild);
      anims[i % anims.length](canvas);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReelCanvases);
  } else {
    initReelCanvases();
  }
})();
