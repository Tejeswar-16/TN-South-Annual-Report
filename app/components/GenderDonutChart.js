"use client";

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Determine gender from the category string (e.g. "Boys- School Balvikas")
// This is more reliable than the gender field which can be misconfigured in Firestore.
function detectGender(item) {
  const cat = (item.category || '').toLowerCase();
  if (cat.startsWith('boys')) return 'Boys';
  if (cat.startsWith('girls')) return 'Girls';
  // Fallback to gender field
  if (item.gender === 'Boys' || item.gender === 'Girls') return item.gender;
  return null;
}

// Only leaf-level rows (not aggregate/total rows) should be counted.
// Leaf rows always have a centreType of School / Urban Domestic / Rural Domestic.
const VALID_CENTRE_TYPES = new Set(['School', 'Urban Domestic', 'Rural Domestic']);

function isLeafRow(item) {
  return VALID_CENTRE_TYPES.has(item.centreType);
}

export default function GenderDonutChart({ students = [], activeGroup = 'all' }) {
  let totalBoys = 0;
  let totalGirls = 0;

  students.filter(isLeafRow).forEach((item) => {
    const gender = detectGender(item);
    if (!gender) return;

    const value = activeGroup === 'all'
      ? (item.total || 0)
      : (item[activeGroup] || 0); // group1 / group2 / group3 / group4

    if (gender === 'Boys')  totalBoys  += value;
    if (gender === 'Girls') totalGirls += value;
  });

  const total = totalBoys + totalGirls;
  const boysPercent  = total > 0 ? ((totalBoys  / total) * 100).toFixed(1) : 0;
  const girlsPercent = total > 0 ? ((totalGirls / total) * 100).toFixed(1) : 0;

  const data = {
    labels: [`Boys (${boysPercent}%)`, `Girls (${girlsPercent}%)`],
    datasets: [
      {
        data: [totalBoys, totalGirls],
        backgroundColor: [
          '#3b82f6', // blue-500 for Boys
          '#ec4899', // pink-500 for Girls
        ],
        borderColor: ['#2563eb', '#db2777'],
        borderWidth: 1,
        cutout: '70%',
      },
    ],
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.restore();
      ctx.textBaseline = 'middle';

      ctx.font = '12px var(--font-geist-sans)';
      ctx.fillStyle = '#94a3b8';
      const label = 'TOTAL';
      ctx.fillText(label, Math.round((width - ctx.measureText(label).width) / 2), height / 2 - 12);

      ctx.font = 'bold 24px var(--font-geist-sans)';
      ctx.fillStyle = '#1e293b';
      const num = total.toLocaleString();
      ctx.fillText(num, Math.round((width - ctx.measureText(num).width) / 2), height / 2 + 12);

      ctx.save();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'var(--font-geist-sans)', size: 13 },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}`,
        },
        titleFont: { family: 'var(--font-geist-sans)', size: 13, weight: 'bold' },
        bodyFont: { family: 'var(--font-geist-sans)', size: 13 },
      },
    },
  };

  return (
    <div className="w-full h-64 relative flex items-center justify-center">
      <div className="w-64 h-64 relative">
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}
