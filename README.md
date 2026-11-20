# Valky Mobile — CitizenTech (Global Solution 2026/2 • FIAP)

Aplicativo mobile desenvolvido em **React Native com Expo (SDK 58) e Expo Router** para a disciplina de **Mobile Application Development** (2º Ano de Análise e Desenvolvimento de Sistemas — Turma **2TDSPV**).

---

## 1. Identificação do Grupo

**Grupo:** Valky • **Turma:** 2TDSPV

| RM | Nome Completo | Turma |
|---|---|---|
| **563379** | Enzo Xavier Coelho | 2TDSPV |
| **564995** | Gustavo Ribeiro Permagnani | 2TDSPV |
| **565568** | Júlia Kauane Menezes Farias | 2TDSPV |
| **566457** | Larissa Juvenal de Magalhães | 2TDSPV |
| **565258** | Matheus Gianolli | 2TDSPV |

---

## 2. A Solução CitizenTech e Conexão com os ODS da ONU

O **Valky** é uma plataforma de proteção para mulheres em risco de violência doméstica e feminicídio. Enquanto aplicativos oficiais atuais só liberam o botão de pânico após o juiz conceder a medida protetiva (o que pode levar 48 horas ou mais após a denúncia), o **Valky protege desde o registro do Boletim de Ocorrência (BO)**:

1. **O disfarce é o próprio gatilho (`/calculator`):** O aplicativo opera camuflado como uma calculadora funcional. Ao digitar o PIN pessoal configurado (ex.: `1901`) e tocar em `=`, o app dispara silenciosamente um alerta real (`POST /api/alertas`) enviando o número do BO e as coordenadas GPS para a polícia, mantendo a aparência de calculadora antes, durante e depois.
2. **Acompanhamento pela Rede de Confiança (`/contacts` e `/alerts`):** A usuária cadastra até 5 pessoas de confiança que recebem alertas e acompanham o andamento real da viatura policial (`ABERTO` → `VIATURA_A_CAMINHO` → `NO_LOCAL` → `ENCERRADO`).
3. **Diagnóstico de Prontidão em Tempo Real (`/` e `/profile`):** A API .NET avalia continuamente se a usuária está com BO, PIN da calculadora, permissões de microfone/GPS e contatos de confiança configurados (`prontaParaAlertaSilencioso`).

### Objetivos de Desenvolvimento Sustentável (ODS — Agenda 2030 da ONU)
- **ODS 11 — Cidades e Comunidades Sustentáveis:** Torna os espaços urbanos mais seguros, acolhedores e inclusivos para mulheres em situação de vulnerabilidade.
- **ODS 10 — Redução das Desigualdades:** Amplia o acesso imediato a mecanismos de proteção pública a partir do registro do BO.
- **ODS 3 — Saúde e Bem-Estar:** Preserva a vida e a integridade física e psicológica das cidadãs com resposta rápida e rede de apoio.
- **ODS 5 — Igualdade de Gênero (Complementar):** Enfrenta diretamente a escalada de ameaças e o feminicídio com tecnologia centrada na cidadã.

---

## 3. Atendimento aos Requisitos Técnicos (Mobile Application Development)

| Requisito | Como foi implementado no projeto |
|---|---|
| **Telas e Navegação (Expo Router)** | **8 telas funcionais de domínio + 1 tela extra "Sobre o App" = 9 telas no total**, utilizando roteamento baseado em arquivos (`src/app/`) do **Expo Router** (`Link`, `router`, `useLocalSearchParams`, `usePathname`, `Slot`) com barra de navegação dedicada e ocultação automática no modo de calculadora disfarçada. |
| **CRUD com API (.NET) via Fetch** | Camada `src/services/` e Custom Hooks (`useContacts`, `useAlerts`, `useApiHealth`) consumindo a **Valky.Api (.NET 10 + EF Core + Oracle Database 19c)** com **3 CRUDs completos** (Rede de Contatos de Confiança, Alertas de Emergência + Histórico de Status, e Perfil/Conta de Usuário), tratamento de erros RFC 7807 (`ProblemDetails`) e feedbacks visuais (`ErrorBanner`, `SuccessBanner`, loaders). |
| **Sistema de Autenticação** | Telas de Cadastro (`/signup` → `POST /api/auth/registrar`) e Login (`/login` → `POST /api/auth/login`) com autenticação real via **JWT Bearer**, validação matemática de CPF e senha forte, proteção de rotas restritas e **Logout funcional** limpando a sessão. |
| **Estilização e Identidade Visual** | Paleta autoral Valky (`src/constants/valky-theme.ts`) em tons de vinho (`#684A53`), rosé (`#A87580`) e creme (`#F8F3F2`), combinada com o tema escuro realista na calculadora disfarçada. |
| **Arquitetura, Hooks e Migrations** | Separação estrita de responsabilidades fora de `src/app/`: `src/services/`, `src/hooks/` (com `useEffect` e `useCallback`), `src/database/migrations.ts` (sincronizado com a migration EF Core `20261117000000_InitialCreateValkyOracle`), `src/contexts/`, `src/components/`, `src/types/`, `src/utils/` e `src/constants/`. |
| **Publicação e Tela "Sobre o App"** | Tela `/about` exibindo o **hash do commit de referência (`f09333c1f8d35efe8fcc97c23753d988053719cb`)**, relatório das migrations aplicadas e status ao vivo do `/health` da API .NET. |

---

## 4. Mapa das 9 Telas do Aplicativo (`src/app/`)

1. **`src/app/index.tsx` (Início / Painel de Proteção):** Dashboard com diagnóstico de prontidão do alerta silencioso (`prontaParaAlertaSilencioso`), resumo da sessão e atalhos para todos os módulos.
2. **`src/app/login.tsx` (Login JWT):** Autenticação real (`POST /api/auth/login`), leitura de parâmetros via `useLocalSearchParams`, tratamento de erros RFC 7807 e seletor de servidor da API (`ApiConfigModal`).
3. **`src/app/signup.tsx` (Cadastro / Signup):** Criação de conta (`POST /api/auth/registrar`) com escolha de perfil (`USUARIA`, `CONTATO_CONFIANCA`, `POLICIA`), CPF validado, senha forte, número do BO, PIN da calculadora e permissões.
4. **`src/app/calculator.tsx` (Calculadora Disfarçada):** Calculadora funcional que dispara silenciosamente `POST /api/alertas` ao digitar o PIN configurado seguido de `=`.
5. **`src/app/contacts.tsx` (Rede de Confiança — CRUD):** Listagem (`GET`), cadastro (`POST`), edição (`PUT`) e exclusão (`DELETE`) de até 5 pessoas de confiança em `/api/usuarios/{id}/contatos-confianca` via Custom Hook `useContacts()`.
6. **`src/app/alerts.tsx` (Central de Alertas e Andamento Policial — CRUD Duplo):** CRUD completo de alertas (`/api/alertas`) e CRUD completo da linha do tempo de atualizações de status da viatura (`/api/atualizacoes-status`) via Custom Hook `useAlerts()`.
7. **`src/app/profile.tsx` (Perfil, Ficha de Segurança e Conta — CRUD):** Leitura (`GET /api/auth/me`), atualização cadastral/BO/PIN (`PUT /api/usuarios/{id}`), troca de senha (`PATCH /api/usuarios/{id}/senha`), exclusão de conta (`DELETE /api/usuarios/{id}`) e Logout.
8. **`src/app/map.tsx` (Mapa de Incidências):** Mapa interativo (`react-native-maps`) exibindo ocorrências georreferenciadas e alertas sincronizados da `Valky.Api`.
9. **`src/app/blog.tsx` (Informação e Acolhimento):** Publicações educativas sobre direitos, Lei Maria da Penha, segurança e acolhimento.
10. **`src/app/about.tsx` (Sobre o App):** Exibe o **hash do commit Git de referência**, migrations aplicadas, verificação ao vivo do `/health` da API .NET/Oracle, integrantes do grupo e ODS da ONU.

---

## 5. Arquitetura de Pastas

```text
valky-mobile/
├── assets/                       # Ícones, splash screen e recursos visuais
├── src/
│   ├── app/                      # Camada de Navegação e Telas (Expo Router)
│   │   ├── _layout.tsx           # Layout raiz com AuthProvider, TopBar e BottomNav
│   │   ├── index.tsx             # Dashboard e diagnóstico de prontidão
│   │   ├── login.tsx             # Tela de Login JWT
│   │   ├── signup.tsx            # Tela de Cadastro com BO e PIN
│   │   ├── calculator.tsx        # Calculadora Disfarçada (Gatilho Silencioso)
│   │   ├── contacts.tsx          # CRUD da Rede de Contatos de Confiança
│   │   ├── alerts.tsx            # CRUD de Alertas e Histórico Policial
│   │   ├── profile.tsx           # CRUD de Perfil, Senha, Exclusão e Logout
│   │   ├── map.tsx               # Mapa de Incidências integrado à API
│   │   ├── blog.tsx              # Conteúdos de Informação e Acolhimento
│   │   └── about.tsx             # Tela "Sobre o App" com Hash do Commit e HealthCheck
│   ├── components/               # Componentes de UI reutilizáveis
│   │   ├── api-config-modal.tsx  # Seletor de URL da API e teste ao vivo do /health
│   │   ├── status-feedback.tsx   # Banners de erro RFC 7807, sucesso e loading
│   │   └── valky-navigation.tsx  # Cabeçalho e barra de navegação inferior
│   ├── constants/                # Tema, paleta de cores e metadados do projeto
│   │   ├── app-info.ts           # Commit hash, integrantes (RM/Turma) e ODS
│   │   ├── theme.ts              # Configurações base de tema
│   │   └── valky-theme.ts        # Identidade visual Valky e metadados de status
│   ├── contexts/                 # Gerenciamento de estado global
│   │   └── auth-context.tsx      # Contexto de Autenticação JWT e sessão da usuária
│   ├── database/                 # Controle de schema e migrations
│   │   └── migrations.ts         # Migrations locais sincronizadas com o EF Core Oracle
│   ├── hooks/                    # Custom Hooks com useEffect e useCallback
│   │   ├── use-alerts.ts         # Hook de CRUD duplo de alertas e status
│   │   ├── use-api-health.ts     # Hook de monitoramento do endpoint /health
│   │   ├── use-contacts.ts       # Hook de CRUD da rede de contatos de confiança
│   │   └── use-migrations.ts     # Hook de execução das migrations no startup
│   ├── services/                 # Camada de acesso à API REST (.NET 10) via Fetch
│   │   ├── api-client.ts         # Cliente HTTP com JWT Bearer, X-Client-Id e RFC 7807
│   │   ├── auth-service.ts       # Chamadas a /api/auth/login, /registrar e /me
│   │   ├── user-service.ts       # CRUD de /api/usuarios e /contatos-confianca
│   │   └── alert-service.ts      # CRUD de /api/alertas, /atualizacoes-status e /health
│   ├── types/                    # Contratos TypeScript espelhados dos DTOs C#
│   │   └── api.ts                # Interfaces de Request, Response e ProblemDetails
│   └── utils/                    # Funções puras de validação e formatação
│       └── validators.ts         # Validação matemática de CPF, senha forte e máscaras
├── app.json                      # Configuração do Expo e metadados do build
└── package.json                  # Dependências e scripts
```

---

## 6. Endpoints Consumidos da `Valky.Api` (.NET 10 + Oracle)

| Módulo | Método | Rota na `Valky.Api` | Tela / Hook / Serviço no App Mobile |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/registrar` | `signup.tsx` (`AuthService.registrar`) |
| **Auth** | `POST` | `/api/auth/login` | `login.tsx` (`AuthService.login`) |
| **Auth** | `GET` | `/api/auth/me` | `profile.tsx` (`AuthService.obterPerfilAutenticado`) |
| **Usuários** | `PUT` | `/api/usuarios/{id}` | `profile.tsx` (`UserService.atualizarUsuario`) |
| **Usuários** | `PATCH` | `/api/usuarios/{id}/senha` | `profile.tsx` (`UserService.alterarSenha`) |
| **Usuários** | `DELETE` | `/api/usuarios/{id}` | `profile.tsx` (`UserService.excluirUsuario`) |
| **Contatos** | `GET` | `/api/usuarios/{id}/contatos-confianca` | `contacts.tsx` (`useContacts` / `UserService.listarContatosConfianca`) |
| **Contatos** | `POST` | `/api/usuarios/{id}/contatos-confianca` | `contacts.tsx` (`useContacts` / `UserService.adicionarContatoConfianca`) |
| **Contatos** | `PUT` | `/api/usuarios/{id}/contatos-confianca/{contatoId}` | `contacts.tsx` (`useContacts` / `UserService.atualizarContatoConfianca`) |
| **Contatos** | `DELETE` | `/api/usuarios/{id}/contatos-confianca/{contatoId}` | `contacts.tsx` (`useContacts` / `UserService.removerContatoConfianca`) |
| **Alertas** | `GET` | `/api/alertas` | `alerts.tsx` e `map.tsx` (`useAlerts` / `AlertService.listarAlertas`) |
| **Alertas** | `POST` | `/api/alertas` | `calculator.tsx` e `alerts.tsx` (`AlertService.criarAlerta`) |
| **Alertas** | `PUT` | `/api/alertas/{id}` | `alerts.tsx` (`useAlerts` / `AlertService.atualizarAlerta`) |
| **Alertas** | `DELETE` | `/api/alertas/{id}` | `alerts.tsx` (`useAlerts` / `AlertService.excluirAlerta`) |
| **Status** | `GET` | `/api/atualizacoes-status?alertaId={id}` | `alerts.tsx` (`useAlerts` / `AlertService.listarAtualizacoesStatus`) |
| **Status** | `POST` | `/api/atualizacoes-status` | `alerts.tsx` (`useAlerts` / `AlertService.criarAtualizacaoStatus`) |
| **Status** | `PUT` | `/api/atualizacoes-status/{id}` | `alerts.tsx` (`useAlerts` / `AlertService.atualizarAtualizacaoStatus`) |
| **Status** | `DELETE` | `/api/atualizacoes-status/{id}` | `alerts.tsx` (`useAlerts` / `AlertService.excluirAtualizacaoStatus`) |
| **Saúde** | `GET` | `/health` e `/` | `about.tsx` e `api-config-modal.tsx` (`useApiHealth` / `AlertService.verificarHealthCheck`) |

---

## 7. Como Executar o Projeto

1. **Inicie a API Backend (`valky-devops`):**
   ```bash
   dotnet run --project src/Valky.Api
   ```
   *(Por padrão, a API responde na porta `54300` — `http://localhost:54300` / `https://localhost:54300`, ou na URL do Azure App Service).*

2. **Instale as dependências e inicie o aplicativo mobile (`valky-mobile`):**
   ```bash
   npm install
   npx expo start
   ```

3. **Configuração rápida da URL da API dentro do App:**
   - No topo do aplicativo (ou na tela de Login), toque no botão **`API`** para alternar com 1 toque entre:
     - **Web / iOS Simulator:** `http://localhost:54300` (ou `https://localhost:54300`)
     - **Emulador Android:** `http://10.0.2.2:54300`
     - **Azure App Service (Nuvem):** `https://app-valky-rm564995.azurewebsites.net`
     - Ou digite o IP local da sua máquina na rede Wi-Fi (ex.: `http://192.168.1.10:54300`) e toque em **"Salvar e Testar /health"**.

---

## 8. Declaração de Uso de IA Generativa

Em conformidade com as regras da Global Solution 2026/2 (página 17 do guia oficial):
- **Ferramenta utilizada:** Assistente de IA Generativa (Antigravity / Gemini e Claude).
- **Finalidade:** Apoio na estruturação da camada de serviços HTTP (`fetch`), espelhamento dos contratos TypeScript com os DTOs da API .NET, revisão de código e padronização visual dos componentes React Native.
