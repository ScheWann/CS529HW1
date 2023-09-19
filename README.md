## Instructions
I divided the map into two parts, states and counties, to show different gun death distribution. Besides, it also includes a packed bubble chart for large US county data, a stacked bar chart to show each state detailed information, and an interaction scatter plot showing male and female victims by clicking the state in the map: multiple interactions and more detailed information to make the visualization of the whitehat.

## Data transformations
- Using county data to connect with stategundeath data to get each county gun death count.
- Using Gun death per 100,000 as a standard to completion in each state, county, and city.
- Due to some special domain in the US, which causes some of the miss of state abbreviations, connect with the state.csv to clean data.
- Using average to fill in the missed population and using the 'Unknown' to fill in some missed county names (because some county has been merged with other counties.) 

## References
- TopoJSON about US counties: https://github.com/topojson/us-atlas  
- List of states Abbreviations: https://github.com/jasonong/List-of-US-States/blob/master/states.csv
- The US county population: https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-total.html
- The US city information: https://simplemaps.com/data/us-cities
- Stack bar chart: https://observablehq.com/@stuartathompson/a-step-by-step-guide-to-the-d3-v4-stacked-bar-chart
- Packed bubble chart: https://observablehq.com/@johnhaldeman/tutorial-on-d3-basics-and-circle-packing-heirarchical-bubb

## ScreenShots
<img src="./public/state page.png">
<img src="./public/county page.png">