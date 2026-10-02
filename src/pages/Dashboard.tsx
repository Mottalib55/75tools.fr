import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save, LogOut, Upload, User, Phone, Mail, Briefcase, ExternalLink,
  Linkedin, Twitter, Instagram, Github, Facebook, Youtube,
  Globe, MessageCircle, Send, Music2, Camera, Link, Copy, Check, CreditCard,
  QrCode, Download, X, Eye, UserCheck, BarChart3, TrendingUp
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Profile } from "@/lib/supabase";
import SEO from "@/components/SEO";

interface SocialField {
  value: string;
  enabled: boolean;
}

interface FieldConfig {
  key: string;
  dbKey: string;
  enabledKey?: string; // Optional: use when enabled key differs from dbKey
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
}

interface AnalyticsData {
  views: number;
  contacts_saved: number;
  whatsapp_clicks: number;
  linkedin_clicks: number;
}

interface ChartDataPoint {
  date: string;
  views: number;
  contacts: number;
  whatsapp: number;
  linkedin: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views: 0,
    contacts_saved: 0,
    whatsapp_clicks: 0,
    linkedin_clicks: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartPeriod, setChartPeriod] = useState<7 | 30 | 90>(7);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [user, authLoading]);

  // Reload chart when period changes
  useEffect(() => {
    if (profileId) {
      loadAnalytics(profileId);
    }
  }, [chartPeriod]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setProfileId(data.id);
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
      // Load analytics for this profile
      loadAnalytics(data.id);
    }
    setLoading(false);
  };

  const loadAnalytics = async (profileId: string) => {
    const { data, error } = await supabase
      .from("analytics")
      .select("event_type, created_at")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error loading analytics:", error);
      return;
    }

    if (data) {
      // Calculate totals
      const counts = {
        views: data.filter((e) => e.event_type === "view").length,
        contacts_saved: data.filter((e) => e.event_type === "contact_saved").length,
        whatsapp_clicks: data.filter((e) => e.event_type === "whatsapp_click").length,
        linkedin_clicks: data.filter((e) => e.event_type === "linkedin_click").length,
      };
      setAnalytics(counts);

      // Generate chart data based on selected period
      const chartPoints: ChartDataPoint[] = [];
      const days = chartPeriod;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayEvents = data.filter((e) => e.created_at?.startsWith(dateStr));

        // Format date based on period
        let dateLabel: string;
        if (days <= 7) {
          dateLabel = date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
        } else if (days <= 30) {
          dateLabel = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        } else {
          dateLabel = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        }

        chartPoints.push({
          date: dateLabel,
          views: dayEvents.filter((e) => e.event_type === "view").length,
          contacts: dayEvents.filter((e) => e.event_type === "contact_saved").length,
          whatsapp: dayEvents.filter((e) => e.event_type === "whatsapp_click").length,
          linkedin: dayEvents.filter((e) => e.event_type === "linkedin_click").length,
        });
      }
      setChartData(chartPoints);
    }
  };

  const handleChange = (key: string, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    let avatarUrl = profile.avatar_url;

    // Upload avatar if changed
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        setError(`Failed to upload photo: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      avatarUrl = data.publicUrl;
    }

    // Only update editable fields, exclude id, user_id, username, created_at
    const { id, user_id, username, created_at, ...editableFields } = profile as any;

    const updateData = {
      ...editableFields,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id);

    if (updateError) {
      setError(`Failed to save: ${updateError.message}`);
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getCardUrl = () => {
    return `${window.location.origin}/card/${profile.username}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getCardUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contactFields: FieldConfig[] = [
    { key: "phone", dbKey: "phone", label: "Phone", icon: <Phone size={18} />, placeholder: "+1 555 123 4567", type: "tel" },
    { key: "email", dbKey: "email_contact", enabledKey: "email", label: "Email", icon: <Mail size={18} />, placeholder: "contact@example.com", type: "email" },
    { key: "website", dbKey: "website", label: "Website", icon: <Globe size={18} />, placeholder: "https://mysite.com", type: "url" },
  ];

  const professionalFields: FieldConfig[] = [
    { key: "linkedin", dbKey: "linkedin", label: "LinkedIn", icon: <Linkedin size={18} />, placeholder: "https://linkedin.com/in/username" },
  ];

  const socialFields: FieldConfig[] = [
    { key: "twitter", dbKey: "twitter", label: "Twitter / X", icon: <Twitter size={18} />, placeholder: "https://twitter.com/username" },
    { key: "instagram", dbKey: "instagram", label: "Instagram", icon: <Instagram size={18} />, placeholder: "https://instagram.com/username" },
    { key: "facebook", dbKey: "facebook", label: "Facebook", icon: <Facebook size={18} />, placeholder: "https://facebook.com/username" },
    { key: "tiktok", dbKey: "tiktok", label: "TikTok", icon: <Music2 size={18} />, placeholder: "https://tiktok.com/@username" },
    { key: "youtube", dbKey: "youtube", label: "YouTube", icon: <Youtube size={18} />, placeholder: "https://youtube.com/@username" },
    { key: "snapchat", dbKey: "snapchat", label: "Snapchat", icon: <Camera size={18} />, placeholder: "username" },
  ];

  const techFields: FieldConfig[] = [
    { key: "github", dbKey: "github", label: "GitHub", icon: <Github size={18} />, placeholder: "https://github.com/username" },
  ];

  const messagingFields: FieldConfig[] = [
    { key: "whatsapp", dbKey: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={18} />, placeholder: "+33612345678", type: "tel" },
    { key: "telegram", dbKey: "telegram", label: "Telegram", icon: <Send size={18} />, placeholder: "@username" },
  ];

  const renderFieldGroup = (title: string, fields: FieldConfig[]) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">
        {fields.map((field) => {
          const value = (profile as any)[field.dbKey] || "";
          const enabledFieldKey = field.enabledKey ? `${field.enabledKey}_enabled` : `${field.dbKey}_enabled`;
          const enabled = (profile as any)[enabledFieldKey] ?? false;
          return (
            <div
              key={field.key}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                enabled ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => handleChange(enabledFieldKey, !enabled)}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  enabled ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {field.icon}
              </button>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-slate-500 mb-1">{field.label}</label>
                <input
                  type={field.type || "url"}
                  value={value}
                  onChange={(e) => handleChange(field.dbKey, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={!enabled}
                  className={`w-full text-sm bg-transparent border-0 p-0 focus:ring-0 outline-none ${
                    enabled ? "text-slate-900" : "text-slate-400"
                  }`}
                />
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleChange(enabledFieldKey, !enabled)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div data-clarity-mask="true" className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <SEO
        title="Dashboard - MyCard"
        description="Manage your digital business card, view your stats and customize your profile."
        url="https://75tools.fr/dashboard"
        noindex={true}
      />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">MyCard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(getCardUrl(), "_blank")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ExternalLink size={18} />
              <span className="hidden sm:inline">View my card</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Share Link */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <h2 className="font-semibold mb-2">Your card link</h2>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl p-3">
            <span className="flex-1 text-sm truncate">
              {getCardUrl()}
            </span>
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">QR</span>
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Your QR Code</h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
                  <QRCodeCanvas
                    id="dashboard-qr-code"
                    value={getCardUrl()}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-3 text-center">
                  Scan to view your digital card
                </p>
                <button
                  onClick={() => {
                    const canvas = document.getElementById("dashboard-qr-code") as HTMLCanvasElement;
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `qrcode-${profile.username || "card"}.png`;
                    link.click();
                  }}
                  className="mt-4 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  <Download size={18} />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <BarChart3 size={20} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900">Analytics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.views}</p>
              <p className="text-xs text-blue-500 font-medium">Card Views</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCheck size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-green-600">{analytics.contacts_saved}</p>
              <p className="text-xs text-green-500 font-medium">Contacts Saved</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{analytics.whatsapp_clicks}</p>
              <p className="text-xs text-emerald-500 font-medium">WhatsApp Clicks</p>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-2">
                <Linkedin size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-sky-600">{analytics.linkedin_clicks}</p>
              <p className="text-xs text-sky-500 font-medium">LinkedIn Clicks</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-400" />
                <h3 className="font-medium text-slate-700">Activity</h3>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setChartPeriod(7)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartPeriod === 7
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  7 days
                </button>
                <button
                  onClick={() => setChartPeriod(30)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartPeriod === 30
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  1 month
                </button>
                <button
                  onClick={() => setChartPeriod(90)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartPeriod === 90
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  3 months
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0A66C2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ fontWeight: 600, color: '#1E293B' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="contacts"
                    name="Contacts"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContacts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="whatsapp"
                    name="WhatsApp"
                    stroke="#25D366"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWhatsapp)"
                  />
                  <Area
                    type="monotone"
                    dataKey="linkedin"
                    name="LinkedIn"
                    stroke="#0A66C2"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLinkedin)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-600">Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-600">Contacts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#25D366]"></div>
                <span className="text-xs text-slate-600">WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#0A66C2]"></div>
                <span className="text-xs text-slate-600">LinkedIn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Identité */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User size={20} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Identity</h2>
            </div>

            {/* Photo */}
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload size={24} className="text-slate-300" />
                </div>
              )}
              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Upload size={16} />
                  Choose a photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400">JPG, PNG. Max 2MB</p>
              </div>
            </div>

            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">First name</label>
                <input
                  type="text"
                  value={profile.first_name || ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Last name</label>
                <input
                  type="text"
                  value={profile.last_name || ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Titre & Entreprise */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Title / Position</label>
                <input
                  type="text"
                  value={profile.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Web Developer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Company</label>
                <input
                  type="text"
                  value={profile.company || ""}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="My Company"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="A short description about yourself..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition resize-none text-sm"
              />
            </div>
          </div>

          {/* Section: Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Phone size={20} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Contact</h2>
            </div>
            {renderFieldGroup("Contact info", contactFields)}
          </div>

          {/* Section: Réseaux Professionnels */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Briefcase size={20} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Professional</h2>
            </div>
            {renderFieldGroup("Professional networks", professionalFields)}
            {renderFieldGroup("Messaging", messagingFields)}
          </div>

          {/* Section: Réseaux Sociaux */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Link size={20} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Social Networks</h2>
            </div>
            {renderFieldGroup("Social platforms", socialFields)}
            {renderFieldGroup("Tech & Dev", techFields)}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 font-medium py-4 px-6 rounded-xl transition-all shadow-lg ${
              saved
                ? "bg-green-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl"
            }`}
          >
            <Save size={20} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
