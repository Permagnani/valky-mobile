
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  background: '#F8F3F2',
  wine: '#684A53',
  rose: '#A87580',
  text: '#806C71',
  white: '#FFFFFF',
  border: '#E8DADD',
  lightRose: '#F0E4E6',
};

const categories = [
  'Todos',
  'Direitos',
  'Segurança',
  'Acolhimento',
  'Informação',
];

const articles = [
  {
    id: 1,
    category: 'Direitos',
    title: 'Você conhece seus direitos?',
    description:
      'Conhecer os próprios direitos é um passo importante para buscar proteção e apoio.',
    content:
      'Toda mulher tem direito à proteção, ao respeito e a uma vida livre de violência. A Lei Maria da Penha é um importante instrumento de proteção no Brasil. Em situações de violência, procure os serviços oficiais de atendimento e orientação.',
    readTime: '3 min de leitura',
  },
  {
    id: 2,
    category: 'Segurança',
    title: 'Construindo uma rede de apoio',
    description:
      'Pessoas de confiança podem fazer diferença em momentos difíceis.',
    content:
      'Uma rede de apoio pode ser formada por familiares, amigas, profissionais e serviços especializados. Identifique pessoas com quem você se sente segura para conversar. Não é necessário enfrentar situações difíceis sozinha.',
    readTime: '4 min de leitura',
  },
  {
    id: 3,
    category: 'Acolhimento',
    title: 'Você não está sozinha',
    description:
      'Um espaço de acolhimento, escuta e respeito, sem julgamentos.',
    content:
      'Cada história merece ser ouvida com respeito. Sentir medo, insegurança ou confusão diante de uma situação difícil não é motivo de vergonha. Buscar ajuda é um gesto de cuidado consigo mesma.',
    readTime: '2 min de leitura',
  },
  {
    id: 4,
    category: 'Informação',
    title: 'Identificando sinais de violência',
    description:
      'A violência nem sempre começa com agressões físicas.',
    content:
      'Controle excessivo, ameaças, humilhações, isolamento e restrições à liberdade também podem ser sinais de violência. Informar-se é uma forma de reconhecer situações preocupantes e buscar orientação.',
    readTime: '3 min de leitura',
  },
];

export default function BlogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const filteredArticles =
    selectedCategory === 'Todos'
      ? articles
      : articles.filter(
          (article) => article.category === selectedCategory
        );

  const featuredArticle = articles[0];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>VALKY • INFORMAÇÃO E ACOLHIMENTO</Text>

        <Text style={styles.title}>Um espaço para você</Text>

        <Text style={styles.subtitle}>
          Informação, orientação e acolhimento. Conhecimento também é
          uma forma de proteção.
        </Text>

        <View style={styles.featuredCard}>
          <Text style={styles.featuredLabel}>DESTAQUE</Text>
          <Text style={styles.featuredTitle}>
            {featuredArticle.title}
          </Text>
          <Text style={styles.featuredDescription}>
            {featuredArticle.description}
          </Text>

          <Pressable
            style={styles.featuredButton}
            onPress={() => setSelectedArticle(featuredArticle)}
          >
            <Text style={styles.featuredButtonText}>
              Ler publicação →
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Explore os conteúdos</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category &&
                  styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category &&
                    styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Publicações</Text>

        {filteredArticles.map((article) => (
          <Pressable
            key={article.id}
            style={styles.articleCard}
            onPress={() => setSelectedArticle(article)}
          >
            <Text style={styles.articleCategory}>
              {article.category.toUpperCase()}
            </Text>

            <Text style={styles.articleTitle}>{article.title}</Text>

            <Text style={styles.articleDescription}>
              {article.description}
            </Text>

            <View style={styles.articleFooter}>
              <Text style={styles.readTime}>{article.readTime}</Text>
              <Text style={styles.readMore}>Ler mais →</Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.footer}>
          Valky • Informação também é acolhimento.
        </Text>
      </ScrollView>

      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedArticle && (
              <>
                <Text style={styles.articleCategory}>
                  {selectedArticle.category.toUpperCase()}
                </Text>

                <Text style={styles.modalTitle}>
                  {selectedArticle.title}
                </Text>

                <Text style={styles.modalBody}>
                  {selectedArticle.content}
                </Text>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedArticle(null)}
                >
                  <Text style={styles.closeButtonText}>Voltar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 22,
    paddingTop: 35,
    paddingBottom: 140,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 'bold',
    color: COLORS.rose,
    marginBottom: 12,
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: COLORS.wine,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text,
    marginBottom: 25,
  },
  featuredCard: {
    backgroundColor: COLORS.wine,
    borderRadius: 22,
    padding: 23,
    marginBottom: 30,
  },
  featuredLabel: {
    color: '#E8C9D0',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 14,
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuredDescription: {
    color: '#F3E7E9',
    fontSize: 14,
    lineHeight: 21,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 12,
    marginTop: 20,
  },
  featuredButtonText: {
    color: COLORS.wine,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.wine,
    marginBottom: 16,
  },
  categories: {
    gap: 9,
    paddingBottom: 25,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: COLORS.white,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.wine,
    borderColor: COLORS.wine,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 19,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  articleCategory: {
    color: COLORS.rose,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  articleTitle: {
    color: COLORS.wine,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleDescription: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
  },
  readTime: {
    color: COLORS.text,
    fontSize: 12,
  },
  readMore: {
    color: COLORS.rose,
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 12,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 25, 30, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 27,
    paddingTop: 35,
    minHeight: '45%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.wine,
    marginBottom: 18,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
  },
  closeButton: {
    backgroundColor: COLORS.wine,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  closeButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
