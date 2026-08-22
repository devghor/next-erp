import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CategoryListingPage from '@/features/product/categories/components/category-listing';
import { CategoryFormSheetTrigger } from '@/features/product/categories/components/category-form-sheet';
import { CategoryImportDialogTrigger } from '@/features/product/categories/components/category-import-dialog';
import { CategoryExportButtons } from '@/features/product/categories/components/category-export-buttons';

export const metadata = {
  title: 'Dashboard: Categories'
};

export default function CategoriesPage() {
  return (
    <PageContainer
      pageTitle='Categories'
      pageDescription='Product category management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PRODUCT_CATEGORIES'>
            <CategoryExportButtons />
          </Can>
          <Can permission='CREATE_PRODUCT_CATEGORIES'>
            <CategoryImportDialogTrigger />
            <CategoryFormSheetTrigger />
          </Can>
        </>
      }
    >
      <CategoryListingPage />
    </PageContainer>
  );
}
