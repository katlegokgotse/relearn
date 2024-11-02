// Dashboard.tsx
"use client";

import FileUpload from "@/components/dashboard/UploadComponent";
import Sidebar from "@/components/dashboard/Sidebar";
import React, { useEffect, useState } from "react";
import ChartDisplay from "@/components/dashboard/ChartComponent";
import "./Dashboard.css"; // Import your CSS file

export function Dashboard() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emptyData = { labels: [], datasets: [] };
  const fetchData = async () => {
      try {
        const response = await fetch("http://10.73.226.236:3333/transcripts/send");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Log the fetched data
        
        // Check if predictedMarks exists and is an array
        if (!data.predictedMarks || !Array.isArray(data.predictedMarks)) {
          throw new Error("Unexpected data format");
        }

        // Process the predictedMarks data for Chart.js
        const labels = data.predictedMarks.map((item: any) => item.module);
        const values = data.predictedMarks.map((item: any) => item.predictedMark);

        setChartData({
          labels,
          datasets: [
            {
              label: "Predicted Marks",
              data: values,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 1,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error); // Log error for more info
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();


  return (
    <div className="dashboard-container">
      <Sidebar />
      <br />
      <div className="Upload">
        <FileUpload />
        {loading ? (
          <p>Loading chart data...</p>
        ) : (
          chartData && <ChartDisplay data={emptyData} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
