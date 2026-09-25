/* Interactive results charts for the malaria project.
   Model-comparison figures are from Table 1 of the paper; the yearly series below is placeholder data. */
(function () {
  const ORANGE = "#e07020";  // M-LSTM (this study) — same colour on every chart
  const CYAN = "#00a0d0";    // comparison model / projected values
  const ROSE = "#b05060";    // observed malaria incidence
  const INK = "#3f4757", MUTED = "#626a7a", GRID = "#eceef2";
  const DECADES = [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1];

  const DATA = {
    countries: ["Pakistan", "India", "Bangladesh"],
    r2: { mlstm: [0.33, 0.99, 0.10], convlstm: [0.09, 0.18, 0.01] },
    rmse: {
      temporal: { label: "Predicting 2017 (trained on 2000–2016)", ours: [0.0007, 4.86e-6, 1.32e-5], other: [0.0128, 0.0162, 0.0016], otherName: "Conv-LSTM" },
      spatial: { label: "Predicting unseen places (random 20% held out)", ours: [0.0076, 0.0166, 0.0016], other: [0.026, 5.15e-5, 0.0009], otherName: "Random Forest" },
    },
  };


  /* Yearly malaria incidence for South Asia.
     PLACEHOLDER FIGURES — swap `values` (and `projectedFrom` if the study period changes)
     for the real series when the data file arrives. One value per year from `startYear`. */
  const PFIR = {
    startYear: 2000,
    projectedFrom: 2017,   // years after this one are drawn as a dashed projection
    values: [
      0.128, 0.131, 0.122, 0.119, 0.113, 0.108, 0.104, 0.096, 0.091, 0.087,
      0.079, 0.072, 0.068, 0.061, 0.054, 0.047, 0.041, 0.036, 0.033, 0.030,
      0.028, 0.029, 0.026, 0.023, 0.021, 0.019, 0.017,
    ],
  };

  // 0.0000486 -> "4.86 × 10⁻⁶"; 0.0128 -> "0.0128"
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const fmt = (v) => {
    if (v === 0) return "0";
    if (Math.abs(v) >= 0.0001) return String(+v.toPrecision(3));
    const [m, e] = v.toExponential(2).split("e");
    return `${m}×10${String(+e).replace(/./g, (c) => SUP[c])}`;
  };


  // Vertical rule marking where observed data ends and the projection begins.
  const projectionMark = {
    id: "projectionMark",
    beforeDatasetsDraw(chart, _args, opts) {
      if (!opts || !opts.enabled) return;
      const x = chart.scales.x.getPixelForValue(opts.at), { top, bottom } = chart.chartArea;
      const { ctx } = chart;
      ctx.save();
      ctx.strokeStyle = "#c9ccd4"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "500 11px 'Roboto', sans-serif";
      ctx.fillStyle = MUTED; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(opts.label, x + 6, top + 2);
      ctx.restore();
    },
  };

  // Direct value labels above bars (so identity and value never rely on colour alone).
  const valueLabels = {
    id: "valueLabels",
    afterDatasetsDraw(chart, _args, opts) {
      if (!opts || !opts.enabled) return;
      const { ctx } = chart;
      ctx.save();
      ctx.font = "500 12px 'Roboto', sans-serif";
      ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      chart.data.datasets.forEach((ds, i) => {
        const meta = chart.getDatasetMeta(i);
        if (meta.hidden) return;
        meta.data.forEach((bar, j) => ctx.fillText(opts.format(ds.data[j]), bar.x, bar.y - 5));
      });
      ctx.restore();
    },
  };

  function base(extra) {
    return Object.assign({
      responsive: true, maintainAspectRatio: false,
      animation: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 500 },
      layout: { padding: { top: 26 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#002147", titleFont: { family: "Roboto", weight: "700" }, bodyFont: { family: "Roboto" },
          padding: 10, cornerRadius: 6, boxPadding: 4,
        },
      },
    }, extra);
  }

  function bars(ours, other, oursName, otherName) {
    const ds = (label, data, color) => ({
      label, data, backgroundColor: color, borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: "bottom",
      maxBarThickness: 46, categoryPercentage: .62, barPercentage: .92,
    });
    return [ds(oursName, ours, ORANGE), ds(otherName, other, CYAN)];
  }

  function table(el, head, rows) {
    el.innerHTML = `<table class="data-table"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr${r.best ? ' class="best"' : ""}>${r.cells.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function wireTableToggle(card) {
    const btn = card.querySelector("[data-toggle-table]"), tbl = card.querySelector(".chart-table");
    if (!btn || !tbl) return;
    btn.addEventListener("click", () => {
      const show = tbl.hidden; tbl.hidden = !show;
      btn.textContent = show ? "Hide data table" : "Show data table";
      btn.setAttribute("aria-expanded", String(show));
    });
  }

  function init() {
    if (!window.Chart) return;
    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.color = MUTED;
    Chart.register(valueLabels, projectionMark);


    /* ---- Malaria incidence over time, with projection ---- */
    const pfirCard = document.getElementById("chart-pfir");
    if (pfirCard) {
      const years = PFIR.values.map((_, i) => PFIR.startYear + i);
      const cut = PFIR.projectedFrom - PFIR.startYear;           // last observed index
      const isProjected = (i) => i > cut;
      new Chart(pfirCard.querySelector("canvas"), {
        type: "line",
        data: {
          labels: years,
          datasets: [{
            label: "Malaria incidence rate",
            data: PFIR.values,
            borderColor: ROSE,
            backgroundColor: "rgba(176, 80, 96, .10)",
            borderWidth: 2.5, tension: .3, fill: true,
            pointRadius: (c) => (years[c.dataIndex] % 5 === 0 || c.dataIndex === cut ? 4 : 0),
            pointBackgroundColor: (c) => (isProjected(c.dataIndex) ? CYAN : ROSE),
            pointBorderColor: "#fff", pointBorderWidth: 2, pointHoverRadius: 6,
            segment: {
              borderColor: (c) => (isProjected(c.p1DataIndex) ? CYAN : ROSE),
              borderDash: (c) => (isProjected(c.p1DataIndex) ? [6, 5] : undefined),
            },
          }],
        },
        options: base({
          interaction: { mode: "index", intersect: false },
          plugins: Object.assign(base().plugins, {
            projectionMark: { enabled: true, at: cut, label: "Projection" },
            tooltip: Object.assign(base().plugins.tooltip, {
              callbacks: {
                title: (items) => `${items[0].label}${isProjected(items[0].dataIndex) ? " (projected)" : ""}`,
                label: (c) => ` Incidence rate: ${c.raw.toFixed(3)}`,
              },
            }),
          }),
          scales: {
            x: { grid: { display: false }, ticks: { color: INK, maxRotation: 0, autoSkipPadding: 16 } },
            y: { min: 0, grid: { color: GRID }, border: { display: false },
                 title: { display: true, text: "Incidence rate (cases per person, per year)" },
                 ticks: { callback: (v) => v.toFixed(2) } },
          },
        }),
      });
      table(pfirCard.querySelector(".chart-table") || document.createElement("div"), ["Year", "Incidence rate", "Basis"],
        years.map((y, i) => ({ cells: [y, PFIR.values[i].toFixed(3), isProjected(i) ? "Projected" : "Observed"] })));
      wireTableToggle(pfirCard);
    }

    /* ---- R² : how much of the real pattern each model explains ---- */
    const r2Card = document.getElementById("chart-r2");
    if (r2Card) {
      new Chart(r2Card.querySelector("canvas"), {
        type: "bar",
        data: { labels: DATA.countries, datasets: bars(DATA.r2.mlstm, DATA.r2.convlstm, "M-LSTM (this study)", "Conv-LSTM") },
        options: base({
          plugins: Object.assign(base().plugins, {
            valueLabels: { enabled: true, format: (v) => v.toFixed(2) },
            tooltip: Object.assign(base().plugins.tooltip, { callbacks: { label: (c) => ` ${c.dataset.label}: R² ${c.raw.toFixed(2)}` } }),
          }),
          scales: {
            x: { grid: { display: false }, ticks: { color: INK, font: { size: 13, weight: "600" } } },
            y: { min: 0, max: 1, ticks: { stepSize: .25, callback: (v) => v.toFixed(2) }, grid: { color: GRID }, border: { display: false },
                 title: { display: true, text: "R²  (1 = perfect)" } },
          },
        }),
      });
      table(r2Card.querySelector(".chart-table") || document.createElement("div"), ["Country", "M-LSTM R²", "Conv-LSTM R²"],
        DATA.countries.map((c, i) => ({ cells: [c, DATA.r2.mlstm[i].toFixed(2), DATA.r2.convlstm[i].toFixed(2)] })));
      wireTableToggle(r2Card);
    }

    /* ---- RMSE : size of the error, two ways of testing ---- */
    const rmseCard = document.getElementById("chart-rmse");
    if (rmseCard) {
      const key = rmseCard.querySelector(".chart-legend .other-name");
      const chart = new Chart(rmseCard.querySelector("canvas"), {
        type: "bar",
        data: { labels: DATA.countries, datasets: [] },
        options: base({
          plugins: Object.assign(base().plugins, {
            valueLabels: { enabled: true, format: fmt },
            tooltip: Object.assign(base().plugins.tooltip, { callbacks: { label: (c) => ` ${c.dataset.label}: RMSE ${fmt(c.raw)}` } }),
          }),
          scales: {
            x: { grid: { display: false }, ticks: { color: INK, font: { size: 13, weight: "600" } } },
            y: { type: "logarithmic", min: 1e-6, max: 0.1, grid: { color: (c) => (DECADES.includes(c.tick?.value) ? GRID : "transparent") }, border: { display: false },
                 title: { display: true, text: "Error (RMSE, log scale) — lower is better" },
                 ticks: { callback: (v) => (DECADES.includes(v) ? fmt(v) : "") } },
          },
        }),
      });
      const setSplit = (s) => {
        const d = DATA.rmse[s];
        chart.data.datasets = bars(d.ours, d.other, "M-LSTM (this study)", d.otherName);
        chart.update();
        key.textContent = d.otherName;
        rmseCard.querySelectorAll("[data-split]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.split === s)));
        rmseCard.querySelectorAll("[data-split-note]").forEach((n) => (n.hidden = n.dataset.splitNote !== s));
        table(rmseCard.querySelector(".chart-table") || document.createElement("div"), ["Country", "M-LSTM RMSE", `${d.otherName} RMSE`, "Lower error"],
          DATA.countries.map((c, i) => ({ cells: [c, fmt(d.ours[i]), fmt(d.other[i]), d.ours[i] < d.other[i] ? "M-LSTM" : d.otherName] })));
      };
      rmseCard.querySelectorAll("[data-split]").forEach((b) => b.addEventListener("click", () => setSplit(b.dataset.split)));
      setSplit("temporal");
      wireTableToggle(rmseCard);
    }

  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
