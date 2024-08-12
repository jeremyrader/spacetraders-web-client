"use client";

import { Layer, Group, Circle, Rect, Text } from 'react-konva';
import { useState, useRef, useEffect, useContext } from 'react';
import React from 'react';
import Konva from 'konva';
import DataContext from '../contexts/DataContext';

import Map from './Map'

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomPointInCircle(radius) {
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

function UniverseMap({ hq, onSelectMap }) {
  const context = useContext(DataContext);
  const dataContext = useContext(DataContext);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [headquarters, setHeadquarters] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });
  const [selectedStar, setSelectedStar] = useState<any>(null);

  const massiveCircleCenter = {
    x: 0,
    y: 0,
  };
  const massiveCircleRadius = 60000; // Radius of the massive circle

  let minX= 10 ^ 6
  let minY = 10 ^ 6
  let maxX = -10 ^ 6
  let maxY = -10 ^ 6

  points.forEach(point => {
    if (point.x < minX) {
      minX = point.x
    }
    if (point.y < minY) {
      minY = point.y
    }
    if (point.x > maxX) {
      maxX = point.x
    }
    if (point.y > maxY) {
      maxY = point.y
    }
  })

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

  const handleStarClick = (star, index) => {
    // onSelectMap('system', star)
    setSelectedStar(star);
  };

  const handleEnterSystemClick = (star) => {
    onSelectMap('system', star)
  }

  useEffect(() => {

    const fetchData = async (headq) => {
      if (dataContext) {
        try {
          const dbData = await dataContext.getDataFromDB();

          let hq = dbData.find(data => data.symbol === headq)

          if (hq) {
            setHeadquarters(hq)
          }

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
          
        } catch (error) {
          console.error('Error fetching data from IndexedDB:', error);
        } finally {
        }
      }
    };

    fetchData(hq);

  }, [dataContext]);

  const calculateOpacity = (scale) => {
    if (scale >= 1) return 1;
    if (scale <= 0.02) return 0;
    return (scale - 0.005) / (.2 - 0.005); // Linear interpolation
  };

  return <div ref={containerRef} className='border-4 border-white'>
    {
      selectedStar ? (
        <button onClick={() => handleEnterSystemClick(selectedStar)} className="btn btn-primary">View System Map</button>
      ) : null
    }
    <Map
      containerRef={containerRef}
      maxZoom={1}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
    >

      {/* Background Nebula Layer */}
      <Layer>
        {/* Black background */}
        {/* <Rect width={stageSize.width} height={stageSize.height} fill="black" /> */}

        {/* Render nebulas */}
        {nebulas.map((nebula, index) => (
          <Circle
            key={index}
            x={nebula.x}
            y={nebula.y}
            radius={nebula.radius}
            opacity={calculateOpacity(zoomLevel)}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={nebula.radius}
            fillRadialGradientColorStops={[
              0, nebula.color1, // Center color
              1, nebula.color2, // Fade to transparent
            ]}
          />
        ))}
      </Layer>
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
      <Layer ref={layerRef}>
        {/* Plot points */}
          {points.map((point, index) => {
            const { x, y, symbol, type, waypoints, color, size } = point;

            function calculateColorFill(zoomLevel) {
              if (zoomLevel >= 1) {
                return .5
              }

              if (zoomLevel <= .03) {
                return .3
              }

              return .5
            }

            const stops = [.3, calculateColorFill(zoomLevel), 1]
    
            return (
              <React.Fragment key={index}>
                <Circle
                  key={index}
                  x={x}
                  y={-y}
                  radius={size}
                  // fill={fill}
                  // opacity={(Math.random() * 0.7 + 0.3) * .5} 
                  fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                  fillRadialGradientStartRadius={0}
                  fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                  fillRadialGradientEndRadius={size}
                  fillRadialGradientColorStops={[stops[0], 'white', stops[1], color, stops[2], 'rgba(0, 0, 255, 0)']}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (stage) {
                      const pointerPosition = stage.getPointerPosition();
                      if (pointerPosition) {
                        setTooltip({
                          visible: true,
                          x: x + 20,
                          y: -y + 30, // Position slightly above the point
                          text: `Name: ${symbol}\nWaypoints: ${waypoints.length}\nType: ${type}\n${x}, ${-y}`,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltip({
                      ...tooltip,
                      visible: false,
                    });
                  }}
                  onClick={() => handleStarClick(point, index)}
                />
              </React.Fragment>
            )
          })}

        {/* Tooltip */}
          {tooltip.visible && (
            <Group x={tooltip.x} y={tooltip.y}>
              <Rect
                width={150}
                height={100}
                fill="lightblue"
                cornerRadius={5}
                shadowBlur={5}
              />
              <Text
                text={tooltip.text}
                fontSize={14}
                x={5} // Padding inside the box
                y={5}
                width={150}
                height={100}
                fill="black"
              />
            </Group>
          )}
      </Layer>
    </Map>
  </div>
}

export default UniverseMap;
