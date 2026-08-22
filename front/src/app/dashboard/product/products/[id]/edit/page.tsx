import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ProductEditForm } from '@/features/product/products/components/product-edit-form';

export const metadata = {
  title: 'Dashboard: Edit Product'
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageContainer pageTitle='Edit Product' pageDescription='Update product details'>
      <Can permission='UPDATE_PRODUCT_PRODUCTS'>
        <ProductEditForm productId={Number(id)} />
      </Can>
    </PageContainer>
  );
}
