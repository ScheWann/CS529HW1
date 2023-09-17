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

    // const margin = 50;
    const radius = 10;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;


    //TODO: modify or replace the code below to draw a more truthful or insightful representation of the dataset. This other representation could be a histogram, a stacked bar chart, etc.
    //this loop updates when the props.data changes or the window resizes
    //we can edit it to also use props.brushedState if you want to use linking
    useEffect(()=>{
        //wait until the data loads
        if(svg === undefined | props.data === undefined){ return }
        var colors = ["#C9D6DF", "#F7EECF", "#E3E1B2", "#F9CAC8"];
        //aggregate gun deaths by state
        const data = props.data.states;
        
        //get data for each state
        const plotData = [];
        for(let state of data){
            const dd = drawingDifficulty[state.abreviation];
            let entry = {
                'abreviation': state.abreviation,
                'count': state.count,
                'name': state.state,
                'population': state.population,
                'genderRatio': state.male_count/state.count,
                'Gun_Deaths_per_100000': Math.round(((state.count * 100000) / state.population) * 10) / 10,
                'male_count': state.male_count,
                'female_count': state.count - state.male_count,
            }
            plotData.push(entry)
        }

        const keys = Object.keys(plotData[0]).slice(6)
        const stack = d3.stack().keys(keys)(plotData)
        //convert data for stack bar chart
        stack.map((d,i) => {
            d.map(d => {
              d.key = keys[i]
              return d
            })
            return d
          })
        //calcualte the max gundeath value
        const yMax = d3.max(plotData, d => {
            var val = 0
            for(var k of keys){
                val += d[k]
            }
            return val
        })
        console.log(stack)
        const xScale = d3.scaleBand().domain(plotData.map(d => d.abreviation)).range([marginLeft, width - marginRight]).padding(0.1);

        const yScale = d3.scaleLinear().domain([0, yMax]).range([height - marginBottom, marginTop])
        
        svg.selectAll('g')
            .data(stack).enter()
            .append('g')
            .selectAll('rect')
            .data(d => d).enter()
            .append('rect')
                .attr('x', d => xScale(d.data.abreviation))
                .attr('y', d => yScale(d[1]))
                .attr('width', xScale.bandwidth())
                .attr('height', d => {
                    return yScale(d[0])-yScale(d[1])
                })
                .attr('fill', d => d.key == 'male_count' ? '#0077b6' : 'orange')
                .attr('opacity', .5)
                .attr('stroke', 'lightblue')
                .attr('stroke-width', .6)
                .on('mouseover',(e,d)=>{
                    let string = '<strong>' + d.data.name.replaceAll('_',' ') + '</strong>' + '</br>'
                        + '<div class="toolTipTextStyle">' + 'Gun Deaths:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.data.count + '</p>' + '</div>'
                        + '<div class="toolTipTextStyle">' + 'Gun Deaths per 100000:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.data.Gun_Deaths_per_100000 + '</p>' + '</div>'
                        + '<div class="toolTipTextStyle">' + 'Male victims:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.data.male_count + '</p>' + '</div>'
                        + '<div class="toolTipTextStyle">' + 'Female victims:&nbsp;&nbsp;' + '<p class="toolTipFont">' + d.data.female_count + '</p>' + '</div>'
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
            .call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')))
            .attr('transform', `translate(${marginLeft},0)`)
    },[props.data,svg]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}
//END of TODO #1.

 
const drawingDifficulty = {
    'IL': 9,
    'AL': 2,
    'AK': 1,
    'AR': 3,
    'CA': 9.51,
    'CO': 0,
    'DE': 3.1,
    'DC': 1.3,
    'FL': 8.9,
    'GA': 3.9,
    'HI': 4.5,
    'ID': 4,
    'IN': 4.3,
    'IA': 4.1,
    'KS': 1.6,
    'KY': 7,
    'LA': 6.5,
    'MN': 2.1,
    'MO': 5.5,
    'ME': 7.44,
    'MD': 10,
    'MA': 6.8,
    'MI': 9.7,
    'MN': 5.1,
    'MS': 3.8,
    'MT': 1.4,
    'NE': 1.9,
    'NV': .5,
    'NH': 3.7,
    'NJ': 9.1,
    'NM': .2,
    'NY': 8.7,
    'NC': 8.5,
    'ND': 2.3,
    'OH': 5.8,
    'OK': 6.05,
    'OR': 4.7,
    'PA': 4.01,
    'RI': 8.4,
    'SC': 7.1,
    'SD': .9,
    'TN': 3.333333,
    'TX': 8.1,
    'UT': 2.8,
    'VT': 2.6,
    'VA': 8.2,
    'WA': 9.2,
    'WV': 7.9,
    'WY': 0,
}
