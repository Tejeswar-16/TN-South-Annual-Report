"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GenderDonutChart({ students = {} }) {
  const totalBoys = Number(students.boys || 0);
  const totalGirls = Number(students.girls || 0);

  const total = totalBoys + totalGirls;

  const boysPercent =
    total > 0 ? ((totalBoys / total) * 100).toFixed(1) : "0";

  const girlsPercent =
    total > 0 ? ((totalGirls / total) * 100).toFixed(1) : "0";

  const data = {
    labels: [
      `Boys (${boysPercent}%)`,
      `Girls (${girlsPercent}%)`,
    ],
    datasets: [
      {
        data: [totalBoys, totalGirls],
        backgroundColor: [
          "#3b82f6",
          "#ec4899",
        ],
        borderColor: [
          "#2563eb",
          "#db2777",
        ],
        borderWidth: 1,
        cutout: "70%",
      },
    ],
  };

  const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    const {
      ctx,
      chartArea: { left, right, top, bottom },
    } = chart;

    const x = (left + right) / 2;
    const y = (top + bottom) / 2;

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#475569"; // slate-600
    ctx.font = "bold 15px Arial";

    ctx.fillText("Gender", x, y - 8);
    ctx.fillText("Split", x, y + 12);

    ctx.restore();
  },
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.parsed}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-72 flex justify-center items-center">
      <div className="w-64 h-64">
        <Doughnut
          data={data}
          options={options}
          plugins={[centerTextPlugin]}
        />
      </div>
    </div>
  );
}