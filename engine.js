/* GearMath engine - what every gear actually does. Pure math, no DOM. */
(function (root) {
  'use strict';

  var WHEELS = {
    '700c': { label: '700c road (622 + 25mm)', diameterIn: 27.0 },
    '27.5': { label: '27.5" MTB (584 + 2.2")', diameterIn: 27.4 },
    '29er': { label: '29er (622 + 2.2")', diameterIn: 29.1 },
    '26':   { label: '26" classic (559 + 1.9")', diameterIn: 25.8 },
    '20':   { label: '20" folding (406 + 1.5")', diameterIn: 19.1 }
  };

  function num(v, name) {
    var n = typeof v === 'string' ? parseFloat(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || isNaN(n)) throw new Error(name + ' must be a number');
    return n;
  }
  function round2(x) { return Math.round(x * 100) / 100; }
  function round1(x) { return Math.round(x * 10) / 10; }

  function parseTeeth(v, name, lo, hi) {
    var n = num(v, name);
    if (n < lo || n > hi || Math.round(n) !== n) throw new Error(name + ' must be a whole number in [' + lo + ', ' + hi + ']');
    return n;
  }

  function gearInches(chainring, cog, diameterIn) {
    return (chainring / cog) * diameterIn;
  }
  function developmentM(gi) {
    return gi * Math.PI * 0.0254;
  }
  function speedKmh(gi, rpm) {
    return developmentM(gi) * rpm * 60 / 1000;
  }

  function combos(chainrings, cogs, wheelKey) {
    var w = WHEELS[wheelKey];
    if (!w) throw new Error('unknown wheel');
    if (!chainrings.length) throw new Error('at least one chainring');
    if (!cogs.length) throw new Error('at least one cog');
    var out = [];
    chainrings.forEach(function (cr, ci) {
      cogs.forEach(function (cg) {
        var gi = gearInches(cr, cg, w.diameterIn);
        out.push({ chainring: cr, chainringIdx: ci, cog: cg, gearInches: round1(gi), developmentM: round2(developmentM(gi)), speed90: round1(speedKmh(gi, 90)) });
      });
    });
    out.sort(function (a, b) { return a.gearInches - b.gearInches; });
    // overlap: combos within 3% of each other from different chainrings
    for (var i = 1; i < out.length; i++) {
      if (out[i].chainringIdx !== out[i - 1].chainringIdx &&
          (out[i].gearInches - out[i - 1].gearInches) / out[i - 1].gearInches < 0.03) {
        out[i].overlap = true;
        out[i - 1].overlap = true;
      }
    }
    return out;
  }

  function analyze(o) {
    if (!o || typeof o !== 'object') throw new Error('options required');
    var wheelKey = o.wheel === undefined ? '700c' : o.wheel;
    if (!WHEELS[wheelKey]) throw new Error('wheel must be one of ' + Object.keys(WHEELS).join(', '));
    var chainrings = (o.chainrings === undefined ? [50, 34] : o.chainrings).map(function (c, i) { return parseTeeth(c, 'chainring ' + (i + 1), 20, 70); });
    var cogs = (o.cogs === undefined ? [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28] : o.cogs).map(function (c, i) { return parseTeeth(c, 'cog ' + (i + 1), 9, 52); });
    if (chainrings.length > 3) throw new Error('max 3 chainrings');
    if (cogs.length > 14) throw new Error('max 14 cogs');

    var rows = combos(chainrings, cogs, wheelKey);
    var easiest = rows[0];
    var hardest = rows[rows.length - 1];
    var overlapCount = rows.filter(function (r) { return r.overlap; }).length;
    var range = hardest.gearInches / easiest.gearInches;

    var targetKmh = o.targetKmh === undefined ? 30 : num(o.targetKmh, 'targetKmh');
    if (targetKmh <= 0 || targetKmh > 80) throw new Error('targetKmh must be in (0, 80]');
    var cadenceHardest = speedKmh(hardest.gearInches, 1) > 0 ? targetKmh / speedKmh(hardest.gearInches, 1) : null;

    return {
      wheel: WHEELS[wheelKey].label,
      rows: rows,
      easiest: easiest,
      hardest: hardest,
      rangeRatio: round2(range),
      overlapCount: overlapCount,
      targetKmh: targetKmh,
      cadenceForTargetInHardest: cadenceHardest === null ? null : Math.round(cadenceHardest)
    };
  }

  var api = { WHEELS: WHEELS, gearInches: gearInches, developmentM: developmentM, speedKmh: speedKmh, combos: combos, analyze: analyze };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GearMathEngine = api;
})(typeof self !== 'undefined' ? self : this);
