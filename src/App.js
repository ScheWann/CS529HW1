import React, {useState,useEffect, useMemo} from 'react';
import { Tabs } from 'antd';
import { EnvironmentOutlined, GlobalOutlined} from '@ant-design/icons';
import './App.css';
import Whitehat from './Whitehat';
import WhiteHatStats from './WhiteHatStats'
import Blackhat from './Blackhat';
import BlackHatStats from './BlackHatStats';
import * as d3 from 'd3';


function App() {
  // black or white tabs definations
  const appItems = [
    {
      key: 'white',
      label: 'White Hat'
    },
    {
      key: 'black',
      label: 'Black Hat',
    }
  ];

  // state or county tabs defination
  const stateCountyItems = [
    {
      key: 'State',
      label: (
        <span>
          <GlobalOutlined />
          State
        </span>
      ),
    },
    {
      key: 'County',
      label: (
        <span>
          <EnvironmentOutlined />
          County
        </span>
      ),
    }
  ];

  //state deciding if we are looking at the blackhat or whitehat visualization
  const [hatView, setHatView] = useState('whitehat');
  const [stateCountyView, setStateCountyView] = useState('state');

  //state for the data, since it loads asynchronously
  const [whitemap, setwhiteMap] = useState();
  const [blackmap, setblackMap] = useState();

  const [gunData, setGunData] = useState();

  //at the top level and pass setZoomedState etc to the map
  //so we can do brushing accross multiple components
  const [zoomedState, setZoomedState] = useState();
  const [zoomedCounty, setZoomedCounty] = useState();

  const [selectedStuff, setSelectedStuff] = useState();

  const [brushedState, setBrushedState] = useState();
  const [brushedCounty, setBrushedCounty] = useState();

  //filter for the linked view in whitehat stats
  const [sortKey,setSortKey] = useState('age');

  //load map contours
  //react looks into the '/public' folder by default
  async function fetchMap(){
    fetch('us-states.geojson').then(paths=>{
      paths.json().then(data=>{
        setblackMap(data);
      })
    })
    d3.json('counties-10m.json').then(data => {
      setwhiteMap(data);
    })
  }

  //fetch gun data and attach a timestamp to make sorting dates easier for filters
  async function fetchGunData(){
    fetch('new_processed_gundeaths_data.json').then(d => {
      d.json().then(gd=>{
        console.log('gundata',gd)
        setGunData(gd);
      })
    })
  }

  //function on clicking the tabs
  const onChangeHats = (key) => {
    if(key == 'white') {
      setHatView('whitehat')
    } else {
      setHatView('blackhat')
    }
  };

  const onChangeStateCounty = (key) => {
    if(key == 'State') {
      setStateCountyView('state')
    } else {
      setStateCountyView('county')
    }
  };

  //fetch data, called only once
  useEffect(()=>{
    fetchMap();
    fetchGunData()
  },[])

 
  //called to draw the whitehat visualization
  function makeWhiteHat(){
    
        return (
          <>
            <div style={{'width':'100%','height':'100%','display':'flex','alignItems':'center'}}>
              <div 
                style={{'height': '100%','width':'calc(100% - 15em)','display':'inline-block'}}
              >
                  <Whitehat
                    map={whitemap}
                    data={gunData}
                    ToolTip={ToolTip}
                    stateCountyToggle={stateCountyView}
                    setSelectedStuff={setSelectedStuff}
                    zoomedState={zoomedState}
                    zoomedCounty={zoomedCounty}
                    setZoomedCounty={setZoomedCounty}
                    setZoomedState={setZoomedCounty}
                    brushedState={brushedState}
                    setBrushedState={setBrushedState}
                    brushedCounty={brushedCounty}
                    setBrushedCounty={setBrushedCounty}
                  />
              </div>
              <div 
                className={'shadow'}
                style={{'height': '50%','width':'14em','display':'inline-block','verticalAlign':'text-bottom'}}
              >
                <Tabs
                // style={{'marginTop': 20}}
                  centered
                  // type="card"
                  size='small'
                  defaultActiveKey="white"
                  items={stateCountyItems}
                  onChange={onChangeStateCounty}
                />
              </div>
            </div>
            {/* <div style={{'height': '49%','width':'99%'}}>
              <div className={'title'} 
                style={{'height':'2em','width':'100%','fontWeight':'bold','fontFamily':'Georgia'}}
              >
                {'Gun Deaths'}
              </div>
              <div style={{'height': 'calc(100% - 2em)','width': '50%','maxWidth': '60em','marginLeft':'25%'}}>
                <WhiteHatStats
                  data={gunData}
                  ToolTip={ToolTip}
                  brushedState={brushedState}
                  setBrushedState={setBrushedState}
                  zoomedState={zoomedState}
                />     
              </div>   
            </div> */}
          </>
        )
      }

  //function for a simpler chloropleth map
  function makeBlackHat(){

    return (
      <>
        <div style={{'width':'100%','height':'50%','display':'inline-block'}}>
          <div 
            style={{'height': '100%','width':'calc(100% - 15em)','display':'inline-block'}}
          >
              <Blackhat
                map={blackmap}
                data={gunData}
                ToolTip={ToolTip}
                zoomedState={zoomedState}
                setSelectedStuff={setSelectedStuff}
                setZoomedState={setZoomedState}
                brushedState={brushedState}
                setBrushedState={setBrushedState}
              />
          </div>
          <div 
            className={'shadow'}
            style={{'height': '100%','width':'14em','display':'inline-block','verticalAlign':'text-bottom'}}
          >
            <h1>{'Instructions'}</h1>
            <p>{'Click on each state to zoom and unzoom'}</p>
          </div>
        </div>
        <div style={{'height': '49%','width':'99%'}}>
          <div className={'title'} 
            style={{'height':'2em','width':'100%','fontWeight':'bold','fontFamily':'Georgia'}}
          >
            {'Gun Deaths'}
          </div>
          <div style={{'height': 'calc(100% - 2em)','width': '50%','maxWidth': '60em','marginLeft':'25%'}}>
            <BlackHatStats
              data={gunData}
              ToolTip={ToolTip}
            />     
          </div>   
        </div>
      </>
    )
  }

  //toggle which visualization we're looking at based on the "viewToggle" state
  const hat = ()=>{
    if(hatView === 'whitehat'){
      return makeWhiteHat();
    }
    else{
      return makeBlackHat();
    }
  }

  return (
    <div className="App">
      <div className={'header'}
        style={{'height':'2em','width':'100vw'}}
      >
          <Tabs
            centered
            defaultActiveKey="white"
            items={appItems}
            onChange={onChangeHats}
          />
      </div>
      <div className={'body'} 
        style={{'height':'calc(100vh - 2.5em)','width':'100vw'}}
        >
        {hat()}
      </div>
    </div>
  );
}


class ToolTip {
  static moveTTip(tTip, tipX, tipY){
    var tipBBox = tTip.node().getBoundingClientRect();
    while(tipBBox.width + tipX > window.innerWidth){
        tipX = tipX - 10 ;
    }
    while(tipBBox.height + tipY > window.innerHeight){
        tipY = tipY - 10 ;
    }
    tTip.style('left', tipX + 'px')
        .style('top', tipY + 'px')
        .style('visibility', 'visible')
        .style('z-index', 1000);
  }

  static moveTTipEvent(tTip, event){
      var tipX = event.pageX + 30;
      var tipY = event.pageY -20;
      this.moveTTip(tTip,tipX,tipY);
  }


  static hideTTip(tTip){
      tTip.style('visibility', 'hidden')
  }

  static addTTipCanvas(tTip, className, width, height){
      tTip.selectAll('svg').selectAll('.'+className).remove();
      let canvas = tTip.append('svg').attr('class',className)
          .attr('height',height).attr('width',width)
          .style('background','white');
      return canvas
  }
}

export default App;
