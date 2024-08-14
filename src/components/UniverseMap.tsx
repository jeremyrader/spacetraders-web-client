'use client'

import { Layer, Circle } from 'react-konva';
import { useState, useRef, useEffect, useContext } from 'react';
import React from 'react';
import Konva from 'konva';
import DataContext from '../contexts/DataContext';

import Map from './Map'
import MapControls from './MapControls';
import System from './System'
import Nebula from './Nebula'

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getRandomPointInCircle(radius: number) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const r = radius * Math.sqrt(Math.random()); // Random radius within the circle
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    distance: r, // Include the distance from the center
  };
}

// Function to randomly choose a color spectrum and generate a star color
function getRandomStarColor() {
  const spectrum = getRandomInt(1, 3); // Randomly choose between 1 and 3
  switch (spectrum) {
    case 1:
      return getRandomBlue();
    case 2:
      return getRandomRed();
    case 3:
      return getRandomYellow();
    default:
      return 'white';
  }
}

// Function to generate a random blue color
function getRandomBlue() {
  const blue = getRandomInt(200, 255);
  const green = getRandomInt(100, 180);
  const red = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

// Function to generate a random red color
function getRandomRed() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(0, 100);
  const blue = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

// Function to generate a random yellow color
function getRandomYellow() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(200, 255);
  const blue = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

// Function to generate a random orange color
function getRandomOrange() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(100, 150);
  const blue = getRandomInt(0, 50);
  return `rgb(${red}, ${green}, ${blue})`;
}

interface UniverseMapProps {
  onSelectMap: Function;
}

const UniverseMap = ({ onSelectMap }: UniverseMapProps) => {
  const context = useContext(DataContext);
  const dataContext = useContext(DataContext);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({x: 0, y: 0});
  const [selectedStar, setSelectedStar] = useState<System | null>(null);

  const massiveCircleCenter = {
    x: 0,
    y: 0,
  };
  const massiveCircleRadius = 60000; // Radius of the massive circle

  // TODO: Handle at ingestion time
  // Generate nebulas only once and store in state
  const [nebulas] = useState(() => {
    const nebulas = [];
    const numNebulas = 10000; // Attempt to generate 50 nebulas

    for (let i = 0; i < numNebulas; i++) {
      const point = getRandomPointInCircle(massiveCircleRadius);

      // Calculate the probability of placing a nebula based on distance
      const probability = 1 - point.distance / massiveCircleRadius;

      if (Math.random() < probability) {
        nebulas.push({
          x: massiveCircleCenter.x + point.x,
          y: massiveCircleCenter.y + point.y,
          radius: getRandomInt(1000, 2000), // Large radius for diffuse nebula
          color1: `rgba(${getRandomInt(100, 255)}, ${getRandomInt(50, 150)}, ${getRandomInt(150, 255)}, ${getRandomFloat(0.2, 0.5)})`,
          color2: `rgba(${getRandomInt(50, 150)}, ${getRandomInt(0, 100)}, ${getRandomInt(100, 200)}, 0)`, // Fade to transparent
        });
      }
    }

    return nebulas;
  });

  if (!context) {
    throw new Error('DataContext must be used within a DataProvider');
  }

  const handleStarClick = (star: System) => {
    setSelectedStar(star);
  };

  const handleEnterSystemClick = (star: System | null) => {

    if (star) {
      onSelectMap('system', star)
    }
  }

  const UniverseMapControls = () => {
    return (
      <MapControls onSelectMap={onSelectMap}>
        <button disabled={!selectedStar} onClick={() => handleEnterSystemClick(selectedStar)} className="btn btn-primary">View System Map</button>
      </MapControls>
    )
  }

  useEffect(() => {

    const fetchData = async () => {
      if (dataContext) {
        try {
          const dbData = await dataContext.getDataFromDB();

          // TODO: handle this at ingestion time
          dbData.forEach(datum => {
            const { x, y, symbol, type, waypoints } = datum;

            let fill = "white"
            let radius = 30

            let types = [
              'BLACK_HOLE',
              'ORANGE_STAR',
              'BLUE_STAR',
              'RED_STAR',
              'YOUNG_STAR',
              'WHITE_DWARF',
              'HYPERGIANT',
              'UNSTABLE',
              'NEUTRON_STAR'
            ]

            if (type == 'BLACK_HOLE') {
              fill = "gray"
              radius = getRandomInt(5,10)
            }

            if (type == 'ORANGE_STAR') {
              fill = getRandomOrange()
              radius = getRandomInt(15,20)
            }

            if (type == 'BLUE_STAR') {
              fill = getRandomBlue()
              radius = getRandomInt(25,28)
            }

            if (type == 'RED_STAR') {
              fill = getRandomRed()
              radius = getRandomInt(15, 25)
            }

            if (type == 'YOUNG_STAR') {
              fill = getRandomStarColor()
              radius = getRandomInt(20,25)
            }

            if (type == 'WHITE_DWARF') {
              fill = 'white'
              radius = getRandomInt(10,15)
            }

            if (type == 'HYPERGIANT') {
              fill = getRandomStarColor()
              radius = getRandomInt(28,30)
            }

            if (type == 'UNSTABLE') {
              fill = getRandomStarColor()
              radius = 15
            }

            if (type == 'NEUTRON_STAR') {
              fill = "white"
              radius = getRandomInt(10,15)
            }

            if (!types.includes(type)) {
              console.log(type)
            }

            datum.color = fill
            datum.size = radius

          })

          setPoints(dbData);

          const mapCenterSymbol = window.localStorage.getItem('map-center-symbol')

          if (mapCenterSymbol) {
            const symbolParts = mapCenterSymbol.split('-')
            const mapCenter = dbData.find(datum => datum.symbol == `${symbolParts[0]}-${symbolParts[1]}`)

            if (mapCenter) {
              setMapCenter({x: mapCenter.x, y: mapCenter.y})
            }
          }
        } catch (error) {
          console.error('Error fetching data from IndexedDB:', error);
        } finally {
        }
      }
    };

    fetchData();

  }, [dataContext]);

  return <div ref={containerRef} className='border-4 border-white'>
    <Map
      containerRef={containerRef}
      maxZoom={1}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
      mapCenter={mapCenter}
      MapControls={UniverseMapControls}
    >
      {/* Background Nebula Layer */}
      <Layer>
        {
          nebulas.map((nebula, index) => (
            <Nebula
              key={index}
              x={nebula.x}
              y={nebula.y}
              radius={nebula.radius}
              color1={nebula.color1}
              color2={nebula.color2}
              zoomLevel={zoomLevel}
            />
          ))
        }
      </Layer>
      {/* Selected star */}
      <Layer>
      {
        selectedStar && (
          <Circle
            x={selectedStar.x}
            y={-selectedStar.y}
            radius={20} // Larger circle
            stroke="white"
            strokeWidth={2}
            opacity={0.5}
          />
        )}
      </Layer>
      {/* System stars */}
      <Layer ref={layerRef}>
        {
          points.map((point, index) => {
            return (
              <System
                key={index}
                system={point}
                zoomLevel={zoomLevel}
                onSystemClick={handleStarClick}
              />
            )
          })
        }
      </Layer>
    </Map>
  </div>
}

export default UniverseMap;
