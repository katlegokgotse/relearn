"use client"; // Mark this component as a Client Component

import FileUpload from "@/components/dashboard/UploadComponent";
import Sidebar from "@/components/dashboard/Sidebar";
import React, { Component } from "react";
import "./Dashboard.css"; // Import your CSS file

export class Dashboard extends Component {
  render() {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <br></br>
        <div className="Upload">
          <FileUpload />
        </div>
      </div>
    );
  }
}

export default Dashboard;
