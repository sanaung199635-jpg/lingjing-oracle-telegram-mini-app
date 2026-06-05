"use client";

import { useEffect, useState } from "react";
import { Apple, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? ""));
  }, [supabase]);

  async function signInWithProvider(provider: "google" | "apple") {
    if (!supabase) {
      setStatus("请先配置 Supabase 环境变量");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` }
    });
  }

  async function signInWithEmail() {
    if (!supabase || !email) {
      setStatus("请输入邮箱并配置 Supabase");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    setStatus(error ? error.message : "登录链接已发送");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserEmail("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户系统</CardTitle>
        <CardDescription>支持 Google、Apple 与邮箱登录，会员次数与报告记录由 Supabase 承载。</CardDescription>
      </CardHeader>
      <CardContent>
        {userEmail ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-white/70">{userEmail}</span>
            <Button variant="secondary" onClick={signOut}>退出</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => signInWithProvider("google")}>
                <LogIn className="h-4 w-4" />
                Google登录
              </Button>
              <Button type="button" variant="secondary" onClick={() => signInWithProvider("apple")}>
                <Apple className="h-4 w-4" />
                Apple登录
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="邮箱登录" />
              <Button type="button" onClick={signInWithEmail}>
                <Mail className="h-4 w-4" />
                发送链接
              </Button>
            </div>
            {status && <p className="text-sm text-primary/80">{status}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
