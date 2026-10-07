import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-brand-green text-2xl font-bold">Tela não encontrada</h1>
      <p className="text-muted">Este item pode ter sido excluído.</p>
      <Button asChild variant="green">
        <Link href="/admin">Voltar ao painel</Link>
      </Button>
    </main>
  );
}
