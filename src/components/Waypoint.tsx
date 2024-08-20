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
  isSelected: boolean;
  isObscured: boolean;
}

const Waypoint = ({waypoint, selectedTrait, zoomLevel, onWaypointClick, isObscured, isSelected}: WaypointProps) => {
  const { symbol, orbits } = waypoint
  const { x, y, radius } = waypoint.renderData
  const orbitalRef = useRef<Konva.Circle>(null);
  const waypointRef = useRef<Konva.Circle>(null);
  const [isHovered, setIsHovered] = useState(false);

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
              isSelected={isSelected}
              isObscured={isObscured}
            />
          )
        })
      }
      {
        (orbits && x && y) ? (
          <Group>
            <Circle
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
              <Text
                name="waypoint-metadata"
                x={waypoint.x + radius}
                y={-waypoint.y - 30}
                text={
                  `
                    Symbol: ${waypoint.symbol}\n
                    Type: ${waypoint.type}\n
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
        )
      }
      
    </Fragment>
  )

}

export default Waypoint