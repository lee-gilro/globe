
import  React,{useReducer,useRef,useEffect,useState} from "react";
import Globe from 'react-globe.gl';
import XLSX from 'xlsx';
import {countries} from './countries'



const initialState = "unloaded";

function reducer(state, action) {
  switch (action.type) {
    case 'load':
      return "loaded";
    default:
      return state;
  }
}

function GlobeComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const[places,setPlaces] = useState([]);
  const[arcs,setArcs] = useState();

  const fetchData = async () => {
    try {
      let response = await fetch("/datasets/worldcities.xlsx");
      let json = await response.arrayBuffer();
      return { success: true, data: json };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }  
  useEffect(() => {
    (async () => {
      if (state==="unloaded"){
        let res = await fetchData();
        if (res.success) {
          const wb = XLSX.read(res.data, { type: "array" });
                  const wc = wb.Sheets["worldcities"];
                  const arcs=wb.Sheets["transactions"];
                  const wc_data = XLSX.utils.sheet_to_json(wc, {header:1});
                  const arcs_data= XLSX.utils.sheet_to_json(arcs, {header:1});
                  var lon_=[]
                  var lat_=[]
                  var pop=[]
                  var cities=[]
                  var places_=[];
                  wc_data.map( data=>{
                      lon_.push(data[2]);
                      lat_.push(data[1]);
                      pop.push("0.3");
                      cities.push(data[0]);
                      return 1;
  
                  });
                  lon_.shift();
                  lat_.shift();
                  pop.shift();
                  cities.shift();
                  cities.forEach((city, index) => {
                      places_.push({
                              lat:lat_[index],
                              lng:lon_[index],
                              size: pop[index],
                              city:city

                            }
                      )
                    }); 

                    var arc_start_lat=[];
                    var arc_start_lon=[];
                    var arc_end_lon=[];
                    var arc_end_lat=[];
                    var start_city=[];
                    var end_city=[];
                    var _currentTransaction=""
                    arcs_data.map( data=>{
                     if (_currentTransaction===data[0]){
                           if(data[1]==="end"){
                            end_city.push(data[2]);
                            arc_end_lat.push(data[3]);
                            arc_end_lon.push(data[4]);
                           }
                     } else{
                      if(data[1]==="start"){
                        start_city.push(data[2]);
                        arc_start_lat.push(data[3]);
                        arc_start_lon.push(data[4]);
                        _currentTransaction=data[0];
                     }}
                        return 1;
                   
  
                  });
                  var transaction=[];
                  end_city.forEach((city, index) => {
                    transaction.push({
                            startlat:arc_start_lat[index],
                            startlng:arc_start_lon[index],
                            endlat:arc_end_lat[index],
                            endlng:arc_end_lon[index],
                            label:start_city[index]+" to "+city
                          }
                    )
                  }); 
                    console.log(arcs_data)
                    setArcs(transaction);
                    setPlaces(places_);
                    dispatch({type:"load"});
        }
      
            }
            else if( state==="loaded") {
                
            }
     
    })();
  });

const globeEl =useRef()


return <>
    <Globe
    ref={globeEl}
    globeImageUrl={"/images/earth-night.jpg"}
    backgroundImageUrl={"/images/night-sky.png"}
    arcsData={arcs}
    arcStartLat={d => +d.startlat}
    arcStartLng={d => +d.startlng}
    arcEndLat={d => +d.endlat}
    arcEndLng={d => +d.endlng}
    arcDashLength={0.25}
    arcDashGap={1}
    arcLabel={d=>+d.label}
    arcDashInitialGap={() => Math.random()}
    arcDashAnimateTime={4000}
    arcColor={() => "#9cff00"}
    arcsTransitionDuration={0}
    pointsData={places.slice(0,20000)}
    pointColor={() => "#FFFF00"}
    pointAltitude={0.01}
    pointLabel={"city"}
    pointRadius="size"
    hexPolygonsData={countries.features}
    hexPolygonResolutio={3}
    hexPolygonMargin={0.1}
    hexPolygonColor={() =>"rgba(255,255,255, 1)"}
    showAtmosphere={false}
    // onPointClick={} 
    />;

</>;
}
export default GlobeComponent