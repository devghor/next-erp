import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import SaleAgentListingPage from '@/features/people/sale-agents/components/sale-agent-listing';
import { SaleAgentFormSheetTrigger } from '@/features/people/sale-agents/components/sale-agent-form-sheet';
import { SaleAgentImportDialogTrigger } from '@/features/people/sale-agents/components/sale-agent-import-dialog';
import { SaleAgentExportButtons } from '@/features/people/sale-agents/components/sale-agent-export-buttons';

export const metadata = {
  title: 'Dashboard: Sale Agents'
};

export default function SaleAgentsPage() {
  return (
    <PageContainer
      pageTitle='Sale Agents'
      pageDescription='Sale agent management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PEOPLE_SALE_AGENTS'>
            <SaleAgentExportButtons />
          </Can>
          <Can permission='CREATE_PEOPLE_SALE_AGENTS'>
            <SaleAgentImportDialogTrigger />
            <SaleAgentFormSheetTrigger />
          </Can>
        </>
      }
    >
      <SaleAgentListingPage />
    </PageContainer>
  );
}
