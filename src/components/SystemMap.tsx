"use client";

import { Stage, Layer, Group, Circle, Rect, Text } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Konva from 'konva';
import React from 'react';

function generatePointsOnCircle(radius, numberOfPoints) {
  const points = [];
  const angleStep = (2 * Math.PI) / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    const angle = i * angleStep;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push({ x, y });
  }

  return points;
}

function SystemMap({system, onSelectMap}) {
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const stageRef = useRef<Konva.Stage>(null);
    const [tooltip, setTooltip] = useState({
      visible: false,
      x: 0,
      y: 0,
      text: ''
    });
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleSelectBack = () => {
      onSelectMap('universe')
    };

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
  
        // newScale = Math.min(newScale, 1)
  
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

        // Apply the new scale and position
        stage.scale({ x: newScale, y: newScale });
        setZoomLevel(newScale)
        stage.position(newPos);
        
        stage.batchDraw();
  
      }
    }

    useEffect(() => {

      const stage = stageRef.current;
    
      if (stage) {
        // Set initial position so that (0,0) is in the center of the canvas
        stage.position({
          x: stageSize.width / 2, // 91
          y: stageSize.height / 2, // -12
        });

        stage.scale({ x: 0.5, y: 0.5 });

        stage.batchDraw();

      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === containerRef.current) {
            const { width, height } = entry.contentRect;
            stage.position({
              x: width / 2,
              y: height / 2
            });
            setStageSize({ width, height });
          }
        }
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      async function fetchWaypoints() {
        const callsign = searchParams.get('callsign')
  
        if (callsign) {
          const token = localStorage.getItem(callsign);
  
          if (token) {
            const options = {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            };
      
            const response = await fetch(`https://api.spacetraders.io/v2/systems/${system.symbol}/waypoints`, options)
            const result = await response.json();
            console.log(result.data)
            // setAgent(result.data);
          }
          else {
            console.error("Agent not found")
          }
  
        }
        else {
          console.error("missing callsign param")
        }
      }

      fetchWaypoints()

      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
      
    }, []);


    let { type, color, size } = system

    const orbitalWaypoints = system.waypoints.filter(waypoint => {
      return waypoint.orbitals
    }).reduce((acc, waypoint) => {
      return acc.concat(waypoint.orbitals);
    }, []);

    const waypoints = system.waypoints.filter(waypoint => {
      return !orbitalWaypoints.find(orbitalWaypoint => orbitalWaypoint.symbol == waypoint.symbol)
    })

    return <div ref={containerRef} className='border-4 border-white'>
        <button onClick={handleSelectBack} className="btn btn-primary">Back to System Map</button>
        <Stage
          width={stageSize.width}
          height={window.innerHeight}
          style={{ backgroundColor: 'black' }}
          ref={stageRef}
          onWheel={handleWheel}
          draggable
        >
          <Layer>
            {
              waypoints.map((waypoint, index) => {

                let drawOrbit = false

                if (['PLANET', 'GAS_GIANT', 'JUMP_GATE'].includes(waypoint.type)) {
                  drawOrbit = true
                }

                const distanceFromOrigin = Math.sqrt(waypoint.x ** 2 + waypoint.y ** 2);

                return drawOrbit ? (
                  <React.Fragment key={index}>
                    { waypoint.orbitals.map((orbital, index) => {
                        <Circle
                          key={'waypoint-orbit-' + index}
                          x={waypoint.x}
                          y={-waypoint.y}
                          radius={5 + 1}
                          stroke="gray" // Circle outline color
                          strokeWidth={1}
                          fill="transparent" // No fill color
                        />
                      })
                    }
                    <Circle
                      key={'waypoint-orbital-orbit-' + index}
                      x={0}
                      y={0}
                      radius={distanceFromOrigin}
                      stroke="gray" // Circle outline color
                      strokeWidth={1}
                      fill="transparent" // No fill color
                    />
                    </React.Fragment>
                ) : null
              })
            }
          </Layer>
          <Layer>
          <Circle
            x={0}
            y={0}
            radius={800}
            // fill={fill}
            // opacity={(Math.random() * 0.7 + 0.3) * .5} 
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={800}
            fillRadialGradientColorStops={[.001, 'white', .01, color, .8, 'rgba(0, 0, 255, 0)']}
          />
            {
              waypoints.map((waypoint, index) => {
                let radius = 30
                let fill = 'white'
                let drawOrbit = false

                if (waypoint.type == 'ASTEROID') {
                  fill = 'gray'
                  radius = 2
                }

                if (waypoint.type == 'MOON') {
                  fill = 'white'
                  radius = 3
                }

                if (waypoint.type == 'PLANET') {
                  fill = '#126f1e'
                  radius = 3
                  drawOrbit = true
                }

                if (waypoint.type == 'GAS_GIANT') {
                  fill = 'green'
                  radius = 5
                  drawOrbit = true
                }

                if (waypoint.type == 'JUMP_GATE') {
                  fill = 'blue'
                  radius = 2
                  drawOrbit = true
                }

                let orbitalRadius = 1

                let orbitals = []
                if (waypoint.orbitals.length > 0) {

                  orbitals = generatePointsOnCircle(5 + orbitalRadius, waypoint.orbitals.length);
                }

                return (
                  <React.Fragment key={index}>
                    <Circle
                      key={'waypoint' + index}
                      x={waypoint.x}
                      y={-waypoint.y}
                      radius={radius}
                      fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                      fillRadialGradientStartRadius={0}
                      fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                      fillRadialGradientEndRadius={radius}
                      fillRadialGradientColorStops={[0, '#258dbe', 1, '#25be49']}
                      onMouseEnter={(e) => {
                        const stage = e.target.getStage();
                        if (stage) {
                          const pointerPosition = stage.getPointerPosition();
                          if (pointerPosition) {
                            setTooltip({
                              visible: true,
                              x: waypoint.x + (20 / zoomLevel),
                              y: -waypoint.y + (30 / zoomLevel),
                              text: `Name: ${waypoint.symbol}\nOrbitals: ${waypoint.orbitals.length}\nType: ${waypoint.type}\n`,
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
                    />
                    {
                      waypoint.orbitals.map((orbital, index) => {

                        return (
                          <React.Fragment key={index}>
                            <Circle
                              key={index}
                              x={waypoint.x + orbitals[index].x}
                              y={-waypoint.y + orbitals[index].y}
                              radius={1}
                              fill="white"
                              onMouseEnter={(e) => {
                                const stage = e.target.getStage();
                                if (stage) {

                                  let waypointInfo = system.waypoints.find(waypoint => waypoint.symbol == orbital.symbol)
                                  const pointerPosition = stage.getPointerPosition();
                                  if (pointerPosition) {
                                    setTooltip({
                                      visible: true,
                                      x: waypoint.x + orbitals[index].x + (20 / zoomLevel),
                                      y: -waypoint.y + orbitals[index].y + (30 / zoomLevel), // Position slightly above the point
                                      text: `Name: ${orbital.symbol}\n\nType: ${waypointInfo.type}`,
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
                            />
                          </React.Fragment>
                        )
                      })
                    }
                  </React.Fragment>
                )
              })
            }
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

export default SystemMap;