'use client'

import { Circle, Rect, Group, Text } from 'react-konva';
import { useState, useEffect, Fragment } from 'react';
import { getObject } from '../utils/indexeddb';

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
  orbitalWaypoints: Waypoint[]
  zoomLevel: number;
  onWaypointClick: Function;
}

const Waypoint = ({waypoint, orbitalWaypoints, zoomLevel, onWaypointClick}: WaypointProps) => {

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });

  const [traits, setTraits] = useState<Trait[]>([])

  let radius = 1
  let fill = 'white'
  let drawOrbit = false

  if (['ASTEROID', 'ENGINEERED_ASTEROID', 'ASTEROID_BASE'].includes(waypoint.type)) {
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

  if (waypoint.type == 'JUMP_GATE' || waypoint.type == 'FUEL_STATION') {
    fill = 'blue'
    radius = 2
    drawOrbit = true
  }

  let orbitalRadius = 1

  let orbitalCoordinates: {x: number; y: number;}[] = []
  if (waypoint.orbitals.length > 0) {
    orbitalCoordinates = generatePointsOnCircle(5 + orbitalRadius, waypoint.orbitals.length);
  }

  useEffect(() => {

    async function getWaypointTraits() {
      const waypointData = await getObject('waypointStore', waypoint.symbol)
      
      if (waypointData) {
        setTraits((waypointData.traits))
      }
      
    }

    getWaypointTraits()

  }, []);

  const getTooltipText = ({ symbol, type}: Waypoint) => {
    const text = `
      Name: ${symbol}\n
      Type: ${type}\n
      ${
        traits.map((trait) => {
          return `${trait.symbol}\n`
        }).join('')
      }
      `
      return text
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
        onClick={() => {
          onWaypointClick(waypoint)
        }}
      />
      {
        orbitalWaypoints.map((orbital, index) => {
          return (
            <Fragment key={index}>
              <Circle
                key={index}
                x={waypoint.x + orbitalCoordinates[index].x}
                y={-waypoint.y + orbitalCoordinates[index].y}
                radius={1}
                fill="white"
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (stage) {
                    const pointerPosition = stage.getPointerPosition();
                    if (pointerPosition) {
                      setTooltip({
                        visible: true,
                        x: waypoint.x + orbitalCoordinates[index].x + (20 / zoomLevel),
                        y: -waypoint.y + orbitalCoordinates[index].y + (30 / zoomLevel), // Position slightly above the point
                        text: getTooltipText(waypoint),
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
                onClick={() => { 
                  // adjust coordinates so that when the waypoint is clicked it has
                  // a circle rendered at the right spot indicating is was selected
                  orbital.x = waypoint.x + orbitalCoordinates[index].x
                  orbital.y = waypoint.y + orbitalCoordinates[index].y
                  onWaypointClick(orbital)
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