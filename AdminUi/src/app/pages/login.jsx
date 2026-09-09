import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "sonner";

export function Login() {
  // const navigate = useNavigate();

  // ==========================================
  // SCREEN STATE
  // ==========================================

  const [step, setStep] = useState("login");

  // ==========================================
  // FORM STATES
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  // Temporary dummy OTP for testing
  const [dummyOtp, setDummyOtp] = useState("");

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async () => {
    try {
      setLoading(true);
  
      const res = await axios.post("/admin/login", {
        email,
        password,
      });
  
      localStorage.setItem("token", res.data.token);
  
      toast.success("Login successful");
  
      window.location.href = "/";
  
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/admin/forgot-password",
        {
          email,
        }
      );

      // TEMPORARY DUMMY OTP
      if (res.data?.otp) {
        setDummyOtp(res.data.otp);

        console.log(
          "DUMMY PASSWORD RESET OTP:",
          res.data.otp
        );

        toast.success(
          `OTP Generated: ${res.data.otp}`
        );
      } else {
        toast.success(
          "OTP generated successfully"
        );
      }

      setStep("otp");

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to generate OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/admin/verify-reset-otp",
        {
          email,
          otp,
        }
      );

      toast.success(
        res.data?.message ||
          "OTP verified successfully"
      );

      setStep("reset");

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/admin/reset-password",
        {
          email,
          otp,
          newPassword,
          confirmPassword,
        }
      );

      toast.success(
        res.data?.message ||
          "Password reset successfully"
      );

      // Reset states
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setDummyOtp("");

      // Back to login
      setStep("login");

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK TO LOGIN
  // ==========================================

  const handleBackToLogin = () => {
    setStep("login");

    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setDummyOtp("");
  };

  // ==========================================
  // ENTER KEY SUPPORT
  // ==========================================

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">

      <div className="w-full max-w-[380px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">

        {/* ========================================== */}
        {/* LOGIN */}
        {/* ========================================== */}

        {step === "login" && (
          <>
            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Admin Login
            </h2>

            <p className="text-center text-sm text-gray-400 mb-6">
              Welcome back! Please login to continue.
            </p>

            <div className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, handleLogin)
                }
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("forgot")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              RealEstateHub Admin Panel
            </p>
          </>
        )}

        {/* ========================================== */}
        {/* FORGOT PASSWORD */}
        {/* ========================================== */}

        {step === "forgot" && (
          <>
            <button
              onClick={handleBackToLogin}
              className="text-sm text-gray-400 hover:text-white mb-5 transition"
            >
              ← Back to Login
            </button>

            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Forgot Password
            </h2>

            <p className="text-center text-sm text-gray-400 mb-6">
              Enter your admin email to receive an OTP.
            </p>

            <div className="space-y-4">

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, handleSendOtp)
                }
              />

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium text-white disabled:opacity-50"
              >
                {loading
                  ? "Generating OTP..."
                  : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* VERIFY OTP */}
        {/* ========================================== */}

        {step === "otp" && (
          <>
            <button
              onClick={() => setStep("forgot")}
              className="text-sm text-gray-400 hover:text-white mb-5 transition"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Verify OTP
            </h2>

            <p className="text-center text-sm text-gray-400 mb-6">
              Enter the 6-digit OTP generated for your account.
            </p>

            {/* TEMPORARY DUMMY OTP DISPLAY */}

            {dummyOtp && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                <p className="text-xs text-yellow-300">
                  Testing OTP
                </p>

                <p className="text-xl font-bold tracking-[6px] text-yellow-400 mt-1">
                  {dummyOtp}
                </p>
              </div>
            )}

            <div className="space-y-4">

              <input
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white text-center tracking-[8px] placeholder:tracking-normal placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, handleVerifyOtp)
                }
              />

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium text-white disabled:opacity-50"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-sm text-blue-400 hover:text-blue-300"
              >
                Generate New OTP
              </button>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* RESET PASSWORD */}
        {/* ========================================== */}

        {step === "reset" && (
          <>
            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Reset Password
            </h2>

            <p className="text-center text-sm text-gray-400 mb-6">
              Create a new password for your admin account.
            </p>

            <div className="space-y-4">

              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    handleResetPassword
                  )
                }
              />

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium text-white disabled:opacity-50"
              >
                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}