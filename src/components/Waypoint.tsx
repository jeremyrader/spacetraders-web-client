'use client'

import { Circle, Rect, Group, Text } from 'react-konva';
import { useState, Fragment } from 'react';

function generatePointsOnCircle(radius: number, numberOfPoints: number) {
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

interface WaypointProps {
  waypoint: Waypoint;
  zoomLevel: number;
}

const Waypoint = ({waypoint, zoomLevel}: WaypointProps) => {

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });

  let radius = 30
  let fill = 'white'
  let drawOrbit = false

  if (waypoint.type == 'ASTEROID' || waypoint.type == 'ENGINEERED_ASTEROID') {
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
    <Fragment>
      <Circle
        x={waypoint.x}
        y={-waypoint.y} // down on HTML canvas is positive
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
                text: `Name: ${waypoint.symbol}\nOrbitals: ${waypoint.orbitals.length}\nType: ${waypoint.type}`,
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
            <Fragment key={index}>
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
            </Fragment>
          )
        })
      }
      {/* Tooltip */}
      {
        tooltip.visible && (
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
        )
      }
    </Fragment>
  )

}

export default Waypoint