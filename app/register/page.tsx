"use client";

import React, { useEffect, useState } from "react";
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
  Zap,
  Globe,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { SET_USERS } from "../lib/reducer/usersSlice";
import { request } from "../services/request";
import { toast } from "../components/Toast";
import { UserData } from "../types/userTypes";
import { PublicRoute } from "../components/PublicRoute";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Compute workspace slug in real-time
  const computedSlug = company
    ? company.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
    : "my-workspace";

  const dispatch = useAppDispatch();

  const getOnboardingDetails = useAppSelector(state => state.auth.onboardingData.company_name);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newUser: UserData = {
      full_name: fullName,
      email,
      company_name: company,
      password
    };

    try {
      await request<UserData>({
        method: 'POST',
        url: '/register',
        data: newUser
      });

      const { password, ...userWithoutPassword } = newUser;

      dispatch(SET_USERS(userWithoutPassword));
      toast.success(
        "Account Created Successfully!",
        `Welcome aboard, ${fullName || "User"}. Redirecting you to login...`
      );
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      toast.apiError(error, "Registration failed. Please check your details or backend server status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (getOnboardingDetails) {
      setCompany(getOnboardingDetails)
    }
  }, [getOnboardingDetails]);

  return (
    <PublicRoute>
    <div className="auth-root">
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
          width: "min(700px, 90vw)",
          height: "450px",
          background: "radial-gradient(circle, rgba(186, 255, 57, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Header */}
      <header className="auth-header">
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
      <main className="auth-main">
        {/* LEFT COLUMN: Feature Grid & Live Dynamic Workspace Slug */}
        <div className="auth-hero">
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

            <h1 className="auth-hero-title">
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

          {/* Interactive Dynamic Slug Preview
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
              <span style={{ color: "var(--dim-grey)" }}>http://your_company/workspaces/</span>
              <strong style={{ color: "var(--neon-lime)" }}>{computedSlug}</strong>
            </div>
          </div> */}

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
        <div className="auth-card-container">
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

          <div className="auth-card">
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
    </PublicRoute>
  );
}
