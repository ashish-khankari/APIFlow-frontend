"use client";

import React from "react";
import "./LoadingScreen.css";

export interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function LoadingScreen({
  title = "Loading",
  subtitle = "Please wait",
  badge = "API FLOW RUNTIME",
}: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      {/* Background Matrix Grid & Radial Lime Glow */}
      <div className="loading-bg-grid" aria-hidden="true" />
      <div className="loading-glow-spotlight" aria-hidden="true" />

      <div className="loading-container">
        {/* Futuristic Status Badge */}
        {badge && (
          <div className="loading-badge">
            <span className="loading-badge-pulse" />
            <span className="loading-badge-text">{badge}</span>
          </div>
        )}

        {/* Orbiting Multi-Ring Loader */}
        <div className="loader">
          <div className="orbit orbit-1">
            <span className="orbit-particle" />
          </div>
          <div className="orbit orbit-2">
            <span className="orbit-particle" />
          </div>
          <div className="orbit orbit-3">
            <span className="orbit-particle" />
          </div>

          <div className="loader-core">
            <span className="core-icon">⚡</span>
            <span className="core-pulse-ring" />
          </div>
        </div>

        {/* Loading Content & Animated Flow Indicator */}
        <div className="loading-content">
          <h2>{title}</h2>
          <p>
            {subtitle}
            <span className="dots">...</span>
          </p>

          <div className="loading-bar-track" aria-hidden="true">
            <div className="loading-bar-indicator" />
          </div>
        </div>
      </div>
    </div>
  );
}