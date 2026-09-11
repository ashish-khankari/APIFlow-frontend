"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Globe,
  Database,
  Cpu,
  Play,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  ShieldCheck,
  Code2,
  Server,
  Layers,
  Flame,
  RefreshCw,
  Send,
  Radio,
  Clock,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useAppDispatch } from "./lib/hooks";
import { SET_ONBOARDING_DETAILS } from "./lib/reducer/usersSlice";

type TemplateType = "ecommerce" | "auth" | "stripe";

interface PipelineStep {
  name: string;
  type: string;
  badge: string;
  status: "idle" | "active" | "success";
  latency: string;
}

const TEMPLATES: Record<
  TemplateType,
  {
    id: TemplateType;
    title: string;
    subtitle: string;
    tag: string;
    nodes: PipelineStep[];
    samplePayload: object;
    curlCmd: string;
  }
> = {
  ecommerce: {
    id: "ecommerce",
    title: "E-commerce API Test (6 Nodes)",
    subtitle: "Sequential 6-step verification: Auth -> Profile -> Catalog -> Cart -> Checkout -> Logout.",
    tag: "E-COMMERCE / FULL FLOW",
    nodes: [
      { name: "Login API", type: "POST /login", badge: "AUTH", status: "idle", latency: "12.4ms" },
      { name: "Profile API", type: "GET /profile", badge: "USER CORE", status: "idle", latency: "8.2ms" },
      { name: "Products API", type: "GET /products", badge: "CATALOG", status: "idle", latency: "15.1ms" },
      { name: "Cart API", type: "POST /cart", badge: "CHECKOUT", status: "idle", latency: "9.4ms" },
      { name: "Checkout API", type: "POST /checkout", badge: "PAYMENT", status: "idle", latency: "28.6ms" },
      { name: "Logout API", type: "POST /logout", badge: "SESSION", status: "idle", latency: "6.5ms" },
    ],
    samplePayload: {
      auth: { user: "alex@ecommerce.com", token: "Bearer eyJhbGciOiJIUzI1Ni..." },
      cart: { sku: "PROD-101", quantity: 1, price: 49.0 },
      checkout: { payment_method: "mock_card", currency: "USD", status: "completed" },
    },
    curlCmd: `curl -X POST https://api.ecommerce.com/checkout \\\n  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"sku":"PROD-101","quantity":1,"currency":"USD"}'`,
  },
  auth: {
    id: "auth",
    title: "Authentication Flow (3 Nodes)",
    subtitle: "Core security handshake: User credentials login, JWT validation, and user profile retrieval.",
    tag: "AUTH / SECURITY",
    nodes: [
      { name: "Credentials Login", type: "POST /auth/login", badge: "AUTH", status: "idle", latency: "14.2ms" },
      { name: "Verify Token", type: "GET /auth/verify", badge: "SECURITY", status: "idle", latency: "4.1ms" },
      { name: "Tenant Profile", type: "GET /users/me", badge: "SESSION", status: "idle", latency: "7.8ms" },
    ],
    samplePayload: {
      email: "alex@company.com",
      token_type: "Bearer",
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expires_in: 3600,
      user_id: "usr_9912",
      role: "Workspace Architect",
    },
    curlCmd: `curl -X POST https://api.ecommerce.com/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"alex@company.com","password":"••••••••"}'`,
  },
  stripe: {
    id: "stripe",
    title: "Stripe Webhook & DB Sync (4 Nodes)",
    subtitle: "Real-time idempotent subscription processing with PostgreSQL ledger auditing.",
    tag: "FINTECH / BILLING",
    nodes: [
      { name: "Stripe Webhook Listener", type: "POST /webhook", badge: "TRIGGER", status: "idle", latency: "1.2ms" },
      { name: "Verify HMAC & Normalize", type: "Transform AST", badge: "SECURITY", status: "idle", latency: "3.4ms" },
      { name: "PostgreSQL Ledger Upsert", type: "SQL Query", badge: "DATABASE", status: "idle", latency: "8.1ms" },
      { name: "Slack & Email Notification", type: "Webhook Dispatch", badge: "ACTION", status: "idle", latency: "14.2ms" },
    ],
    samplePayload: {
      event: "charge.succeeded",
      id: "ch_3M4k92Lkd82a",
      amount: 4900,
      currency: "usd",
      customer: {
        id: "cus_YC_2026_Enterprise",
        email: "founder@nextunicorn.ai",
        tier: "Scale Enterprise",
      },
      idempotency_key: "idem_9a87f2b1c",
    },
    curlCmd: `curl -X POST https://api.flow.dev/v1/webhooks/stripe \\\n  -H "X-Signature: t=17258392,v1=9a8c..." \\\n  -d '{"event":"charge.succeeded","amount":4900}'`,
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [founderRole, setFounderRole] = useState("Founding Engineer");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("ecommerce");
  const [activeTab, setActiveTab] = useState<"visual" | "payload" | "curl">("visual");

  // Live simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(-1);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [liveLatency, setLiveLatency] = useState("14.2ms");

  // Step 3 ignition terminal lines
  const [ignitionProgress, setIgnitionProgress] = useState(0);
  const [ignitionLogs, setIgnitionLogs] = useState<string[]>([]);

  const currentTpl = TEMPLATES[selectedTemplate];

  const dispatch = useAppDispatch();

  // Test Fire Simulation Runner
  // Test Fire Simulation Runner
  const runTestSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveNodeIndex(0);
    setSimulatedLogs([`[0.0ms] ⚡ Initiating ${currentTpl.title} execution pipeline...`]);

    const totalNodes = currentTpl.nodes.length;
    currentTpl.nodes.forEach((node, idx) => {
      setTimeout(() => {
        setActiveNodeIndex(idx);
        setSimulatedLogs((prev) => [
          ...prev,
          `[+${node.latency}] ✓ Node ${idx + 1}: ${node.name} (${node.type}) verified with 200 OK`,
        ]);

        if (idx === totalNodes - 1) {
          setTimeout(() => {
            setActiveNodeIndex(-1);
            setIsSimulating(false);
            setLiveLatency(node.latency);
            setSimulatedLogs((prev) => [
              ...prev,
              `✨ Pipeline verified: all ${totalNodes} nodes passed deterministic test assertions.`,
            ]);
          }, 450);
        }
      }, (idx + 1) * 400);
    });
  };

  const handleCompanyName = () => {
    dispatch(SET_ONBOARDING_DETAILS({
      company_name: workspaceName,
    }));
    setStep(2);
  }

  // Launch Ignition Sequence (Step 3)
  useEffect(() => {
    if (step === 3) {
      setIgnitionProgress(10);
      setIgnitionLogs(["[SYS] Initializing isolated workflow runtime environment..."]);

      const timer1 = setTimeout(() => {
        setIgnitionProgress(35);
        setIgnitionLogs((p) => [...p, "[SEC] Generating HMAC cryptographic keys & local sandbox..."]);
      }, 400);

      const timer2 = setTimeout(() => {
        setIgnitionProgress(70);
        setIgnitionLogs((p) => [...p, `[NET] Mounting starter graph '${currentTpl.title}'...`]);
      }, 800);

      const timer3 = setTimeout(() => {
        setIgnitionProgress(100);
        setIgnitionLogs((p) => [
          ...p,
          "[ENG] High-performance GolfSpace Canvas Ready at 120 FPS.",
          "🚀 Launch sequence unlocked!",
        ]);
      }, 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step, currentTpl.title]);

  const handleFinishLaunch = () => {
    router.push("/register");
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
      {/* Background Animated Neon Glow Accent */}
      <div
        style={{
          position: "fixed",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "450px",
          background: "radial-gradient(circle, rgba(186, 255, 57, 0.12) 0%, rgba(18, 22, 30, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar */}
      <header
        style={{
          height: "64px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(18, 22, 30, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
        </div>

        {/* Stepper Header Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[
            { num: 1, label: "Workspace & Mission" },
            { num: 2, label: "Live Blueprint Sandbox" },
            { num: 3, label: "Engine Ignition" },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setStep(s.num as 1 | 2 | 3)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: isCurrent
                    ? "rgba(186, 255, 57, 0.12)"
                    : isDone
                      ? "var(--bg-surface-elevated)"
                      : "transparent",
                  border: `1px solid ${isCurrent
                    ? "var(--neon-lime)"
                    : isDone
                      ? "var(--border-medium)"
                      : "transparent"
                    }`,
                  color: isCurrent
                    ? "var(--neon-lime)"
                    : isDone
                      ? "var(--text-white)"
                      : "var(--dim-grey)",
                  fontSize: "12px",
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: isDone ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 800,
                    background: isCurrent
                      ? "var(--neon-lime)"
                      : isDone
                        ? "rgba(186, 255, 57, 0.3)"
                        : "var(--border-medium)",
                    color: isCurrent ? "var(--neon-lime-dark)" : "var(--neon-lime)",
                  }}
                >
                  {isDone ? <Check size={11} /> : s.num}
                </div>
                <span className="onboarding-stepper-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Main Studio Body */}
      <main
        className="onboarding-main"
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          zIndex: 10,
          maxWidth: "1480px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 32px",
          gap: "28px",
        }}
      >
        {/* LEFT COLUMN: Controls & Steps */}
        <div
          className="onboarding-left-col"
          style={{
            flex: "0 0 460px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* STEP 1: Mission & Identity */}
          {step === 1 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "16px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--neon-lime)",
                    marginBottom: "4px",
                  }}
                >
                  STEP 01 OF 03
                </div>
                <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                  Identify Your Production Domain
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Configure your high-throughput tenant. All workflows run locally with zero cloud vendor lock-in.
                </p>
              </div>

              {/* Workspace Name Input */}
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
                  Project / Company Name
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Acme Scale (YC S26)"
                    style={{
                      width: "100%",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "var(--text-white)",
                      fontSize: "13px",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Founder Persona Picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Engineering Persona
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    "Founding Engineer",
                    "API Platform Architect",
                    "AI Systems Lead",
                    "Fullstack Hacker",
                  ].map((role) => {
                    const isSelected = founderRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFounderRole(role)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: isSelected
                            ? "rgba(186, 255, 57, 0.12)"
                            : "var(--bg-surface-elevated)",
                          border: `1px solid ${isSelected ? "var(--neon-lime)" : "var(--border-subtle)"
                            }`,
                          color: isSelected ? "var(--neon-lime)" : "var(--text-white)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metric Highlights */}
              <div
                style={{
                  background: "var(--bg-app)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "var(--dim-grey)" }}>Engine Latency</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--neon-lime)" }}>
                    &lt; 0.4ms
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--dim-grey)" }}>Target Architecture</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-white)" }}>
                    Event-Driven
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--dim-grey)" }}>Palette Style</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--neon-lime)" }}>
                    GolfSpace Neon
                  </div>
                </div>
              </div>

              {/* Continue Action */}
              <button
                type="button"
                onClick={handleCompanyName}
                style={{
                  background: "var(--neon-lime)",
                  border: "none",
                  color: "var(--neon-lime-dark)",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 0 16px var(--neon-lime-glow)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>Enter Live Architecture Sandbox</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* STEP 2: Choose Blueprint */}
          {step === 2 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--neon-lime)",
                    marginBottom: "4px",
                  }}
                >
                  STEP 02 OF 03
                </div>
                <h2 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                  Select Production Blueprint
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  Click to switch live architectural topology on the simulator canvas.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(
                  [
                    {
                      id: "ecommerce",
                      icon: Globe,
                      title: "E-commerce API Test",
                      badge: "6 NODES",
                      desc: "6 nodes · Sequential validation · Full checkout lifecycle",
                    },
                    {
                      id: "auth",
                      icon: ShieldCheck,
                      title: "Authentication Flow",
                      badge: "3 NODES",
                      desc: "3 nodes · JWT issuance · Session & permission verification",
                    },
                    {
                      id: "stripe",
                      icon: Zap,
                      title: "Stripe Webhook & DB Sync",
                      badge: "4 NODES",
                      desc: "4 nodes · Idempotent Ledger · Instant Slack alerts",
                    },
                  ] as const
                ).map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: isSelected
                          ? "rgba(186, 255, 57, 0.08)"
                          : "var(--bg-surface-elevated)",
                        border: `1px solid ${isSelected ? "var(--neon-lime)" : "var(--border-subtle)"
                          }`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          background: isSelected ? "var(--neon-lime)" : "var(--bg-card)",
                          color: isSelected ? "var(--neon-lime-dark)" : "var(--dim-grey-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: isSelected ? "var(--neon-lime)" : "var(--text-white)",
                            }}
                          >
                            {tpl.title}
                          </span>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: isSelected
                                ? "rgba(186, 255, 57, 0.2)"
                                : "var(--bg-surface)",
                              color: isSelected ? "var(--neon-lime)" : "var(--dim-grey)",
                            }}
                          >
                            {tpl.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {tpl.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    flex: 2,
                    background: "var(--neon-lime)",
                    border: "none",
                    color: "var(--neon-lime-dark)",
                    borderRadius: "8px",
                    padding: "11px 16px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 0 16px var(--neon-lime-glow)",
                  }}
                >
                  <span>Proceed to Ignition</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Engine Ignition Sequence */}
          {step === 3 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "16px",
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--neon-lime)",
                    marginBottom: "4px",
                  }}
                >
                  STEP 03 OF 03 · READY
                </div>
                <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                  Ignition Sequence
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  Workspace: <strong style={{ color: "var(--text-white)" }}>{workspaceName}</strong> ({founderRole})
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                  <span style={{ color: "var(--dim-grey)", fontWeight: 700 }}>RUNTIME PROVISIONING</span>
                  <span style={{ color: "var(--neon-lime)", fontWeight: 800 }}>{ignitionProgress}%</span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "var(--bg-card)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${ignitionProgress}%`,
                      background: "var(--neon-lime)",
                      boxShadow: "0 0 10px var(--neon-lime)",
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Console log stream */}
              <div
                style={{
                  background: "var(--bg-app)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "11px",
                  color: "var(--dim-grey-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minHeight: "110px",
                }}
              >
                {ignitionLogs.map((line, i) => (
                  <div key={i} style={{ color: line.includes("🚀") || line.includes("Ready") ? "var(--neon-lime)" : "inherit" }}>
                    {line}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(2)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={ignitionProgress < 100}
                  onClick={handleFinishLaunch}
                  style={{
                    flex: 2,
                    background: "var(--neon-lime)",
                    border: "none",
                    color: "var(--neon-lime-dark)",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: ignitionProgress === 100 ? "pointer" : "wait",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 0 24px var(--neon-lime-glow)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Flame size={16} />
                  <span>Launch Flow Canvas</span>
                </button>
              </div>
            </div>
          )}

          {/* Developer Quick Badge */}
          <div
            style={{
              background: "rgba(18, 22, 30, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(186, 255, 57, 0.15)",
                color: "var(--neon-lime)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={14} />
            </div>
            <div style={{ fontSize: "11px", color: "var(--dim-grey-light)", lineHeight: 1.4 }}>
              Zero external telemetry required. Built for ultra-low latency internal APIs and mission-critical workflows.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Pipeline Simulator */}
        <div
          className="onboarding-sandbox-col"
          style={{
            flex: 1,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-medium)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.5)",
            position: "relative",
          }}
        >
          {/* Simulator Top Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isSimulating ? "#38bdf8" : "var(--neon-lime)",
                  boxShadow: `0 0 10px ${isSimulating ? "#38bdf8" : "var(--neon-lime)"}`,
                }}
              />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-white)" }}>
                  {currentTpl.title}
                </div>
                <div style={{ fontSize: "10px", color: "var(--dim-grey)", fontWeight: 700, letterSpacing: "0.5px" }}>
                  {currentTpl.tag} · LATENCY BENCHMARK: {liveLatency}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Tab Selector */}
              <div
                style={{
                  display: "flex",
                  background: "var(--bg-app)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "2px",
                }}
              >
                {(
                  [
                    { id: "visual", label: "Interactive Canvas" },
                    { id: "payload", label: "Payload (JSON)" },
                    { id: "curl", label: "cURL Test" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      background: activeTab === t.id ? "var(--bg-card)" : "transparent",
                      color: activeTab === t.id ? "var(--text-white)" : "var(--dim-grey)",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Fire Test Button */}
              <button
                type="button"
                onClick={runTestSimulation}
                disabled={isSimulating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isSimulating ? "rgba(186, 255, 57, 0.2)" : "var(--neon-lime)",
                  color: isSimulating ? "var(--neon-lime)" : "var(--neon-lime-dark)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: isSimulating ? "wait" : "pointer",
                  boxShadow: isSimulating ? "none" : "0 0 12px var(--neon-lime-glow)",
                  transition: "all 0.15s ease",
                }}
              >
                <Play size={12} fill={isSimulating ? "var(--neon-lime)" : "var(--neon-lime-dark)"} />
                <span>{isSimulating ? "Propagating..." : "Test Fire Event"}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Visual Dynamic Node Pipeline */}
          {activeTab === "visual" && (
            <div
              style={{
                flex: 1,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "var(--bg-app)",
                position: "relative",
              }}
            >
              {/* Background dot grid pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(#202735 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: 0.8,
                  pointerEvents: "none",
                }}
              />

              {/* Interactive Node Chain */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: currentTpl.nodes.length <= 4 ? "space-between" : "flex-start",
                  position: "relative",
                  zIndex: 2,
                  overflowX: "auto",
                  padding: "16px 8px",
                  gap: currentTpl.nodes.length <= 4 ? "0" : "8px",
                  scrollbarWidth: "thin",
                }}
              >
                {currentTpl.nodes.map((node, index) => {
                  const isActive = activeNodeIndex === index;
                  const isDone = activeNodeIndex > index;
                  return (
                    <React.Fragment key={node.name}>
                      {/* Node Card */}
                      <div
                        style={{
                          width: currentTpl.nodes.length <= 4 ? "170px" : "150px",
                          minWidth: currentTpl.nodes.length <= 4 ? "150px" : "140px",
                          flexShrink: 0,
                          background: isActive
                            ? "rgba(186, 255, 57, 0.1)"
                            : "var(--bg-card)",
                          border: `1px solid ${isActive
                            ? "var(--neon-lime)"
                            : isDone
                              ? "rgba(186, 255, 57, 0.4)"
                              : "var(--border-medium)"
                            }`,
                          borderRadius: "10px",
                          padding: "12px",
                          boxShadow: isActive
                            ? "0 0 20px var(--neon-lime-glow), 0 8px 24px rgba(0,0,0,0.5)"
                            : "0 6px 18px rgba(0,0,0,0.3)",
                          transform: isActive ? "scale(1.05)" : "scale(1)",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          position: "relative",
                        }}
                      >
                        {/* Port Handle indicator */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: isActive ? "var(--neon-lime)" : "var(--dim-grey)",
                            border: "1px solid var(--bg-card)",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: "-5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: isActive ? "var(--neon-lime)" : "var(--dim-grey)",
                            border: "1px solid var(--bg-card)",
                          }}
                        />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "2px 5px",
                              borderRadius: "3px",
                              background: isActive
                                ? "var(--neon-lime)"
                                : "rgba(255, 255, 255, 0.08)",
                              color: isActive ? "var(--neon-lime-dark)" : "var(--neon-lime)",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {node.badge}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--dim-grey)", fontFamily: "monospace" }}>
                            {node.latency}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--text-white)",
                            lineHeight: 1.3,
                            marginBottom: "4px",
                          }}
                        >
                          {node.name}
                        </div>

                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--dim-grey-light)",
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {node.type}
                        </div>
                      </div>

                      {/* Connection Line with animated energy pulse */}
                      {index < currentTpl.nodes.length - 1 && (
                        <div
                          style={{
                            flex: currentTpl.nodes.length <= 4 ? 1 : "none",
                            width: currentTpl.nodes.length <= 4 ? "auto" : "24px",
                            minWidth: "16px",
                            height: "2px",
                            background: isDone
                              ? "var(--neon-lime)"
                              : isActive
                                ? "linear-gradient(90deg, var(--neon-lime), var(--border-medium))"
                                : "var(--border-medium)",
                            position: "relative",
                            margin: "0 6px",
                            boxShadow: isDone ? "0 0 8px var(--neon-lime)" : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {/* Pulsing particle */}
                          {isActive && (
                            <div
                              style={{
                                position: "absolute",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--neon-lime)",
                                boxShadow: "0 0 10px var(--neon-lime)",
                                top: "-2px",
                                left: "50%",
                                transform: "translateX(-50%)",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Execution Telemetry Console Log */}
              <div
                style={{
                  marginTop: "32px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  zIndex: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>
                    <Terminal size={14} />
                    <span>EVENT PROPAGATION MONITOR</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--neon-lime)", fontFamily: "monospace", fontWeight: 700 }}>
                    {isSimulating ? "● EXECUTING EVENT" : "● READY TO FIRE"}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "11px",
                    color: "var(--dim-grey-light)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: "56px",
                  }}
                >
                  {simulatedLogs.length === 0 ? (
                    <span style={{ color: "var(--dim-grey)" }}>
                      Click &quot;Test Fire Event&quot; above to trace live event packets through each stage.
                    </span>
                  ) : (
                    simulatedLogs.slice(-3).map((log, i) => (
                      <div key={i} style={{ color: log.includes("✓") || log.includes("✨") ? "var(--neon-lime)" : "inherit" }}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Payload Preview */}
          {activeTab === "payload" && (
            <div
              style={{
                flex: 1,
                background: "var(--bg-app)",
                padding: "20px",
                overflow: "auto",
                fontFamily: "ui-monospace, monospace",
                fontSize: "12px",
              }}
            >
              <div style={{ color: "var(--dim-grey)", marginBottom: "8px", fontSize: "11px" }}>
                // Inbound normalized JSON payload passing through pipeline:
              </div>
              <pre
                style={{
                  margin: 0,
                  color: "var(--neon-lime)",
                  lineHeight: 1.5,
                }}
              >
                {JSON.stringify(currentTpl.samplePayload, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: cURL Command */}
          {activeTab === "curl" && (
            <div
              style={{
                flex: 1,
                background: "var(--bg-app)",
                padding: "24px",
                fontFamily: "ui-monospace, monospace",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ color: "var(--dim-grey)", fontSize: "11px" }}>
                // Trigger this workflow directly from terminal, GitHub Actions, or webhook providers:
              </div>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#38bdf8",
                  lineHeight: 1.6,
                }}
              >
                {currentTpl.curlCmd}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
