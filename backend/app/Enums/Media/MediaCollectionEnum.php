<?php

namespace App\Enums\Media;

enum MediaCollectionEnum: string
{
    /**
     * Settings
     */
    case SettingsUsersProfilePicture = 'settings_users_profile_picture';

    /**
     * Product
     */
    case ProductCategoriesImage = 'product_categories_image';
    case ProductBrandsImage = 'product_brands_image';
    case ProductProductsImage = 'product_products_image';

    /**
     * Quotation
     */
    case QuotationQuotationsDocument = 'quotation_quotations_document';
}
