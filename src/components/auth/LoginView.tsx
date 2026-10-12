import React, { useState } from 'react';
import { AuthUser, Role } from '../../types';
import { LoginForm } from './LoginForm';
import { ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from '../../utils/security';
import { getTodayRondaGroup } from '../../data/rondaGroups';

interface LoginViewProps {
  expectedRole: Role;
  onLogin: (user: AuthUser) => void;
  onNavigateUrl: (path: string) => void;
}

/**
 * Validasi kredensial login akun demo & penetapan 7 grup ronda bergilir harian
 */
function authenticateCredentials(
  identifier: string,
  pass: string,
  expectedRole: Role
): AuthUser | null {
  const adminIds = ['admin@jimpitan.local', 'adminrt123', 'admin'];
  const adminPasswords = ['admin123', 'password'];
  const isAdmin = expectedRole === 'bendahara';

  if (isAdmin && adminIds.includes(identifier) && adminPasswords.includes(pass)) {
    return {
      id: 'usr-bendahara',
      nama: 'Bpk. Mulyadi',
      usernameOrEmail: identifier,
      role: 'bendahara',
      jabatan: 'Bendahara Kas RT BDA',
    };
  }

  const petugasIds = ['petugas@jimpitan.local', 'ronda123', 'petugas', 'ronda'];
  const petugasPasswords = ['petugas123', 'password'];
  const isPetugas = expectedRole === 'petugas_ronda';

  if (isPetugas && petugasIds.includes(identifier) && petugasPasswords.includes(pass)) {
    const todayGroup = getTodayRondaGroup();
    return {
      id: `usr-${todayGroup.id}`,
      nama: todayGroup.namaGrup,
      usernameOrEmail: identifier,
      role: 'petugas_ronda',
      jabatan: todayGroup.salam,
    };
  }

  return null;
}

/**
 * Tampilan login utama dengan proteksi Cybersecurity (Anti-Brute Force)
 * JIMPITANKU by Perum BDA (Bumi Dukuh Asri)
 */
export const LoginView: React.FC<LoginViewProps> = ({
  expectedRole,
  onLogin,
  onNavigateUrl,
}) => {
  const isAdmin = expectedRole === 'bendahara';

  const [emailOrUsername, setEmailOrUsername] = useState(
    isAdmin ? 'admin@jimpitan.local' : 'petugas@jimpitan.local'
  );
  const [password, setPassword] = useState(isAdmin ? 'admin123' : 'petugas123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const identifier = emailOrUsername.trim().toLowerCase();

    // 1. Pengecekan Rate Limiting / Anti-Brute Force
    const rateCheck = checkLoginRateLimit(identifier);
    if (!rateCheck.allowed) {
      setErrorMessage(
        `Akses terkunci sementara karena 5x percobaan gagal (Anti-Brute Force). Tunggu ${rateCheck.remainingLockoutSeconds} detik.`
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = authenticateCredentials(identifier, password, expectedRole);

      if (!user) {
        const failRecord = recordFailedLogin(identifier);
        if (failRecord.isLockedOut) {
          setErrorMessage(
            'Akun dikunci sementara 60 detik karena 5x gagal berturut-turut (Cybersecurity Defense).'
          );
          return;
        }

        const hint = isAdmin
          ? 'Kredensial admin tidak valid. Gunakan admin@jimpitan.local / admin123.'
          : 'Kredensial petugas tidak valid. Gunakan petugas@jimpitan.local / petugas123.';
        setErrorMessage(hint);
        return;
      }

      resetLoginRateLimit(identifier);
      onLogin(user);
    }, 250);
  };

  const handleQuickFill = (role: Role) => {
    if (role === 'bendahara') {
      setEmailOrUsername('admin@jimpitan.local');
      setPassword('admin123');
      return;
    }
    setEmailOrUsername('petugas@jimpitan.local');
    setPassword('petugas123');
  };

  const formProps = {
    isAdmin,
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errorMessage,
    isLoading,
    handleSubmit,
    handleQuickFill,
    onNavigateUrl,
  };

  /* Layout Admin Dashboard: 2 Kolom Grid Split */
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[#090d16]">
        {/* Kolom Kiri: Formulir login di atas surface terang bersih */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white md:rounded-r-[32px] shadow-2xl relative z-10">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/bda-logo.jpg"
                alt="Logo Bumi Dukuh Asri"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <span className="font-bold text-slate-900 block leading-tight">
                  JIMPITANKU by Perum BDA
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  RT 02 / RW 07 Bumi Dukuh Asri
                </span>
              </div>
            </div>
            <LoginForm {...formProps} />
          </div>
        </div>

        {/* Kolom Kanan: Panel Visual Showcase bertema Merah & Hitam Logo BDA */}
        <div className="hidden md:flex flex-1 items-center justify-center p-10 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#090d16] via-[#121826] to-[#1e1014]">
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-md text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Sistem Otomasi Finansial Lingkungan
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
              Transparansi Kas & Jimpitan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300">
                Bumi Dukuh Asri
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed mb-8">
              JIMPITANKU by Perum BDA — Platform modern pencatatan tarikan ronda malam bergilir 7 regu harian, pembayaran iuran warga, dan pembukuan kas otomatis.
            </p>

            <div className="space-y-3.5 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-slate-200">
                  Rekonsiliasi otomatis setoran fisik toples ronda malam
                </span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-slate-200">
                  Laporan buku kas RT dan visualisasi mutasi siap cetak PDF
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-slate-200">
                  Privasi terlindungi dan sistem terproteksi cybersecurity dasar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Layout Petugas Ronda Lapangan: Mobile Centered Fintech Card */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-100/80">
      <div className="w-full max-w-sm bg-white rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/60">
        <LoginForm {...formProps} />
      </div>

      <p className="fixed bottom-3 left-0 right-0 text-center text-[11px] text-slate-400 font-medium">
        © 2026 JIMPITANKU by Perum BDA (Bumi Dukuh Asri)
      </p>
    </div>
  );
};

export default LoginView;
