import React, {useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

//change the code below to modify the bottom plot view
export default function WhiteHatStats(props){
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;

    const statisticChart = useMemo(()=>{
        //wait until the data loads
        if(svg === undefined | props.data === undefined){ return }
        
        svg.selectAll('circle').remove();
        svg.selectAll('g').remove()
        svg.selectAll('.barChartLegendRect').remove()
        svg.selectAll('.barChartLegendRectText').remove()
        
        //aggregate gun data by cities
        const data = props.data.cities;
        const sortedData = data.filter(val => val.state === props.sortState)

        //get data for each city
        const plotData = [];
        for(let city of sortedData){
            let entry = {
                'count': city.count,
                'state': city.state,
                'city': city.city,
                'population': city.population,
                'genderRatio': city.male_count/city.count,
                'Gun_Deaths_per_100000': Math.round(((city.count * 100000) / city.population) * 10) / 10,
                'male_count': city.male_count,
                'female_count': city.count - city.male_count,
            }
            plotData.push(entry)
        }
        //get transforms for each value into x and y coordinates
        let xScale = d3.scaleLinear()
            .domain(d3.extent(plotData,d=>d.male_count))
            .range([marginLeft, width - marginRight])
        let yScale = d3.scaleLinear()
            .domain(d3.extent(plotData,d=>d.female_count))
            .range([height - marginBottom, marginTop])

        let colorScale = d3.scaleSequential(d3.interpolatePuOr)
            .domain([0, 10]);

        //draw the circles for each city
        svg.selectAll('.dot').remove();
        svg.selectAll('.dot').data(plotData)
            .enter().append('circle')
            .attr('cx',d => xScale(d.male_count))
            .attr('cy',d => yScale(d.female_count))
            .attr('fill',d=> colorScale(d.genderRatio))
            .attr('opacity', .5)
            .attr('r', 5)
            .on('mouseover',(e,d)=>{
                let name = d.city;
                let string = '<strong>' + name + '</strong>' + '</br>'
                    + '<div class="toolTipTextStyle">' + 'Gun Deaths:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.count + '</p>' + '</div>'
                    + '<div class="toolTipTextStyle">' + 'Gun Deaths per 100000:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.Gun_Deaths_per_100000 + '</p>' + '</div>'
                    + '<div class="toolTipTextStyle">' + 'Male victims:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.male_count + '</p>' + '</div>'
                    + '<div class="toolTipTextStyle">' + 'Female victims:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.female_count + '</p>' + '</div>'
                props.ToolTip.moveTTipEvent(tTip,e)
                tTip.html(string)
            }).on('mousemove',(e)=>{
                props.ToolTip.moveTTipEvent(tTip,e);
            }).on('mouseout',(e,d)=>{
                props.ToolTip.hideTTip(tTip);
            });
        
        
        svg.append('g')
            .call(d3.axisBottom(xScale))
            .attr('transform', `translate(0,${height - marginBottom})`)

        svg.append('g')
            .call(d3.axisLeft(yScale))
            .attr('transform', `translate(${marginLeft},0)`)

        return svg
    },[svg, props.data, props.sortState]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}
