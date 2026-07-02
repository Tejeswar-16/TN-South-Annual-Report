"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GroupBarChart({
  centres = {},
  gurus = {},
  students = {},
}) {
  const data = {
    labels: ["Group I", "Group II", "Group III", "Group IV"],
    datasets: [
      {
        label: "Centres",
        data: [
          Number(centres["Group I"] || 0),
          Number(centres["Group II"] || 0),
          Number(centres["Group III"] || 0),
          Number(centres["Pre-Sevadal or IV"] || 0),
        ],
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "yCentresGurus",
      },
      {
        label: "Gurus",
        data: [
          Number(gurus["Group I"] || 0),
          Number(gurus["Group II"] || 0),
          Number(gurus["Group III"] || 0),
          Number(gurus["Pre-Sevadal or IV"] || 0),
        ],
        backgroundColor: "#14b8a6",
        borderColor: "#0d9488",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "yCentresGurus",
      },
      {
        label: "Students",
        data: [
          Number(students["Group I"] || 0),
          Number(students["Group II"] || 0),
          Number(students["Group III"] || 0),
          Number(students["Pre-Sevadal or IV"] || 0),
        ],
        backgroundColor: "#f59e0b",
        borderColor: "#d97706",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "yStudents",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: "var(--font-geist-sans)",
            size: 12,
          },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleFont: {
          family: "var(--font-geist-sans)",
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          family: "var(--font-geist-sans)",
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            family: "var(--font-geist-sans)",
          },
        },
      },
      yCentresGurus: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Centres & Gurus Count",
          color: "#64748b",
          font: {
            family: "var(--font-geist-sans)",
            weight: "bold",
          },
        },
        grid: {
          color: "#f1f5f9",
        },
        ticks: {
          precision: 0,
          color: "#64748b",
          font: {
            family: "var(--font-geist-sans)",
          },
        },
      },
      yStudents: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Students Count",
          color: "#d97706",
          font: {
            family: "var(--font-geist-sans)",
            weight: "bold",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          precision: 0,
          color: "#d97706",
          font: {
            family: "var(--font-geist-sans)",
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Bar data={data} options={options} />
    </div>
  );
}