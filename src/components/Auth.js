import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import './Auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // 尝试在 `user` 表中创建对应行，避免外键冲突
        try {
          const authUser = (data && data.user) ? data.user : null;
          if (authUser) await ensureUserRow(authUser);
        } catch (e) {
          console.warn('无法在 `user` 表创建行（可在 Console 手动创建）:', e?.message || e);
        }
        alert('注册成功！请检查邮件进行验证。');
        setEmail('');
        setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // 登录成功后，确保 `user` 表有对应记录
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const authUser = sessionData?.session?.user ?? null;
          if (authUser) await ensureUserRow(authUser);
        } catch (e) {
          console.warn('登录后无法同步 `user` 表:', e?.message || e);
        }
      }
    } catch (error) {
      setError(error.message || '认证失败');
    } finally {
      setLoading(false);
    }
  };

  // 在 supabase Auth 成功后确保在 `user` 表中有一行（使用 auth user 的 id）
  const ensureUserRow = async (authUser) => {
    // 根据你的 schema，用户信息保存在 public.profiles 表（而不是 `user`）
    // profiles 表的字段：id, username, avatar_url, created_at, password (NOT NULL)
    // 为了避免 NOT NULL 约束失败，这里在 upsert 时提供空字符串作为 password（仅用于同步 profile 行，不建议在生产环境保存明文密码）。
    if (!authUser || !authUser.id) return;
    try {
      const username = authUser.email ? authUser.email.split('@')[0] : authUser.id;
      const payload = [{
        id: authUser.id,
        username,
        password: ''
      }];

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.warn('ensureUserRow: upsert error:', error.message || error);
      }
    } catch (e) {
      console.warn('ensureUserRow failed:', e?.message || e);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>📷 相册管理系统</h1>
        <h2>{isSignUp ? '创建账户' : '登录'}</h2>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>

        <button 
          className="toggle-btn"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
        >
          {isSignUp ? '已有账户？登录' : '没有账户？注册'}
        </button>
      </div>
    </div>
  );
}
