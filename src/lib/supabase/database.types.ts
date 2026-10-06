// Database types for the Art Terra schema (supabase/migrations).
// Regenerate from the live project with the Supabase MCP (`generate_typescript_types`)
// or `supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<{ user_id: string; created_at: string }, 'user_id'>;
      categorias: {
        Row: {
          id: string;
          slug: string;
          nome: string;
          descricao: string | null;
          imagem_capa_url: string | null;
          ordem: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          nome: string;
          descricao?: string | null;
          imagem_capa_url?: string | null;
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          nome?: string;
          descricao?: string | null;
          imagem_capa_url?: string | null;
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cores: {
        Row: { id: string; nome: string; hex: string; ordem: number; created_at: string };
        Insert: { id?: string; nome: string; hex?: string; ordem?: number; created_at?: string };
        Update: { id?: string; nome?: string; hex?: string; ordem?: number; created_at?: string };
        Relationships: [];
      };
      produtos: {
        Row: {
          id: string;
          categoria_id: string;
          slug: string;
          nome: string;
          descricao: string | null;
          medidas: Json;
          rendimento: string | null;
          rendimento_pecas_m2: number | null;
          face: string | null;
          observacao_face: string | null;
          aplicacao: string | null;
          observacoes: string | null;
          imagem_principal_url: string | null;
          imagem_aplicacao_url: string | null;
          imagens_extras: Json;
          destaque: boolean;
          ativo: boolean;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          slug: string;
          nome: string;
          descricao?: string | null;
          medidas?: Json;
          rendimento?: string | null;
          rendimento_pecas_m2?: number | null;
          face?: string | null;
          observacao_face?: string | null;
          aplicacao?: string | null;
          observacoes?: string | null;
          imagem_principal_url?: string | null;
          imagem_aplicacao_url?: string | null;
          imagens_extras?: Json;
          destaque?: boolean;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_id?: string;
          slug?: string;
          nome?: string;
          descricao?: string | null;
          medidas?: Json;
          rendimento?: string | null;
          rendimento_pecas_m2?: number | null;
          face?: string | null;
          observacao_face?: string | null;
          aplicacao?: string | null;
          observacoes?: string | null;
          imagem_principal_url?: string | null;
          imagem_aplicacao_url?: string | null;
          imagens_extras?: Json;
          destaque?: boolean;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'produtos_categoria_id_fkey';
            columns: ['categoria_id'];
            isOneToOne: false;
            referencedRelation: 'categorias';
            referencedColumns: ['id'];
          },
        ];
      };
      produto_cores: {
        Row: { produto_id: string; cor_id: string; ordem: number };
        Insert: { produto_id: string; cor_id: string; ordem?: number };
        Update: { produto_id?: string; cor_id?: string; ordem?: number };
        Relationships: [
          {
            foreignKeyName: 'produto_cores_cor_id_fkey';
            columns: ['cor_id'];
            isOneToOne: false;
            referencedRelation: 'cores';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'produto_cores_produto_id_fkey';
            columns: ['produto_id'];
            isOneToOne: false;
            referencedRelation: 'produtos';
            referencedColumns: ['id'];
          },
        ];
      };
      galeria: {
        Row: {
          id: string;
          imagem_url: string;
          legenda: string | null;
          alt: string;
          ordem: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          imagem_url: string;
          legenda?: string | null;
          alt: string;
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          imagem_url?: string;
          legenda?: string | null;
          alt?: string;
          ordem?: number;
          ativo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      configuracoes: {
        Row: {
          id: number;
          nome_empresa: string;
          slogan: string | null;
          whatsapp: string;
          email: string | null;
          instagram: string | null;
          endereco: string | null;
          horario_atendimento: string | null;
          catalogo_pdf_url: string | null;
          hero_titulo: string | null;
          hero_subtitulo: string | null;
          hero_imagem_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nome_empresa?: string;
          slogan?: string | null;
          whatsapp?: string;
          email?: string | null;
          instagram?: string | null;
          endereco?: string | null;
          horario_atendimento?: string | null;
          catalogo_pdf_url?: string | null;
          hero_titulo?: string | null;
          hero_subtitulo?: string | null;
          hero_imagem_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nome_empresa?: string;
          slogan?: string | null;
          whatsapp?: string;
          email?: string | null;
          instagram?: string | null;
          endereco?: string | null;
          horario_atendimento?: string | null;
          catalogo_pdf_url?: string | null;
          hero_titulo?: string | null;
          hero_subtitulo?: string | null;
          hero_imagem_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      mensagens_contato: {
        Row: {
          id: string;
          nome: string;
          telefone: string;
          email: string | null;
          assunto: string | null;
          mensagem: string;
          lida: boolean;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone: string;
          email?: string | null;
          assunto?: string | null;
          mensagem: string;
          lida?: boolean;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string;
          email?: string | null;
          assunto?: string | null;
          mensagem?: string;
          lida?: boolean;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
