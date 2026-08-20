import PageContainer from "@/components/layout/page-container";
import UserListingPage from "@/features/settings/users/components/user-listing";
import { UserFormSheetTrigger } from "@/features/settings/users/components/user-form-sheet";
import { UserImportDialogTrigger } from "@/features/settings/users/components/user-import-dialog";
import { UserExportButtons } from "@/features/settings/users/components/user-export-buttons";

export const metadata = {
  title: "Dashboard: Users",
};

export default function UsersPage() {
  return (
    <PageContainer
      pageTitle="Users"
      pageDescription="User management"
      pageHeaderAction={
        <>
          <UserExportButtons />
          <UserImportDialogTrigger />
          <UserFormSheetTrigger />
        </>
      }
    >
      <UserListingPage />
    </PageContainer>
  );
}
