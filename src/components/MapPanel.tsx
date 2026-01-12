"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import buildsData from "@/data/builds.json";

type MapPanelProps = {
  activeYear: number;
  activeEventIds: string[];
};

const builds = buildsData as unknown as Record<string, unknown>;

const baseStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-base",
      type: "raster",
      source: "osm",
    },
  ],
};

export default function MapPanel({
  activeYear,
  activeEventIds,
}: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);

  const eventFilter = useMemo(() => {
    if (activeEventIds.length === 0) {
      return ["!=", ["get", "primary_event_id"], "__none__"];
    }
    return ["in", ["get", "primary_event_id"], ["literal", activeEventIds]];
  }, [activeEventIds]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: [-73.94, 40.75],
      zoom: 10.2,
      pitch: 20,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      loadedRef.current = true;
      map.addSource("builds", {
        type: "geojson",
        data: builds,
      });

      map.addLayer({
        id: "build-polygons",
        type: "fill",
        source: "builds",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "fill-color": [
            "match",
            ["get", "category"],
            "park",
            "#c8b28b",
            "housing",
            "#d0c3aa",
            "#d3c7b1",
          ],
          "fill-opacity": 0.55,
          "fill-outline-color": "#2f2a20",
        },
      });

      map.addLayer({
        id: "build-lines",
        type: "line",
        source: "builds",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": [
            "match",
            ["get", "category"],
            "expressway",
            "#c1121f",
            "parkway",
            "#2f2a20",
            "#3b3527",
          ],
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 2, 12, 4],
          "line-opacity": 0.85,
          "line-dasharray": [
            "case",
            ["==", ["get", "status"], "under_construction"],
            ["literal", [1.2, 1.2]],
            ["literal", [1, 0]],
          ],
          "line-opacity-transition": { duration: 800 },
        },
      });

      map.addLayer({
        id: "build-points",
        type: "circle",
        source: "builds",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 4, 12, 8],
          "circle-color": [
            "match",
            ["get", "category"],
            "pool",
            "#2f2a20",
            "bridge",
            "#c1121f",
            "#2f2a20",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#f5f0e6",
          "circle-opacity": 0.85,
        },
      });

    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const baseFilter = [
      ["<=", ["get", "year_start"], activeYear],
      eventFilter,
      ["!=", ["get", "category"], "contested"],
    ];

    map.setFilter("build-polygons", [
      "all",
      ["==", ["geometry-type"], "Polygon"],
      ...baseFilter,
    ]);
    map.setFilter("build-lines", [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ...baseFilter,
    ]);
    map.setFilter("build-points", [
      "all",
      ["==", ["geometry-type"], "Point"],
      ...baseFilter,
    ]);

  }, [activeYear, eventFilter]);

  return <div ref={containerRef} className="h-full w-full" />;
}
