import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import UserListingPage from '@/features/settings/users/components/user-listing';
import { UserFormSheetTrigger } from '@/features/settings/users/components/user-form-sheet';
import { UserImportDialogTrigger } from '@/features/settings/users/components/user-import-dialog';
import { UserExportButtons } from '@/features/settings/users/components/user-export-buttons';

export const metadata = {
  title: 'Dashboard: Users'
};

export default function UsersPage() {
  return (
    <PageContainer
      pageTitle='Users'
      pageDescription='User management'
      pageHeaderAction={
        <>
          <Can permission='LIST_SETTINGS_USERS'>
            <UserExportButtons />
          </Can>
          <Can permission='CREATE_SETTINGS_USERS'>
            <UserImportDialogTrigger />
            <UserFormSheetTrigger />
          </Can>
        </>
      }
    >
      <UserListingPage />
    </PageContainer>
  );
}
