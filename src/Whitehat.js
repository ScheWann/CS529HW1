import React, {useRef, useMemo, useState, useEffect} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as topojson from "topojson";
import * as d3 from 'd3';

export default function Whitehat(props){
    
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);

    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);
    const stateFormFIPS = {
        "1": { "PostalAbbr": "AL", "State": "Alabama" },
        "2": { "PostalAbbr": "AK", "State": "Alaska" },
        "4": { "PostalAbbr": "AZ", "State": "Arizona" },
        "5": { "PostalAbbr": "AR", "State": "Arkansas" },
        "6": { "PostalAbbr": "CA", "State": "California" },
        "8": { "PostalAbbr": "CO", "State": "Colorado" },
        "9": { "PostalAbbr": "CT", "State": "Connecticut" },
        "10": { "PostalAbbr": "DE", "State": "Delaware" },
        "11": { "PostalAbbr": "DC", "State": "District of Columbia" },
        "12": { "PostalAbbr": "FL", "State": "Florida" },
        "13": { "PostalAbbr": "GA", "State": "Georgia" },
        "15": { "PostalAbbr": "HI", "State": "Hawaii" },
        "16": { "PostalAbbr": "ID", "State": "Idaho" },
        "17": { "PostalAbbr": "IL", "State": "Illinois" },
        "18": { "PostalAbbr": "IN", "State": "Indiana" },
        "19": { "PostalAbbr": "IA", "State": "Iowa" },
        "20": { "PostalAbbr": "KS", "State": "Kansas" },
        "21": { "PostalAbbr": "KY", "State": "Kentucky" },
        "22": { "PostalAbbr": "LA", "State": "Louisiana" },
        "23": { "PostalAbbr": "ME", "State": "Maine" },
        "24": { "PostalAbbr": "MD", "State": "Maryland" },
        "25": { "PostalAbbr": "MA", "State": "Massachusetts" },
        "26": { "PostalAbbr": "MI", "State": "Michigan" },
        "27": { "PostalAbbr": "MN", "State": "Minnesota" },
        "28": { "PostalAbbr": "MS", "State": "Mississippi" },
        "29": { "PostalAbbr": "MO", "State": "Missouri" },
        "30": { "PostalAbbr": "MT", "State": "Montana" },
        "31": { "PostalAbbr": "NE", "State": "Nebraska" },
        "32": { "PostalAbbr": "NV", "State": "Nevada" },
        "33": { "PostalAbbr": "NH", "State": "New Hampshire" },
        "34": { "PostalAbbr": "NJ", "State": "New Jersey" },
        "35": { "PostalAbbr": "NM", "State": "New Mexico" },
        "36": { "PostalAbbr": "NY", "State": "New York" },
        "37": { "PostalAbbr": "NC", "State": "North Carolina" },
        "38": { "PostalAbbr": "ND", "State": "North Dakota" },
        "39": { "PostalAbbr": "OH", "State": "Ohio" },
        "40": { "PostalAbbr": "OK", "State": "Oklahoma" },
        "41": { "PostalAbbr": "OR", "State": "Oregon" },
        "42": { "PostalAbbr": "PA", "State": "Pennsylvania" },
        "44": { "PostalAbbr": "RI", "State": "Rhode Island" },
        "45": { "PostalAbbr": "SC", "State": "South Carolina" },
        "46": { "PostalAbbr": "SD", "State": "South Dakota" },
        "47": { "PostalAbbr": "TN", "State": "Tennessee" },
        "48": { "PostalAbbr": "TX", "State": "Texas" },
        "49": { "PostalAbbr": "UT", "State": "Utah" },
        "50": { "PostalAbbr": "VT", "State": "Vermont" },
        "51": { "PostalAbbr": "VA", "State": "Virginia" },
        "53": { "PostalAbbr": "WA", "State": "Washington" },
        "54": { "PostalAbbr": "WV", "State": "West Virginia" },
        "55": { "PostalAbbr": "WI", "State": "Wisconsin" },
        "56": { "PostalAbbr": "WY", "State": "Wyoming" },
        "60": { "PostalAbbr": "AS", "State": "American Samoa" },
        "66": { "PostalAbbr": "GU", "State": "Guam"},
        "69": { "PostalAbbr": "MP", "State": "Northern Mariana Islands" },
        "72": { "PostalAbbr": "PR", "State": "Puerto Rico" },
        "78": { "PostalAbbr": "VI", "State": "Virgin Islands" },
    };

    var isZoomed = false;

    //albers usa projection puts alaska in the corner
    //this automatically convert latitude and longitude to coordinates on the svg canvas
    const projection = d3.geoAlbersUsa().translate([width/2,height/2]);

    //set up the path generator to draw the states
    const geoGenerator = d3.geoPath().projection(projection);

    //we need to use this function to convert state names into ids so we can select individual states by name using javascript selectors
    //since spaces makes it not work correctly
    function cleanString(string){
        return string.replace(' ','_').replace(' ','_')
    }

    //This is the main loop that renders the code once the data loads
    const mapGroupSelection = useMemo(()=>{
        console.log(props.stateCountyToggle, 'lplplplplp')
        //wait until the svg is rendered and data is loaded
        if(svg !== undefined & props.map !== undefined & props.data !== undefined){

            //for return a map finally
            let outputMap = {};
            const stateData = props.data.states;
            const countyData = props.data.counties;
            
            //calucate the gun death rate per 100000
            const getEncodedFeature = d => Math.round(((d.count * 100000) / d.population) * 10) / 10


            //this section of code sets up the colormap
            //get each state count of gunshot
            const stateCounts = Object.values(stateData).map(getEncodedFeature);
            const countyCounts = Object.values(countyData).map(getEncodedFeature);
            
            //get color extends for the color legend
            const [stateMin, stateMax] = d3.extent(stateCounts);
            const [countyMin, countyMax] = d3.extent(countyCounts)

            //color map scale, scales numbers to a smaller range to use with a d3 color scale
            const stateScale = d3.scaleLinear()
                .domain([stateMin, stateMax])
                .range([0, 4]);

            const countyScale = d3.scaleLinear()
                .domain([countyMin, countyMax])
                .range([0, 100]);
            //this function takes a number 0-1 and returns a color
            
            const colorMap = d3.interpolateBlues


            //this set of functions extracts the features given the state name from the geojson
            function getStateCount(name){
                //map uses full name, dataset uses abreviations
                name = cleanString(name);
                let entry = stateData.filter(d=>d.state===name);
                if(entry === undefined | entry.length < 1){
                    return 0
                }
                return getEncodedFeature(entry[0]);
            }

            function getCountyCount(id, name) {
                //convert county id to state id based on FIPS to match
                let stateName = stateFormFIPS[(Math.floor(id / 1000)).toString()].State
                let entry = countyData.filter(d => (d.state===stateName && d.county === name));
                if(entry === undefined | entry.length < 1){
                    return 0
                }
                return getEncodedFeature(entry[0]);
            }

            function getStateVal(name){
                let count = getStateCount(name);
                let val = stateScale(count);
                return val
            }

            function getCountyVal(id, name) {
                let count = getCountyCount(id, name);
                let val = countyScale(count);
                return val
            }

            //get state tip data
            function getStateTipData(name) {
                let entry = stateData.filter(d=>d.state===name);
                if(entry === undefined | entry.length < 1){
                    return {
                        rate: 0,
                        population: 'unknown',
                        state: name,
                        count: 0
                    }
                }
                let countyDir = {
                    rate: getEncodedFeature(entry[0]),
                    population: entry[0].population,
                    state: entry[0].abreviation,
                    count: entry[0].count
                }
                return countyDir
            }

            //get county tip data
            function getCountyTipData(id, name) {
                let stateName = stateFormFIPS[(Math.floor(id / 1000)).toString()].State
                let entry = countyData.filter(d => (d.state===stateName && d.county === name));
                if(entry === undefined | entry.length < 1){
                    return {
                        rate: 0,
                        population: 'unknown',
                        state: stateName,
                        count: 0
                    }
                }
                let countyDir = {
                    rate: getEncodedFeature(entry[0]),
                    population: entry[0].population,
                    state: entry[0].abreviation,
                    count: entry[0].count
                }
                return countyDir
            }
            function getStateColor(d) {
                return colorMap(getStateVal(d.properties.name))
            }

            function getCountyColor(d) {
                return colorMap(getCountyVal(d.id, d.properties.name))
            }

            //draw states map
            function drawStateMap() {
                let stateMapGroup = svg.append('g').attr('class','stateBox');
                stateMapGroup.selectAll('path').filter('.state')
                .data(topojson.feature(props.map, props.map.objects.states).features).enter()
                .append('path').attr('class', 'state')
                .attr('id',d => cleanString(d.properties.name))
                .attr('d', geoGenerator)
                .attr('fill',getStateColor)
                .attr('stroke','black')
                .attr('stroke-width',.1)   
                .on('mouseover',(e,d)=>{                   
                    let state = cleanString(d.properties.name);
                    //this updates the brushed state
                    if(props.brushedState !== state){
                        props.setBrushedState(state);
                    }
                    console.log(props.brushedState, state, 'now what is that')
                    let sname = d.properties.name;
                    let stateTip = getStateTipData(sname);
                    let text = '<strong>' + sname + '</strong>' + '</br>'
                        + '<div class="toolTipTextStyle">' + 'Gun Deaths per 100000:&nbsp;&nbsp;' + '<p class="toolTipFont">' + stateTip.rate + '</p>' + '</div>'
                        + '<div class="toolTipTextStyle">' + 'Victims:&nbsp;&nbsp; ' + '<p class="toolTipFont">' + stateTip.count + '</p>'+ '</div>'
                        + '<div class="toolTipTextStyle">' + 'Population:&nbsp;&nbsp; ' + '<p class="toolTipFont">' + stateTip.population + '</p>' + '</div>'
                    d3.select(`[id="${d.id}"]`)
                        .style("stroke", "#666")
                        .style("stroke-width", 1.5)
                    tTip.html(text);
                }).on('mousemove',(e)=>{
                    props.ToolTip.moveTTipEvent(tTip,e);
                }).on('mouseout',(e,d)=>{
                    d3.select(`[id="${d.id}"]`)
                        .style("stroke", "black")
                        .style("stroke-width", .1)
                    props.setBrushedState();
                    props.ToolTip.hideTTip(tTip);
                });

                //draw a state legend
                function drawStateLegend(){
                    let bounds = stateMapGroup.node().getBBox();
                    const barHeight = Math.min(height/10,40);
                    
                    let legendX = bounds.x + 100 + bounds.width;
                    const barWidth = Math.min((width - legendX)/3,40);
                    const fontHeight = Math.min(barWidth/2,16);
                    let legendY = bounds.y + 5*fontHeight;
                    
                    let colorLData = [];
    
                    let legendTempArr = [0, 1, 2, 3, 4, 5]
                    for(let i = 0; i < legendTempArr.length; i++) {
                        let val = stateScale(legendTempArr[i]);
                        let color = colorMap(val);
                        let entry = {
                            'x': legendX,
                            'y': legendY,
                            'value': legendTempArr[i],
                            'color':color,
                        }
                        if(i === legendTempArr.length - 1){
                            entry.text = `${entry.value}+`
                        } else {
                            entry.text = (entry.value).toFixed(0);
                        }       
                        colorLData.push(entry);
                        legendY += barHeight;
                    }
                    svg.selectAll('.legendRect').remove();
                    svg.selectAll('.legendRect')
                        .data(colorLData).enter()
                        .append('rect').attr('class','legendRect')
                        .attr('x',d=>d.x)
                        .attr('y',d=>d.y)
                        .attr('fill',d=>d.color)
                        .attr('height',barHeight)
                        .attr('width',barWidth);
    
                    svg.selectAll('.legendText').remove();
                    const legendTitle = {
                        'x': legendX - 90,
                        'y': bounds.y,
                        'text': 'Gun Deaths per 100000' 
                    }
                    svg.selectAll('.legendText')
                        .data([legendTitle].concat(colorLData)).enter()
                        .append('text').attr('class','legendText')
                        .attr('x',d=>d.x+barWidth+5)
                        .attr('y',d=>d.y+barHeight/2 + fontHeight/4)
                        .attr('font-size',(d,i) => i == 0? 1.2*fontHeight:fontHeight)
                        .text(d=>d.text);
                }

                drawStateLegend()   
                
                return stateMapGroup
            }
            
            //draw county map
            function drawCountyMap() {
                let countyMapGroup = svg.append('g').attr('class','countybox');
                countyMapGroup.append("g")
                .selectAll("path")
                .data(topojson.feature(props.map, props.map.objects.counties).features).enter()
                .append("path").attr("class", "county")
                .attr('id',d=> cleanString(d.properties.name))
                .attr("d", geoGenerator)
                .attr('fill',getCountyColor)
                .attr('stroke','black')
                .attr('stroke-width',.1)   
                .on('mouseover',(e,d)=>{
                    let county = cleanString(d.properties.name);
                    //this updates the brushed county
                    if(props.brushedCounty !== county){
                        props.setBrushedCounty(county);
                    }
                    let cname = d.properties.name;
                    let countyTip = getCountyTipData(d.id, cname);
                    let text = '<strong>' + cname + ', ' + countyTip.state + '</strong>' + '</br>'
                        + '<div class="toolTipTextStyle">' + 'Gun Deaths per 100000:&nbsp;&nbsp;' + '<p class="toolTipFont">' + countyTip.rate + '</p>' + '</div>'
                        + '<div class="toolTipTextStyle">' + 'Victims:&nbsp;&nbsp; ' + '<p class="toolTipFont">' + countyTip.count + '</p>'+ '</div>'
                        + '<div class="toolTipTextStyle">' + 'Population:&nbsp;&nbsp; ' + '<p class="toolTipFont">' + countyTip.population + '</p>' + '</div>'
                    d3.select(`[id="${d.id}"]`)
                        .style("stroke", "#666")
                        .style("stroke-width", 1.5)
                    tTip.html(text);
                }).on('mousemove',(e)=>{
                    props.ToolTip.moveTTipEvent(tTip,e);
                }).on('mouseout',(e,d)=>{
                    d3.select(`[id="${d.id}"]`)
                        .style("stroke", "black")
                        .style("stroke-width", .1)
                    props.setBrushedCounty();
                    props.ToolTip.hideTTip(tTip);
                });
                            
                //draw a county color legend
                function drawCountyLegend(){
                    let bounds = countyMapGroup.node().getBBox();
                    const barHeight = Math.min(height/10,40);
                    
                    let legendX = bounds.x + 100 + bounds.width;
                    const barWidth = Math.min((width - legendX)/3,40);
                    const fontHeight = Math.min(barWidth/2,16);
                    let legendY = bounds.y + 5*fontHeight;
                    
                    let colorLData = [];
    
                    let legendTempArr = [0, 1, 2, 3, 4, 5]
                    for(let i = 0; i < legendTempArr.length; i++) {
                        let val = countyScale(legendTempArr[i]);
                        let color = colorMap(val);
                        let entry = {
                            'x': legendX,
                            'y': legendY,
                            'value': legendTempArr[i],
                            'color':color,
                        }
                        if(i === legendTempArr.length - 1){
                            entry.text = `${entry.value}+`
                        } else {
                            entry.text = (entry.value).toFixed(0);
                        }       
                        colorLData.push(entry);
                        legendY += barHeight;
                    }
                    svg.selectAll('.legendRect').remove();
                    svg.selectAll('.legendRect')
                        .data(colorLData).enter()
                        .append('rect').attr('class','legendRect')
                        .attr('x',d=>d.x)
                        .attr('y',d=>d.y)
                        .attr('fill',d=>d.color)
                        .attr('height',barHeight)
                        .attr('width',barWidth);
    
                    svg.selectAll('.legendText').remove();
                    const legendTitle = {
                        'x': legendX - 90,
                        'y': bounds.y,
                        'text': 'Gun Deaths per 100000' 
                    }
                    svg.selectAll('.legendText')
                        .data([legendTitle].concat(colorLData)).enter()
                        .append('text').attr('class','legendText')
                        .attr('x',d=>d.x+barWidth+5)
                        .attr('y',d=>d.y+barHeight/2 + fontHeight/4)
                        .attr('font-size',(d,i) => i == 0? 1.2*fontHeight:fontHeight)
                        .text(d=>d.text);
                }

                drawCountyLegend(); 

                return countyMapGroup
            }

            if(props.stateCountyToggle === "county") {
                svg.selectAll('g').remove();
                outputMap = drawCountyMap()
            } else {
                svg.selectAll('g').remove();
                outputMap = drawStateMap()
            }

            return outputMap
        }
    },[svg, props.map, props.data, props.stateCountyToggle])

    //This adds zooming. Triggers whenever the function above finishes
    //this section can be included in the main body but is here as an example 
    //of how to do multiple hooks so updates don't have to occur in every state
    useMemo(()=>{
        if(mapGroupSelection === undefined){ return }
        
        //set up zooming
        function zoomed(event) {
            const {transform} = event;
            mapGroupSelection
                .attr("transform", transform)
                .attr("stroke-width", 1 / transform.k);
        }

        const zoom = d3.zoom()
            .on("zoom", zoomed);

        //OPTIONAL: EDIT THIS CODE TO CHANGE WHAT HAPPENS WHEN YOU CLICK A STATE
        //useful if you want to add brushing
        function clicked(event, d) {
            event.stopPropagation();
            if(isZoomed){
                mapGroupSelection.transition().duration(300).call(
                    zoom.transform,
                    d3.zoomIdentity.translate(0,0),
                    d3.pointer(event, svg.node())
                )         
            }
            else{
                //get bounds of path from map
                const [[x0, y0], [x1, y1]] = geoGenerator.bounds(d);

                //zoom to bounds
                mapGroupSelection.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.pointer(event, svg.node())
                );
            }

            //sets the zoomed state property in the main app when we click on something
            //if we are zoomed in, unzoom instead
            isZoomed = !isZoomed;
            if(isZoomed){
                props.setZoomedState(d.properties.name);
            } else{
                props.setZoomedState(undefined);
            }
        }

        if(props.stateCountyToggle === 'county') {
            mapGroupSelection.selectAll('.county')
            .attr('cursor','pointer')
            .on('click',clicked);
        } else {
            mapGroupSelection.selectAll('.state')
            .attr('cursor','pointer')
            .on('click',clicked);
        }

    },[mapGroupSelection, props.stateCountyToggle]);

    //OPTIONAL: EDIT HERE TO CHANGE THE BRUSHING BEHAVIOUR IN THE MAP WHEN MOUSING OVER A STATE
    //WILL UPDATE WHEN THE "BRUSHEDSTATE" VARIABLE CHANGES
    //brush the state by altering it's opacity when the property changes
    //brushed state can be on the same level but that makes it harder to use in linked views
    //so its in the parent app to simplify the "whitehat" part which uses linked views.
    useMemo(()=>{
        if(mapGroupSelection !== undefined){
            console.log(props.stateCountyToggle, 'k000k')
            if(props.stateCountyToggle === "state") {
                const isStateBrushed = props.brushedState !== undefined;
                mapGroupSelection.selectAll('.state')
                    .attr('opacity', isStateBrushed ? .4: 1)
                    .attr('strokeWidth', isStateBrushed ? 1: 2);
                if(isStateBrushed){
                    mapGroupSelection.select('#'+props.brushedState)
                        .attr('opacity',1)
                        .attr('strokeWidth',3);
                }
            } else {
                const isCountyBrushed = props.brushedCounty !== undefined;
                mapGroupSelection.selectAll('.county')
                    .attr('opacity', isCountyBrushed ? .4: 1)
                    .attr('strokeWidth', isCountyBrushed ? 1: 2);
                if(isCountyBrushed){
                    mapGroupSelection.select('#'+props.brushedCounty)
                        .attr('opacity',1)
                        .attr('strokeWidth',3);
                }
            }
        }
    },[mapGroupSelection,props.brushedState, props.brushedCounty, props.stateCountyToggle]);
    
    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}
