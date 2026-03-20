import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

const COLORS = {
  bg: '#0A0A0A',
  surface: '#141414',
  surface2: '#1E1E1E',
  border: 'rgba(249, 201, 53, 0.15)',
  accent: '#F9C935',
  accentDark: '#E0B520',
  text: '#F5F5F5',
  muted: '#8A8A8A',
  green: '#22C55E',
  amber: '#F9C935',
  red: '#EF4444',
  blue: '#3B82F6'
};

const STYLES = `
  @import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  .custom-leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; }
  .custom-leaflet-tooltip::before { display: none !important; }
  .leaflet-container { background: #0D0D14; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseRedRing {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes pulseGreenDot {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes meltdown {
    from { box-shadow: inset 0 0 0px #EF4444; background: #000; }
    to { box-shadow: inset 0 0 100px #EF4444; background: #1a0505; }
  }
  .heatmap-blur { filter: blur(30px) opacity(0.7); mix-blend-mode: screen; }
  * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body { margin: 0; background: ${COLORS.bg}; color: ${COLORS.text}; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const initialZones = [
  { id: 'z1', name: 'Koyambedu', score: 87, tier: 'RED', lat: 13.0674, lng: 80.1956, radius: 1500, crime: 82, lighting: 38, flags: 14 },
  { id: 'z2', name: 'Perambur', score: 79, tier: 'RED', lat: 13.1091, lng: 80.2442, radius: 1200, crime: 76, lighting: 42, flags: 11 },
  { id: 'z3', name: 'Anna Nagar West', score: 54, tier: 'AMBER', lat: 13.0837, lng: 80.2036, radius: 1400, crime: 52, lighting: 58, flags: 6 },
  { id: 'z4', name: 'Velachery', score: 48, tier: 'AMBER', lat: 12.9785, lng: 80.2223, radius: 1800, crime: 48, lighting: 62, flags: 4 },
  { id: 'z5', name: 'Adyar', score: 21, tier: 'GREEN', lat: 13.0033, lng: 80.2555, radius: 1300, crime: 22, lighting: 84, flags: 1 },
  { id: 'z6', name: 'Besant Nagar', score: 14, tier: 'GREEN', lat: 12.9995, lng: 80.2676, radius: 1100, crime: 14, lighting: 91, flags: 0 },
];

const initialRiders = [
  { id: 'r1', name: 'Arjun Kumar', zone: 'Koyambedu', status: 'ACTIVE', buddy: 'Kavitha R', lat: 13.0714, lng: 80.1986, inactiveSec: 0 },
  { id: 'r2', name: 'Priya S', zone: 'Koyambedu', status: 'SOS', buddy: null, lat: 13.0634, lng: 80.1926, inactiveSec: 312 },
  { id: 'r3', name: 'Mohammed A', zone: 'Anna Nagar West', status: 'IDLE', buddy: null, lat: 13.0857, lng: 80.2016, inactiveSec: 130 },
  { id: 'r4', name: 'Kavitha R', zone: 'Koyambedu', status: 'ACTIVE', buddy: 'Arjun Kumar', lat: 13.0744, lng: 80.2006, inactiveSec: 0 },
  { id: 'r5', name: 'Suresh M', zone: 'Velachery', status: 'SEEKING', buddy: null, lat: 12.9755, lng: 80.2203, inactiveSec: 0 },
  { id: 'r6', name: 'Deepa T', zone: 'Adyar', status: 'ACTIVE', buddy: null, lat: 13.0013, lng: 80.2575, inactiveSec: 0 },
];

const initialTrucks = [
  { id: 't1', name: 'Raj Kumar', reg: 'TN01AB1234', route: 'Chennai to Coimbatore', progress: 55, speed: 62, fuel: 68, status: 'ACTIVE', lat: 13.0500, lng: 80.2100, pathSegments: [[[13.0500, 80.2100],[12.9800, 80.1800], COLORS.green], [[12.9800, 80.1800],[12.9100, 80.1200], COLORS.amber], [[12.9100, 80.1200],[12.8500, 80.0500], COLORS.red]] },
  { id: 't2', name: 'Murugan P', reg: 'TN07CD5678', route: 'Chennai to Madurai', progress: 20, speed: 78, fuel: 89, status: 'ALERT', lat: 13.0300, lng: 80.2300, pathSegments: [[[13.0300, 80.2300],[12.9500, 80.1900], COLORS.red], [[12.9500, 80.1900],[12.8800, 80.1500], COLORS.red]] },
  { id: 't3', name: 'Selvam K', reg: 'TN22EF9012', route: 'Chennai to Salem', progress: 80, speed: 54, fuel: 31, status: 'ACTIVE', lat: 13.0100, lng: 80.2400, pathSegments: [[[13.0100, 80.2400],[12.9600, 80.1800], COLORS.green], [[12.9600, 80.1800],[12.9000, 80.1000], COLORS.green]] },
];

const initialAlerts = [
  { id: 'a1', worker: 'Priya S', type: 'INACTIVITY', zone: 'Koyambedu', status: 'DISPATCHED', timeAgo: '2 minutes ago' },
  { id: 'a2', worker: 'Murugan P', type: 'MISSED CHECKPOINT', zone: 'Perambur', status: 'PENDING', timeAgo: '8 minutes ago' },
  { id: 'a3', worker: 'Priya S', type: 'MANUAL SOS', zone: 'Koyambedu', status: 'PENDING', timeAgo: '5 minutes ago' },
];

const initialLiveLogs = [
  { id: 'l1', msg: 'Priya S SOS triggered in Koyambedu (RED zone)', time: new Date(Date.now() - 120000) },
  { id: 'l2', msg: 'Mohammed A inactivity detected, T plus 2 minutes', time: new Date(Date.now() - 240000) },
  { id: 'l3', msg: 'Murugan P checkpoint missed on Chennai to Madurai route', time: new Date(Date.now() - 480000) },
];

const cyclingMessages = [
  "Suresh M flagged Velachery: Suspicious Person",
  "Selvam K checkpoint pinged at KM 180",
  "Arjun Kumar and Kavitha R buddy check-in confirmed"
];

function getTierColor(tier) {
  if (tier === 'RED') return COLORS.red;
  if (tier === 'AMBER') return COLORS.amber;
  return COLORS.green;
}

function getEscalationStage(sec) {
  if (sec >= 300) return { label: 'ERSS 112 Alerted', color: COLORS.red };
  if (sec >= 180) return { label: 'Buddy and Dispatcher Alerted', color: COLORS.amber };
  if (sec >= 60) return { label: 'App Notified', color: COLORS.accent };
  return null;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
}

const TN_CITIES = [
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Trichy', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172 },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348 }
];

for (let i = 0; i < 20; i++) {
  const city = TN_CITIES[Math.floor(Math.random() * TN_CITIES.length)];
  const latOff = (Math.random() - 0.5) * 0.15;
  const lngOff = (Math.random() - 0.5) * 0.15;
  const tier = Math.random() > 0.8 ? 'RED' : Math.random() > 0.4 ? 'AMBER' : 'GREEN';
  const score = tier === 'RED' ? 75 + Math.floor(Math.random()*20) : tier === 'AMBER' ? 40 + Math.floor(Math.random()*30) : 10 + Math.floor(Math.random()*20);
  initialZones.push({ id: `z_tn_${i}`, name: `${city.name} Sector ${i+1}`, tier, score, flags: Math.floor(Math.random()*5), crime: Math.floor(Math.random()*20), unlit: Math.floor(Math.random()*30), isolated: Math.floor(Math.random()*30), activeWorkers: Math.floor(Math.random()*10), trend: Math.random()>0.5?'up':'down', lat: city.lat+latOff, lng: city.lng+lngOff, radius: 800+Math.random()*1500 });
}

for (let i = 0; i < 60; i++) {
  const city = TN_CITIES[Math.floor(Math.random() * TN_CITIES.length)];
  const isAlert = Math.random() < 0.1;
  const isIdol = Math.random() < 0.2;
  const status = isAlert ? 'SOS' : isIdol ? 'IDLE' : 'ACTIVE';
  initialRiders.push({ id: `r_tn_${i}`, name: `TN Rider ${i}`, zone: `${city.name} Sector`, status, buddy: Math.random() > 0.5 ? null : `Buddy ${i}`, lat: city.lat + (Math.random()-0.5)*0.2, lng: city.lng + (Math.random()-0.5)*0.2, inactiveSec: status === 'IDLE' || status === 'SOS' ? Math.floor(Math.random()*300) : 0 });
}

for (let i = 0; i < 30; i++) {
  const city = TN_CITIES[Math.floor(Math.random() * TN_CITIES.length)];
  const status = Math.random() < 0.1 ? 'ALERT' : 'ACTIVE';
  const startLat = city.lat + (Math.random()-0.5)*0.3;
  const startLng = city.lng + (Math.random()-0.5)*0.3;
  
  const p1 = [startLat + (Math.random()-0.5)*0.1, startLng + (Math.random()-0.5)*0.1];
  const p2 = [p1[0] + (Math.random()-0.5)*0.1, p1[1] + (Math.random()-0.5)*0.1];
  
  const colors = [COLORS.green, COLORS.amber, COLORS.red];
  const pathSegments = [
    [[startLat, startLng], p1, colors[Math.floor(Math.random()*3)]],
    [p1, p2, colors[Math.floor(Math.random()*3)]]
  ];

  initialTrucks.push({ id: `t_tn_${i}`, name: `TN TRK ${i}`, route: `${city.name} - Hub`, progress: Math.floor(Math.random()*100), speed: 40 + Math.floor(Math.random()*40), fuel: 20 + Math.floor(Math.random()*80), status, lat: startLat, lng: startLng, pathSegments });
}

export default function SafeRouteDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [riders, setRiders] = useState(initialRiders);
  const [trucks, setTrucks] = useState(initialTrucks);
  const [zones] = useState(initialZones);
  const [alerts] = useState(initialAlerts);
  const [liveLogs, setLiveLogs] = useState(initialLiveLogs);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const cycleIndexRef = useRef(0);

  // Removed triggerCrisis

  useEffect(() => {
    const int1 = setInterval(() => {
      setRiders(prev => prev.map(r => {
        if (r.status === 'IDLE' || r.status === 'SOS') {
          return { ...r, inactiveSec: r.inactiveSec + 1 };
        }
        return r;
      }));
    }, 1000);

    const int2 = setInterval(() => {
      setLiveLogs(prev => {
        const newLog = {
          id: Date.now().toString(),
          msg: cyclingMessages[cycleIndexRef.current],
          time: new Date()
        };
        cycleIndexRef.current = (cycleIndexRef.current + 1) % cyclingMessages.length;
        return [newLog, ...prev.slice(0, 19)]; // keep last 20
      });
    }, 30000);

    const int3 = setInterval(() => {
      // Rotate ticker
      setTickerIndex(prev => (prev + 1) % alerts.length);
      
      // Simulate live GPS movement every 3 seconds
      setTrucks(prev => prev.map(t => {
        if (t.status === 'ACTIVE') {
          if (t.pathSegments && t.pathSegments.length > 0) {
            const dest = t.pathSegments[0][1];
            // Move 5% towards route destination per tick
            const latStep = (dest[0] - t.lat) * 0.05;
            const lngStep = (dest[1] - t.lng) * 0.05;
            return { ...t, lat: t.lat + latStep, lng: t.lng + lngStep };
          }
          return { ...t, lat: t.lat + (Math.random() - 0.5) * 0.005, lng: t.lng + (Math.random() - 0.5) * 0.005 };
        }
        return t;
      }));
      setRiders(prev => prev.map(r => r.status === 'ACTIVE' ? { ...r, lat: r.lat + (Math.random() - 0.5) * 0.002, lng: r.lng + (Math.random() - 0.5) * 0.002 } : r));
    }, 3000);

    return () => {
      clearInterval(int1);
      clearInterval(int2);
      clearInterval(int3);
    };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{STYLES}</style>
      
      {/* Top Nav */}
      <div style={{ height: 56, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ paddingRight: 16, borderRight: `1px solid ${COLORS.border}`, marginRight: 24 }}>
            <span style={{ color: COLORS.accent, fontWeight: 800, fontSize: 20 }}>SAFE</span>
            <span style={{ color: COLORS.text, fontWeight: 800, fontSize: 20 }}>ROUTE</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['OPS DASHBOARD', 'RIDER VIEW', 'GOVT VIEWER'].map((tab, idx) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(idx)} 
                style={{ 
                  background: activeTab === idx ? COLORS.accent : 'transparent', 
                  color: activeTab === idx ? COLORS.bg : COLORS.muted, 
                  border: 'none', 
                  padding: '6px 16px', 
                  borderRadius: 4, 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {activeTab === 0 && (
            <button onClick={() => setShowHeatmap(!showHeatmap)} style={{ background: showHeatmap ? COLORS.accent : 'transparent', color: showHeatmap ? '#000' : COLORS.accent, border: `1px solid ${COLORS.accent}`, padding: '6px 16px', borderRadius: 4, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', fontSize: 11 }}>
              {showHeatmap ? 'HIDE HEATMAP' : 'THREAT HEATMAP'}
            </button>
          )}
          {/* Removed Simulate Crisis Button */}
          <StatChip label="Active Trucks" val={trucks.length} color={COLORS.accent} />
          <StatChip label="Active Riders" val={riders.length} color={COLORS.accent} />
          <StatChip label="Red Zones" val={zones.filter(z => z.tier === 'RED').length} color={COLORS.red} />
          <StatChip label="Open Alerts" val={alerts.filter(a => a.status === 'PENDING').length} color={COLORS.red} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green, animation: 'pulseGreenDot 2s infinite' }} />
            <span style={{ color: COLORS.green, fontSize: 13, fontWeight: 'bold' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 0 && (
          <OpsDashboard 
            riders={riders} trucks={trucks} zones={zones} alerts={alerts} liveLogs={liveLogs}
            selectedZone={selectedZone} setSelectedZone={setSelectedZone}
            hoveredZone={hoveredZone} setHoveredZone={setHoveredZone}
            showHeatmap={showHeatmap}
          />
        )}
        {activeTab === 1 && <RiderView />}
        {activeTab === 2 && <GovtViewer zones={zones} alerts={alerts} tickerIndex={tickerIndex} />}
      </div>
    </div>
  );
}

function StatChip({ label, val, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
      <div style={{ color: color, fontWeight: 'bold', fontSize: 16 }}>{val}</div>
      <div style={{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

// --- TAB 1: OPS DASHBOARD ---

function OpsDashboard({ riders, trucks, zones, alerts, liveLogs, selectedZone, setSelectedZone, hoveredZone, setHoveredZone, showHeatmap }) {
  const [trackedId, setTrackedId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('TRUCKS');
  
  const sortedRiders = [...riders].sort((a, b) => {
    const pA = a.status === 'SOS' ? 3 : a.status === 'IDLE' ? 2 : 1;
    const pB = b.status === 'SOS' ? 3 : b.status === 'IDLE' ? 2 : 1;
    return pB - pA;
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([13.0450, 80.2200], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  useEffect(() => {
    if (!layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    // 1. Buddy lines
    const processed = new Set();
    riders.forEach(r => {
      if (r.buddy && !processed.has(r.id)) {
        const b = riders.find(x => x.name === r.buddy);
        if (b) {
          L.polyline([[r.lat, r.lng], [b.lat, b.lng]], { color: COLORS.blue, dashArray: '4, 8', weight: 2, opacity: 0.6 }).addTo(group);
          processed.add(r.id);
          processed.add(b.id);
        }
      }
    });

    // 2. Zones
    zones.forEach(z => {
      const isRed = z.tier === 'RED';
      const color = z.tier === 'RED' ? COLORS.red : z.tier === 'AMBER' ? COLORS.amber : COLORS.green;
      const opacity = isRed ? 0.2 : 0.05;
      
      const zoneCircle = L.circle([z.lat, z.lng], {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        radius: z.radius,
        weight: isRed ? 2 : 1,
        dashArray: isRed ? '' : '4,8'
      }).addTo(group);

      if (showHeatmap && z.tier !== 'GREEN') {
        const heatColor = z.tier === 'RED' ? '#ff0000' : '#ffa500';
        L.circle([z.lat + 0.01, z.lng + 0.01], { radius: z.radius * 2.5, color: 'transparent', fillColor: heatColor, fillOpacity: 0.15, className: 'heatmap-blur' }).addTo(group);
        L.circle([z.lat - 0.01, z.lng - 0.01], { radius: z.radius * 2, color: 'transparent', fillColor: heatColor, fillOpacity: 0.1, className: 'heatmap-blur' }).addTo(group);
      }
      
      zoneCircle.on('click', () => setSelectedZone(z));
      zoneCircle.on('mouseover', () => setHoveredZone(z));
      zoneCircle.on('mouseout', () => setHoveredZone(null));

      zoneCircle.bindTooltip(
        `<div style="text-align: center; color: #fff; font-weight: bold; text-shadow: 0px 0px 4px #000;">
           <div style="font-size: 12px;">${z.name}</div>
           <div style="font-size: 14px; color: ${color};">${z.score}</div>
         </div>`,
        { permanent: true, direction: 'top', className: 'custom-leaflet-tooltip', offset: [0, -20] }
      );
    });

    // 3. Trucks
    trucks.forEach(t => {
      const isAlert = t.status === 'ALERT';
      const color = isAlert ? COLORS.red : COLORS.green;
      const html = `<div style="width: 20px; height: 20px; border-radius: 50%; background: ${COLORS.surface}; border: 2px solid ${color}; display: flex; justify-content: center; align-items: center; color: white; font-size: 10px; font-weight: bold; ${isAlert ? 'box-shadow: 0 0 0 2px rgba(239,68,68,0.3);' : ''}">T</div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [20, 20], iconAnchor: [10, 10] });
      L.marker([t.lat, t.lng], { icon }).addTo(group);
      
      // Draw per-segment route lines connecting origin to destination
      if (t.pathSegments && t.pathSegments.length > 0) {
        t.pathSegments.forEach((seg, idx) => {
          // Keep the first point dynamically attached to the truck's live updating position
          const firstPoint = idx === 0 ? [t.lat, t.lng] : seg[0];
          L.polyline([firstPoint, seg[1]], { 
            color: seg[2], 
            weight: 3, 
            opacity: 0.8, 
            dashArray: seg[2] === COLORS.red ? '5,10' : '' 
          }).addTo(group);
        });

        // Add Pinpoint at final destination
        const lastSegment = t.pathSegments[t.pathSegments.length - 1];
        const destPoint = lastSegment[1];
        const destHtml = `<div style="width: 14px; height: 14px; border-radius: 50%; background: ${COLORS.surface}; border: 3px solid ${COLORS.accent}; box-shadow: 0 0 10px rgba(249,201,53,0.5);"></div>`;
        const destIcon = L.divIcon({ className: '', html: destHtml, iconSize: [14, 14], iconAnchor: [7, 7] });
        L.marker(destPoint, { icon: destIcon }).addTo(group);
      }
    });

    // 4. Riders
    riders.forEach(r => {
      const isSOS = r.status === 'SOS';
      const color = isSOS ? COLORS.red : r.status === 'IDLE' ? COLORS.amber : r.status === 'SEEKING' ? COLORS.blue : COLORS.green;
      const html = `<div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; ${isSOS ? `border: 2px solid ${COLORS.red}; opacity: 0.9; animation: pulseRedRing 1.2s infinite;` : ''}"></div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [16, 16], iconAnchor: [8, 8] });
      L.marker([r.lat, r.lng], { icon }).addTo(group);
    });

    // 5. Track Active Target
    if (trackedId) {
      const target = trucks.find(t => t.id === trackedId) || riders.find(r => r.id === trackedId);
      if (target) {
        mapInstanceRef.current.panTo([target.lat, target.lng], { animate: true, duration: 2.5, easeLinearity: 1 });
      } else {
        setTrackedId(null);
      }
    }

  }, [riders, trucks, zones, setHoveredZone, setSelectedZone, showHeatmap, trackedId]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left Sidebar */}
      <div className="hide-scrollbar" style={{ width: 280, background: COLORS.surface2, borderRight: `1px solid ${COLORS.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setSidebarTab('TRUCKS')}
            style={{ flex: 1, padding: '8px 0', background: sidebarTab === 'TRUCKS' ? COLORS.surface : 'transparent', color: sidebarTab === 'TRUCKS' ? COLORS.accent : COLORS.muted, border: `1px solid ${sidebarTab === 'TRUCKS' ? COLORS.accent : COLORS.border}`, borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
            TRUCKS ({trucks.length})
          </button>
          <button 
            onClick={() => setSidebarTab('RIDERS')}
            style={{ flex: 1, padding: '8px 0', background: sidebarTab === 'RIDERS' ? COLORS.surface : 'transparent', color: sidebarTab === 'RIDERS' ? COLORS.accent : COLORS.muted, border: `1px solid ${sidebarTab === 'RIDERS' ? COLORS.accent : COLORS.border}`, borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
            RIDERS ({riders.length})
          </button>
        </div>
        
        {sidebarTab === 'TRUCKS' && trucks.map(t => (
          <div key={t.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`, borderLeft: t.status === 'ALERT' ? `3px solid ${COLORS.red}` : '3px solid transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.status === 'ALERT' ? COLORS.red : COLORS.green }} />
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
              </div>
              <button 
                onClick={() => setTrackedId(t.id === trackedId ? null : t.id)}
                style={{ background: t.id === trackedId ? COLORS.accent : 'transparent', color: t.id === trackedId ? '#000' : COLORS.accent, border: `1px solid ${COLORS.accent}`, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                {t.id === trackedId ? 'TRACKING' : 'TRACK'}
              </button>
            </div>
            <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 8 }}>{t.route}</div>
            <div style={{ height: 4, background: '#333', borderRadius: 2, marginBottom: 8 }}>
              <div style={{ height: '100%', background: COLORS.accent, borderRadius: 2, width: `${t.progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.muted, fontSize: 11 }}>
              <span>{t.speed} km/h</span>
              <span>{t.fuel}% Fuel</span>
            </div>
          </div>
        ))}

        {sidebarTab === 'RIDERS' && sortedRiders.map(r => {
          const esc = (r.status === 'IDLE' || r.status === 'SOS') ? getEscalationStage(r.inactiveSec) : null;
          return (
            <div key={r.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <button 
                    onClick={() => setTrackedId(r.id === trackedId ? null : r.id)}
                    style={{ background: r.id === trackedId ? COLORS.accent : 'transparent', color: r.id === trackedId ? '#000' : COLORS.accent, border: `1px solid ${COLORS.accent}`, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                    {r.id === trackedId ? 'TRACKING' : 'TRACK'}
                  </button>
                </div>
                <div style={{ fontSize: 10, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, background: r.status === 'SOS' ? COLORS.red : r.status === 'ACTIVE' ? COLORS.green : r.status === 'SEEKING' ? COLORS.blue : COLORS.amber, color: r.status === 'ACTIVE' || r.status === 'SEEKING' ? COLORS.bg : '#fff' }}>
                  {r.status}
                </div>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}>Zone: {r.zone}</div>
              <div style={{ color: COLORS.blue, fontSize: 11, display: 'flex', gap: 4, alignItems: 'center' }}>
                {r.buddy ? `Buddy: ${r.buddy}` : r.status === 'SEEKING' ? 'Seeking...' : 'No buddy'}
              </div>
              {esc && (
                <div style={{ marginTop: 8, color: esc.color, fontSize: 11, fontWeight: 'bold' }}>
                  {esc.label} ({Math.floor(r.inactiveSec / 60)}m {(r.inactiveSec % 60).toString().padStart(2,'0')}s)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Centre Map (Vanilla Leaflet) */}
      <div style={{ flex: 1, background: '#0D0D14', position: 'relative', zIndex: 0 }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', background: '#0D0D14' }} />

        <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 6, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, fontWeight: 'bold', zIndex: 1000, pointerEvents: 'none' }}>
          Live Tracking Map
        </div>

        {hoveredZone && (
          <div style={{ position: 'absolute', top: 20, right: 20, background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: '12px 16px', borderRadius: 6, zIndex: 1000, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{hoveredZone.name}</div>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>Active Flags: <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>{hoveredZone.flags}</span></div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="hide-scrollbar" style={{ width: 300, background: COLORS.surface2, borderLeft: `1px solid ${COLORS.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selectedZone ? (
          <ZoneDetail z={selectedZone} onClose={() => setSelectedZone(null)} riders={riders} />
        ) : (
          <AlertFeed alerts={alerts} liveLogs={liveLogs} />
        )}
      </div>
    </div>
  );
}

function ZoneDetail({ z, onClose, riders }) {
  const color = getTierColor(z.tier);
  const activeHere = riders.filter(r => r.zone === z.name);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }}>ZONE DETAIL</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>✕</button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{z.name}</div>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 'bold', padding: '4px 8px', borderRadius: 4, background: color, color: z.tier === 'GREEN' ? COLORS.bg : '#fff', marginBottom: 24 }}>
          {z.tier} RISK • SCORE {z.score}
        </div>
        
        <div style={{ marginBottom: 24 }}>
           {[
             { label: 'Crime Density', val: z.crime },
             { label: 'Low Lighting', val: z.lighting },
             { label: 'Agent Flags', val: Math.min(100, z.flags * 10) },
             { label: 'Time of Day', val: 75 },
           ].map(bar => (
             <div key={bar.label} style={{ marginBottom: 12 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: COLORS.muted }}>
                 <span>{bar.label}</span>
                 <span style={{ color: COLORS.text }}>{bar.val}</span>
               </div>
               <div style={{ height: 6, background: '#333', borderRadius: 3 }}>
                 <div style={{ height: '100%', background: color, borderRadius: 3, width: `${bar.val}%` }} />
               </div>
             </div>
           ))}
        </div>

        <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 'bold', marginBottom: 12 }}>7-DAY TREND</div>
        <svg viewBox="0 0 260 60" style={{ width: '100%', height: 60, marginBottom: 24 }}>
           <polyline points="0,50 40,40 80,45 120,30 160,20 200,35 260,10" fill="none" stroke={color} strokeWidth="2" />
           {[ [0,50],[40,40],[80,45],[120,30],[160,20],[200,35],[260,10] ].map((pt, i) => (
             <circle key={i} cx={pt[0]} cy={pt[1]} r="3" fill={color} />
           ))}
        </svg>

        <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 'bold', marginBottom: 12 }}>ACTIVE WORKERS IN ZONE</div>
        {activeHere.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 12 }}>No active workers</div> : activeHere.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, background: COLORS.surface, padding: '8px 12px', borderRadius: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
            <span style={{ fontSize: 10, fontWeight: 'bold', color: r.status === 'SOS' ? COLORS.red : COLORS.mixed }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertFeed({ alerts, liveLogs }) {
  return (
    <>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }}>ALERT FEED</div>
      </div>
      <div style={{ padding: 20 }}>
         {alerts.map(a => {
           const isPend = a.status === 'PENDING';
           return (
             <div key={a.id} style={{ background: isPend ? 'rgba(239, 68, 68, 0.05)' : COLORS.surface, border: `1px solid ${COLORS.border}`, borderLeft: isPend ? `4px solid ${COLORS.red}` : `1px solid ${COLORS.border}`, padding: 16, borderRadius: 6, marginBottom: 12 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                 <div style={{ fontWeight: 'bold', fontSize: 14 }}>{a.worker}</div>
                 <div style={{ fontSize: 10, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, background: isPend ? COLORS.red : COLORS.surface2, color: isPend ? '#fff' : COLORS.muted }}>{a.status}</div>
               </div>
               <div style={{ color: isPend ? COLORS.red : COLORS.text, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{a.type.replace(/_/g, ' ')}</div>
               <div style={{ color: COLORS.muted, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                 <span>{a.zone}</span>
                 <span>{a.timeAgo}</span>
               </div>
             </div>
           );
         })}
         
         <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 'bold', marginTop: 24, marginBottom: 12 }}>LIVE EVENT LOG</div>
         {liveLogs.map(l => {
           const isCritical = l.msg.includes('C R I T I C A L');
           return (
             <div key={l.id} style={{ marginBottom: 12, fontSize: 13, background: isCritical ? 'rgba(239,68,68,0.1)' : 'transparent', padding: isCritical ? '8px 12px' : 0, borderRadius: 4, borderLeft: isCritical ? `3px solid ${COLORS.red}` : 'none' }}>
               <span style={{ color: COLORS.accent, fontFamily: 'monospace', marginRight: 8, fontWeight: 'bold' }}>[{formatTime(l.time)}]</span>
               <span style={{ color: isCritical ? COLORS.red : COLORS.muted, fontFamily: isCritical ? 'monospace' : 'inherit', fontWeight: isCritical ? 900 : 'normal' }}>{l.msg}</span>
             </div>
           );
         })}
      </div>
    </>
  );
}

// --- TAB 2: RIDER VIEW ---

function RiderView() {
  const [sosActivated, setSosActivated] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showFlagSheet, setShowFlagSheet] = useState(false);
  const [flagBanner, setFlagBanner] = useState('');
  const [buddyCheckedIn, setBuddyCheckedIn] = useState(false);
  const holdIntervalRef = useRef(null);

  const startHold = () => {
    if (sosActivated) return;
    setHoldProgress(0);
    const startTime = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        setSosActivated(true);
        clearInterval(holdIntervalRef.current);
      }
    }, 50);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    if (!sosActivated) {
      setHoldProgress(0);
    }
  };

  const handleFlag = (cat) => {
    setShowFlagSheet(false);
    setFlagBanner(`Flagged: ${cat}`);
    setTimeout(() => setFlagBanner(''), 3000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: COLORS.bg, overflowY: 'auto', padding: '20px 0' }}>
      <div style={{ width: 390, height: 844, background: '#000', borderRadius: 36, border: `8px solid ${COLORS.surface2}`, boxShadow: `0 0 40px rgba(249,201,53,0.1)`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, animation: sosActivated ? 'meltdown 0.5s infinite alternate' : 'none' }}>
        
        {sosActivated && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.4)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ background: '#000', padding: 32, borderRadius: 24, border: `4px solid ${COLORS.red}`, textAlign: 'center', boxShadow: '0 0 40px rgba(239,68,68,0.5)', animation: 'pulseRedRing 1s infinite' }}>
              <div style={{ color: COLORS.red, fontSize: 64, marginBottom: 16 }}>🚨</div>
              <div style={{ color: COLORS.red, fontWeight: 900, fontSize: 24, letterSpacing: 1, marginBottom: 12 }}>DISPATCHER AWARE</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }}>POLICE DEPLOYED</div>
              <div style={{ background: COLORS.surface2, padding: '12px 24px', borderRadius: 12, marginTop: 24, border: `1px solid ${COLORS.border}` }}>
                <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 900 }}>ETA: 2 MINS</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div style={{ height: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', fontSize: 13, fontWeight: 'bold', zIndex: 50, position: 'relative' }}>
          <span>14:30</span>
          <span style={{ color: COLORS.accent, letterSpacing: 1 }}>SAFEROUTE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green, animation: 'pulseGreenDot 2s infinite' }} />
            <span style={{ color: COLORS.green }}>LIVE</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {flagBanner && (
            <div style={{ background: COLORS.green, color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>
              ✓ {flagBanner}
            </div>
          )}

          {/* Zone Card - Contextual Red Zone */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.red}`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}>CURRENT ZONE</div>
                <div style={{ fontSize: 22, fontWeight: 'bold' }}>Koyambedu</div>
              </div>
              <div style={{ background: COLORS.red, color: '#fff', fontSize: 12, fontWeight: 'bold', padding: '4px 8px', borderRadius: 6 }}>RED RISK</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#FCC', padding: 12, borderRadius: 8, fontSize: 13, lineHeight: 1.4 }}>
              <b>Warning:</b> You are in a high-risk zone. Inactivity monitoring is strictly enforced (60s threshold).
            </div>
          </div>

          {/* Buddy Card */}
          <div style={{ background: COLORS.surface, borderRadius: 20, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', border: buddyCheckedIn ? `1px solid rgba(34, 197, 94, 0.3)` : `1px solid ${COLORS.surface2}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>YOUR ASSIGNED BUDDY</div>
              {buddyCheckedIn ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: COLORS.green, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                  ✓ SECURE
                </div>
              ) : null}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: COLORS.accent, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000', fontWeight: 800, fontSize: 18, boxShadow: '0 4px 12px rgba(249,201,53,0.3)' }}>KR</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, letterSpacing: -0.5 }}>Kavitha R</div>
                <div style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>0.8 km away • Active</div>
              </div>
            </div>

            <button 
              onClick={() => setBuddyCheckedIn(true)}
              disabled={buddyCheckedIn}
              style={{ 
                width: '100%', padding: '14px', 
                background: buddyCheckedIn ? 'rgba(255,255,255,0.02)' : 'rgba(249, 201, 53, 0.1)', 
                border: buddyCheckedIn ? 'none' : `1px solid ${COLORS.accent}`, 
                borderRadius: 14, 
                color: buddyCheckedIn ? COLORS.muted : COLORS.accent, 
                fontWeight: 800, fontSize: 14, cursor: buddyCheckedIn ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {buddyCheckedIn ? '✓ Safety Confirmed' : 'Ping Safety Confirmation'}
            </button>
          </div>

          {/* Delivery Card */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 4 }}>HEADING TO</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Block C, Olympia Tech Park</div>
            <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 16 }}>Guindy Zone</div>
            <button style={{ width: '100%', padding: 12, background: 'transparent', border: `1px solid ${COLORS.accent}`, borderRadius: 8, color: COLORS.accent, fontWeight: 'bold', cursor: 'pointer' }}>
              Enable Lobby Drop (Hostile Zone)
            </button>
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom Actions */}
          <button 
            onClick={() => setShowFlagSheet(true)}
            style={{ width: '100%', padding: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, color: COLORS.text, fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}
          >
            Flag Route Issue
          </button>

          <div 
            onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
            onTouchStart={startHold} onTouchEnd={endHold}
            style={{ 
              width: '100%', height: 56, background: sosActivated ? 'rgba(239,68,68,0.1)' : COLORS.accent, 
              borderRadius: 14, position: 'relative', overflow: 'hidden', cursor: sosActivated ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: sosActivated ? `2px solid ${COLORS.red}` : 'none',
              userSelect: 'none', WebkitUserSelect: 'none'
            }}
          >
            {sosActivated ? (
              <span style={{ color: COLORS.red, fontWeight: 800, fontSize: 16 }}>SOS SENT</span>
            ) : (
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${holdProgress}%`, background: COLORS.red, transition: 'width 0.05s linear' }} />
                <span style={{ position: 'relative', color: holdProgress > 50 ? '#fff' : '#0A0A0A', fontWeight: 800, fontSize: 16, transition: 'color 0.2s' }}>
                  {holdProgress > 0 ? `HOLD TO CONFIRM (${Math.round(holdProgress)}%)` : 'SOS EMERGENCY'}
                </span>
              </>
            )}
          </div>
          {sosActivated && (
            <div style={{ textAlign: 'center', color: COLORS.red, fontSize: 12, fontWeight: 'bold' }}>Emergency services alerted. GPS coordinates shared.</div>
          )}
        </div>

        {/* Flag Sheet Overlay */}
        {showFlagSheet && (
          <>
            <div onClick={() => setShowFlagSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: COLORS.surface2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, zIndex: 11 }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Flag an Issue</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['Broken Lighting', 'Suspicious Person', 'Harassment', 'Dangerous Road', 'Building Threat', 'Police Presence'].map(cat => (
                  <button key={cat} onClick={() => handleFlag(cat)} style={{ padding: '12px 8px', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowFlagSheet(false)} style={{ width: '100%', padding: 14, background: 'transparent', border: 'none', color: COLORS.muted, fontWeight: 'bold', marginTop: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- TAB 3: GOVT VIEWER ---

function GovtViewer({ zones, alerts, tickerIndex }) {
  const sortedZones = [...zones].sort((a,b) => b.score - a.score);

  return (
    <div className="hide-scrollbar" style={{ height: '100%', overflowY: 'auto', padding: '32px 48px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Ticker - Uber/Ola Pill Style */}
      <div style={{ background: '#1A0B0B', borderRadius: 100, marginBottom: 32, display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', padding: 4, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ fontWeight: 800, zIndex: 2, color: '#000', background: COLORS.red, padding: '8px 20px', borderRadius: 100, fontSize: 11, letterSpacing: 0.5 }}>LIVE INTEL</div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 16 }}>
           <div key={tickerIndex} style={{ fontWeight: 600, fontSize: 13, letterSpacing: 0.5, color: '#E5E7EB', paddingTop: 2, animation: 'fadeIn 0.5s ease-out' }}>
             <span style={{ color: COLORS.red }}>●</span> {alerts[tickerIndex].type.replace(/_/g, ' ')} detected in {alerts[tickerIndex].zone} <span style={{ color: COLORS.muted }}>({alerts[tickerIndex].timeAgo})</span>
           </div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: COLORS.accent, margin: '0 0 8px 0', fontSize: 28 }}>Government Safety Dashboard</h1>
        <div style={{ color: COLORS.muted, fontSize: 14 }}>Read-only view • Integrated with ERSS 112 • Real-time verified telemetry</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <GovCard label="Total Alerts (30d)" val="1,402" color={COLORS.text} />
        <GovCard label="Resolution Rate" val="98.5%" color={COLORS.green} />
        <GovCard label="Avg Resolution Time" val="3m 12s" color={COLORS.blue} />
        <GovCard label="Active Red Zones" val={zones.filter(z=>z.tier === 'RED').length} color={COLORS.red} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 40 }}>
        {/* Donut Chart: Alert Breakdown */}
        <div style={{ background: COLORS.surface, borderRadius: 24, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: 18, margin: '0 0 32px 0', color: COLORS.text, fontWeight: 700 }}>Alert Diagnostics</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, position: 'relative' }}>
            <svg viewBox="0 0 36 36" style={{ height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={COLORS.surface2} strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={COLORS.red} strokeWidth="3" strokeDasharray="45 100" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={COLORS.amber} strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-45" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={COLORS.blue} strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-75" />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, letterSpacing: -1 }}>142</div>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>THIS WK</div>
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.red }} /> <span style={{ color: COLORS.text, fontWeight: 500 }}>Prolonged SOS</span></div><span style={{ fontWeight: 700, color: COLORS.text }}>45%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.amber }} /> <span style={{ color: COLORS.text, fontWeight: 500 }}>Route Deviation</span></div><span style={{ fontWeight: 700, color: COLORS.text }}>30%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.blue }} /> <span style={{ color: COLORS.text, fontWeight: 500 }}>Manual Flag</span></div><span style={{ fontWeight: 700, color: COLORS.text }}>25%</span></div>
          </div>
        </div>

        {/* Line Chart: 7-Day Trend */}
        <div style={{ background: COLORS.surface, borderRadius: 24, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: 18, margin: '0 0 24px 0', color: COLORS.text, fontWeight: 700 }}>7-Day Network Threat Trend</h2>
          <div style={{ height: 220, position: 'relative', display: 'flex', alignItems: 'flex-end', paddingTop: 20 }}>
            <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={COLORS.surface2} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,150 L100,120 L200,160 L300,90 L400,110 L500,40 L600,60 L600,200 L0,200 Z" fill="url(#glow)" />
              <polyline points="0,150 100,120 200,160 300,90 400,110 500,40 600,60" fill="none" stroke={COLORS.accent} strokeWidth="3" />
              {[ [0,150],[100,120],[200,160],[300,90],[400,110],[500,40],[600,60] ].map((pt, i) => (
                <circle key={i} cx={pt[0]} cy={pt[1]} r="5" fill={COLORS.accent} style={{ filter: `drop-shadow(0 0 6px ${COLORS.accent})` }} />
              ))}
            </svg>
            <div style={{ position: 'absolute', bottom: -24, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', color: COLORS.muted, fontSize: 11, fontWeight: 'bold' }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.surface, borderRadius: 24, padding: 32, marginBottom: 40, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, margin: 0, color: COLORS.text, fontWeight: 700 }}>Top Critical Zones</h2>
          <div style={{ background: COLORS.surface2, padding: '6px 12px', borderRadius: 100, fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>TOP 5 HIGHEST RISK</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedZones.slice(0, 5).map(z => {
            const color = getTierColor(z.tier);
            return (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 150, fontSize: 15, fontWeight: 600, color: COLORS.text }}>{z.name}</div>
                <div style={{ flex: 1, height: 8, background: '#222', borderRadius: 100, margin: '0 20px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: color, width: `${z.score}%`, borderRadius: 100 }} />
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: 15, fontWeight: 700, color: color }}>{z.score}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, margin: 0, color: COLORS.text }}>Recent Incident Log</h2>
          <button style={{ background: 'transparent', border: `1px solid ${COLORS.accent}`, color: COLORS.accent, padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
        <div style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12, color: COLORS.muted, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
            <div>WORKER</div>
            <div>INCIDENT TYPE</div>
            <div>ZONE</div>
            <div>STATUS</div>
            <div>TIME</div>
          </div>
          {alerts.map((a, i) => {
            const isPend = a.status === 'PENDING';
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '16px 0', borderBottom: `1px solid ${COLORS.surface2}`, alignItems: 'center', fontSize: 14 }}>
                <div style={{ fontWeight: 'bold' }}>{a.worker}</div>
                <div>{a.type.replace(/_/g, ' ')}</div>
                <div>{a.zone}</div>
                <div>
                  <span style={{ padding: '4px 8px', borderRadius: 4, background: isPend ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: isPend ? COLORS.red : COLORS.green, fontSize: 11, fontWeight: 'bold' }}>
                    {a.status}
                  </span>
                </div>
                <div style={{ color: COLORS.muted }}>{a.timeAgo}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GovCard({ label, val, color }) {
  return (
    <div style={{ background: COLORS.surface, borderRadius: 24, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: color, marginBottom: 4, letterSpacing: -1 }}>{val}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
