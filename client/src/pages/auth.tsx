import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, insertUserSchema } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const { login, isLoggingIn, requestOtp, isRequestingOtp, verifyOtp, isVerifyingOtp, user } = useAuth();
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setErrorMsg("");
      await login(data);
      setLocation("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login");
    }
  };

  const onRegisterRequest = async (data: z.infer<typeof insertUserSchema>) => {
    try {
      setErrorMsg("");
      await requestOtp(data);
      setIsOtpStep(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to request OTP");
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits");
      return;
    }

    try {
      setErrorMsg("");
      const formData = registerForm.getValues();
      await verifyOtp({
        ...formData,
        otp: otpValue
      });
      setLocation("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <img src="/blogo.png" alt="Makhana Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl text-secondary">
              {isLogin ? "Welcome Back" : isOtpStep ? "Verify Mobile" : "Join the Club"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Sign in to access your orders and favorites." : isOtpStep ? `A 6-digit code has been sent to +91 ${registerForm.getValues("mobile")}` : "Create an account for faster checkout."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Username</label>
                  <input
                    {...loginForm.register("username")}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
                  <input
                    type="password"
                    {...loginForm.register("password")}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 shadow-xl shadow-secondary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center"
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </button>
              </motion.form>
            ) : isOtpStep ? (
              <motion.form
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                onSubmit={onOtpSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5 text-center">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 text-center text-3xl tracking-widest rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono font-bold"
                    placeholder="------"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpValue.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center mt-4"
                >
                  {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Create Account"}
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setIsOtpStep(false); setOtpValue(""); }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Change mobile number
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={registerForm.handleSubmit(onRegisterRequest)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Username</label>
                  <input
                    {...registerForm.register("username")}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Choose a username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5 flex justify-between">
                    Mobile Number <span className="text-muted-foreground text-xs">+91 (India Only)</span>
                  </label>
                  <input
                    {...registerForm.register("mobile")}
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
                  <input
                    type="password"
                    {...registerForm.register("password")}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Create a password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRequestingOtp}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center mt-2"
                >
                  {isRequestingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!isOtpStep && (
            <div className="mt-8 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
