import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Instagram, Linkedin, Github, Facebook, Youtube,
  Mail, Phone, UserPlus, Globe, QrCode, Download,
  LayoutDashboard, LogIn, UserPlus as UserPlusIcon, ArrowLeft, Share2,
  Smartphone, X, Plus, MoreVertical
} from "lucide-react";

// Custom SVG icons for social platforms
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const SnapchatIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.217-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
  </svg>
);

const XTwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

// Brand colors for social platforms
const socialColors: Record<string, { bg: string; hover: string; text: string }> = {
  instagram: { bg: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]", hover: "hover:opacity-90", text: "text-white" },
  linkedin: { bg: "bg-[#0A66C2]", hover: "hover:bg-[#004182]", text: "text-white" },
  twitter: { bg: "bg-black", hover: "hover:bg-gray-800", text: "text-white" },
  facebook: { bg: "bg-[#1877F2]", hover: "hover:bg-[#0d65d9]", text: "text-white" },
  tiktok: { bg: "bg-black", hover: "hover:bg-gray-800", text: "text-white" },
  youtube: { bg: "bg-[#FF0000]", hover: "hover:bg-[#cc0000]", text: "text-white" },
  snapchat: { bg: "bg-[#FFFC00]", hover: "hover:bg-[#e6e300]", text: "text-black" },
  github: { bg: "bg-[#181717]", hover: "hover:bg-[#333]", text: "text-white" },
  whatsapp: { bg: "bg-[#25D366]", hover: "hover:bg-[#1fb855]", text: "text-white" },
  telegram: { bg: "bg-[#26A5E4]", hover: "hover:bg-[#1e8bc3]", text: "text-white" },
};
import { QRCodeCanvas } from "qrcode.react";
import { supabase, Profile } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";

const PublicCard = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [showAddToHome, setShowAddToHome] = useState(false);

  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  // Track analytics event
  const trackEvent = async (eventType: string, profileId: string) => {
    if (profileId === "demo") return; // Don't track demo profile
    try {
      const { data, error } = await supabase.from("analytics").insert({
        profile_id: profileId,
        event_type: eventType,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      }).select();

      if (error) {
        console.error("Analytics insert error:", error.message, error.details);
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  // Track page view once profile is loaded
  useEffect(() => {
    if (profile && !viewTracked && profile.id !== "demo") {
      trackEvent("view", profile.id);
      setViewTracked(true);
    }
  }, [profile, viewTracked]);

  // Dynamic manifest for PWA - allows each card to be saved to home screen with correct URL
  useEffect(() => {
    if (!profile || !username) return;

    const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    // Use absolute URL for iOS Safari compatibility
    const baseUrl = window.location.origin;
    const cardUrl = `${baseUrl}/card/${username}`;

    const manifest = {
      name: fullName || "Digital Card",
      short_name: profile.first_name || "Card",
      description: profile.title ? `${fullName} - ${profile.title}` : `${fullName}'s digital business card`,
      start_url: cardUrl,
      scope: `${baseUrl}/card/`,
      id: `/card/${username}`,
      display: "standalone",
      background_color: "#f1f5f9",
      theme_color: "#0f172a",
      icons: [
        {
          src: profile.avatar_url || `${baseUrl}/favicon.svg`,
          sizes: "any",
          type: profile.avatar_url ? "image/jpeg" : "image/svg+xml",
          purpose: "any maskable"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const manifestUrl = URL.createObjectURL(blob);

    // Remove existing manifest link and add new one
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.setAttribute("href", manifestUrl);
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = manifestUrl;
      document.head.appendChild(link);
    }

    // Update apple-mobile-web-app-title
    let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitleMeta) {
      appleTitleMeta.setAttribute("content", fullName || "Card");
    }

    return () => {
      URL.revokeObjectURL(manifestUrl);
    };
  }, [profile, username]);

  const loadProfile = async () => {
    if (!username) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Demo profile
    if (username === "demo") {
      setProfile({
        id: "demo",
        user_id: "demo",
        username: "demo",
        first_name: "Marie",
        last_name: "Martin",
        title: "UX Designer",
        company: "Creative Studio",
        bio: "Passionate about design and user experience. I create intuitive and elegant interfaces.",
        avatar_url: "",
        phone: "+33612345678",
        phone_enabled: true,
        email_contact: "marie@example.com",
        email_enabled: true,
        website: "https://mariemartin.design",
        website_enabled: true,
        linkedin: "https://linkedin.com/in/mariemartin",
        linkedin_enabled: true,
        twitter: "https://twitter.com/mariemartin",
        twitter_enabled: true,
        instagram: "https://instagram.com/mariemartin",
        instagram_enabled: true,
        facebook: "",
        facebook_enabled: false,
        tiktok: "",
        tiktok_enabled: false,
        youtube: "",
        youtube_enabled: false,
        snapchat: "",
        snapchat_enabled: false,
        github: "",
        github_enabled: false,
        whatsapp: "+33612345678",
        whatsapp_enabled: true,
        telegram: "",
        telegram_enabled: false,
        created_at: "",
        updated_at: "",
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const isFieldActive = (value: string | undefined, enabled: boolean | undefined) => {
    return enabled && value && value.trim() !== "";
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.startsWith("+33") && cleaned.length === 12) {
      return cleaned.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5 $6");
    }
    return phone;
  };

  const generateVCard = () => {
    if (!profile) return;

    // Track contact save
    trackEvent("contact_saved", profile.id);

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.first_name} ${profile.last_name}
N:${profile.last_name};${profile.first_name};;;
${profile.title ? `TITLE:${profile.title}` : ""}
${profile.company ? `ORG:${profile.company}` : ""}
${isFieldActive(profile.phone, profile.phone_enabled) ? `TEL;TYPE=CELL:${profile.phone}` : ""}
${isFieldActive(profile.email_contact, profile.email_enabled) ? `EMAIL:${profile.email_contact}` : ""}
${isFieldActive(profile.website, profile.website_enabled) ? `URL:${profile.website}` : ""}
END:VCARD`.replace(/\n{2,}/g, "\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.first_name}_${profile.last_name}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, "").replace("+", "");
    return `https://wa.me/${cleaned}`;
  };

  const getTelegramLink = (username: string) => {
    const cleaned = username.replace("@", "");
    return `https://t.me/${cleaned}`;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/card/${username}`;
    const shareData = {
      title: `${profile?.first_name} ${profile?.last_name}`.trim() || "Digital Business Card",
      text: profile?.title
        ? `Check out ${profile?.first_name}'s digital business card - ${profile?.title}`
        : `Check out this digital business card`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <p className="text-slate-500 mb-6">This card doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const socialLinks = [
    { key: "linkedin", icon: <Linkedin size={20} />, value: profile.linkedin, enabled: profile.linkedin_enabled, label: "LinkedIn" },
    { key: "twitter", icon: <XTwitterIcon size={20} />, value: profile.twitter, enabled: profile.twitter_enabled, label: "X (Twitter)" },
    { key: "instagram", icon: <Instagram size={20} />, value: profile.instagram, enabled: profile.instagram_enabled, label: "Instagram" },
    { key: "facebook", icon: <Facebook size={20} />, value: profile.facebook, enabled: profile.facebook_enabled, label: "Facebook" },
    { key: "tiktok", icon: <TikTokIcon size={20} />, value: profile.tiktok, enabled: profile.tiktok_enabled, label: "TikTok" },
    { key: "youtube", icon: <Youtube size={20} />, value: profile.youtube, enabled: profile.youtube_enabled, label: "YouTube" },
    { key: "snapchat", icon: <SnapchatIcon size={20} />, value: profile.snapchat, enabled: profile.snapchat_enabled, label: "Snapchat" },
    { key: "github", icon: <Github size={20} />, value: profile.github, enabled: profile.github_enabled, label: "GitHub" },
    {
      key: "whatsapp",
      icon: <WhatsAppIcon size={20} />,
      value: profile.whatsapp,
      enabled: profile.whatsapp_enabled,
      label: "WhatsApp",
      href: getWhatsAppLink(profile.whatsapp || ""),
    },
    {
      key: "telegram",
      icon: <TelegramIcon size={20} />,
      value: profile.telegram,
      enabled: profile.telegram_enabled,
      label: "Telegram",
      href: getTelegramLink(profile.telegram || ""),
    },
  ].filter((link) => isFieldActive(link.value, link.enabled));

  const hasName = profile.first_name || profile.last_name;
  const hasContactInfo =
    isFieldActive(profile.phone, profile.phone_enabled) ||
    isFieldActive(profile.email_contact, profile.email_enabled) ||
    isFieldActive(profile.website, profile.website_enabled);

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  const seoDescription = profile.bio
    ? `${fullName}${profile.title ? ` - ${profile.title}` : ""}${profile.company ? ` at ${profile.company}` : ""}. ${profile.bio.substring(0, 120)}`
    : `Digital business card of ${fullName}${profile.title ? ` - ${profile.title}` : ""}${profile.company ? ` at ${profile.company}` : ""}. Connect with me easily via my online business card.`;

  const seoKeywords = [
    fullName,
    profile.title,
    profile.company,
    "digital business card",
    "professional contact",
    "vcard",
    username,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <SEO
        title={`${fullName}${profile.title ? ` - ${profile.title}` : ""} | Digital Business Card`}
        description={seoDescription}
        keywords={seoKeywords}
        url={`https://75tools.fr/card/${username}`}
        type="profile"
        image={profile.avatar_url || "https://75tools.fr/og-image.svg"}
        imageAlt={`Digital business card of ${fullName}`}
        appTitle={fullName || "Card"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: fullName,
          jobTitle: profile.title || undefined,
          worksFor: profile.company ? { "@type": "Organization", name: profile.company } : undefined,
          url: `https://75tools.fr/card/${username}`,
          image: profile.avatar_url || undefined,
          email: profile.email_enabled ? profile.email_contact : undefined,
          telephone: profile.phone_enabled ? profile.phone : undefined,
          sameAs: [
            profile.linkedin_enabled && profile.linkedin,
            profile.twitter_enabled && profile.twitter,
            profile.instagram_enabled && profile.instagram,
            profile.github_enabled && profile.github,
            profile.website_enabled && profile.website,
          ].filter(Boolean),
        }}
      />
      {/* Back to MyCard */}
      <div className="max-w-md mx-auto mb-4">
        <button
          onClick={() => navigate("/mycard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">MyCard</span>
        </button>
      </div>

      {/* Navigation */}
      {!authLoading && (
        <div className="max-w-md mx-auto mb-4">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <LayoutDashboard size={18} />
              My Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <LogIn size={18} />
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <UserPlusIcon size={18} />
                Create my card for free
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 relative">
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowAddToHome(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              title="Add to Home Screen"
            >
              <Smartphone size={20} className="text-slate-600" />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              title="Share this card"
            >
              <Share2 size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Add to Home Screen Modal */}
          {showAddToHome && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddToHome(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-slate-700" />
                    <h3 className="text-lg font-semibold text-slate-900">Add to Home Screen</h3>
                  </div>
                  <button
                    onClick={() => setShowAddToHome(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                <p className="text-slate-600 text-sm mb-5">
                  Save this card to your home screen for quick access, just like an app.
                </p>

                {isIOS ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Tap the Share button</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          Look for <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 rounded">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                              <polyline points="16 6 12 2 8 6"/>
                              <line x1="12" y1="2" x2="12" y2="15"/>
                            </svg>
                          </span> in Safari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Tap "Add to Home Screen"</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          Look for <Plus size={14} className="inline" /> Add to Home Screen
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Tap "Add"</p>
                        <p className="text-sm text-slate-500">The card will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                ) : isAndroid ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Tap the menu button</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          Look for <MoreVertical size={14} className="inline" /> in Chrome
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Tap "Add to Home screen"</p>
                        <p className="text-sm text-slate-500">Or "Install app"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Confirm</p>
                        <p className="text-sm text-slate-500">The card will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <p className="text-slate-600 text-sm">
                        Open this page on your mobile device to add it to your home screen.
                      </p>
                      <button
                        onClick={handleShare}
                        className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        Share link to mobile
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowAddToHome(false)}
                  className="w-full mt-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {(profile.first_name?.[0] || "").toUpperCase()}
                {(profile.last_name?.[0] || "").toUpperCase()}
              </div>
            )}
          </div>

          {/* Nom */}
          {hasName && (
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">
              {profile.first_name} {profile.last_name}
            </h1>
          )}

          {/* Titre & Entreprise */}
          {(profile.title || profile.company) && (
            <div className="text-center mb-4">
              {profile.title && (
                <p className="text-slate-600 font-medium">{profile.title}</p>
              )}
              {profile.company && (
                <p className="text-slate-500">{profile.company}</p>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-slate-600 text-center mb-6 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Contact Info */}
          {hasContactInfo && (
            <div className="space-y-3 mb-6">
              {isFieldActive(profile.phone, profile.phone_enabled) && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <Phone size={18} />
                  </div>
                  <span className="text-slate-700">{formatPhone(profile.phone!)}</span>
                </a>
              )}

              {isFieldActive(profile.email_contact, profile.email_enabled) && (
                <a
                  href={`mailto:${profile.email_contact}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <Mail size={18} />
                  </div>
                  <span className="text-slate-700">{profile.email_contact}</span>
                </a>
              )}

              {isFieldActive(profile.website, profile.website_enabled) && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <Globe size={18} />
                  </div>
                  <span className="text-slate-700">{profile.website!.replace(/https?:\/\/(www\.)?/, "")}</span>
                </a>
              )}
            </div>
          )}

          {/* Bouton Ajouter aux contacts */}
          {hasName && (
            <button
              onClick={generateVCard}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors mb-4"
            >
              <UserPlus size={20} />
              Add to contacts
            </button>
          )}

          {/* CTA LinkedIn & WhatsApp */}
          {(isFieldActive(profile.linkedin, profile.linkedin_enabled) || isFieldActive(profile.whatsapp, profile.whatsapp_enabled)) && (
            <div className="flex gap-3 mb-6">
              {isFieldActive(profile.linkedin, profile.linkedin_enabled) && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("linkedin_click", profile.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <Linkedin size={20} />
                  LinkedIn
                </a>
              )}
              {isFieldActive(profile.whatsapp, profile.whatsapp_enabled) && (
                <a
                  href={getWhatsAppLink(profile.whatsapp!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", profile.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <WhatsAppIcon size={20} />
                  WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Réseaux Sociaux */}
          {socialLinks.filter(l => l.key !== "linkedin" && l.key !== "whatsapp").length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks
                .filter((link) => link.key !== "linkedin" && link.key !== "whatsapp")
                .map((link) => {
                  const colors = socialColors[link.key];
                  return (
                    <a
                      key={link.key}
                      href={(link as any).href || link.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent(`${link.key}_click`, profile.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        colors
                          ? `${colors.bg} ${colors.hover} ${colors.text}`
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                      title={link.label}
                    >
                      {link.icon}
                    </a>
                  );
                })}
            </div>
          )}

          {/* QR Code */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100">
                <QRCodeCanvas
                  id="qr-code"
                  value={`${window.location.origin}/card/${username}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <QrCode size={14} />
                  Scan to share
                </p>
                <button
                  onClick={() => {
                    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `qrcode-${username}.png`;
                    link.click();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Create your card on{" "}
          <button onClick={() => navigate("/mycard")} className="text-slate-600 hover:underline">
            MyCard
          </button>
        </p>
      </div>
    </div>
  );
};

export default PublicCard;
