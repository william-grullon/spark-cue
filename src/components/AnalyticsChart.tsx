"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type DataPoint = {
  hour: string;
  total: number;
  success_rate: number;
};

interface AnalyticsChartProps {
  data: DataPoint[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No analytics data available.
      </div>
    );
  }

  const labels = data.map((d) => d.hour);
  const successData = data.map((d) => d.success_rate * 100);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Success Rate (%)",
        data: successData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Hourly Success Rate" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
