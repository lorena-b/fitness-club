import ReactMapGL, { Marker, NavigationControl } from "react-map-gl";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG9yZW5hYjIyIiwiYSI6ImNsYjVtbHQ0ZDA4NHIzd3Jyc3E4cGJqMHMifQ.hJa4nhmH2o5xSF7NKa8d0A'

export default function Map(props) {
    const { lat, lng } = props.location;
    const { address, useCurrentLocation, userLoc } = props;
  
    const [viewport, setViewport] = useState({
      latitude: lat,
      longitude: lng,
      width: "100vw",
      height: "100vh",
      zoom: 10
    });

    const navigate = useNavigate();
  
    useEffect(() => {
        setViewport({ 
          latitude: lat,
          longitude: lng
        });
  
    }, [lat, lng]);
  
    return (
      <ReactMapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        onViewportChange={(viewport) => setViewport(viewport)}
        onMove={evt => setViewport(evt.viewState)}
      >
        <NavigationControl />
        <Marker 
        key={'user'} 
        latitude={lat} 
        longitude={lng} 
        color="red">

        </Marker>
        {props.studios && props.studios.map((studio) => (
          <Marker
            key={studio.id}
            latitude={studio.latitude}
            longitude={studio.longitude}
            onClick={() => navigate(`/studios/${studio.id}`, {state: {inputAddress: address, useCurrentLocation: useCurrentLocation, userLoc: userLoc}})}
          >
          </Marker>
        ))}
      </ReactMapGL>
    );
  }