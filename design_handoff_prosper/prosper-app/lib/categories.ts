// Categorias — padrões + utilitário para mesclar com as personalizadas do usuário.

export interface Category { slug: string; name: string; color: string }

export const DEFAULT_CATEGORIES: Record<string, { name: string; color: string }> = {
  food:      { name: 'Alimentação', color: '#C8A02C' },
  home:      { name: 'Moradia',     color: '#1F8A5B' },
  transport: { name: 'Transporte',  color: '#2E7D9A' },
  leisure:   { name: 'Lazer',       color: '#C2542E' },
  health:    { name: 'Saúde',       color: '#8E5B8A' },
  edu:       { name: 'Educação',    color: '#B5862B' },
  income:    { name: 'Receita',     color: '#1F8A5B' },
};

// Paleta para o usuário escolher ao criar categoria.
export const CATEGORY_COLORS = ['#C8A02C', '#1F8A5B', '#2E7D9A', '#C2542E', '#8E5B8A', '#B5642B', '#7A4DE0', '#0E9E6E'];

// slug a partir de um nome digitado ("Pets & Cia" -> "pets-cia")
export function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || ('cat-' + Date.now().toString(36));
}

// Mescla padrões + personalizadas num único mapa { slug: {name,color} }.
export function buildCategoryMap(custom: Category[] = []): Record<string, { name: string; color: string }> {
  const map: Record<string, { name: string; color: string }> = { ...DEFAULT_CATEGORIES };
  for (const c of custom) map[c.slug] = { name: c.name, color: c.color };
  return map;
}

// Resolve nome/cor de um slug, com fallback amigável.
export function resolveCategory(slug: string, map: Record<string, { name: string; color: string }>) {
  return map[slug] ?? { name: slug, color: '#8A8E9E' };
}

// Tipos (subtype) sugeridos por padrão — o usuário pode criar os próprios.
export const DEFAULT_EXPENSE_TYPES = ['Conta fixa', 'Fatura de cartão de crédito', 'Compra avulsa', 'Assinatura', 'Empréstimo'];
export const DEFAULT_INCOME_TYPES = ['Salário', 'Venda de produto', 'Venda de serviço', 'Rendimento', 'Reembolso'];
