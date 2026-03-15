import { useState } from "react";
import { supabase } from "./supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("sign_in"); // 'sign_in' | 'sign_up'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "sign_in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Akun dibuat. Kalau Email Confirm aktif, cek inbox untuk konfirmasi dulu.",
        );
      }
    } catch (err) {
      setError(err?.message || "Gagal autentikasi.");
    } finally {
      setBusy(false);
    }
  };

  const onResetPassword = async () => {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Isi email dulu untuk reset password.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin },
      );
      if (resetError) throw resetError;
      setMessage("Link reset password dikirim ke email kamu (cek inbox/spam).");
    } catch (err) {
      setError(err?.message || "Gagal kirim reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-[#1a1a24] border border-[#2a2a35] rounded-3xl p-6 shadow-2xl">
        <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
          Private Mode
        </p>
        <h1 className="text-xl font-bold mt-1">Login dulu</h1>
        <p className="text-sm text-gray-400 mt-2">
          Biar data habit kamu nggak bisa diubah pengunjung lain.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("sign_in");
              setError("");
              setMessage("");
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "sign_in" ? "bg-[#2a2a35] text-white" : "bg-transparent text-gray-500 hover:text-gray-300"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sign_up");
              setError("");
              setMessage("");
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "sign_up" ? "bg-[#2a2a35] text-white" : "bg-transparent text-gray-500 hover:text-gray-300"}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#2a2a35] border border-[#3a3a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-colors"
              autoComplete={
                mode === "sign_in" ? "current-password" : "new-password"
              }
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-60 disabled:hover:bg-purple-500 text-white text-sm font-bold transition-all"
          >
            {busy ? "..." : mode === "sign_in" ? "Masuk" : "Daftar"}
          </button>

          <button
            type="button"
            onClick={onResetPassword}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45] disabled:opacity-60 text-sm font-semibold transition-colors"
          >
            Lupa password
          </button>
        </form>
      </div>
    </div>
  );
}

