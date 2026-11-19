
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { apiFetch } from '@/services/api';
import { getUserId } from '@/services/auth-storage';

type Contato = {
  id: number;
  nome: string;
  telefone: string;
  parentesco: string;
};

export default function ContatosScreen() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregarContatos = useCallback(async () => {
    try {
      setCarregando(true);

      const usuarioId = await getUserId();

      if (!usuarioId) {
        throw new Error('Faça login novamente para acessar seus contatos.');
      }

      const resposta = await apiFetch(
        `/api/contatos-confianca/usuario/${usuarioId}`,
      );

      setContatos(
        Array.isArray(resposta) ? resposta : resposta?.content ?? [],
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível carregar',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarContatos();
  }, [carregarContatos]);

  async function adicionarContato() {
    if (!nome.trim() || !telefone.trim() || !parentesco.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      setSalvando(true);

      const usuarioId = await getUserId();

      if (!usuarioId) {
        throw new Error('Faça login novamente.');
      }

      await apiFetch(
        `/api/contatos-confianca/usuario/${usuarioId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            nome: nome.trim(),
            telefone: telefone.trim(),
            parentesco: parentesco.trim(),
          }),
        },
      );

      setNome('');
      setTelefone('');
      setParentesco('');

      await carregarContatos();

      Alert.alert('Sucesso', 'Contato cadastrado com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro ao cadastrar',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao(contatoId: number) {
    Alert.alert(
      'Excluir contato',
      'Deseja realmente excluir este contato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirContato(contatoId),
        },
      ],
    );
  }

  async function excluirContato(contatoId: number) {
    try {
      await apiFetch(`/api/contatos-confianca/${contatoId}`, {
        method: 'DELETE',
      });

      await carregarContatos();

      Alert.alert('Sucesso', 'Contato excluído.');
    } catch (error) {
      Alert.alert(
        'Erro ao excluir',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>VALKY • PROTEÇÃO</Text>
        <Text style={styles.title}>Contatos de confiança</Text>
        <Text style={styles.subtitle}>
          Pessoas que você escolhe para fazer parte da sua rede de apoio.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Adicionar contato</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do contato"
            placeholderTextColor="#A58C92"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 11999999999"
            placeholderTextColor="#A58C92"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Parentesco ou relação</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Irmã, amiga, mãe..."
            placeholderTextColor="#A58C92"
            value={parentesco}
            onChangeText={setParentesco}
          />

          <Pressable
            style={[styles.addButton, salvando && styles.disabledButton]}
            onPress={adicionarContato}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>Adicionar contato</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Minha rede de apoio</Text>
          <Pressable onPress={carregarContatos}>
            <Text style={styles.refreshText}>Atualizar</Text>
          </Pressable>
        </View>

        {carregando ? (
          <ActivityIndicator color="#A87580" size="large" />
        ) : contatos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum contato cadastrado ainda.
            </Text>
          </View>
        ) : (
          contatos.map((contato) => (
            <View key={contato.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contato.nome}</Text>
                <Text style={styles.contactRelation}>
                  {contato.parentesco}
                </Text>
                <Text style={styles.contactPhone}>{contato.telefone}</Text>
              </View>

              <Pressable
                onPress={() => confirmarExclusao(contato.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Valky — informação, cuidado e proteção.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3F2',
  },
  content: {
    padding: 22,
    paddingTop: 28,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#A87580',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 9,
  },
  title: {
    color: '#684A53',
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  subtitle: {
    color: '#806C71',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 25,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 19,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAD9DC',
    marginBottom: 30,
  },
  cardTitle: {
    color: '#684A53',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  label: {
    color: '#684A53',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FAF6F5',
    borderWidth: 1,
    borderColor: '#EAD9DC',
    borderRadius: 12,
    padding: 14,
    color: '#684A53',
    marginBottom: 15,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#684A53',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#684A53',
    fontSize: 19,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#A87580',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  emptyText: {
    color: '#806C71',
    textAlign: 'center',
    fontSize: 14,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAD9DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#684A53',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactRelation: {
    color: '#A87580',
    fontSize: 13,
    marginBottom: 4,
  },
  contactPhone: {
    color: '#806C71',
    fontSize: 13,
  },
  deleteButton: {
    padding: 9,
  },
  deleteText: {
    color: '#A34F60',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    color: '#A87580',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});
