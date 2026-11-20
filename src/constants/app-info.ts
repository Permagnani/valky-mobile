import { Platform } from 'react-native';

/**
 * Metadados oficiais do projeto Valky para a Global Solution 2026/2 (CitizenTech)
 * e para a tela "Sobre o App" exigida no Requisito 7.
 */
export const APP_INFO = {
  name: 'Valky',
  tagline: 'Proteção silenciosa, acolhimento e resposta rápida contra o feminicídio',
  version: '1.0.0',
  sdkVersion: 'Expo SDK 58 / React Native 0.88',
  backendTech: '.NET 10 Minimal API + EF Core + Oracle Database 19c',
  course: '2º Ano — Análise e Desenvolvimento de Sistemas (Turma 2TDSPV)',
  subject: 'Mobile Application Development',
  /**
   * Hash do commit de referência (Requisito 7 — Publicação do App / Tela "Sobre o App").
   * Pode ser sobrescrito via variável de ambiente EXPO_PUBLIC_COMMIT_HASH no build.
   */
  commitHashFull:
    process.env.EXPO_PUBLIC_COMMIT_HASH ??
    'f09333c1f8d35efe8fcc97c23753d988053719cb',
  commitHashShort:
    (
      process.env.EXPO_PUBLIC_COMMIT_HASH ??
      'f09333c1f8d35efe8fcc97c23753d988053719cb'
    ).slice(0, 7),
  repositoryUrl: 'https://github.com/Permagnani/valky-mobile',
  apiRepositoryUrl: 'https://github.com/Permagnani/valky-devops',
  firebaseDistributionGroup: 'fiap-professores-testers',
} as const;

export const GROUP_MEMBERS = [
  { rm: '563379', nome: 'Enzo Xavier Coelho', turma: '2TDSPV' },
  { rm: '564995', nome: 'Gustavo Ribeiro Permagnani', turma: '2TDSPV' },
  { rm: '565568', nome: 'Júlia Kauane Menezes Farias', turma: '2TDSPV' },
  { rm: '566457', nome: 'Larissa Juvenal de Magalhães', turma: '2TDSPV' },
  { rm: '565258', nome: 'Matheus Gianolli', turma: '2TDSPV' },
] as const;

export const ONU_ODS = [
  {
    numero: '11',
    titulo: 'Cidades e Comunidades Sustentáveis',
    descricao:
      'Torna os espaços urbanos mais seguros e inclusivos para mulheres em situação de vulnerabilidade.',
  },
  {
    numero: '10',
    titulo: 'Redução das Desigualdades',
    descricao:
      'Garante acesso imediato à proteção desde o registro do BO, antes mesmo do deferimento da medida protetiva.',
  },
  {
    numero: '3',
    titulo: 'Saúde e Bem-Estar',
    descricao:
      'Preserva a vida e a integridade física e psicológica da mulher com acionamento silencioso e rede de apoio.',
  },
  {
    numero: '5',
    titulo: 'Igualdade de Gênero (Complementar)',
    descricao:
      'Combate diretamente a violência doméstica e o feminicídio por meio de tecnologia centrada na cidadã.',
  },
] as const;

/**
 * Presets de URL da Valky.Api (.NET 10) para facilitar testes em Emulador Android,
 * Simulador iOS, Web e Nuvem (Azure App Service).
 */
export const API_URL_PRESETS = [
  {
    label: 'Localhost HTTP (localhost:54300)',
    url: 'http://localhost:54300',
    hint: 'Porta padrão da Valky.Api local (Web, iOS Simulator ou ADB reverse)',
  },
  {
    label: 'Localhost HTTPS (localhost:54300)',
    url: 'https://localhost:54300',
    hint: 'Porta HTTPS configurada no launchSettings.json do Visual Studio',
  },
  {
    label: 'Emulador Android (10.0.2.2:54300)',
    url: 'http://10.0.2.2:54300',
    hint: 'Padrão do Android Studio Emulator acessando a Valky.Api na porta 54300',
  },
  {
    label: 'Localhost Alternativo (localhost:54301)',
    url: 'http://localhost:54301',
    hint: 'Porta HTTP secundária do launchSettings.json',
  },
  {
    label: 'Azure App Service (Nuvem)',
    url: 'https://app-valky-rm564995.azurewebsites.net',
    hint: 'Ambiente provisionado via Azure CLI (scripts/infra-azure.sh)',
  },
] as const;

export function getDefaultApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:54300';
  }
  return 'http://localhost:54300';
}
