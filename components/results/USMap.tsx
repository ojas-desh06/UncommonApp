"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion } from "framer-motion";
import type { SchoolPrediction } from "@/lib/types";
import { classificationColorVar, formatPercent } from "@/lib/utils";

type HoverState = { school: SchoolPrediction; x: number; y: number } | null;

export function USMap({
  schools,
  onSelect,
}: {
  schools: SchoolPrediction[];
  onSelect: (s: SchoolPrediction) => void;
}) {
  const [hover, setHover] = useState<HoverState>(null);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1100 }}
        width={900}
        height={560}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography="/us-map.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "var(--muted)",
                    stroke: "var(--border)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: "var(--accent)",
                    stroke: "var(--border)",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  pressed: {
                    fill: "var(--accent)",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>

        {schools.map((s, i) => {
          const color = classificationColorVar[s.classification];
          return (
            <Marker
              key={s.college.id}
              coordinates={[s.college.location.lon, s.college.location.lat]}
            >
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.02 * i, type: "spring", stiffness: 260, damping: 18 }}
                r={7}
                fill={color}
                stroke="var(--background)"
                strokeWidth={1.5}
                style={{
                  cursor: "pointer",
                  filter: `drop-shadow(0 0 6px ${color})`,
                }}
                onMouseEnter={(e) =>
                  setHover({
                    school: s,
                    x: (e as unknown as React.MouseEvent).clientX,
                    y: (e as unknown as React.MouseEvent).clientY,
                  })
                }
                onMouseMove={(e) =>
                  setHover({
                    school: s,
                    x: (e as unknown as React.MouseEvent).clientX,
                    y: (e as unknown as React.MouseEvent).clientY,
                  })
                }
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(s)}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none fixed z-40 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{
            left: hover.x + 14,
            top: hover.y + 14,
          }}
        >
          <div className="font-medium text-foreground">{hover.school.college.name}</div>
          <div className="mt-0.5 text-muted-foreground">
            {formatPercent(hover.school.chance_low)} – {formatPercent(hover.school.chance_high)} ·{" "}
            <span style={{ color: classificationColorVar[hover.school.classification] }}>
              {hover.school.classification.replace("_", " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
