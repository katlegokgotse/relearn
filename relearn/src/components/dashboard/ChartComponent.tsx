// components/Chart.tsx
"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
}

const ChartDisplay: React.FC<ChartProps> = ({ data }) => {
  // Dummy data for the chart
  const dummyData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sample Data",
        data: [65, 59, 80, 81, 56, 55, 40], // Dummy values for each month
        borderColor: 'rgba(75, 192, 192, 1)', // Color of the line
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Background color of the area
        fill: true,
        borderWidth: 1,
      },
    ],
  };

  // Use dummyData if no valid data is provided
  const chartData = data && data.datasets.length > 0 ? data : dummyData;

  return (
    <div>
      <h2>My Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default ChartDisplay;
