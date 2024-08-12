"use client";

import { Stage, Layer, Group, Circle, Rect, Text } from 'react-konva';
import { useState, useRef, useEffect, useContext } from 'react';
import React from 'react';
import Konva from 'konva';
import DataContext from '../contexts/DataContext';

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
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
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

  const moveAmount = 10;

  // document.addEventListener('keydown', (event) => {
  //   const stage = stageRef.current;

  //   if (stage) {

  //     const key = event.key;

  //     // Get the current position of the stage
  //     const position = stage.position();

  //     switch (key) {
  //       case 'w': // Move up
  //         stage.position({ x: position.x, y: position.y + moveAmount });
  //         break;
  //       case 'a': // Move left
  //         stage.position({ x: position.x + moveAmount, y: position.y });
  //         break;
  //       case 's': // Move down
  //         stage.position({ x: position.x, y: position.y - moveAmount });
  //         break;
  //       case 'd': // Move right
  //         stage.position({ x: position.x - moveAmount, y: position.y });
  //         break;
  //     }
  //   }
  // });

  if (!context) {
    throw new Error('DataContext must be used within a DataProvider');
  }

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;  // Zoom factor
    const stage = stageRef.current;

    if (stage) {

      const oldScale = stage.scaleX();
      // Determine the new scale factor based on scroll direction
      let newScale = oldScale;
      if (e.evt.deltaY < 0) {
        // Zoom in (scrolling up)
        newScale = oldScale * scaleBy;
      } else if (e.evt.deltaY > 0) {
        // Zoom out (scrolling down)
        newScale = oldScale / scaleBy;
      }

      newScale = Math.min(newScale, 1)

      // Center of the screen in stage coordinates
      const center = {
        x: stageSize.width / 2,
        y: stageSize.height / 2,
      };
      
      // Center point in stage coordinates considering the current scale
      const centerPointTo = {
        x: (center.x - stage.x()) / oldScale,
        y: (center.y - stage.y()) / oldScale,
      };
      
      // Calculate the new position to maintain the center point
      const newPos = {
        x: center.x - centerPointTo.x * newScale,
        y: center.y - centerPointTo.y * newScale,
      };
      setZoomLevel(newScale)
      // Apply the new scale and position
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      
      stage.batchDraw();

    }
  }

  const handleStarClick = (star, index) => {
    // onSelectMap('system', star)
    setSelectedStar(star);
  };

  const handleEnterSystemClick = (star) => {
    onSelectMap('system', star)
  }


  useEffect(() => {
    const stage = stageRef.current;
    
    if (stage) {
      // Set initial position so that (0,0) is in the center of the canvas
      stage.position({
        x: stageSize.width / 2, // 91
        y: stageSize.height / 2, // -12
      });

      // galaxy view
      // stage.scale({ x: .005, y: .005 });

      stage.batchDraw();
    }

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

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          const { width, height } = entry.contentRect;
          setStageSize({ width, height });
          // setOriginX(width / 2)
          // setOriginY(height / 2)
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    fetchData(hq);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
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
    <Stage
      width={stageSize.width}
      height={window.innerHeight}
      style={{ backgroundColor: 'black' }}
      ref={stageRef}
      onWheel={handleWheel}
      draggable
    >
      {/* Background Nebula Layer */}
      <Layer>
        {/* Black background */}
        <Rect width={stageSize.width} height={stageSize.height} fill="black" />

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
                          text: `Name: ${symbol}\nWaypoints: ${waypoints.length}\nType: ${type}\n`,
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
    </Stage>
  </div>
}

export default UniverseMap;
