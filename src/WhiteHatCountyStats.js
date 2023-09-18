import React, {useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

export default function WhiteHatStats(props){
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    
    const gWidth = 1000
    const gHeight = gWidth

    const statisticChart = useMemo(()=>{
        //wait until the data loads
        if(svg === undefined | props.data === undefined){ return }
        
        svg.selectAll('g').remove();
        svg.selectAll('.rectCount').remove()
        svg.selectAll('.circleCountText').remove()
        
        //aggregate gun deaths by state
        const data = props.data.counties;

        //get transforms for each value into x and y coordinates
        const groupByState = d3.group(data, d => d.abreviation)

        const transformedData = [];

        for (let [key, value] of groupByState) {
              const stateNode = {
                name: key, 
                children: groupByState.get(key),
              };
              transformedData.push(stateNode);
          }

        const color = d3.scaleLinear()
            .domain([0, 5])
            .range(["#90e0ef", "#00b4d8"])
            .interpolate(d3.interpolateHcl);
        
        const pack = d3.pack()
            .size([gWidth/2, gHeight/2])
            .padding(1);

        const root = pack(d3.hierarchy({children: transformedData})
                .sum(d => d.count));

        svg.attr("viewBox", `-${gWidth / 2} -${gHeight / 2} ${gWidth} ${gHeight}`)

        const node = svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .join("circle")
                .attr("fill", d => d.children ? color(d.depth) : "white")
                .attr("pointer-events", d => !d.children ? "none" : null)
                .on("mouseover", function() { 
                    d3.select(this).attr("stroke", "#ff006e")
                })
                .on("mouseout", function() { d3.select(this).attr("stroke", null); })
                .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

        const label = svg.append("g")
            .style("font", "12px sans-serif")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .text(d => {if(d.data.name){
                return d.data.name
            }else{
                return d.data.county
            }});

            
        svg.on("click", (event) => zoom(event, root));
        
        let focus = root;
        let view;
        zoomTo([focus.x, focus.y, focus.r * 2]);
          
        function zoomTo(v) {
              const k = gWidth / v[2];
              view = v;
              label.attr("transform", d => `translate(${(d.x- v[0]) * k},${(d.y - v[1]) * k})`);
              node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
              node.attr("r", d => d.r * k);
            }
          
        function zoom(event, d) {
              focus = d;
          
              const transition = svg.transition()
                  .duration(event.altKey ? 7500 : 750)
                  .tween("zoom", d => {
                    const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                    return t => zoomTo(i(t));
                  });
          
              label
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .transition(transition)
                  .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                  .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                  .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }
        const bounds = svg.node().getBBox();

        svg.append("rect").attr('class','rectCount').attr("x", bounds.x + bounds.width - 200).attr("y",bounds.y + 50).attr("width", 20).attr("height", 20).style("fill", "#00b4d8")
        svg.append("text").attr('class','circleCountText').attr("x", bounds.x + bounds.width - 160).attr("y",bounds.y + 61).text("Victim Counts by circle areas").attr("alignment-baseline","middle")

    },[svg, props.data, props.setBrushedCounty, props.brushedCounty]);

    useMemo(()=>{
        if(statisticChart !== undefined){
            const isCountyBrushed = props.brushedCounty !== undefined;
            if(isCountyBrushed){
                statisticChart.select('#'+props.brushedCounty)
                    .attr('opacity',1)
                    .attr('strokeWidth',3);
            }
        }
    },[statisticChart, props.brushedCounty]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}