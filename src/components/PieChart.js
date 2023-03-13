import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function PieChart({ chartData }) {
  let options = { 
    plugins: {
      legend: {
        labels: {
          color: "black",
          font: {
            size: 12
          }
        }
      }
    },
  }
  return <Pie data={chartData} options={options} />;
}

export default PieChart;