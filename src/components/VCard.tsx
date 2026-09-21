import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Instagram, Linkedin, Twitter, Github, Facebook, Youtube,
  Mail, Phone, UserPlus, Settings, Globe, MessageCircle,
  Send, Music2, Camera
} from "lucide-react";
import defaultAvatar from "@/assets/avatar.jpg";
export interface SocialField {
  value: string;
  enabled: boolean;
}

export interface CardData {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  bio: string;
  avatar: string;
  phone: SocialField;
  email: SocialField;
  website: SocialField;
  linkedin: SocialField;
  twitter: SocialField;
  instagram: SocialField;
  facebook: SocialField;
  tiktok: SocialField;
  youtube: SocialField;
  snapchat: SocialField;
  github: SocialField;
  whatsapp: SocialField;
  telegram: SocialField;
}

const defaultData: CardData = {
  firstName: "",
  lastName: "",
  title: "",
  company: "",
  bio: "",
  avatar: "",
  phone: { value: "", enabled: false },
  email: { value: "", enabled: false },
  website: { value: "", enabled: false },
  linkedin: { value: "", enabled: false },
  twitter: { value: "", enabled: false },
  instagram: { value: "", enabled: false },
  facebook: { value: "", enabled: false },
  tiktok: { value: "", enabled: false },
  youtube: { value: "", enabled: false },
  snapchat: { value: "", enabled: false },
  github: { value: "", enabled: false },
  whatsapp: { value: "", enabled: false },
  telegram: { value: "", enabled: false },
};

const VCard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CardData>(defaultData);

  useEffect(() => {
    const stored = localStorage.getItem("cardData");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration des anciennes données
      const migrated = { ...defaultData };
      Object.keys(parsed).forEach((key) => {
        if (key in migrated) {
          const value = parsed[key];
          if (typeof value === "string" && key in defaultData && typeof (defaultData as any)[key] === "object") {
            (migrated as any)[key] = { value, enabled: !!value };
          } else {
            (migrated as any)[key] = value;
          }
        }
      });
      setData(migrated);
    }
  }, []);

  const isFieldActive = (field: SocialField) => field.enabled && field.value.trim() !== "";

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.startsWith("+33") && cleaned.length === 12) {
      return cleaned.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5 $6");
    }
    return phone;
  };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.firstName} ${data.lastName}
N:${data.lastName};${data.firstName};;;
${data.title ? `TITLE:${data.title}` : ""}
${data.company ? `ORG:${data.company}` : ""}
${isFieldActive(data.phone) ? `TEL;TYPE=CELL:${data.phone.value}` : ""}
${isFieldActive(data.email) ? `EMAIL:${data.email.value}` : ""}
${isFieldActive(data.website) ? `URL:${data.website.value}` : ""}
${isFieldActive(data.linkedin) ? `URL;TYPE=LinkedIn:${data.linkedin.value}` : ""}
END:VCARD`.replace(/\n{2,}/g, "\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.firstName}_${data.lastName}.vcf`;
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

  const socialLinks = [
    { key: "linkedin", icon: <Linkedin size={20} />, field: data.linkedin, label: "LinkedIn" },
    { key: "twitter", icon: <Twitter size={20} />, field: data.twitter, label: "Twitter" },
    { key: "instagram", icon: <Instagram size={20} />, field: data.instagram, label: "Instagram" },
    { key: "facebook", icon: <Facebook size={20} />, field: data.facebook, label: "Facebook" },
    { key: "tiktok", icon: <Music2 size={20} />, field: data.tiktok, label: "TikTok" },
    { key: "youtube", icon: <Youtube size={20} />, field: data.youtube, label: "YouTube" },
    { key: "snapchat", icon: <Camera size={20} />, field: data.snapchat, label: "Snapchat" },
    { key: "github", icon: <Github size={20} />, field: data.github, label: "GitHub" },
    {
      key: "whatsapp",
      icon: <MessageCircle size={20} />,
      field: data.whatsapp,
      label: "WhatsApp",
      href: isFieldActive(data.whatsapp) ? getWhatsAppLink(data.whatsapp.value) : "",
    },
    {
      key: "telegram",
      icon: <Send size={20} />,
      field: data.telegram,
      label: "Telegram",
      href: isFieldActive(data.telegram) ? getTelegramLink(data.telegram.value) : "",
    },
  ].filter((link) => isFieldActive(link.field));

  const hasName = data.firstName || data.lastName;
  const hasContactInfo = isFieldActive(data.phone) || isFieldActive(data.email) || isFieldActive(data.website);

  return (
    <div className="vcard-container">
      {/* Bouton Admin */}
      <button
        onClick={() => navigate("/admin")}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white transition-colors z-10"
        aria-label="Administration"
      >
        <Settings size={20} className="text-slate-600" />
      </button>

      <div className="vcard-card">
        {/* Avatar */}
        <div className="animate-fade-in">
          <img
            src={data.avatar || defaultAvatar}
            alt="Photo de profil"
            className="vcard-avatar"
          />
        </div>

        {/* Nom */}
        {hasName && (
          <h1 className="vcard-name animate-fade-in-delay-1">
            {data.firstName} {data.lastName}
          </h1>
        )}

        {/* Titre & Entreprise */}
        {(data.title || data.company) && (
          <p className="text-sm text-slate-500 animate-fade-in-delay-1">
            {data.title}
            {data.title && data.company && " · "}
            {data.company}
          </p>
        )}

        {/* Bio */}
        {data.bio && (
          <p className="vcard-bio animate-fade-in-delay-2">
            {data.bio}
          </p>
        )}

        {/* Contact Info */}
        {hasContactInfo && (
          <div className="w-full space-y-2 mt-4">
            {/* Téléphone */}
            {isFieldActive(data.phone) && (
              <a
                href={`tel:${data.phone.value}`}
                className="vcard-phone animate-fade-in-delay-2"
              >
                <Phone size={18} />
                <span>{formatPhone(data.phone.value)}</span>
              </a>
            )}

            {/* Email */}
            {isFieldActive(data.email) && (
              <a
                href={`mailto:${data.email.value}`}
                className="vcard-phone animate-fade-in-delay-2"
              >
                <Mail size={18} />
                <span>{data.email.value}</span>
              </a>
            )}

            {/* Site web */}
            {isFieldActive(data.website) && (
              <a
                href={data.website.value}
                target="_blank"
                rel="noopener noreferrer"
                className="vcard-phone animate-fade-in-delay-2"
              >
                <Globe size={18} />
                <span>{data.website.value.replace(/https?:\/\/(www\.)?/, "")}</span>
              </a>
            )}
          </div>
        )}

        {/* Bouton Ajouter aux contacts */}
        {hasName && (
          <button
            onClick={generateVCard}
            className="vcard-add-contact animate-fade-in-delay-3"
          >
            <UserPlus size={20} />
            <span>Ajouter aux contacts</span>
          </button>
        )}

        {/* Réseaux Sociaux */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-6 animate-fade-in-delay-3">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href || link.field.value}
                target="_blank"
                rel="noopener noreferrer"
                className="vcard-social-link"
                aria-label={link.label}
                title={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}

        {/* Message si aucune donnée */}
        {!hasName && !data.bio && !hasContactInfo && socialLinks.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <p className="text-slate-400 mb-4">Votre carte est vide</p>
            <button
              onClick={() => navigate("/admin")}
              className="text-slate-900 font-medium underline hover:no-underline"
            >
              Configurer ma carte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VCard;
