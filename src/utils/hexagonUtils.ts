import * as THREE from 'three';

export interface HexagonData {
  id: string;
  position: THREE.Vector3;
  vertices: THREE.Vector3[];
  center: THREE.Vector3;
  lat: number;
  lon: number;
}

/**
 * Convert lat/lon to 3D coordinates on a sphere
 */
export function latLonToVector3(lat: number, lon: number, radius: number = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Convert 3D vector to lat/lon
 */
export function vector3ToLatLon(vector: THREE.Vector3): { lat: number; lon: number } {
  const lat = 90 - (Math.acos(vector.y / vector.length()) * 180) / Math.PI;
  const lon = ((Math.atan2(vector.z, -vector.x) * 180) / Math.PI + 180) % 360 - 180;
  return { lat, lon };
}

/**
 * Generate hexagon vertices in 2D plane
 */
export function generateHexagonVertices(center: THREE.Vector2, radius: number): THREE.Vector2[] {
  const vertices: THREE.Vector2[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    vertices.push(
      new THREE.Vector2(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      )
    );
  }
  return vertices;
}

/**
 * Project 2D hexagon vertices onto sphere surface
 */
export function projectHexagonToSphere(
  center2D: THREE.Vector2,
  vertices2D: THREE.Vector2[],
  radius: number = 1
): { center: THREE.Vector3; vertices: THREE.Vector3[] } {
  // Convert 2D center to lat/lon (assuming equirectangular projection)
  const lat = center2D.y * 90;
  const lon = center2D.x * 180;
  
  const center3D = latLonToVector3(lat, lon, radius);
  
  // Project vertices onto sphere
  const vertices3D = vertices2D.map((v2D) => {
    const vLat = v2D.y * 90;
    const vLon = v2D.x * 180;
    return latLonToVector3(vLat, vLon, radius);
  });

  return { center: center3D, vertices: vertices3D };
}

/**
 * Generate hexagonal grid using icosahedral geodesic approach
 */
export function generateHexagonGrid(
  subdivisions: number = 20,
  hexRadius: number = 0.05
): HexagonData[] {
  const hexagons: HexagonData[] = [];
  const hexRadiusRad = hexRadius * Math.PI; // Convert to radians for lat/lon space
  
  // Generate hexagons using a grid pattern
  // Using a simple grid approach with offset rows for hexagon pattern
  const latStep = hexRadius * 2.5;
  const lonStep = hexRadius * 2.2;
  
  for (let lat = -90; lat <= 90; lat += latStep * 90) {
    const lonOffset = (lat % (latStep * 180)) === 0 ? 0 : lonStep * 90;
    
    for (let lon = -180; lon <= 180; lon += lonStep * 180) {
      const centerLat = lat;
      const centerLon = lon + lonOffset;
      
      // Skip if outside valid range
      if (centerLat < -90 || centerLat > 90) continue;
      
      const center3D = latLonToVector3(centerLat, centerLon, 1);
      
      // Generate hexagon vertices on sphere
      const vertices3D: THREE.Vector3[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        // Calculate offset in lat/lon space
        const dLat = hexRadiusRad * Math.cos(angle);
        const dLon = hexRadiusRad * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
        
        const vertexLat = centerLat + dLat * 180 / Math.PI;
        const vertexLon = centerLon + dLon * 180 / Math.PI;
        
        vertices3D.push(latLonToVector3(vertexLat, vertexLon, 1));
      }
      
      hexagons.push({
        id: `hex-${centerLat}-${centerLon}`,
        position: center3D,
        vertices: vertices3D,
        center: center3D,
        lat: centerLat,
        lon: centerLon,
      });
    }
  }
  
  return hexagons;
}

/**
 * Improved hexagon grid using better geodesic distribution
 */
export function generateGeodesicHexagonGrid(
  resolution: number = 15,
  hexRadius: number = 0.08
): HexagonData[] {
  const hexagons: HexagonData[] = [];
  const hexRadiusRad = hexRadius;
  
  // Create a more uniform distribution
  const latSteps = Math.floor(180 / (hexRadius * 180));
  
  for (let i = 0; i <= latSteps; i++) {
    const lat = -90 + (i * 180) / latSteps;
    const lonSteps = Math.floor(360 / (hexRadius * 180 * Math.cos(lat * Math.PI / 180)));
    const lonStep = 360 / lonSteps;
    
    // Offset every other row for hexagonal pattern
    const offset = (i % 2) * (lonStep / 2);
    
    for (let j = 0; j < lonSteps; j++) {
      const lon = -180 + j * lonStep + offset;
      
      const center3D = latLonToVector3(lat, lon, 1);
      
      // Generate hexagon vertices
      const vertices3D: THREE.Vector3[] = [];
      for (let k = 0; k < 6; k++) {
        const angle = (Math.PI / 3) * k;
        const dLat = hexRadiusRad * Math.cos(angle);
        const dLon = hexRadiusRad * Math.sin(angle) / Math.max(Math.cos(lat * Math.PI / 180), 0.1);
        
        const vertexLat = Math.max(-90, Math.min(90, lat + dLat * 180 / Math.PI));
        const vertexLon = lon + dLon * 180 / Math.PI;
        
        vertices3D.push(latLonToVector3(vertexLat, vertexLon, 1));
      }
      
      hexagons.push({
        id: `hex-${i}-${j}`,
        position: center3D,
        vertices: vertices3D,
        center: center3D,
        lat,
        lon,
      });
    }
  }
  
  return hexagons;
}

