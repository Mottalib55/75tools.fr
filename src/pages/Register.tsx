import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Mail, Lock, Loader2, ArrowLeft, User, Phone, Briefcase, Instagram, Linkedin, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/SEO";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate username
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError("Username can only contain lowercase letters, numbers and underscores.");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingProfile) {
      setError("This username is already taken.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("This email is already registered.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setLoading(false);
      return;
    }

    // Get the new user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Create profile with first and last name
      await supabase.from("profiles").insert({
        user_id: user.id,
        username: username,
        email_contact: email,
        first_name: firstName,
        last_name: lastName,
      });
    }

    navigate("/dashboard");
    setLoading(false);
  };

  // Get initials for avatar
  const getInitials = () => {
    const f = firstName?.[0]?.toUpperCase() || "";
    const l = lastName?.[0]?.toUpperCase() || "";
    return f + l || "?";
  };

  return (
    <div data-clarity-mask="true" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <SEO
        title="Create your card - MyCard"
        description="Create your free digital business card in seconds. Share your contact info with a QR code."
        keywords="create business card, free digital card, MyCard signup"
        url="https://75tools.fr/register"
        noindex={true}
      />
      <div className="w-full max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/mycard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Form Column */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold text-white">MyCard</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Create your card
            </h1>
            <p className="text-slate-400 text-center mb-6">
              Free and in seconds
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="johndoe"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  75tools.fr/card/<span className="text-blue-400">{username || "yourname"}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create my free card"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-slate-400 text-center mt-5 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Preview Column */}
          <div className="hidden lg:block">
            <p className="text-slate-400 text-sm text-center mb-4">Preview of your card</p>

            {/* Card Preview */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-auto transform hover:scale-[1.02] transition-transform duration-300">
              {/* Avatar */}
              <div className="flex justify-center mb-5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {getInitials()}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name"}
              </h2>

              {/* Title placeholder */}
              <p className="text-slate-500 text-center text-sm mb-4">
                Your job title
              </p>

              {/* Contact Info placeholders */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <Phone size={14} />
                  </div>
                  <span className="text-slate-400 text-sm">+1 XXX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <Mail size={14} />
                  </div>
                  <span className="text-slate-400 text-sm">{email || "your@email.com"}</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <Briefcase size={14} />
                  </div>
                  <span className="text-slate-400 text-sm">Your company</span>
                </div>
              </div>

              {/* Social Icons placeholders */}
              <div className="flex justify-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <Linkedin size={18} />
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <Instagram size={18} />
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <Globe size={18} />
                </div>
              </div>

              {/* Add Contact Button */}
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">
                Add to contacts
              </button>

              {/* URL */}
              <p className="text-center text-xs text-slate-400 mt-4">
                75tools.fr/card/<span className="text-blue-500">{username || "yourname"}</span>
              </p>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Free</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">30s</div>
                <div className="text-xs text-slate-400">To create</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">QR</div>
                <div className="text-xs text-slate-400">Code included</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
