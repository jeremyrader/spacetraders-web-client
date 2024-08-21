import React, { useEffect, useRef } from 'react';
import { Circle, Line, Layer, Group } from 'react-konva';
import Konva from 'konva';

import { IShipRender, IRoute, IWaypointLocation } from '@/types'

interface ShipProps {
  route: IRoute;
  color: string;
  radius: number;
  isWaypointSelected: boolean
}

function Ship({ route, color, radius, isWaypointSelected }: ShipProps) {
  const shipRef = useRef<Konva.Circle>(null);
  const dashedLineRef = useRef<Konva.Line>(null);
  const solidLineRef = useRef<Konva.Line>(null);

  const getCurrentLocation = (route: ShipProps['route'], currentTime: number): IWaypointLocation => {
    const departureTime = new Date(route.departureTime).getTime();
    const arrivalTime = new Date(route.arrival).getTime();

    if (currentTime <= departureTime) {
      return route.origin;
    } else if (currentTime >= arrivalTime) {
      return route.destination;
    } else {
      const progress = (currentTime - departureTime) / (arrivalTime - departureTime);
      const currentX = route.origin.x + progress * (route.destination.x - route.origin.x);
      const currentY = route.origin.y + progress * (route.destination.y - route.origin.y);
      return { ...route.origin, x: currentX, y: currentY };
    }
  };

  useEffect(() => {
    const ship = shipRef.current;
    const dashedLine = dashedLineRef.current;
    const solidLine = solidLineRef.current;

    if (ship) {
      const animation = new Konva.Animation((frame) => {
        const currentTime = Date.now();
        const currentLocation = getCurrentLocation(route, currentTime);
        ship.x(currentLocation.x);
        ship.y(-currentLocation.y);

        if (dashedLine) {
          // Update dashed line from origin to current ship position
          dashedLine.points([route.origin.x, -route.origin.y, currentLocation.x, -currentLocation.y]);
        }

        if (solidLine) {
          // Update solid line from current ship position to destination
          solidLine.points([currentLocation.x, -currentLocation.y, route.destination.x, -route.destination.y]);
        }

        // Blinking effect
        const opacity = Math.abs(Math.sin((frame?.time || 0) / 500)); // Adjust the divisor to control blink speed
        ship.opacity(opacity);
      }, ship.getLayer());

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [route]);
  return (
    <Group>
      <Line ref={dashedLineRef} stroke={color} strokeWidth={.5} dash={[1, 1]} opacity={isWaypointSelected ? .1 : .3} />
      <Line ref={solidLineRef} stroke={color} strokeWidth={.5} opacity={isWaypointSelected ? .1 : .3} />
      <Circle ref={shipRef} radius={radius} fill={'white'} opacity={isWaypointSelected ? .1 : .3} />
    </Group> 
  )
}

interface FleetLayerProps {
  ships: IShipRender[]
  isWaypointSelected: boolean
}

function FleetLayer({ ships, isWaypointSelected }: FleetLayerProps) {
  return (
    <Layer>
      {ships.map((ship, index) => (
        ship.nav.status === 'IN_TRANSIT' ? (
          <Ship key={index} route={ship.nav.route} color={ship.renderData.color} radius={1} isWaypointSelected={isWaypointSelected} />
        ) : null
      ))}
    </Layer>
  );
}

export default FleetLayer;
