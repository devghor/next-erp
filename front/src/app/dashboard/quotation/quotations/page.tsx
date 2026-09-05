import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import QuotationListingPage from '@/features/quotation/quotations/components/quotation-listing';
import { QuotationFormDialogTrigger } from '@/features/quotation/quotations/components/quotation-form-dialog';
import { QuotationExportButtons } from '@/features/quotation/quotations/components/quotation-export-buttons';

export const metadata = {
  title: 'Dashboard: Quotations'
};

export default function QuotationsPage() {
  return (
    <PageContainer
      pageTitle='Quotations'
      pageDescription='Prepare and track price quotes for customers'
      pageHeaderAction={
        <>
          <Can permission='LIST_QUOTATION_QUOTATIONS'>
            <QuotationExportButtons />
          </Can>
          <Can permission='CREATE_QUOTATION_QUOTATIONS'>
            <QuotationFormDialogTrigger />
          </Can>
        </>
      }
    >
      <QuotationListingPage />
    </PageContainer>
  );
}
