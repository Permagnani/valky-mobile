import { PerfilUsuario } from '@/types/api';

/**
 * Regras de validação client-side espelhadas exatamente de RegrasUsuario.cs
 * e RegrasAlerta.cs da Valky.Api (.NET 10).
 */

export function normalizarDigitos(valor?: string | null): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

export function formatarCpf(valor: string): string {
  const d = normalizarDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function formatarTelefone(valor: string): string {
  const d = normalizarDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/**
 * Validação matemática dos dígitos verificadores do CPF (idêntica a RegrasUsuario.CpfValido na API).
 */
export function cpfValido(cpf?: string | null): boolean {
  const digitos = normalizarDigitos(cpf);
  if (digitos.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(digitos)) return false;

  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += Number(digitos[i]) * (10 - i);
  }
  let resto1 = (soma1 * 10) % 11;
  if (resto1 === 10) resto1 = 0;
  if (resto1 !== Number(digitos[9])) return false;

  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += Number(digitos[i]) * (11 - i);
  }
  let resto2 = (soma2 * 10) % 11;
  if (resto2 === 10) resto2 = 0;
  return resto2 === Number(digitos[10]);
}

export function validarSenhaForte(senha?: string | null): string[] {
  const erros: string[] = [];
  if (!senha || senha.trim().length === 0) {
    erros.push('A senha é obrigatória.');
    return erros;
  }
  if (senha.length < 8 || senha.length > 100) {
    erros.push('A senha deve ter entre 8 e 100 caracteres.');
  }
  if (!/[A-Z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  if (!/[a-z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra minúscula.');
  }
  if (!/[0-9]/.test(senha)) {
    erros.push('A senha deve conter pelo menos um número.');
  }
  return erros;
}

export function validarFormularioCadastro(params: {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  perfil: PerfilUsuario;
  codigoBo?: string;
  pinDisfarce?: string;
}): string[] {
  const erros: string[] = [];
  const nome = params.nome.trim();
  const email = params.email.trim();
  const telefoneDigitos = normalizarDigitos(params.telefone);
  const codigoBo = params.codigoBo?.trim() ?? '';
  const pinDisfarce = params.pinDisfarce?.trim() ?? '';

  if (nome.length < 3 || nome.length > 120) {
    erros.push('O nome completo deve ter entre 3 e 120 caracteres.');
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    erros.push('Informe um endereço de e-mail válido.');
  }

  if (!cpfValido(params.cpf)) {
    erros.push('Informe um CPF válido (11 dígitos com verificador válido).');
  }

  if (telefoneDigitos.length < 10 || telefoneDigitos.length > 15) {
    erros.push('O telefone deve conter DDD + número (10 a 15 dígitos).');
  }

  erros.push(...validarSenhaForte(params.senha));

  if (params.perfil === 'USUARIA' && codigoBo.length === 0) {
    erros.push(
      'Para o perfil USUÁRIA, o número do Boletim de Ocorrência (BO) é obrigatório.'
    );
  } else if (codigoBo.length > 30) {
    erros.push('O número do BO deve ter no máximo 30 caracteres.');
  }

  if (pinDisfarce.length > 0 && !/^\d{4,8}$/.test(pinDisfarce)) {
    erros.push('O PIN da calculadora disfarçada deve conter de 4 a 8 dígitos numéricos.');
  }

  return erros;
}

export function validarContatoConfianca(params: {
  nome: string;
  telefone: string;
  email?: string;
  parentesco: string;
  notificarPorSms: boolean;
  notificarPorApp: boolean;
}): string[] {
  const erros: string[] = [];
  const nome = params.nome.trim();
  const telefone = normalizarDigitos(params.telefone);
  const email = params.email?.trim() ?? '';
  const parentesco = params.parentesco.trim();

  if (nome.length < 2 || nome.length > 120) {
    erros.push('O nome do contato deve ter entre 2 e 120 caracteres.');
  }
  if (telefone.length < 10 || telefone.length > 15) {
    erros.push('O telefone do contato deve conter DDD + número (10 a 15 dígitos).');
  }
  if (email.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    erros.push('O e-mail do contato informado é inválido.');
  }
  if (parentesco.length === 0 || parentesco.length > 50) {
    erros.push('Informe o vínculo ou parentesco (ex.: Mãe, Irmã, Amiga).');
  }
  if (!params.notificarPorSms && !params.notificarPorApp) {
    erros.push('Selecione pelo menos um canal de notificação (SMS ou App).');
  }

  return erros;
}

/**
 * Gera um CPF matematicamente válido para facilitar preenchimento rápido de demonstração em aula/vídeo.
 */
export function gerarCpfValidoDemo(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  let d1 = n.reduce((acc, val, idx) => acc + val * (10 - idx), 0);
  d1 = (d1 * 10) % 11;
  if (d1 === 10) d1 = 0;

  let d2 = [...n, d1].reduce((acc, val, idx) => acc + val * (11 - idx), 0);
  d2 = (d2 * 10) % 11;
  if (d2 === 10) d2 = 0;

  return formatarCpf([...n, d1, d2].join(''));
}
