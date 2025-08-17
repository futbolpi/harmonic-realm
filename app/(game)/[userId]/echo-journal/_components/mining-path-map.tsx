"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  MapRef,
} from "react-map-gl/maplibre";
import { MapPin, Zap, Clock, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/schema/user";
import { MAP_STYLES } from "@/app/(game)/(geo-needed)/map/utils";

type MiningSession = UserProfile["sessions"];

interface MiningPathMapProps {
  sessions: MiningSession;
}

export function MiningPathMap({ sessions }: MiningPathMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedSession, setSelectedSession] = useState<
    MiningSession[number] | null
  >(null);
  const { resolvedTheme } = useTheme();

  // Set initial viewport
  const initialViewState = useMemo(() => {
    return {
      longitude: -73.9654,
      latitude: 40.7829,
      zoom: 12,
    };
  }, []);

  // Sort sessions by end time to create story progression
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Create path line from sessions
  const pathCoordinates = sortedSessions.map((session) => [
    session.node.longitude,
    session.node.latitude,
  ]);

  const pathGeoJSON = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: pathCoordinates,
    },
  };

  // Fit map to show all sessions
  useEffect(() => {
    if (sortedSessions.length > 0 && mapRef.current) {
      const bounds = sortedSessions.reduce(
        (acc, session) => {
          const lng = session.node.longitude;
          const lat = session.node.latitude;
          return {
            minLng: Math.min(acc.minLng, lng),
            maxLng: Math.max(acc.maxLng, lng),
            minLat: Math.min(acc.minLat, lat),
            maxLat: Math.max(acc.maxLat, lat),
          };
        },
        {
          minLng: Number.POSITIVE_INFINITY,
          maxLng: Number.NEGATIVE_INFINITY,
          minLat: Number.POSITIVE_INFINITY,
          maxLat: Number.NEGATIVE_INFINITY,
        }
      );

      mapRef.current?.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 50,
          duration: 1000,
        }
      );
    }
  }, [sortedSessions]);

  const getSessionColor = (index: number, total: number) => {
    const hue = (index / total) * 300; // From red to blue
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Completed
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-game-accent" />
            Your Mining Journey
          </h2>
          <p className="text-sm text-muted-foreground">
            {sortedSessions.length} sessions • Follow your path through the
            Lattice
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (sortedSessions.length > 0 && mapRef.current) {
              const firstSession = sortedSessions[0];
              setSelectedSession(firstSession);
              mapRef.current?.flyTo({
                center: [
                  firstSession.node.longitude,
                  firstSession.node.latitude,
                ],
                zoom: 14,
                duration: 1000,
              });
            }
          }}
        >
          Start of Journey
        </Button>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="h-[70vh] relative">
            <Map
              ref={mapRef}
              initialViewState={initialViewState}
              style={{ width: "100%", height: "100%" }}
              mapStyle={
                resolvedTheme === "light"
                  ? MAP_STYLES.outdoor
                  : MAP_STYLES.outdoorDark
              }
              attributionControl={false}
              onClick={() => setSelectedSession(null)}
            >
              {/* Path Line */}
              {pathCoordinates.length > 1 && (
                <Source id="path" type="geojson" data={pathGeoJSON}>
                  <Layer
                    id="path-line"
                    type="line"
                    paint={{
                      "line-color": "#00ff88",
                      "line-width": 3,
                      "line-opacity": 0.8,
                    }}
                  />
                </Source>
              )}

              {/* Session Markers */}
              {sortedSessions.map((session, index) => (
                <Marker
                  key={session.id}
                  longitude={session.node.longitude}
                  latitude={session.node.latitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedSession(session);
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor: getSessionColor(
                        index,
                        sortedSessions.length
                      ),
                    }}
                  >
                    {index + 1}
                  </div>
                </Marker>
              ))}

              {/* Session Popup */}
              {selectedSession && (
                <Popup
                  longitude={selectedSession.node.longitude}
                  latitude={selectedSession.node.latitude}
                  onClose={() => setSelectedSession(null)}
                  className="mining-session-popup"
                >
                  <Card className="p-3 min-w-[250px]">
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle>
                        Session #{sortedSessions.indexOf(selectedSession) + 1}
                      </CardTitle>
                      {getStatusBadge(selectedSession.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>Node: {selectedSession.node.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {selectedSession.node.type.lockInMinutes}m duration
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {selectedSession.minerSharesEarned.toFixed(2)}{" "}
                            shares
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {format(
                              new Date(selectedSession.startTime),
                              "MMM d, HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Popup>
              )}
            </Map>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
              <div className="text-xs font-medium mb-2">Journey Progress</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-game-accent"></div>
                <span>Mining Path</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></div>
                <span>Session Order</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeline */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-game-accent" />
            Session Timeline
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {sortedSessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    backgroundColor: getSessionColor(
                      index,
                      sortedSessions.length
                    ),
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{session.nodeId}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(session.startTime), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{session.node.type.lockInMinutes}m</span>
                    <span>{session.minerSharesEarned.toFixed(2)} shares</span>
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
