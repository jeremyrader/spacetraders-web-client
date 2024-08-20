'use client'

import { Circle, Text, Group } from 'react-konva';
import { useRef, useState, Fragment } from 'react';
import Konva from 'konva'

import WaypointMetadata from '@/components/WaypointMetadata'
import { IWaypointRender, ITrait } from '@/types'

interface WaypointProps {
  waypoint: IWaypointRender;
  selectedTrait: string | null;
  zoomLevel: number;
  onWaypointClick: Function;
  selectedWaypoint: IWaypointRender | null;
}

const Waypoint = ({waypoint, selectedTrait, zoomLevel, onWaypointClick, selectedWaypoint}: WaypointProps) => {
  const { symbol, orbits } = waypoint
  const { x, y, radius, color1, color2 } = waypoint.renderData
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

  const symbolParts = symbol.split('-')
  const waypointTerminator = symbolParts[2]

  const isObscured = !!selectedWaypoint && selectedWaypoint.symbol !== waypoint.symbol
  const isSelected = selectedWaypoint != null && selectedWaypoint.symbol === waypoint.symbol
  const isHighlighted = waypoint.traits ? getIsHighlighted(waypoint.traits, selectedTrait) : false

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
              radius={radius}
              fillLinearGradientStartPoint={{ x: -50, y: 0 }}
              fillLinearGradientEndPoint={{ x: 50, y: 0 }}
              fillLinearGradientColorStops={[
                0, color1,
                0.7, color2,
                1, 'white'
              ]}
              stroke={isHighlighted ? "rgba(255, 204, 0, 0.4)" : ''}
              strokeWidth={isHighlighted ? 2 : 0}
              shadowBlur={10}
              shadowColor={isHighlighted ? '#ffcc00' : 'white'}
              shadowOpacity={isHighlighted ? 1 : 0.6}
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
                  fontSize={14}
                  fontFamily="Arial"
                  fill="rgba(255, 255, 255, 0.8)"
                  padding={5}
                  align="center"
                  verticalAlign="middle"
                  offsetX={waypointTerminator.length * 7}
                  offsetY={10}
                  listening={false}
                  opacity={.2}
                />
              ) : null
            }
            {isSelected && (
              <WaypointMetadata 
                x={x}
                y={y}
                waypoint={waypoint}
                isSelected={isSelected}
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
              radius={radius}
              fillLinearGradientStartPoint={{ x: -50, y: 0 }}
              fillLinearGradientEndPoint={{ x: 50, y: 0 }}
              fillLinearGradientColorStops={[
                0, color1,
                0.7, color2,
                1, 'white'
              ]}
              stroke={isHighlighted ? "rgba(255, 204, 0, 0.4)" : ''}
              strokeWidth={isHighlighted ? 2 : 0}
              shadowBlur={10}
              shadowColor={isHighlighted ? '#ffcc00' : 'white'}
              shadowOpacity={isHighlighted ? 1 : 0.6}
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
                  fontSize={14}
                  fontFamily="Arial"
                  fill="rgba(255, 255, 255, 0.8)"
                  padding={5}
                  align="center"
                  verticalAlign="middle"
                  offsetX={waypointTerminator.length * 7}
                  offsetY={10}
                  listening={false}
                  opacity={.2}
                />
              ) : null
            }
            {isSelected && (
              <WaypointMetadata 
                x={waypoint.x}
                y={waypoint.y}
                waypoint={waypoint}
                isSelected={isSelected}
              />
            )}
          </Group>
        )
      }
      
    </Fragment>
  )

}

export default Waypoint