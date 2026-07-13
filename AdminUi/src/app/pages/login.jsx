import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/admin/login", { email, password });

      localStorage.setItem("token", res.data.token);

      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* glass card */}
      <div className="w-[380px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Admin Login
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium text-white"
          >
            Login
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          RealEstateHub Admin Panel
        </p>
      </div>
    </div>
  );
}