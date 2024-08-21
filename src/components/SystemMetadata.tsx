'use client';

import React, { useRef, useState, useEffect, Fragment } from 'react';
import { Group, Text } from 'react-konva';
import Konva from 'konva';

import { ISystemRender, TSystemType } from '../types/index';

interface SystemMetadataProps {
  x: number;
  y: number;
  system: ISystemRender;
  isSelected: boolean;
}

const systemTypeNamingMap = {
  NEUTRON_STAR: 'Neutron Star',
  RED_STAR: 'Red Star',
  ORANGE_STAR: 'Orange Star',
  BLUE_STAR: 'Blue Star',
  YOUNG_STAR: 'Young Star',
  WHITE_DWARF: 'White Dwarf',
  ASTEROID: 'Asteroid',
  BLACK_HOLE: 'Black Hole',
  HYPERGIANT: 'Hypergiant',
  NEBULA: 'Nebula',
  UNSTABLE: 'Unstable',
};

const SystemMetadata = ({ x, y, system, isSelected }: SystemMetadataProps) => {
  const symbolOffsetRef = useRef<Konva.Text>(null);
  const waypointsListRef = useRef<Konva.Text>(null);
  const [waypointsListOffset, setWaypointsListOffset] = useState(0);
  const [symbolOffsetX, setSymbolOffsetX] = useState(0);
  const [symbolOffsetY, setSymbolOffsetY] = useState(0);

  const systemPadding = 40;

  useEffect(() => {
    if (waypointsListRef.current) {
      const textHeight = waypointsListRef.current.height();
      setWaypointsListOffset(textHeight / 2);
    }
    if (symbolOffsetRef.current) {
      const textHeight = symbolOffsetRef.current.height();
      setSymbolOffsetY(textHeight / 2);

      const textWidth = symbolOffsetRef.current.width();
      setSymbolOffsetX(textWidth);
    }
  }, [isSelected]);

  return (
    <Group>
      <Text
        ref={symbolOffsetRef}
        name="waypoint-metadata"
        x={x - symbolOffsetX - systemPadding}
        y={-y - symbolOffsetY}
        text={`
            ${system.symbol}
            ${systemTypeNamingMap[system.type as TSystemType]}
          `}
        fontSize={20}
        fontFamily="Arial"
        fill="rgba(255, 255, 255, 0.8)"
        lineHeight={1.5}
        align="right"
      />
      <Text
        ref={waypointsListRef}
        name="waypoint-metadata"
        x={x + systemPadding}
        y={-y - waypointsListOffset}
        text={`${system.waypoints.length} waypoints`}
        fontSize={20}
        fontFamily="Arial"
        fill="rgba(255, 255, 255, 0.8)"
        lineHeight={1.5}
      />
    </Group>
  );
};

export default SystemMetadata;
