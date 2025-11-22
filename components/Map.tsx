import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { AviationStackFlight, GeoJSONWorld } from '../types';
import { Plane, Navigation, Loader2 } from 'lucide-react';

interface MapProps {
  flights: AviationStackFlight[];
  onSelectFlight: (flight: AviationStackFlight) => void;
  selectedFlight: AviationStackFlight | null;
}

const Map: React.FC<MapProps> = ({ flights, onSelectFlight, selectedFlight }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<GeoJSONWorld | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Fetch TopoJSON data
  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(res => res.json())
      .then(data => setWorldData(data as GeoJSONWorld))
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 Render Logic
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;

    // Projection
    const projection = d3.geoMercator()
      .scale(width / 6.3) // Approximate scale fit
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Draw Countries
    const countries = (topojson.feature(worldData as any, worldData.objects.countries as any) as any).features;

    g.selectAll('path')
      .data(countries)
      .enter().append('path')
      .attr('d', path as any)
      .attr('fill', '#1e293b') // Slate 800
      .attr('stroke', '#334155') // Slate 700
      .attr('stroke-width', 0.5);

    // Filter valid flights
    const validFlights = flights.filter(f => f.live && f.live.latitude && f.live.longitude);

    // Define Plane Icon Path (Simple Arrow)
    const planePath = "M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

    // Draw Flights
    const flightGroups = g.selectAll('g.flight')
      .data(validFlights)
      .enter().append('g')
      .attr('class', 'flight')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation(); // Prevent map click
        onSelectFlight(d);
      });

    flightGroups.each(function(d) {
      const coords = projection([d.live!.longitude, d.live!.latitude]);
      if (coords) {
        d3.select(this).attr('transform', `translate(${coords[0]}, ${coords[1]})`);
      }
    });

    // Add Plane Icons
    flightGroups.append('path')
      .attr('d', planePath)
      .attr('fill', (d) => d === selectedFlight ? '#10b981' : '#38bdf8') // Emerald 500 selected, Sky 400 default
      .attr('transform', (d) => `scale(0.7) rotate(${(d.live?.direction || 0) - 45})`) // Rotate based on bearing
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1);
      
    // Add selection ring
    flightGroups.filter(d => d === selectedFlight)
      .append('circle')
      .attr('r', 12)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('from', '8')
      .attr('to', '16')
      .attr('dur', '1.5s')
      .attr('repeatCount', 'indefinite');

    // Add Labels for selected or hovered (simplified to just circles for now for perf)
    // ...

  }, [worldData, dimensions, flights, selectedFlight, onSelectFlight]);

  if (!worldData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sky-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <span className="ml-2 text-sm font-medium">Loading Cartography...</span>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="h-full w-full overflow-hidden bg-slate-900 relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block" />
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur p-2 rounded text-xs text-slate-400 pointer-events-none border border-slate-700">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-sky-400 rounded-full"></div>
           <span>Active Flight</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
           <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
           <span>Selected Target</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
