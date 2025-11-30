import { useMemo } from 'react';
import { generateGeodesicHexagonGrid, HexagonData } from '../utils/hexagonUtils';
import Hexagon from './Hexagon';

interface HexagonGridProps {
  hoveredHexId: string | null;
  selectedHexId: string | null;
  onHover: (id: string | null) => void;
  onClick: (hexagonData: HexagonData) => void;
  resolution?: number;
}

export default function HexagonGrid({
  hoveredHexId,
  selectedHexId,
  onHover,
  onClick,
  resolution = 12,
}: HexagonGridProps) {
  const hexagons = useMemo(() => {
    return generateGeodesicHexagonGrid(resolution, 0.08);
  }, [resolution]);

  return (
    <>
      {hexagons.map((hexagonData) => (
        <Hexagon
          key={hexagonData.id}
          hexagonData={hexagonData}
          isHovered={hoveredHexId === hexagonData.id}
          isSelected={selectedHexId === hexagonData.id}
          onHover={onHover}
          onClick={onClick}
        />
      ))}
    </>
  );
}

