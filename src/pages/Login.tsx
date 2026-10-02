import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setLoading(false);
      return;
    }

    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div data-clarity-mask="true" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <SEO
        title="Sign in - MyCard"
        description="Sign in to your MyCard account to manage your digital business card."
        url="https://75tools.fr/login"
        noindex={true}
      />
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-2xl font-bold text-white">MyCard</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Welcome back!
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Sign in to manage your card
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-slate-400 text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-white hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
