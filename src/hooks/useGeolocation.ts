"use client";

import { useState, useEffect } from "react";
import { DEFAULT_COORDINATES } from "@/lib/prayer-times";

interface GeolocationState {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
    city: DEFAULT_COORDINATES.city,
    country: DEFAULT_COORDINATES.country,
    loading: false,
    error: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: "Your Location",
          country: "",
          loading: false,
          error: null,
        });
      },
      () => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to retrieve your location. Using default (London).",
        }));
      }
    );
  };

  return { ...state, requestLocation };
}
