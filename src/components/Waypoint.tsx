'use client'

import { Circle, Text, Rect, Group } from 'react-konva';
import { useRef, useState, useEffect, Fragment } from 'react';
import Konva from 'konva'

import { IWaypointRender, ITrait } from '@/types'

interface WaypointProps {
  waypoint: IWaypointRender;
  selectedTrait: string | null;
  zoomLevel: number;
  onWaypointClick: Function;
  selectedWaypoint: IWaypointRender | null;
}

const Waypoint = ({waypoint, selectedTrait, zoomLevel, onWaypointClick, selectedWaypoint}: WaypointProps) => {
  const { symbol, type, orbits } = waypoint
  const { x, y, radius } = waypoint.renderData
  const orbitalRef = useRef<Konva.Circle>(null);
  const waypointRef = useRef<Konva.Circle>(null);
  const traitsListRef = useRef<Konva.Text>(null);
  const symbolOffsetRef = useRef<Konva.Text>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [traitsListOffset, setTraitsListOffset] = useState(0);
  const [symbolOffset, setSymbolOffset] = useState(0);

  const getIsHighlighted = (traits: ITrait[], selectedTrait: string | null) => {
    return traits.find((trait: ITrait) => {
      return trait.symbol == selectedTrait
    })
  }

  const handleMouseEnter = () => {
    document.body.style.cursor = 'pointer';
    setIsHovered(true)
  };

  const handleMouseLeave = () => {
    document.body.style.cursor = 'default';
    setIsHovered(false)
  };

  const handleClick = () => {
    onWaypointClick(waypoint, waypointRef)
  };

  const multiplier = getIsHighlighted(waypoint.traits, selectedTrait) ? 3 : 1
  const symbolParts = symbol.split('-')
  const waypointTerminator = symbolParts[2]

  const isObscured = !!selectedWaypoint && selectedWaypoint.symbol !== waypoint.symbol
  const isSelected = selectedWaypoint != null && selectedWaypoint.symbol === waypoint.symbol

  const traitsList = waypoint.traits.map(trait=> {
    return `${trait.name}\n`
  }).join('').replace(/\n$/, '');

  const waypointTypeNamingMap = {
   'PLANET': 'Planet',
   'GAS_GIANT': 'Gas Giant',
   'MOON': 'Moon',
   'ORBITAL_STATION': 'Orbital Station',
   'JUMP_GATE': 'Jump Gate',
   'ASTEROID_FIELD': 'Asteroid Field',
   'ASTEROID': 'Asteroid',
   'ENGINEERED_ASTEROID': 'Engineered Asteroid',
   'ASTEROID_BASE': 'Asteroid Base',
   'NEBULA': 'Nebula',
   'DEBRIS_FIELD': 'Debris Field',
   'GRAVITY_WELL': 'Gravity Well',
   'ARTIFICIAL_GRAVITY_WELL': 'Artifical Gravity Well',
   'FUEL_STATION': 'Fuel Station'
  }

  useEffect(() => {
    if (traitsListRef.current) {
      const textHeight = traitsListRef.current.height();
      setTraitsListOffset(textHeight / 2)
    }
    if (symbolOffsetRef.current) {
      const textHeight = symbolOffsetRef.current.height();
      setSymbolOffset(textHeight / 2)
    }
  }, [isSelected]);

  return (
    <Fragment>
      {
        waypoint.orbitals.map((orbital, index) => {
          return (
            <Waypoint
              key={index}
              waypoint={orbital}
              selectedTrait={selectedTrait}
              zoomLevel={zoomLevel}
              onWaypointClick={onWaypointClick}
              selectedWaypoint={selectedWaypoint}
            />
          )
        })
      }
      {
        (orbits && x && y) ? (
          <Group>
            <Circle
              waypoint
              ref={orbitalRef}
              x={x}
              y={-y} // down on HTML canvas is positive
              radius={radius * multiplier}
              fill="white"
              stroke="black"
              strokeWidth={0.1}
              opacity={isObscured ? .2 : 1}
              onClick={() => { onWaypointClick(waypoint, orbitalRef) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {
              isHovered ? (
                <Text
                  x={x + 5}
                  y={-y - 20}
                  text={waypointTerminator}
                  fontSize={14}                // Small, but readable size
                  fontFamily="Arial"           // Clean, sans-serif font
                  fill="rgba(255, 255, 255, 0.8)" // White with slight transparency
                  padding={5}                  // Padding around the text
                  align="center"               // Center align the text
                  verticalAlign="middle"       // Center align vertically
                  offsetX={waypointTerminator.length * 7}    // Adjust based on text length
                  offsetY={10}                 // Slight offset from the star position
                  listening={false}            // Disable event listeners if not needed
                  opacity={.2}
                />
              ) : null
            }
            {isSelected && (
              <Text
                name="waypoint-metadata"
                x={x + radius}
                y={-y - 30}
                text={
                  `
                    Symbol: ${symbol}\n
                    Type: ${type}\n
                    Traits:\n
                    ${
                      waypoint.traits.map(trait=> {
                        return `${trait.name}`
                      })
                    }
                  `
                }
                fontSize={4}
                fontFamily="Arial"
                fill="rgba(255, 255, 255, 0.8)"
                lineHeight={1.5}       // Line spacing for readability
              />
            )}
          </Group>
        ) : (
          <Group>
            <Circle
              ref={waypointRef}
              waypoint
              x={waypoint.x}
              y={-waypoint.y} // down on HTML canvas is positive
              radius={radius * multiplier}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={radius}
              fillRadialGradientColorStops={[0, '#258dbe', 1, '#25be49']}
              stroke="black"
              strokeWidth={0.1}
              opacity={isObscured ? .2 : 1}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            />
            {
              isHovered ? (
                <Text
                  x={waypoint.x + 5}
                  y={-waypoint.y - 20}
                  text={waypointTerminator}
                  fontSize={14}                // Small, but readable size
                  fontFamily="Arial"           // Clean, sans-serif font
                  fill="rgba(255, 255, 255, 0.8)" // White with slight transparency
                  padding={5}                  // Padding around the text
                  align="center"               // Center align the text
                  verticalAlign="middle"       // Center align vertically
                  offsetX={waypointTerminator.length * 7}    // Adjust based on text length
                  offsetY={10}                 // Slight offset from the star position
                  listening={false}            // Disable event listeners if not needed
                  opacity={.2}
                />
              ) : null
            }
            {isSelected && (
              <Group>
                <Text
                  ref={symbolOffsetRef}
                  name="waypoint-metadata"
                  x={waypoint.x - 140}
                  y={-waypoint.y - symbolOffset}
                  text={
                    `
                      ${waypoint.symbol}
                      ${waypointTypeNamingMap[waypoint.type as string]}
                    `
                  }
                  fontSize={10}
                  fontFamily="Arial"
                  fill="rgba(255, 255, 255, 0.8)"
                  lineHeight={1.5}
                  align="right"
                />
                <Text
                  ref={traitsListRef}
                  name="waypoint-metadata"
                  x={waypoint.x + 20}
                  y={-waypoint.y - traitsListOffset}
                  text={traitsList}
                  fontSize={10}
                  fontFamily="Arial"
                  fill="rgba(255, 255, 255, 0.8)"
                  lineHeight={1.5}       // Line spacing for readability
                />
                
              </Group>
            )}
          </Group>
        )
      }
      
    </Fragment>
  )

}

export default Waypoint