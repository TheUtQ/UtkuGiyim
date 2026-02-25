'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Giriş başarısız.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Sunucu hatası. Tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(230,51,41,0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'orbPulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,100,200,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'orbPulse 8s ease-in-out infinite reverse',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .login-shake { animation: shake 0.4s ease; }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(230,51,41,0.12)',
            border: '1px solid rgba(230,51,41,0.25)',
            marginBottom: '1.25rem',
          }}>
            <ShieldCheck size={26} color="#e63329" />
          </div>
          <h1 style={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 900,
            fontSize: '1.875rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #e63329 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.375rem',
          }}>
            UTKU GİYİM
          </h1>
          <p style={{
            color: '#666',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            Yönetim Paneli
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(17,17,21,0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${error ? 'rgba(230,51,41,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
            transition: 'border-color 0.3s ease',
          }}
        >
          {/* Card header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#fff',
              marginBottom: '0.25rem',
            }}>
              Hoş Geldiniz
            </h2>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>
              Devam etmek için giriş yapın
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="login-shake"
              style={{
                background: 'rgba(230,51,41,0.08)',
                border: '1px solid rgba(230,51,41,0.25)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Username field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#888',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Kullanıcı Adı
            </label>
            <InputField
              icon={<User size={16} />}
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="admin"
              autoFocus
              required
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#888',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Şifre
            </label>
            <InputField
              icon={<Lock size={16} />}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '12px',
              background: loading
                ? 'rgba(230,51,41,0.5)'
                : 'linear-gradient(135deg, #e63329 0%, #c41f15 100%)',
              border: 'none',
              color: '#fff',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 8px 30px rgba(230,51,41,0.35)',
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget).style.transform = 'translateY(-2px)';
                (e.currentTarget).style.boxShadow = '0 14px 40px rgba(230,51,41,0.5)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget).style.transform = '';
              (e.currentTarget).style.boxShadow = loading ? 'none' : '0 8px 30px rgba(230,51,41,0.35)';
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spinLoader 0.7s linear infinite',
                }} />
                Giriş Yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>


        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#333',
          fontSize: '0.72rem',
          marginTop: '1.5rem',
          letterSpacing: '0.05em',
        }}>
          © 2024 Utku Giyim — Secure Admin Portal
        </p>
      </div>
    </div>
  );
}

/* ===== Input Field Component ===== */
function InputField({
  icon, type, value, onChange, placeholder, required, autoFocus, suffix,
}: {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0 1rem',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${focused ? 'rgba(230,51,41,0.5)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '12px',
      boxShadow: focused ? '0 0 0 3px rgba(230,51,41,0.1)' : 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      height: '50px',
    }}>
      <span style={{ color: focused ? '#e63329' : '#444', transition: 'color 0.2s', flexShrink: 0 }}>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#f0f0f0',
          fontSize: '0.9rem',
          fontFamily: '"Inter", sans-serif',
          padding: '0',
          height: '100%',
        }}
      />
      {suffix && <span style={{ flexShrink: 0 }}>{suffix}</span>}
    </div>
  );
}
