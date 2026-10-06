export interface Medida {
  rotulo: string | null;
  valor: string;
}

export type Face = 'uma_face' | 'dupla_face' | 'uma_ou_dupla';

export interface Cor {
  id: string;
  nome: string;
  hex: string;
  ordem: number;
}

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  imagem_capa_url: string | null;
  ordem: number;
  ativo: boolean;
}

export interface CategoriaComContagem extends Categoria {
  total: number;
}

export interface Produto {
  id: string;
  categoria_id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  medidas: Medida[];
  rendimento: string | null;
  rendimento_pecas_m2: number | null;
  face: Face | null;
  observacao_face: string | null;
  aplicacao: string | null;
  observacoes: string | null;
  imagem_principal_url: string | null;
  imagem_aplicacao_url: string | null;
  imagens_extras: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  updated_at: string;
  categoria: { id: string; slug: string; nome: string; ordem: number };
  cores: Cor[];
}

export interface GaleriaItem {
  id: string;
  imagem_url: string;
  legenda: string | null;
  alt: string;
  ordem: number;
  ativo: boolean;
}

export interface Settings {
  nome_empresa: string;
  slogan: string;
  whatsapp: string;
  email: string;
  instagram: string;
  endereco: string;
  horario_atendimento: string | null;
  catalogo_pdf_url: string | null;
  hero_titulo: string;
  hero_subtitulo: string;
  hero_imagem_url: string | null;
}

export interface Mensagem {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  assunto: string | null;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface Catalog {
  categorias: CategoriaComContagem[];
  produtos: Produto[];
}
