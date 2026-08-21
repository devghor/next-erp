import PageContainer from '@/components/layout/page-container';
import RoleListingPage from '@/features/settings/roles/components/role-listing';
import { RoleFormSheetTrigger } from '@/features/settings/roles/components/role-form-sheet';
import { RoleImportDialogTrigger } from '@/features/settings/roles/components/role-import-dialog';
import { RoleExportButtons } from '@/features/settings/roles/components/role-export-buttons';

export const metadata = {
  title: 'Dashboard: Roles'
};

export default function RolesPage() {
  return (
    <PageContainer
      pageTitle='Roles'
      pageDescription='Role & permission management'
      pageHeaderAction={
        <>
          <RoleExportButtons />
          <RoleImportDialogTrigger />
          <RoleFormSheetTrigger />
        </>
      }
    >
      <RoleListingPage />
    </PageContainer>
  );
}
