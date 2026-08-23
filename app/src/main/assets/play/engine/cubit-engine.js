/** Cubit Play Engine — Phase 2 shared runtime (software 3D + tank controls) */
(function (global) {
  function Engine(opts) {
    opts = opts || {};
    this.canvas = opts.canvas;
    this.IW = opts.width || 320;
    this.IH = opts.height || 240;
    this.off = document.createElement('canvas');
    this.off.width = this.IW;
    this.off.height = this.IH;
    this.g = this.off.getContext('2d', { alpha: false });
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.px = opts.x || 1.5;
    this.pz = opts.z || 1.5;
    this.yaw = opts.yaw || 0;
    this.keys = {};
    this.map = opts.map || [[1]];
    this.rows = this.map.length;
    this.cols = this.map[0].length;
    this.props = opts.props || []; // {x,z,type,label,color,r}
    this.packs = Object.assign({ crt: true, fog: true }, opts.packs || {});
    this.radius = 0.18;
    this.moveSpeed = 2.6;
    this.turnSpeed = 2.2;
    this.onTrigger = opts.onTrigger || function () {};
    this.onFrame = opts.onFrame || null;
    this._last = performance.now();
    this._frames = 0;
    this._fpsT = 0;
    this.fps = 0;
    this.running = true;
    this._bindInput();
    this._resize();
    window.addEventListener('resize', this._resize.bind(this));
  }

  Engine.prototype.setMap = function (map) {
    this.map = map;
    this.rows = map.length;
    this.cols = map[0].length;
  };

  Engine.prototype.solid = function (x, z) {
    var cx = Math.floor(x), cz = Math.floor(z);
    if (cz < 0 || cx < 0 || cz >= this.rows || cx >= this.cols) return true;
    return this.map[cz][cx] === 1;
  };

  Engine.prototype.tryMove = function (nx, nz) {
    var r = this.radius;
    if (!this.solid(nx - r, this.pz - r) && !this.solid(nx + r, this.pz - r) &&
        !this.solid(nx - r, this.pz + r) && !this.solid(nx + r, this.pz + r))
      this.px = nx;
    if (!this.solid(this.px - r, nz - r) && !this.solid(this.px + r, nz - r) &&
        !this.solid(this.px - r, nz + r) && !this.solid(this.px + r, nz + r))
      this.pz = nz;
    var cell = this.map[Math.floor(this.pz)] && this.map[Math.floor(this.pz)][Math.floor(this.px)];
    if (cell && cell !== 0 && cell !== 1) this.onTrigger(cell, Math.floor(this.px), Math.floor(this.pz));
  };

  Engine.prototype._bindInput = function () {
    var self = this;
    window.addEventListener('keydown', function (e) {
      self.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', function (e) {
      self.keys[e.key.toLowerCase()] = false;
    });
    var drag = false, lx = 0;
    this.canvas.addEventListener('pointerdown', function (e) {
      drag = true; lx = e.clientX;
      try { self.canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    this.canvas.addEventListener('pointerup', function () { drag = false; });
    this.canvas.addEventListener('pointermove', function (e) {
      if (!drag || !self.running) return;
      self.yaw += (e.clientX - lx) * 0.006;
      lx = e.clientX;
    });
  };

  Engine.prototype.bindPad = function (root) {
    var self = this;
    if (!root) return;
    root.querySelectorAll('[data-k]').forEach(function (btn) {
      var k = btn.getAttribute('data-k');
      var down = function (e) { e.preventDefault(); self.keys[k] = true; };
      var up = function (e) { e.preventDefault(); self.keys[k] = false; };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('pointercancel', up);
    });
  };

  Engine.prototype._resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.canvas.clientWidth * dpr);
    this.canvas.height = Math.floor(this.canvas.clientHeight * dpr);
  };

  Engine.prototype.project = function (x, y, z) {
    var cx = x - this.px, cy = y - 0.5, cz = z - this.pz;
    var cosy = Math.cos(this.yaw), siny = Math.sin(this.yaw);
    var rx = cx * cosy - cz * siny;
    var rz = cx * siny + cz * cosy;
    if (rz < 0.12) return null;
    var f = 160 / rz;
    return { x: this.IW / 2 + rx * f, y: this.IH / 2 - cy * f, z: rz };
  };

  Engine.prototype.drawWall = function (x, z, colorBase) {
    var g = this.g, h = 1.2;
    var v = [
      [x, 0, z], [x + 1, 0, z], [x + 1, 0, z + 1], [x, 0, z + 1],
      [x, h, z], [x + 1, h, z], [x + 1, h, z + 1], [x, h, z + 1]
    ].map(function (p) { return this.project(p[0], p[1], p[2]); }, this);
    var faces = [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
    var scored = faces.map(function (f, i) {
      var zs = f.map(function (j) { return v[j] && v[j].z; }).filter(Boolean);
      return { f: f, z: zs.length ? zs.reduce(function (a, b) { return a + b; }, 0) / zs.length : 0, i: i };
    }).sort(function (a, b) { return b.z - a.z; });
    var base = colorBase || [42, 52, 72];
    scored.forEach(function (item) {
      var pts = item.f.map(function (j) { return v[j]; });
      if (pts.some(function (p) { return !p; })) return;
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (var k = 1; k < pts.length; k++) g.lineTo(pts[k].x, pts[k].y);
      g.closePath();
      var shade = 0.4 + (item.i % 4) * 0.1;
      g.fillStyle = 'rgb(' +
        Math.floor(base[0] * shade) + ',' +
        Math.floor(base[1] * shade) + ',' +
        Math.floor(base[2] * shade) + ')';
      g.fill();
    });
  };

  Engine.prototype.drawProp = function (prop) {
    var p = this.project(prop.x + 0.5, prop.y || 0.35, prop.z + 0.5);
    if (!p) return;
    var g = this.g;
    var r = Math.max(2, (prop.r || 28) / p.z);
    g.fillStyle = prop.color || '#c9a227';
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.fill();
    if (prop.label) {
      g.fillStyle = '#e8ecf4';
      g.font = '9px monospace';
      g.fillText(prop.label, p.x - 10, p.y - r - 4);
    }
  };

  Engine.prototype.tick = function (dt) {
    if (!this.running) return;
    var turn = this.turnSpeed * dt;
    var k = this.keys;
    if (k['a'] || k['arrowleft'] || k['q']) this.yaw -= turn;
    if (k['d'] || k['arrowright'] || k['e']) this.yaw += turn;
    var cosy = Math.cos(this.yaw), siny = Math.sin(this.yaw);
    var forward = 0;
    if (k['w'] || k['arrowup']) forward += 1;
    if (k['s'] || k['arrowdown']) forward -= 1;
    if (forward !== 0) {
      var sp = this.moveSpeed * dt * forward;
      this.tryMove(this.px + siny * sp, this.pz + cosy * sp);
    }
  };

  Engine.prototype.render = function () {
    var g = this.g, IW = this.IW, IH = this.IH;
    g.fillStyle = '#0a0e18';
    g.fillRect(0, 0, IW, IH / 2);
    g.fillStyle = '#121820';
    g.fillRect(0, IH / 2, IW, IH / 2);

    var walls = [];
    for (var z = 0; z < this.rows; z++) {
      for (var x = 0; x < this.cols; x++) {
        if (this.map[z][x] !== 1) continue;
        var dx = x + 0.5 - this.px, dz = z + 0.5 - this.pz;
        walls.push({ x: x, z: z, d: dx * dx + dz * dz });
      }
    }
    walls.sort(function (a, b) { return b.d - a.d; });
    var self = this;
    walls.forEach(function (w) {
      // TV room walls slightly bluer if cell near prop type tv
      self.drawWall(w.x, w.z);
    });

    this.props.forEach(function (pr) { self.drawProp(pr); });

    if (this.packs.fog) {
      var fog = g.createLinearGradient(0, IH * 0.35, 0, IH);
      fog.addColorStop(0, 'rgba(10,14,24,0)');
      fog.addColorStop(1, 'rgba(10,14,24,0.7)');
      g.fillStyle = fog;
      g.fillRect(0, 0, IW, IH);
    }

    var ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.off, 0, 0, this.canvas.width, this.canvas.height);
    if (this.packs.crt) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (var y = 0; y < this.canvas.height; y += 3) ctx.fillRect(0, y, this.canvas.width, 1);
    }
  };

  Engine.prototype.start = function () {
    var self = this;
    function loop(now) {
      var dt = Math.min(0.05, (now - self._last) / 1000);
      self._last = now;
      self._frames++;
      self._fpsT += dt;
      if (self._fpsT >= 0.4) {
        self.fps = Math.round(self._frames / self._fpsT);
        self._frames = 0;
        self._fpsT = 0;
      }
      self.tick(dt);
      self.render();
      if (self.onFrame) self.onFrame(self);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  global.CubitEngine = Engine;
})(typeof window !== 'undefined' ? window : this);
