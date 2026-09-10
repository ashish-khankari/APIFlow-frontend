"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Zap,
  Radio,
  Cpu,
  Database,
  Activity,
  ArrowUpRight,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"magic" | "password">("password");

  // Interactive Live Pipeline packet state
  const [activeStep, setActiveStep] = useState(0);

  // Cycle through steps every 1.5s for live visual energy
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = {
        name: email ? email.split("@")[0] : "Alex Rivera",
        email: email || "alex@apiflow.dev",
        role: "YC S26 Founder",
        token: "demo-jwt-token-" + Date.now(),
        loggedAt: Date.now(),
      };
      localStorage.setItem("apiflow_user", JSON.stringify(user));
      router.push("/");
    }, 500);
  };

  const handleFastPass = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = {
        name: "Alex Rivera",
        email: "alex@apiflow.dev",
        role: "YC S26 Reviewer",
        token: "demo-yc-fastpass",
        loggedAt: Date.now(),
      };
      localStorage.setItem("apiflow_user", JSON.stringify(demoUser));
      router.push("/");
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app)",
        color: "var(--text-white)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background Animated Neon Grid & Radial Spotlights */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(#1E2533 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.65,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "450px",
          background: "radial-gradient(circle, rgba(186, 255, 57, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          right: "20%",
          width: "500px",
          height: "350px",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Header */}
      <header
        style={{
          height: "64px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(18, 22, 30, 0.7)",
          backdropFilter: "blur(12px)",
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 20,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--neon-lime)",
              color: "var(--neon-lime-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "16px",
              boxShadow: "0 0 16px var(--neon-lime-glow)",
            }}
          >
            ⚡
          </div>
          <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-white)", letterSpacing: "-0.4px" }}>
            API FLOW
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(186, 255, 57, 0.08)",
              border: "1px solid rgba(186, 255, 57, 0.25)",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--neon-lime)",
            }}
          >
            <Radio size={11} className="animate-pulse" />
            <span>YC S26 DEMO ENVIRONMENT</span>
          </div>

          <Link
            href="/"
            style={{
              fontSize: "12px",
              color: "var(--dim-grey-light)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Skip to Canvas</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Split Screen Showcase */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "36px 28px",
          gap: "64px",
        }}
      >
        {/* LEFT COLUMN: Hero & Animated Interactive Graph Preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "540px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(186, 255, 57, 0.12)",
                border: "1px solid rgba(186, 255, 57, 0.35)",
                padding: "5px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--neon-lime)",
                letterSpacing: "0.5px",
                marginBottom: "16px",
              }}
            >
              <Sparkles size={12} />
              <span>THE VISUAL RUNTIME FOR API WORKFLOW TESTING</span>
            </div>

            <h1
              style={{
                margin: "0 0 14px",
                fontSize: "36px",
                fontWeight: 900,
                color: "var(--text-white)",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              Test Every API Workflow. <br />
              <span style={{ color: "var(--neon-lime)" }}>Visual. Deterministic. Fast.</span>
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Design multi-step API sequences with visual node inspection, automated request chaining,
              and live status code verification in a unified canvas.
            </p>
          </div>

          {/* Interactive Live Mini-Flow Card */}
          <div
            style={{
              background: "rgba(18, 22, 30, 0.85)",
              border: "1px solid var(--border-medium)",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--neon-lime)",
                    boxShadow: "0 0 8px var(--neon-lime)",
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-white)" }}>
                  Sequential Pipeline Verification
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "var(--neon-lime)",
                  fontFamily: "monospace",
                }}
              >
                200 OK · 243ms
              </span>
            </div>

            {/* 3 Animated Nodes Chain */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              {[
                { label: "Login API", sub: "POST /login", icon: Zap },
                { label: "Profile API", sub: "GET /profile", icon: Globe },
                { label: "Products API", sub: "GET /products", icon: Database },
              ].map((node, i) => {
                const Icon = node.icon;
                const isCurrent = activeStep === i;
                return (
                  <React.Fragment key={node.label}>
                    <div
                      style={{
                        flex: 1,
                        background: isCurrent
                          ? "rgba(186, 255, 57, 0.12)"
                          : "var(--bg-card)",
                        border: `1px solid ${
                          isCurrent ? "var(--neon-lime)" : "var(--border-subtle)"
                        }`,
                        borderRadius: "8px",
                        padding: "10px",
                        transition: "all 0.3s ease",
                        transform: isCurrent ? "scale(1.04)" : "scale(1)",
                        boxShadow: isCurrent ? "0 0 14px var(--neon-lime-glow)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                          color: isCurrent ? "var(--neon-lime)" : "var(--text-white)",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        <Icon size={12} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {node.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "var(--dim-grey-light)",
                          fontFamily: "monospace",
                        }}
                      >
                        {node.sub}
                      </div>
                    </div>

                    {i < 2 && (
                      <div
                        style={{
                          width: "20px",
                          height: "2px",
                          background:
                            activeStep > i
                              ? "var(--neon-lime)"
                              : isCurrent
                              ? "linear-gradient(90deg, var(--neon-lime), var(--border-medium))"
                              : "var(--border-medium)",
                          boxShadow: activeStep > i ? "0 0 6px var(--neon-lime)" : "none",
                          transition: "all 0.3s ease",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Testimonial Quote */}
            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "12px",
                fontSize: "11px",
                color: "var(--text-secondary)",
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: "var(--text-white)" }}>&quot;APIFlow turned 6 separate Postman requests</strong> into an automated, visual end-to-end testing pipeline in minutes.&quot;
            </div>
          </div>

          {/* Metric Badges */}
          <div style={{ display: "flex", gap: "16px" }}>
            {[
              { val: "6 Nodes", label: "Pipeline Depth" },
              { val: "< 1.2s", label: "End-to-End Latency" },
              { val: "100%", label: "Assertion Pass Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--neon-lime)" }}>
                  {stat.val}
                </div>
                <div style={{ fontSize: "11px", color: "var(--dim-grey)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: High-End Frosted Glass Auth Card */}
        <div
          style={{
            flex: "0 0 420px",
            position: "relative",
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              inset: "-10px",
              background: "radial-gradient(circle, rgba(186, 255, 57, 0.15) 0%, transparent 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              background: "rgba(18, 22, 30, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border-bright)",
              borderRadius: "18px",
              padding: "36px 32px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 24px rgba(186, 255, 57, 0.08)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ marginBottom: "22px" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "-0.4px",
                  color: "var(--text-white)",
                }}
              >
                Sign In to Workspace
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                Enter your credentials or use the 1-Click Fast Pass.
              </p>
            </div>

            {/* 1-Click Fast Pass for YC Reviewers */}
            <button
              type="button"
              onClick={handleFastPass}
              disabled={isLoading}
              style={{
                width: "100%",
                background: "var(--neon-lime)",
                border: "none",
                color: "var(--neon-lime-dark)",
                borderRadius: "10px",
                padding: "12px 18px",
                fontSize: "13px",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 0 20px var(--neon-lime-glow)",
                transition: "all 0.15s ease",
                marginBottom: "20px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 0 28px rgba(186, 255, 57, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 20px var(--neon-lime-glow)";
              }}
            >
              <Sparkles size={15} />
              <span>1-Click YC Reviewer Fast Pass</span>
              <ArrowRight size={14} />
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "0 0 18px",
                color: "var(--dim-grey)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
              <span style={{ padding: "0 10px" }}>OR LOGIN WITH EMAIL</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@startup.com"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "10px 12px 10px 36px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                    }}
                  />
                  <Mail
                    size={15}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--dim-grey)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPassword("demo1234");
                    }}
                    style={{
                      fontSize: "11px",
                      color: "var(--neon-lime)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Use Demo Pass
                  </a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "10px 36px 10px 36px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <Lock
                    size={15}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--dim-grey)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "var(--dim-grey)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: "6px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-bright)",
                  color: "var(--text-white)",
                  borderRadius: "8px",
                  padding: "11px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--neon-lime)";
                  e.currentTarget.style.color = "var(--neon-lime)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-bright)";
                  e.currentTarget.style.color = "var(--text-white)";
                }}
              >
                <span>{isLoading ? "Authenticating Session..." : "Sign In with Credentials"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Card Footer Links */}
            <div
              style={{
                marginTop: "22px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <div>
                Don&apos;t have a workspace?{" "}
                <Link
                  href="/register"
                  style={{ color: "var(--neon-lime)", fontWeight: 700, textDecoration: "none" }}
                >
                  Create workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
