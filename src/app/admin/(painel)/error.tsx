'use client';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="border-line rounded-[12px] border bg-white p-8 text-center">
      <h1 className="font-heading text-brand-green text-xl font-bold">Algo deu errado</h1>
      <p className="text-muted mt-2">
        Não foi possível carregar esta tela. Verifique a internet e tente de novo.
      </p>
      <Button variant="green" className="mt-5" onClick={reset}>
        <RefreshCw />
        Tentar novamente
      </Button>
    </div>
  );
}
