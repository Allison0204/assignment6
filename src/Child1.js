import React, { Component } from "react";
import * as d3 from "d3";

class Child1 extends Component {
  componentDidMount() {
    const data = this.props.data;

    const colors = {
      "GPT-4": "#e41a1c",
      Gemini: "#377eb8",
      "PaLM-2": "#4daf4a",
      Claude: "#984ea3",
      "LLaMA-3.1": "#ff7f00",
    };

    const reversedColors = {
        "GPT-4": "#ff7f00",
        Gemini: "#984ea3",
        "PaLM-2": "#4daf4a",
        Claude: "#377eb8",
        "LLaMA-3.1": "#e41a1c",
      };
      

    const margin = { top: 0, right: 120, bottom: 50, left: 80 };
    const width = 450 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Prepare SVG container
    const svg = d3
      .select(".container")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.sum([
          d3.max(data, (d) => d["GPT-4"]),
          d3.max(data, (d) => d["Gemini"]),
          d3.max(data, (d) => d["PaLM-2"]),
          d3.max(data, (d) => d["Claude"]),
          d3.max(data, (d) => d["LLaMA-3.1"]),
        ]),
      ])
      .range([height, 0]);

    // Stack generator
    const stack = d3
      .stack()
      .keys(["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"])
      .offset(d3.stackOffsetSilhouette);

    const stackedSeries = stack(data);

    // Area generator
    const areaGenerator = d3
      .area()
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCardinal);

      
    // Streamgraph paths
    svg
    .selectAll("path")
    .data(stackedSeries)
    .join("path")
    .style("fill", (d) => colors[d.key])
    .attr("d", (d) => areaGenerator(d))
    .on("mouseover", (event, d) => {
      showTooltip(event, d);
      updateTooltip(event, d); 
    })
    .on("mousemove", (event, d) => {
      updateTooltip(event, d);
    })
    .on("mouseout", hideTooltip);
  
    // X-Axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"));
    svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height+140})`)
      .call(xAxis)
      .selectAll("text")


     // Legend
    const legendData = Object.keys(colors); // Legend order matches stack order

    const legend = d3
      .select(".container")
      .selectAll(".legend-item")
      .data(legendData)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (_, i) => `translate(${width + 20}, ${i * 20})`);

    // Add color boxes
    legend
      .selectAll("rect")
      .data((d) => [d]) 
      .join("rect")
      .attr("x", 20)
      .attr("y", 300)
      .attr("width", 17)
      .attr("height", 17)
      .attr("fill", (d) => reversedColors[d]); // Use reversed colors for the legend

    // Add labels
    legend
      .selectAll("text")
      .data((d) => [d]) 
      .join("text")
      .attr("x", 42)
      .attr("y", 313)
      .style("font-size", "10px")
      .text((d) => d);

    // Tooltip container
    const tooltip = d3
    .select("body")
    .selectAll(".tooltip")
    .data([null])
    .join("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("padding", "10px 15px")
    .style("padding","25px")
    .style("border-radius", "5px")
    .style("background-color", "lightgrey")

    
   // Tooltip bar chart dimensions
   const barChartWidth = 220;
   const barChartHeight = 100;

   function showTooltip(event, d) {
     tooltip
       .style("opacity", 1)
       .style("left", `${event.pageX + 10}px`)
       .style("top", `${event.pageY + 10}px`);

     // Render tooltip content
     tooltip
       .selectAll("svg")
       .data([null])
       .join("svg")
       .attr("width", barChartWidth)
       .attr("height", barChartHeight);
   }

   function updateTooltip(event, d) {
    const stackKey = d.key;
    const stackColor = colors[stackKey];
  
    // Move the tooltip to follow the mouse cursor
    tooltip
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  
    // Prepare bar data for the tooltip
    const barData = data.map((entry) => ({
      date: entry.Date,
      value: entry[stackKey],
    }));
  
    // Scales for bar chart
    const barXScale = d3
      .scaleBand()
      .domain(barData.map((d) => d.date))
      .range([0, barChartWidth])
      .padding(0.1);
  
    const barYScale = d3
      .scaleLinear()
      .domain([0, d3.max(barData, (d) => d.value)])
      .range([barChartHeight, 0]);
  
    const svg = tooltip
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", barChartWidth + 40)
      .attr("height", barChartHeight + 40);
  
    // Clear old elements
    svg.selectAll("*").remove();
  
  
    // Create bars 
    svg.selectAll("rect")
      .data(barData)
      .join("rect")
      .attr("x", (d) => barXScale(d.date) + 30)
      .attr("y", (d) => barYScale(d.value) + 20)
      .attr("width", barXScale.bandwidth())
      .attr("height", (d) => barChartHeight - barYScale(d.value))
      .style("fill", stackColor)
  
    // Add X-axis
    svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("transform", `translate(30, ${barChartHeight + 20})`)
      .call(d3.axisBottom(barXScale).tickFormat(d3.timeFormat("%b")).tickSize(5))
      .selectAll("text")
      .style("font-size", "10px")
      .style("text-anchor", "middle");
  
    // Add Y-axis
    svg
      .selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left - 50}, 20)`)
      .call(d3.axisLeft(barYScale).ticks(5).tickSize(5))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "black");
  }

   function hideTooltip() {
     tooltip.style("opacity", 0);
   }
 }

  render() {
    return (
      <svg style={{ width: 800, height: 600 }}>
        <g className="container"></g>
      </svg>
    );
  }
}

export default Child1;
