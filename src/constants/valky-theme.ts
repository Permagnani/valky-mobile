import { Platform } from 'react-native';

/**
 * Identidade visual personalizada do Valky (Requisito 4).
 * Paleta acolhedora em tons de vinho, rosé e creme para a área de apoio,
 * e paleta neutra/escura realista para o modo de calculadora disfarçada.
 */
export const ValkyColors = {
  background: '#F8F3F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FDFBFA',
  surfaceMuted: '#F3E8E9',
  primary: '#684A53',
  primaryDark: '#4D353C',
  primaryLight: '#87636E',
  secondary: '#A87580',
  secondarySoft: '#E8C9D0',
  accent: '#995D6B',
  textPrimary: '#3D282E',
  textSecondary: '#684A53',
  textMuted: '#806C71',
  border: '#EAD9DC',
  borderStrong: '#D8BEC3',
  white: '#FFFFFF',

  // Cores semânticas de feedback e status de ocorrência
  success: '#2E7D5B',
  successBg: '#E7F4EE',
  successBorder: '#B9DFCD',
  warning: '#B76E1F',
  warningBg: '#FDF3E6',
  warningBorder: '#F2D2A9',
  danger: '#B8334A',
  dangerBg: '#FCEBEF',
  dangerBorder: '#F3BDC7',
  info: '#3B668C',
  infoBg: '#EAF1F8',
  infoBorder: '#BDD3E8',

  // Paleta realista do Modo Calculadora Disfarçada
  calcBackground: '#1C1C1E',
  calcDisplay: '#000000',
  calcNumberBtn: '#333333',
  calcFunctionBtn: '#A5A5A5',
  calcOperatorBtn: '#FF9F0A',
  calcTextLight: '#FFFFFF',
  calcTextDark: '#000000',
} as const;

export const ValkyStatusMeta = {
  ABERTO: {
    label: 'Alerta Recebido (Aberto)',
    shortLabel: 'ABERTO',
    color: '#B8334A',
    bg: '#FCEBEF',
    border: '#F3BDC7',
    description: 'Central 190 recebeu a localização, ficha de contexto e áudio.',
  },
  VIATURA_A_CAMINHO: {
    label: 'Viatura a Caminho',
    shortLabel: 'VIATURA A CAMINHO',
    color: '#B76E1F',
    bg: '#FDF3E6',
    border: '#F2D2A9',
    description: 'Equipe policial foi despachada e está em deslocamento.',
  },
  NO_LOCAL: {
    label: 'Polícia no Local',
    shortLabel: 'NO LOCAL',
    color: '#3B668C',
    bg: '#EAF1F8',
    border: '#BDD3E8',
    description: 'Viatura chegou às coordenadas informadas pelo alerta.',
  },
  ENCERRADO: {
    label: 'Ocorrência Encerrada',
    shortLabel: 'ENCERRADO',
    color: '#2E7D5B',
    bg: '#E7F4EE',
    border: '#B9DFCD',
    description: 'Atendimento concluído pela autoridade policial.',
  },
} as const;

export const ValkyPerfilMeta = {
  USUARIA: {
    label: 'Usuária Protegida',
    badge: 'USUÁRIA',
    description: 'Acesso ao botão silencioso na calculadora, rede de confiança e BO.',
  },
  CONTATO_CONFIANCA: {
    label: 'Rede de Confiança',
    badge: 'CONTATO DE CONFIANÇA',
    description: 'Acompanha o status do atendimento policial em tempo real.',
  },
  POLICIA: {
    label: 'Agente Policial / Central 190',
    badge: 'POLÍCIA',
    description: 'Gerencia ocorrências e atualiza o andamento das viaturas.',
  },
} as const;

export const ValkyShadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#4D353C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
};
