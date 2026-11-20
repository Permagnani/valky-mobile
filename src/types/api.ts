/**
 * Contratos de dados (DTOs) espelhados da Valky.Api (.NET 10 + EF Core Oracle).
 * Mantém tipagem estrita para todas as operações de Autenticação, Usuários,
 * Rede de Confiança, Alertas, Atualizações de Status e Erros RFC 7807.
 */

export type PerfilUsuario = 'USUARIA' | 'CONTATO_CONFIANCA' | 'POLICIA';

export type StatusAlerta =
  | 'ABERTO'
  | 'VIATURA_A_CAMINHO'
  | 'NO_LOCAL'
  | 'ENCERRADO';

export interface RegistrarUsuarioRequest {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  perfil: PerfilUsuario;
  codigoBo?: string | null;
  pinDisfarce?: string | null;
  possuiMedidaProtetiva: boolean;
  permissaoMicrofone: boolean;
  permissaoLocalizacao: boolean;
}

export interface AtualizarUsuarioRequest {
  nome: string;
  email: string;
  telefone: string;
  perfil: PerfilUsuario;
  codigoBo?: string | null;
  pinDisfarce?: string | null;
  possuiMedidaProtetiva: boolean;
  permissaoMicrofone: boolean;
  permissaoLocalizacao: boolean;
  ativo: boolean;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface ContatoConfiancaRequest {
  nome: string;
  telefone: string;
  email?: string | null;
  parentesco: string;
  notificarPorSms: boolean;
  notificarPorApp: boolean;
}

export interface ContatoConfiancaResponse {
  id: number;
  usuarioId: number;
  nome: string;
  telefone: string;
  email?: string | null;
  parentesco: string;
  notificarPorSms: boolean;
  notificarPorApp: boolean;
  criadoEm: string;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  perfil: PerfilUsuario;
  codigoBo?: string | null;
  possuiPinDisfarceConfigurado: boolean;
  possuiMedidaProtetiva: boolean;
  permissaoMicrofone: boolean;
  permissaoLocalizacao: boolean;
  ativo: boolean;
  prontaParaAlertaSilencioso: boolean;
  pendenciasConfiguracao: string[];
  contatosConfianca: ContatoConfiancaResponse[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tipoToken: string;
  expiraEm: string;
  usuario: UsuarioResponse;
}

export interface AlertaRequest {
  codigoBo: string;
  latitude: number;
  longitude: number;
  status?: StatusAlerta | null;
}

export interface AlertaResponse {
  id: number;
  codigoBo: string;
  latitude: number;
  longitude: number;
  status: StatusAlerta;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AtualizacaoStatusRequest {
  alertaId: number;
  status: StatusAlerta;
  observacao?: string | null;
  responsavel: string;
}

export interface AtualizacaoStatusResponse {
  id: number;
  alertaId: number;
  status: StatusAlerta;
  observacao?: string | null;
  responsavel: string;
  criadoEm: string;
}

export interface HealthCheckItem {
  nome: string;
  status: string;
  descricao?: string | null;
  duracaoMs: number;
  erro?: string | null;
}

export interface HealthCheckResponse {
  status: string;
  verificadoEmUtc: string;
  tempoTotalMs: number;
  verificacoes: HealthCheckItem[];
}

export interface ApiStatusRootResponse {
  aplicacao: string;
  versao: string;
  bancoDeDados?: string;
  status: string;
  documentacao?: string;
  healthCheck?: string;
}

/**
 * Contrato de erro padronizado pela Valky.Api seguindo a RFC 7807 (ProblemDetails).
 */
export interface ProblemDetailsResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  mensagem?: string;
  codigoErro?: string;
  codigoOracle?: string;
  traceId?: string;
  timestamp?: string;
  errors?: {
    erros?: string[];
    [key: string]: string[] | undefined;
  };
}
