"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GroupBarChart({ centres = [], gurus = [], students = [] }) {
  // Derive counts by group
  // Group 1, Group 2, Group 3, Group 4
  const getGroupSum = (dataset, field) => {
    return [
      dataset.reduce((sum, item) => sum + (item.group1 || 0), 0),
      dataset.reduce((sum, item) => sum + (item.group2 || 0), 0),
      dataset.reduce((sum, item) => sum + (item.group3 || 0), 0),
      dataset.reduce((sum, item) => sum + (item.group4 || 0), 0),
    ];
  };

  const centresGroupData = getGroupSum(centres);
  const gurusGroupData = getGroupSum(gurus);
  const studentsGroupData = getGroupSum(students);

  const data = {
    labels: ['Group I', 'Group II', 'Group III', 'Group IV'],
    datasets: [
      {
        label: 'Centres',
        data: centresGroupData,
        backgroundColor: '#3b82f6', // blue-500
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yCentresGurus',
      },
      {
        label: 'Gurus',
        data: gurusGroupData,
        backgroundColor: '#14b8a6', // teal-500
        borderColor: '#0d9488',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yCentresGurus',
      },
      {
        label: 'Students',
        data: studentsGroupData,
        backgroundColor: '#f59e0b', // amber-500
        borderColor: '#d97706',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yStudents',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: 'var(--font-geist-sans)',
            size: 12,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: {
          family: 'var(--font-geist-sans)',
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          family: 'var(--font-geist-sans)',
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
          color: '#64748b',
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
      yCentresGurus: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Centres & Gurus Count',
          color: '#64748b',
          font: {
            family: 'var(--font-geist-sans)',
            weight: 'medium',
          },
        },
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
      yStudents: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Students Count',
          color: '#d97706',
          font: {
            family: 'var(--font-geist-sans)',
            weight: 'medium',
          },
        },
        grid: {
          drawOnChartArea: false, // Prevents dual grid lines overlapping
        },
        ticks: {
          color: '#d97706',
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80 relative">
      <Bar data={data} options={options} />
    </div>
  );
}
