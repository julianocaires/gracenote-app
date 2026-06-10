const pt = {
  common: { loading: 'Carregando...', error: 'Ocorreu um erro', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', create: 'Criar', confirm: 'Confirmar', back: 'Voltar', search: 'Buscar', close: 'Fechar' },
  auth: { login: 'Entrar', signup: 'Criar conta', logout: 'Sair', email: 'Email', password: 'Senha', name: 'Nome', forgotPassword: 'Esqueceu a senha?', noAccount: 'Não tem conta?', hasAccount: 'Já tem conta?' },
  tabs: { library: 'Biblioteca', search: 'Buscar', favorites: 'Favoritos', profile: 'Perfil' },
  sermons: { emptyState: 'Nenhuma ministração ainda', createButton: 'Nova ministração', title: 'Título', content: 'Conteúdo', selectCategory: 'Selecionar categoria', selectTags: 'Selecionar tags', limitReached: 'Você atingiu o limite de 100 ministrações no plano gratuito.', limitReachedAction: 'Assine o Premium para ministrações ilimitadas ou exclua ministrações existentes.', sermonCount: '{{count}} de 100', sermonCountPremium: '{{count}} ministrações' },
  categories: { title: 'Categorias', create: 'Nova categoria', edit: 'Editar categoria', delete: 'Excluir categoria', name: 'Nome da categoria' },
  tags: { title: 'Tags', create: 'Nova tag', edit: 'Editar tag', delete: 'Excluir tag', name: 'Nome da tag' },
  profile: { title: 'Perfil', theme: 'Tema', light: 'Claro', dark: 'Escuro', system: 'Sistema', language: 'Idioma' },
  premium: { title: 'GraceNote Premium', monthly: 'Mensal', yearly: 'Anual', subscribe: 'Assinar', restore: 'Restaurar compras', lockedFeature: 'Disponível no plano Premium', upgrade: 'Assinar Premium', limitReached: 'Limite de ministrações atingido', archived: 'Ministração Arquivada', archivedMessage: 'Esta ministração foi arquivada após o fim da sua assinatura Premium.', reUpgrade: 'Assine novamente para acessá-la', downgradeWarning: 'Ao cancelar sua assinatura, apenas suas 100 ministrações mais recentes permanecerão ativas.', upgradeToAccess: 'Assine Premium para acessar' },
  covers: { title: 'Escolher capa', gallery: 'Galeria do App', camera: 'Câmera', device: 'Galeria do Celular', premium: 'Premium' },
  editor: { bold: 'Negrito', italic: 'Itálico', underline: 'Sublinhado', heading1: 'Título', heading2: 'Subtítulo', bulletList: 'Lista', orderedList: 'Lista numerada', textColor: 'Cor do texto', highlight: 'Marca-texto', font: 'Fonte', blockquote: 'Citação' },
}
export default pt
export type Translations = typeof pt
