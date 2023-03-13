import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function BarChart({ chartData }) {
  let options = { 
    plugins: {
      legend: {
        labels: {
          color: "black",
          font: {
            size: 14
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: "black",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "#fffeee"
        },
      },
      x: {
        ticks: {
          color: "black",
          font: {
            size: 12
          },
        },
        grid: {
          color: "#fffeee"
        },
      }
    }
}
  return <Bar data={chartData} options={options}/>;
}

export default BarChart;