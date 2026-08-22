import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ProductCreateForm } from '@/features/product/products/components/product-create-form';

export const metadata = {
  title: 'Dashboard: New Product'
};

export default function CreateProductPage() {
  return (
    <PageContainer pageTitle='New Product' pageDescription='Add a new product to the catalog'>
      <Can permission='CREATE_PRODUCT_PRODUCTS'>
        <ProductCreateForm />
      </Can>
    </PageContainer>
  );
}
