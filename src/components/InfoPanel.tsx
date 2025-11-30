import './InfoPanel.css';

interface InfoPanelProps {
  hexagonData: {
    lat: number;
    lon: number;
    type: 'green' | 'white' | 'sand' | 'beach' | 'water';
    color: string;
  } | null;
  onClose: () => void;
}

export default function InfoPanel({ hexagonData, onClose }: InfoPanelProps) {
  if (!hexagonData) return null;

  const getTypeInfo = () => {
    switch (hexagonData.type) {
      case 'green':
        return {
          title: 'Forest',
          icon: '🌲',
          description: 'Lush green forest area with diverse vegetation',
        };
      case 'white':
        return {
          title: 'Snow Region',
          icon: '❄️',
          description: 'Cold snow-covered region with polar wildlife',
        };
      case 'sand':
        return {
          title: 'Desert',
          icon: '🏜️',
          description: 'Arid desert landscape with unique desert ecosystems',
        };
      case 'beach':
        return {
          title: 'Beach',
          icon: '🏖️',
          description: 'Beautiful sandy beach with coastal scenery',
        };
      case 'water':
        return {
          title: 'Coastal Waters',
          icon: '🌊',
          description: 'Shallow coastal waters and ocean areas',
        };
    }
  };

  const info = getTypeInfo();

  return (
    <div className="info-panel">
      <button className="info-panel-close" onClick={onClose}>
        ✕
      </button>
      <div className="info-panel-content">
        <div className="info-panel-header">
          <span className="info-panel-icon">{info.icon}</span>
          <h2 className="info-panel-title">{info.title}</h2>
        </div>
        <div className="info-panel-description">{info.description}</div>
        <div className="info-panel-coords">
          <div className="coord-item">
            <span className="coord-label">Latitude</span>
            <span className="coord-value">{hexagonData.lat.toFixed(2)}°</span>
          </div>
          <div className="coord-item">
            <span className="coord-label">Longitude</span>
            <span className="coord-value">{hexagonData.lon.toFixed(2)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
