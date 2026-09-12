import React from "react";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loader">
        <div className="orbit orbit-1" />
        <div className="orbit orbit-2" />
        <div className="orbit orbit-3" />

        <div className="loader-core">
          <span />
        </div>
      </div>

      <div className="loading-content">
        <h2>Loading</h2>
        <p>
          Please wait<span className="dots">...</span>
        </p>
      </div>
    </div>
  );
}