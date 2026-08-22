import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CustomFieldListingPage from '@/features/settings/custom-fields/components/custom-field-listing';
import { CustomFieldFormSheetTrigger } from '@/features/settings/custom-fields/components/custom-field-form-sheet';

export const metadata = {
  title: 'Dashboard: Custom Fields'
};

export default function CustomFieldsPage() {
  return (
    <PageContainer
      pageTitle='Custom Fields'
      pageDescription='Define extra fields for other entities, e.g. products'
      pageHeaderAction={
        <Can permission='CREATE_SETTINGS_CUSTOM_FIELDS'>
          <CustomFieldFormSheetTrigger />
        </Can>
      }
    >
      <CustomFieldListingPage />
    </PageContainer>
  );
}
