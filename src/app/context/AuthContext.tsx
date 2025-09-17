'use client';

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import Cookies from 'js-cookie';
import isTokenExpired from '@/app/utils/isTokenExpired';

const ACCESS_TOKEN_KEY = 'authToken';
const ROLE_COOKIE_KEY = 'role';

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string;
  role?: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, remember?: boolean, role?: string | null) => void;
  logout: () => void;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  accessToken: '',
  role: null,
  login: () => {},
  logout: () => {},
  setAuthState: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

const hydrateFromCookies = (): AuthState => {
  const token = Cookies.get(ACCESS_TOKEN_KEY) || '';
  const role = Cookies.get(ROLE_COOKIE_KEY) || null;

  if (!token || isTokenExpired(token)) {
    // clean if expired / missing
    Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
    return { isLoggedIn: false, accessToken: '', role: null };
  }

  return { isLoggedIn: true, accessToken: token, role };
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => hydrateFromCookies());

  // 1) initial hydration (in case cookies change before mount)
  useEffect(() => {
    setAuthState(hydrateFromCookies());
  }, []);

  // 2) keep state fresh when tab visibility changes
  useEffect(() => {
    const syncFromCookies = () => setAuthState((prev) => {
      const token = Cookies.get(ACCESS_TOKEN_KEY) || '';
      const role = Cookies.get(ROLE_COOKIE_KEY) || null;

      if (!token || isTokenExpired(token)) {
        if (prev.isLoggedIn) {
          Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
          return { isLoggedIn: false, accessToken: '', role: null };
        }
        return prev;
      }

      if (prev.accessToken !== token || prev.role !== role || !prev.isLoggedIn) {
        return { isLoggedIn: true, accessToken: token, role };
      }
      return prev;
    });

    document.addEventListener('visibilitychange', syncFromCookies);
    window.addEventListener('focus', syncFromCookies);
    return () => {
      document.removeEventListener('visibilitychange', syncFromCookies);
      window.removeEventListener('focus', syncFromCookies);
    };
  }, []);

  // 3) optional: auto-logout a little after expiry check (every 60s)
  useEffect(() => {
    const id = setInterval(() => {
      setAuthState((prev) => {
        if (!prev.accessToken) return prev;
        if (isTokenExpired(prev.accessToken)) {
          Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
          return { isLoggedIn: false, accessToken: '', role: null };
        }
        return prev;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const login = useCallback((token: string, remember: boolean = true, role: string | null = null) => {
    // write token cookie
    if (remember) {
      Cookies.set(ACCESS_TOKEN_KEY, token, { path: '/', expires: 7 });
    } else {
      Cookies.set(ACCESS_TOKEN_KEY, token, { path: '/' });
    }
    // write role cookie (optional)
    if (role) {
      if (remember) {
        Cookies.set(ROLE_COOKIE_KEY, role, { path: '/', expires: 7 });
      } else {
        Cookies.set(ROLE_COOKIE_KEY, role, { path: '/' });
      }
    }

    setAuthState({ isLoggedIn: true, accessToken: token, role });
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
    Cookies.remove(ROLE_COOKIE_KEY, { path: '/' });
    setAuthState({ isLoggedIn: false, accessToken: '', role: null });
  }, []);

  const value = useMemo(
    () => ({ ...authState, login, logout, setAuthState }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export { AuthContext, ACCESS_TOKEN_KEY, ROLE_COOKIE_KEY };
