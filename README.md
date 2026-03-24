# SafeRoute

SafeRoute is a comprehensive real-time safety and tracking application designed to monitor logistics fleets, field workers, and civilian safety in real-time. Built with React and Leaflet, the application provides live geospatial tracking, dynamic threat heatmaps, and instantaneous emergency response integration.

## Key Features

### 1. Ops Dashboard (Command Center)
- **Live Fleet Tracking:** Real-time location monitoring and route progression of trucks and riders on a centralized map.
- **Interactive Threat Heatmap:** Dynamic visualization of safe vs. hostile zones (Red, Amber, Green). Risk levels are calculated using factors like past crime density, lack of lighting, and live agent flags.
- **Alert Feed & Live Log:** Continuous timeline of system events, missed checkpoints, auto-detected inactivity, and manual SOS alerts.
- **Zone Intelligence:** In-depth analytics for specific area sectors, including 7-day risk trend analysis and counts of active personnel within the perimeter.

### 2. Rider View (Mobile Companion)
- **SOS Emergency Trigger:** A secure, hold-to-confirm SOS button intended to immediately alert dispatchers and local authorities, while minimizing accidental misfires.
- **Buddy System Check-ins:** Pairs riders with designated nearby "buddies" for mutual safety confirmation and proximity tracking.
- **Live Zone Awareness:** Real-time alert banners triggering when the user enters a high-risk (Red Risk) zone, advising heightened caution.
- **Crowdsourced Route Flagging:** Empowers riders to report localized issues (e.g., Suspicious Person, Poor Lighting) directly to the analytics engine to update live threat maps.

### 3. Govt Viewer
- Centralized overview for local authorities to monitor escalation stages, active incidents, and coordinate rapid response protocols.

## Tech Stack

- **Frontend Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Mapping:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Routing/State:** React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/navinrajaa2/HackHustle-26.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to the local URL provided by Vite (typically `http://localhost:5173`) to view the application in your browser.

## Build for Production

To create an optimized, production-ready build, run:
```bash
npm run build
```
To preview the production build locally before deployment:
```bash
npm run preview
```

## Contributing
Contributions, issues, and feature requests are welcome!

## License
This project is licensed under the MIT License.
