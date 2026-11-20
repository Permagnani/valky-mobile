import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ValkyColors } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { AlertService } from '@/services/alert-service';
import { ApiError } from '@/services/api-client';
import { AlertaResponse } from '@/types/api';

/**
 * Tela de Calculadora Disfarçada (O Disfarce é o Próprio Gatilho).
 * - Funciona como uma calculadora comum antes, durante e depois do alerta.
 * - Quando a usuária digita o PIN cadastrado (ou 1901) e aperta "=", dispara
 *   silenciosamente POST /api/alertas na Valky.Api (.NET 10) com o BO e coordenadas GPS.
 */
export default function CalculatorDisguiseScreen() {
  const { usuario, isAuthenticated, pinDisfarceSessao } = useAuth();
  const params = useLocalSearchParams<{ inspector?: string }>();

  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Estado discreto de alerta silencioso
  const [sendingAlert, setSendingAlert] = useState(false);
  const [lastTriggeredAlert, setLastTriggeredAlert] =
    useState<AlertaResponse | null>(null);
  const [silentError, setSilentError] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(false);

  useEffect(() => {
    if (params.inspector === '1') {
      setShowInspector(true);
    }
  }, [params.inspector]);

  const codigoGatilhoAtivo = pinDisfarceSessao || '1901';

  const dispararAlertaSilencioso = async () => {
    setSendingAlert(true);
    setSilentError(null);

    const codigoBo = usuario?.codigoBo || 'BO-2026-EMERGENCIA';
    // Coordenadas de São Paulo com leve variação realista de GPS
    const latitude = Number(
      (-23.55052 + (Math.random() - 0.5) * 0.004).toFixed(6)
    );
    const longitude = Number(
      (-46.633308 + (Math.random() - 0.5) * 0.004).toFixed(6)
    );

    try {
      const novoAlerta = await AlertService.criarAlerta({
        codigoBo,
        latitude,
        longitude,
        status: 'ABERTO',
      });
      setLastTriggeredAlert(novoAlerta);
    } catch (err) {
      if (err instanceof ApiError) {
        setSilentError(err.detail);
      } else {
        setSilentError('Sem conexão com a API no momento.');
      }
    } finally {
      setSendingAlert(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    if (val === 0) return;
    setDisplay(String(val * -1));
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const performCalculation = (
    op: string,
    left: number,
    right: number
  ): number => {
    switch (op) {
      case '+':
        return left + right;
      case '−':
        return left - right;
      case '×':
        return left * right;
      case '÷':
        return right !== 0 ? left / right : 0;
      default:
        return right;
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = performCalculation(operator, previousValue, inputValue);
      setPreviousValue(result);
      setDisplay(String(Number(result.toFixed(8))));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    const cleanInput = display.trim();

    // GATILHO SILENCIOSO: Se o número digitado for o PIN de disfarce (ou 1901)
    if (cleanInput === codigoGatilhoAtivo || cleanInput === '1901') {
      dispararAlertaSilencioso();
      // Mantém a aparência de calculadora mostrando o próprio número como resultado
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      return;
    }

    const inputValue = parseFloat(display);
    if (previousValue !== null && operator) {
      const result = performCalculation(operator, previousValue, inputValue);
      setDisplay(String(Number(result.toFixed(8))));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Barra superior discreta: toque para sair do disfarce */}
        <View style={styles.secretHeader}>
          <Pressable
            onPress={() => router.replace('/' as never)}
            style={styles.exitDisguiseBtn}
          >
            <Text style={styles.exitDisguiseText}>‹ Voltar ao Valky</Text>
          </Pressable>

          <View style={styles.statusIndicators}>
            {sendingAlert && (
              <ActivityIndicator size="small" color="#30D158" />
            )}
            {/* Ponto luminoso discreto: Verde = Alerta enviado à API; Amarelo = Erro/Offline */}
            {lastTriggeredAlert && <View style={styles.silentDotSuccess} />}
            {silentError && <View style={styles.silentDotWarning} />}

            <Pressable
              onPress={() => setShowInspector((v) => !v)}
              style={styles.inspectorToggle}
            >
              <Text style={styles.inspectorToggleText}>
                {showInspector ? 'Ocultar Info' : `PIN: ${codigoGatilhoAtivo} =`}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Painel retrátil para demonstração em aula/vídeo sem quebrar o disfarce */}
        {showInspector && (
          <View style={styles.inspectorBox}>
            <Text style={styles.inspectorTitle}>
              Modo Camuflado Valky (Gatilho Silencioso)
            </Text>
            <Text style={styles.inspectorText}>
              • Digite <Text style={styles.bold}>{codigoGatilhoAtivo}</Text> (ou{' '}
              <Text style={styles.bold}>1901</Text>) e toque em{' '}
              <Text style={styles.bold}>=</Text> para disparar um alerta real em{' '}
              <Text style={styles.bold}>POST /api/alertas</Text>.
            </Text>
            <Text style={styles.inspectorText}>
              • Sessão JWT:{' '}
              {isAuthenticated
                ? `Autenticada (${usuario?.nome} • BO: ${
                    usuario?.codigoBo ?? 'N/A'
                  })`
                : 'Não autenticada (faça login para autenticar o envio na API)'}
            </Text>
            {lastTriggeredAlert && (
              <View style={styles.triggeredBox}>
                <Text style={styles.inspectorSuccess}>
                  ✓ Alerta #{lastTriggeredAlert.id} registrado na Valky.Api! BO:{' '}
                  {lastTriggeredAlert.codigoBo} | Status:{' '}
                  {lastTriggeredAlert.status} | GPS: (
                  {lastTriggeredAlert.latitude}, {lastTriggeredAlert.longitude})
                </Text>
                <Link
                  href={{
                    pathname: '/alerts' as never,
                    params: { alertaId: String(lastTriggeredAlert.id) },
                  }}
                  asChild
                >
                  <Pressable style={styles.openAlertLinkBtn}>
                    <Text style={styles.openAlertLinkText}>
                      Acompanhar Ocorrência #{lastTriggeredAlert.id} na Central
                      190 →
                    </Text>
                  </Pressable>
                </Link>
              </View>
            )}
            {silentError && (
              <Text style={styles.inspectorError}>
                ⚠ Resposta da API: {silentError}
              </Text>
            )}
          </View>
        )}

        {/* Visor da Calculadora */}
        <View style={styles.displayContainer}>
          {operator && previousValue !== null && (
            <Text style={styles.expressionText}>
              {previousValue} {operator}
            </Text>
          )}
          <Text
            style={styles.displayText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </View>

        {/* Teclado da Calculadora */}
        <View style={styles.keypad}>
          <View style={styles.row}>
            <CalcButton label="AC" variant="function" onPress={handleClear} />
            <CalcButton
              label="+/−"
              variant="function"
              onPress={handleToggleSign}
            />
            <CalcButton
              label="%"
              variant="function"
              onPress={handlePercent}
            />
            <CalcButton
              label="÷"
              variant="operator"
              active={operator === '÷' && waitingForOperand}
              onPress={() => handleOperator('÷')}
            />
          </View>

          <View style={styles.row}>
            <CalcButton label="7" onPress={() => handleDigit('7')} />
            <CalcButton label="8" onPress={() => handleDigit('8')} />
            <CalcButton label="9" onPress={() => handleDigit('9')} />
            <CalcButton
              label="×"
              variant="operator"
              active={operator === '×' && waitingForOperand}
              onPress={() => handleOperator('×')}
            />
          </View>

          <View style={styles.row}>
            <CalcButton label="4" onPress={() => handleDigit('4')} />
            <CalcButton label="5" onPress={() => handleDigit('5')} />
            <CalcButton label="6" onPress={() => handleDigit('6')} />
            <CalcButton
              label="−"
              variant="operator"
              active={operator === '−' && waitingForOperand}
              onPress={() => handleOperator('−')}
            />
          </View>

          <View style={styles.row}>
            <CalcButton label="1" onPress={() => handleDigit('1')} />
            <CalcButton label="2" onPress={() => handleDigit('2')} />
            <CalcButton label="3" onPress={() => handleDigit('3')} />
            <CalcButton
              label="+"
              variant="operator"
              active={operator === '+' && waitingForOperand}
              onPress={() => handleOperator('+')}
            />
          </View>

          <View style={styles.row}>
            <CalcButton label="0" wide onPress={() => handleDigit('0')} />
            <CalcButton label="." onPress={handleDecimal} />
            <CalcButton label="=" variant="operator" onPress={handleEquals} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface CalcButtonProps {
  label: string;
  variant?: 'number' | 'function' | 'operator';
  wide?: boolean;
  active?: boolean;
  onPress: () => void;
}

function CalcButton({
  label,
  variant = 'number',
  wide = false,
  active = false,
  onPress,
}: CalcButtonProps) {
  const bgColor =
    variant === 'function'
      ? ValkyColors.calcFunctionBtn
      : variant === 'operator'
      ? active
        ? '#FFFFFF'
        : ValkyColors.calcOperatorBtn
      : ValkyColors.calcNumberBtn;

  const textColor =
    variant === 'function'
      ? ValkyColors.calcTextDark
      : variant === 'operator' && active
      ? ValkyColors.calcOperatorBtn
      : ValkyColors.calcTextLight;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.calcBtn,
        wide && styles.calcBtnWide,
        { backgroundColor: bgColor },
        pressed && styles.calcBtnPressed,
      ]}
    >
      <Text style={[styles.calcBtnText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ValkyColors.calcDisplay,
  },
  container: {
    flex: 1,
    backgroundColor: ValkyColors.calcDisplay,
    paddingHorizontal: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  secretHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  exitDisguiseBtn: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  exitDisguiseText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  silentDotSuccess: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#30D158',
  },
  silentDotWarning: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9F0A',
  },
  inspectorToggle: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  inspectorToggleText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  inspectorBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginTop: 4,
  },
  inspectorTitle: {
    color: '#FF9F0A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inspectorText: {
    color: '#D1D1D6',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  triggeredBox: {
    marginTop: 6,
  },
  inspectorSuccess: {
    color: '#30D158',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  openAlertLinkBtn: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  openAlertLinkText: {
    color: '#FF9F0A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  inspectorError: {
    color: '#FF453A',
    fontSize: 11,
    marginTop: 6,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 18,
  },
  expressionText: {
    color: '#8E8E93',
    fontSize: 22,
    marginBottom: 4,
  },
  displayText: {
    color: ValkyColors.white,
    fontSize: 64,
    fontWeight: '300',
  },
  keypad: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  calcBtn: {
    flex: 1,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnWide: {
    flex: 2.15,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  calcBtnPressed: {
    opacity: 0.75,
  },
  calcBtnText: {
    fontSize: 28,
    fontWeight: '500',
  },
});
