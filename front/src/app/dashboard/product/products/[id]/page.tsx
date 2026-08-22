import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ProductDetailView } from '@/features/product/products/components/product-detail-view';

export const metadata = {
  title: 'Dashboard: Product Details'
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageContainer pageTitle='Product Details' pageDescription='View product info, stock and purchase history'>
      <Can permission='READ_PRODUCT_PRODUCTS'>
        <ProductDetailView productId={Number(id)} />
      </Can>
    </PageContainer>
  );
}
