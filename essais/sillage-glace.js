// Étude de Prison de glace pour l’atelier. Les distances sont en unités du terrain.
const IceWake = (() => {
  const clamp = t => Math.max(0, Math.min(1, t));
  const lanes = [
    { angle: -2.84, bend: 0.12, teeth: 6, height: 20 },
    { angle: -1.98, bend: -0.16, teeth: 5, height: 26 },
    { angle: -1.19, bend: 0.10, teeth: 7, height: 18 },
    { angle: -0.28, bend: 0.15, teeth: 6, height: 25 },
    { angle: 0.57, bend: -0.12, teeth: 5, height: 20 },
    { angle: 1.50, bend: 0.08, teeth: 7, height: 23 },
    { angle: 2.41, bend: -0.14, teeth: 6, height: 17 }
  ];
  // Le front dessiné et le rabattement des cibles suivent le même rayon.
  function radius(zone, progress) {
    return zone.r * (1 - 0.83 * clamp(progress));
  }
  function point(zone, lane, progress) {
    const angle = lane.angle + lane.bend * Math.sin(Math.PI * progress);
    const distance = radius(zone, progress);
    return [Math.cos(angle) * distance, Math.sin(angle) * distance];
  }
  function polygon(ctx, color, points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
    ctx.closePath();
    ctx.fill();
  }
  // Une lame est fichée dans une lèvre de terre. Sa pointe penche vers le centre.
  function blade(ctx, x, y, angle, width, height, lean) {
    if (height < 0.6) return;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const tip = [x - dx * lean, y - dy * lean - height];
    const sides = [-1, 1].map(sign => [x - dy * width * sign, y + dx * width * sign]);
    const heel = [x + dx * width * 0.8, y + dy * width * 0.8 + 1];
    const ridge = [x - dx * lean * 0.42 - width * 0.18, y - dy * lean * 0.42 - height * 0.56];
    polygon(ctx, '#32596d', [sides[0], tip, sides[1], heel]);
    polygon(ctx, '#77b3c1', [sides[0], tip, ridge, heel]);
    polygon(ctx, '#aacfd0', [sides[0], tip, ridge]);
    polygon(ctx, '#497e98', [heel, ridge, tip, sides[1]]);
    polygon(ctx, '#d2ece2', [tip, [ridge[0] - 1.2, ridge[1]], [ridge[0] + 0.7, ridge[1] - 0.6]]);
  }
  function draw(ctx, zone, front) {
    const travel = SpellArt.prisonTravel;
    const progress = clamp(zone.t / travel);
    const fade = clamp((zone.dur - zone.t) / 0.32);
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.globalAlpha *= fade;
    const blades = [];
    for (const lane of lanes) {
      const [x, y] = point(zone, lane, progress);
      if (!front) {
        // Une fente sombre aux bords gelés reste derrière la crête puis se résorbe.
        const tail = Math.max(0, progress - 0.42);
        const wake = clamp(1 - (zone.t - travel) / 0.55);
        if (wake > 0 && progress > 0) {
          ctx.save();
          ctx.globalAlpha *= wake;
          for (let i = 0; i < 8; i++) {
            const a = point(zone, lane, tail + (progress - tail) * i / 8);
            const b = point(zone, lane, tail + (progress - tail) * (i + 1) / 8);
            const width = (i + 1) * 0.49;
            const nx = -Math.sin(lane.angle) * width, ny = Math.cos(lane.angle) * width;
            polygon(ctx, '#363d39', [[a[0]-nx,a[1]-ny], [b[0]-nx,b[1]-ny], [b[0]+nx,b[1]+ny], [a[0]+nx,a[1]+ny]]);
            ctx.strokeStyle = '#a4c4c1'; ctx.lineWidth = 1.15;
            ctx.beginPath(); ctx.moveTo(a[0]-nx,a[1]-ny); ctx.lineTo(b[0]-nx,b[1]-ny); ctx.stroke();
          }
          ctx.restore();
        }
      }
      // Les dents émergent à un ancrage fixe puis replongent au passage de la crête.
      for (let i = 0; i < lane.teeth; i++) {
        const along = i / lane.teeth, age = zone.t - along * travel;
        if (age <= 0 || age >= 0.37) continue;
        const [bx, by] = point(zone, lane, along);
        if ((by > 0) !== front) continue;
        const lift = Math.sin(Math.PI * age / 0.37);
        blades.push([bx, by, lane.angle, 3.5 + i % 3, lane.height * 0.64 * lift, 8 * lift]);
      }
      if ((y > 0) !== front) continue;
      const rise = clamp(zone.t / 0.13);
      const settle = 1 - 0.35 * clamp((zone.t - travel) / 0.22);
      blades.push([x, y, lane.angle, 7, lane.height * rise * settle, (12 + 4 * Math.sin(progress * Math.PI)) * rise]);
    }
    blades.sort((a, b) => a[1] - b[1]);
    for (const b of blades) blade(ctx, ...b);
    ctx.restore();
  }
  return { radius, draw };
})();
