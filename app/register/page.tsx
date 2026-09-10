"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Zap,
  Globe,
  Radio,
  ArrowUpRight,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCohortChecked, setIsCohortChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Compute workspace slug in real-time
  const computedSlug = company
    ? company.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
    : "my-workspace";

  // Dynamic Password Strength Meter
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 1;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        name: name || "Alex Rivera",
        email: email || "alex@company.com",
        company: company || "NextGen APIs (YC S26)",
        role: "Workspace Architect",
        token: "jwt-reg-" + Date.now(),
        registeredAt: Date.now(),
      };
      localStorage.setItem("apiflow_user", JSON.stringify(newUser));
      router.push("/onboarding");
    }, 500);
  };

  const handleDemoRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = {
        name: "Alex Rivera",
        email: "alex@apiflow.dev",
        company: "Stripe & AI Orchestrator (YC S26)",
        role: "Workspace Architect",
        token: "jwt-demo-" + Date.now(),
        registeredAt: Date.now(),
      };
      localStorage.setItem("apiflow_user", JSON.stringify(demoUser));
      router.push("/onboarding");
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
            <span>FOUNDER ONBOARDING</span>
          </div>

          <Link
            href="/login"
            style={{
              fontSize: "12px",
              color: "var(--dim-grey-light)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Have an account? Sign In</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Split Screen */}
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
        {/* LEFT COLUMN: Feature Grid & Live Dynamic Workspace Slug */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "26px",
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
              <span>APIFLOW TESTING SUITE</span>
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
              Build & Test Mission-Critical <br />
              <span style={{ color: "var(--neon-lime)" }}>API Workflows.</span>
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Set up your testing workspace in seconds. Connect sequential API test steps,
              configure endpoints & headers, and verify responses in a visual execution graph.
            </p>
          </div>

          {/* Interactive Dynamic Slug Preview */}
          <div
            style={{
              background: "rgba(18, 22, 30, 0.85)",
              border: "1px solid var(--border-medium)",
              borderRadius: "14px",
              padding: "18px 20px",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--dim-grey)", textTransform: "uppercase" }}>
                Dedicated Workspace Namespace
              </span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--neon-lime)" }}>
                ● LOCAL TESTING SANDBOX
              </span>
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "13px",
                color: "var(--text-white)",
                background: "var(--bg-app)",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--dim-grey)" }}>http://localhost:3000/workspaces/</span>
              <strong style={{ color: "var(--neon-lime)" }}>{computedSlug}</strong>
            </div>
          </div>

          {/* 3 Pillars List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                icon: Zap,
                title: "Visual API Execution Graphs",
                desc: "Chain sequential API nodes with directional connections and live step-by-step execution animation.",
              },
              {
                icon: ShieldCheck,
                title: "Precise Request & Assertions Inspector",
                desc: "Configure HTTP verbs, endpoints, auth tokens, custom headers, query params, and JSON request bodies.",
              },
              {
                icon: Globe,
                title: "Zero Cloud Latency & Local Sandbox",
                desc: "Simulate and verify complete end-to-end API workflows with zero external dependencies.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    background: "rgba(18, 22, 30, 0.5)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(186, 255, 57, 0.12)",
                      color: "var(--neon-lime)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-white)", marginBottom: "2px" }}>
                      {feature.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {feature.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Frosted Glass Registration Card */}
        <div
          style={{
            flex: "0 0 440px",
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
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "-0.4px",
                  color: "var(--text-white)",
                }}
              >
                Provision Workspace
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                Start orchestrating your pipelines with full local control.
              </p>
            </div>

            {/* 1-Click Instant Demo Sign Up */}
            <button
              type="button"
              onClick={handleDemoRegister}
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
              <span>Instant Demo Registration (1-Click)</span>
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
              <span style={{ padding: "0 10px" }}>OR FILL DETAILS</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "9px 12px 9px 36px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <User
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

              {/* Work Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                      padding: "9px 12px 9px 36px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      outline: "none",
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

              {/* Company / Workspace */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Company / Project Name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Scale (YC S26)"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "9px 12px 9px 36px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <Building
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
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                      padding: "9px 36px 9px 36px",
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

                {/* Password Strength Segments */}
                {password && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "3px" }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: "3px",
                          flex: 1,
                          borderRadius: "2px",
                          background:
                            strength >= level
                              ? level <= 2
                                ? "#fbbf24"
                                : "var(--neon-lime)"
                              : "var(--border-subtle)",
                          boxShadow: strength >= level ? "0 0 6px rgba(186, 255, 57, 0.4)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Checkbox for YC early cohort */}
              <div
                onClick={() => setIsCohortChecked(!isCohortChecked)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  marginTop: "2px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    background: isCohortChecked ? "var(--neon-lime)" : "var(--bg-surface-elevated)",
                    border: `1px solid ${isCohortChecked ? "var(--neon-lime)" : "var(--border-medium)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--neon-lime-dark)",
                  }}
                >
                  {isCohortChecked && <CheckCircle2 size={12} />}
                </div>
                <span>Fast-track setup with YC S26 Starter Blueprints</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: "6px",
                  background: "var(--neon-lime)",
                  border: "none",
                  color: "var(--neon-lime-dark)",
                  borderRadius: "8px",
                  padding: "11px 16px",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: "0 0 16px var(--neon-lime-glow)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{isLoading ? "Mounting Workspace..." : "Create Account & Continue"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Card Footer Links */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "14px",
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
                Already registered?{" "}
                <Link
                  href="/login"
                  style={{ color: "var(--neon-lime)", fontWeight: 700, textDecoration: "none" }}
                >
                  Sign in to workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
