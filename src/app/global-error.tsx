'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          background: '#F8F6F2',
          color: '#1C2420',
          padding: '4rem 1.5rem',
        }}
      >
        <h1 style={{ color: '#2D4E2F' }}>Algo deu errado</h1>
        <p>Não conseguimos carregar o site agora. Tente novamente em instantes.</p>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.25rem',
            background: '#F5871F',
            color: '#1F3721',
            border: 0,
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
