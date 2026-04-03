import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, insertUserSchema } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, isLoggingIn, register, isRegistering, googleLogin, isGoogleLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");

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

  const onRegisterSubmit = async (data: z.infer<typeof insertUserSchema>) => {
    try {
      setErrorMsg("");
      await register(data);
      setLocation("/");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to register");
    }
  };

  const onGoogleLogin = async () => {
    try {
      setErrorMsg("");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      await googleLogin({
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL || undefined
      });

      setLocation("/");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google Login failed");
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
              {isLogin ? "Welcome Back" : "Join the Club"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Sign in to access your orders and favorites." : "Create an account for faster checkout."}
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
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-5"
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
                  disabled={isRegistering}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center mt-2"
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={isGoogleLoggingIn}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-semibold text-secondary shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-all disabled:opacity-70"
            >
              {isGoogleLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FcGoogle className="w-5 h-5" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
