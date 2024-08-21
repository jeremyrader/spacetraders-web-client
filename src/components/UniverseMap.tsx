'use client';

import { Layer } from 'react-konva';
import { useState, useRef, useEffect, useContext } from 'react';
import React from 'react';
import Konva from 'konva';
import DataContext from '../contexts/DataContext';

import Map from './Map';
import MapControls from './MapControls';
import System from './System';
import Nebula from './Nebula';

import { ISystemRender } from '@/types';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getRandomPointInCircle(radius: number) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const r = radius * Math.sqrt(Math.random()); // Random radius within the circle
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    distance: r, // Include the distance from the center
  };
}

interface UniverseMapProps {
  onSelectMap: Function;
}

const UniverseMap = ({ onSelectMap }: UniverseMapProps) => {
  const context = useContext(DataContext);
  const dataContext = useContext(DataContext);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [systems, setSystems] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [selectedStar, setSelectedStar] = useState<ISystemRender | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const massiveCircleCenter = {
    x: 0,
    y: 0,
  };
  const massiveCircleRadius = 60000; // Radius of the massive circle

  // TODO: Handle at ingestion time
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

  if (!context) {
    throw new Error('DataContext must be used within a DataProvider');
  }

  const handleStarClick = (star: ISystemRender) => {
    setSelectedStar(star);
    setMapCenter({ x: star.x, y: star.y });
  };

  const handleEnterSystemClick = (star: ISystemRender | null) => {
    if (star) {
      onSelectMap('system', star);
    }
  };

  const UniverseMapControls = () => {
    return (
      <MapControls onSelectMap={onSelectMap}>
        <button
          onClick={() => handleEnterSystemClick(selectedStar)}
          type="button"
          className="px-4 py-2 
            rounded 
            bg-blue-500 
            hover:bg-blue-700
            click:bg-blue-900
            text-lg font-semibold 
            text-white 
            tracking-wide 
            uppercase 
            transition-colors 
            duration-300"
        >
          View System Map
        </button>
      </MapControls>
    );
  };

  useEffect(() => {
    const getSystems = async () => {
      if (dataContext) {
        try {
          const systems = await dataContext.getSystems();

          setSystems(systems);

          const mapCenterSymbol = window.localStorage.getItem('headquarters');

          if (mapCenterSymbol) {
            const symbolParts = mapCenterSymbol.split('-');
            const mapCenter = systems.find(
              (system) =>
                system.symbol == `${symbolParts[0]}-${symbolParts[1]}`,
            );

            setSelectedStar(mapCenter);

            if (mapCenter) {
              setMapCenter({ x: mapCenter.x, y: mapCenter.y });
            }
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data from IndexedDB:', error);
        } finally {
        }
      }
    };

    getSystems();
  }, []);

  return (
    <div ref={containerRef}>
      <Map
        containerRef={containerRef}
        isLoading={isLoading}
        maxZoom={1}
        onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
        onStageClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
          const isSystem = !!e.target.attrs.system;

          if (!isSystem) {
            setSelectedStar(null);
          }
        }}
        mapCenter={mapCenter}
        MapControls={UniverseMapControls}
      >
        {/* Background Nebula Layer */}
        {/* <Layer>
          {nebulas.map((nebula, index) => (
            <Nebula
              key={index}
              x={nebula.x}
              y={nebula.y}
              radius={nebula.radius}
              color1={nebula.color1}
              color2={nebula.color2}
              zoomLevel={zoomLevel}
            />
          ))}
        </Layer> */}
        {/* System stars */}
        <Layer ref={layerRef}>
          {systems.map((system, index) => {
            return (
              <System
                key={index}
                system={system}
                zoomLevel={zoomLevel}
                onSystemClick={handleStarClick}
                selectedSystem={selectedStar}
                isSelected={selectedStar?.symbol == system.symbol}
              />
            );
          })}
        </Layer>
      </Map>
    </div>
  );
};

export default UniverseMap;
