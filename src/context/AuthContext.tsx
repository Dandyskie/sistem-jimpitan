import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Role, Profile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'jimpitan_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
  login: (
    emailOrUsername: string,
    password: string,
    expectedRole?: Role
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  switchRole: (newRole: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ambil data profil dari database Supabase
async function fetchProfileAndUser(
  userId: string,
  email: string
): Promise<{ profile: Profile | null; user: AuthUser } | null> {
  if (!supabase) return null;

  try {
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const roleName: Role = profData?.role === 'petugas' ? 'petugas_ronda' : 'bendahara';
    const isBendahara = roleName === 'bendahara';

    const user: AuthUser = {
      id: userId,
      nama: profData?.nama || 'Petugas Ronda',
      usernameOrEmail: email,
      role: roleName,
      jabatan: isBendahara ? 'Bendahara Kas BDA' : 'Petugas Ronda Lapangan',
    };

    return { profile: profData || null, user };
  } catch {
    return null;
  }
}

// Coba login via kredensial Supabase Auth online
async function trySupabaseSignIn(
  email: string,
  pass: string
): Promise<{ user: AuthUser; profile: Profile | null } | null> {
  const canAuthOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine && email.includes('@');
  if (!canAuthOnline) return null;

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.user) return null;

    return await fetchProfileAndUser(data.user.id, email);
  } catch {
    return null;
  }
}

// Cek kecocokan kredensial akun demo atau offline
function getDemoAuthUser(
  identifier: string,
  pass: string,
  expectedRole?: Role
): AuthUser | null {
  const isBendaharaPass = pass === 'admin123' || pass === 'password';
  const isAdminId =
    identifier === 'admin@jimpitan.local' ||
    identifier === 'adminrt123' ||
    identifier === 'admin' ||
    identifier === 'bendahara@jimpitan.local';

  const matchesAdmin = isAdminId && isBendaharaPass && (!expectedRole || expectedRole === 'bendahara');
  if (matchesAdmin) {
    return {
      id: 'usr-bendahara',
      nama: 'Bpk. Mulyadi',
      usernameOrEmail: identifier,
      role: 'bendahara',
      jabatan: 'Bendahara Kas BDA',
    };
  }

  const isPetugasPass = pass === 'petugas123' || pass === 'password';
  const isPetugasId =
    identifier === 'petugas@jimpitan.local' ||
    identifier === 'ronda123' ||
    identifier === 'petugas' ||
    identifier === 'ronda';

  const matchesPetugas =
    isPetugasId &&
    isPetugasPass &&
    (!expectedRole || expectedRole === 'petugas_ronda' || expectedRole === 'petugas');

  if (matchesPetugas) {
    return {
      id: 'usr-ronda',
      nama: 'Rama & Regu Ronda BDA',
      usernameOrEmail: identifier,
      role: 'petugas_ronda',
      jabatan: 'Petugas Ronda Lapangan',
    };
  }

  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sinkronisasi sesi Supabase saat pertama kali dimuat
  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const canSync = isSupabaseConfigured && Boolean(supabase);
      if (!canSync) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase!.auth.getSession();
        const sessionUser = data.session?.user;
        const result = sessionUser && isMounted
          ? await fetchProfileAndUser(sessionUser.id, sessionUser.email || 'user')
          : null;

        const shouldApply = Boolean(result && isMounted);
        if (shouldApply) {
          setProfile(result!.profile);
          setUser(result!.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result!.user));
        }
      } catch {}

      setIsLoading(false);
    };

    syncSession();

    // Dengarkan perubahan status login dari Supabase
    const canListenAuth = isSupabaseConfigured && Boolean(supabase);
    if (!canListenAuth) {
      return () => {
        isMounted = false;
      };
    }

    const { data: listenerData } = supabase!.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_OUT':
          setUser(null);
          setProfile(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          break;
        case 'SIGNED_IN': {
          const activeUser = session?.user;
          const res = activeUser ? await fetchProfileAndUser(activeUser.id, activeUser.email || 'user') : null;
          if (res) {
            setProfile(res.profile);
            setUser(res.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
          }
          break;
        }
        default:
          break;
      }
    });

    return () => {
      isMounted = false;
      listenerData.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string,
    expectedRole?: Role
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    const identifier = emailOrUsername.trim().toLowerCase();

    // 1. Coba otentikasi Supabase Online
    const onlineResult = await trySupabaseSignIn(identifier, password);
    if (onlineResult) {
      setUser(onlineResult.user);
      setProfile(onlineResult.profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(onlineResult.user));
      return { success: true, user: onlineResult.user };
    }

    // 2. Kredensial Fallback (Mode Demo / Offline)
    const demoUser = getDemoAuthUser(identifier, password, expectedRole);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return { success: true, user: demoUser };
    }

    const isBendaharaExpected = expectedRole === 'bendahara';
    return {
      success: false,
      error: isBendaharaExpected
        ? 'Kredensial admin tidak cocok. Gunakan admin@jimpitan.local dan admin123'
        : 'Kredensial petugas tidak cocok. Gunakan petugas@jimpitan.local dan petugas123',
    };
  };

  const logout = async () => {
    const canSignOut = isSupabaseConfigured && Boolean(supabase);
    if (canSignOut) {
      try {
        await supabase!.auth.signOut();
      } catch {}
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: Role) => {
    const isBendahara = newRole === 'bendahara';
    const targetUser: AuthUser = isBendahara
      ? {
          id: 'usr-bendahara',
          nama: 'Bpk. Mulyadi',
          usernameOrEmail: 'admin@jimpitan.local',
          role: 'bendahara',
          jabatan: 'Bendahara Kas BDA',
        }
      : {
          id: 'usr-ronda',
          nama: 'Rama & Regu Ronda BDA',
          usernameOrEmail: 'petugas@jimpitan.local',
          role: 'petugas_ronda',
          jabatan: 'Petugas Ronda Lapangan',
        };

    setUser(targetUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
