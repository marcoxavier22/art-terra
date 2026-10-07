import { CatalogSkeleton } from '@/components/catalog/catalog-browser';
import { PageHeader } from '@/components/site/page-header';

export default function Loading() {
  return (
    <>
      <PageHeader eyebrow="Elegância atemporal" title="Catálogo 2025" />
      <CatalogSkeleton />
    </>
  );
}
