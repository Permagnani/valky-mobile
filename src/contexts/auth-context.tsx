import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getDefaultApiBaseUrl } from '@/constants/app-info';
import { useDatabaseMigrations } from '@/hooks/use-migrations';
import { MigrationStatusReport } from '@/database/migrations';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  setAuthToken,
} from '@/services/api-client';
import { AuthService } from '@/services/auth-service';
import {
  LoginRequest,
  RegistrarUsuarioRequest,
  UsuarioResponse,
} from '@/types/api';

interface AuthContextData {
  usuario: UsuarioResponse | null;
  token: string | null;
  expiraEm: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiUrl: string;
  pinDisfarceSessao: string;
  migrationReport: MigrationStatusReport;
  isMigrated: boolean;
  login: (credenciais: LoginRequest) => Promise<UsuarioResponse>;
  registrar: (dados: RegistrarUsuarioRequest) => Promise<UsuarioResponse>;
  logout: () => void;
  recarregarPerfil: () => Promise<UsuarioResponse | null>;
  atualizarUsuarioSessao: (
    usuarioAtualizado: UsuarioResponse,
    novoPinDisfarce?: string
  ) => void;
  alterarApiUrl: (novaUrl: string) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Executa as migrations de schema local via custom hook com useEffect no startup
  const { migrationReport, isMigrated } = useDatabaseMigrations();

  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiraEm, setExpiraEm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiUrl, setApiUrlState] = useState<string>(getApiBaseUrl());
  const [pinDisfarceSessao, setPinDisfarceSessao] = useState<string>('1901');

  useEffect(() => {
    if (
      apiUrl === 'http://localhost:54301' ||
      apiUrl === 'http://10.0.2.2:54301'
    ) {
      const padrao = getDefaultApiBaseUrl();
      setApiBaseUrl(padrao);
      setApiUrlState(padrao);
    }
  }, [apiUrl]);

  const login = useCallback(
    async (credenciais: LoginRequest): Promise<UsuarioResponse> => {
      setIsLoading(true);
      try {
        const resposta = await AuthService.login(credenciais);
        setAuthToken(resposta.accessToken);
        setToken(resposta.accessToken);
        setExpiraEm(resposta.expiraEm);
        setUsuario(resposta.usuario);
        return resposta.usuario;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const registrar = useCallback(
    async (dados: RegistrarUsuarioRequest): Promise<UsuarioResponse> => {
      setIsLoading(true);
      try {
        const resposta = await AuthService.registrar(dados);
        setAuthToken(resposta.accessToken);
        setToken(resposta.accessToken);
        setExpiraEm(resposta.expiraEm);
        setUsuario(resposta.usuario);
        if (dados.pinDisfarce && dados.pinDisfarce.trim().length >= 4) {
          setPinDisfarceSessao(dados.pinDisfarce.trim());
        }
        return resposta.usuario;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setExpiraEm(null);
    setUsuario(null);
  }, []);

  const recarregarPerfil =
    useCallback(async (): Promise<UsuarioResponse | null> => {
      if (!token) return null;
      try {
        const perfilAtualizado = await AuthService.obterPerfilAutenticado();
        setUsuario(perfilAtualizado);
        return perfilAtualizado;
      } catch {
        return null;
      }
    }, [token]);

  const atualizarUsuarioSessao = useCallback(
    (usuarioAtualizado: UsuarioResponse, novoPinDisfarce?: string) => {
      setUsuario(usuarioAtualizado);
      if (novoPinDisfarce && novoPinDisfarce.trim().length >= 4) {
        setPinDisfarceSessao(novoPinDisfarce.trim());
      }
    },
    []
  );

  const alterarApiUrl = useCallback((novaUrl: string) => {
    setApiBaseUrl(novaUrl);
    setApiUrlState(getApiBaseUrl());
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      usuario,
      token,
      expiraEm,
      isAuthenticated: Boolean(token && usuario),
      isLoading,
      apiUrl,
      pinDisfarceSessao,
      migrationReport,
      isMigrated,
      login,
      registrar,
      logout,
      recarregarPerfil,
      atualizarUsuarioSessao,
      alterarApiUrl,
    }),
    [
      usuario,
      token,
      expiraEm,
      isLoading,
      apiUrl,
      pinDisfarceSessao,
      migrationReport,
      isMigrated,
      login,
      registrar,
      logout,
      recarregarPerfil,
      atualizarUsuarioSessao,
      alterarApiUrl,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return ctx;
}
