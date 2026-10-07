import type { Metadata } from 'next';
import { NewPasswordForm } from './new-password-form';

export const metadata: Metadata = { title: 'Nova senha' };

export default function NovaSenhaPage() {
  return <NewPasswordForm />;
}
