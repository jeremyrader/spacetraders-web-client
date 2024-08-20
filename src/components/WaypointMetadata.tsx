'use client'

import React, { useRef, useState, useEffect, Fragment } from 'react';
import { Group, Text } from 'react-konva';
import Konva from 'konva'

import { IWaypointRender, TWaypointType } from '../types/index'

interface WaypointMetadataProps {
  x: number;
  y: number;
  waypoint: IWaypointRender
  isSelected: boolean;
}

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

const WaypointMetadata = ({x, y, waypoint, isSelected}: WaypointMetadataProps) => {
  const symbolOffsetRef = useRef<Konva.Text>(null);
  const traitsListRef = useRef<Konva.Text>(null);
  const [traitsListOffset, setTraitsListOffset] = useState(0);
  const [symbolOffsetX, setSymbolOffsetX] = useState(0);
  const [symbolOffsetY, setSymbolOffsetY] = useState(0);

  const traitsList = waypoint.traits.map(trait=> {
    return `${trait.name}\n`
  }).join('').replace(/\n$/, '');

  const waypointPadding = 20

  useEffect(() => {
    if (traitsListRef.current) {
      const textHeight = traitsListRef.current.height();
      setTraitsListOffset(textHeight / 2)
    }
    if (symbolOffsetRef.current) {
      const textHeight = symbolOffsetRef.current.height();
      setSymbolOffsetY(textHeight / 2)

      const textWidth = symbolOffsetRef.current.width();
      setSymbolOffsetX(textWidth)
    }
  }, [isSelected]);

  return (
    <Group>
      <Text
        ref={symbolOffsetRef}
        name="waypoint-metadata"
        x={x - symbolOffsetX  - waypointPadding}
        y={-y - symbolOffsetY}
        text={
          `
            ${waypoint.symbol}
            ${waypointTypeNamingMap[waypoint.type as TWaypointType]}
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
        x={x + waypointPadding}
        y={-y - traitsListOffset}
        text={traitsList}
        fontSize={10}
        fontFamily="Arial"
        fill="rgba(255, 255, 255, 0.8)"
        lineHeight={1.5}
      />
    </Group>
  )
}

export default WaypointMetadata