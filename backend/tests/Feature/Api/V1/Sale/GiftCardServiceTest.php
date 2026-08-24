<?php

namespace Tests\Feature\Api\V1\Sale;

use App\Models\Settings\Company;
use App\Services\Sale\GiftCardServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No HTTP/auth test harness (Sanctum + tenancy + Spatie permission bootstrapping)
 * exists anywhere in this repo yet, so this exercises the service layer directly
 * against the tenancy-initialized `tenant()` context, same as the controller does.
 */
class GiftCardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_and_lists_gift_cards_scoped_to_the_active_company(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(GiftCardServiceInterface::class);

        $giftCard = $service->create([
            'card_no' => 'GC-0001',
            'amount' => 100,
        ]);

        $this->assertSame('GC-0001', $giftCard->card_no);
        $this->assertSame($company->id, $giftCard->company_id);
        $this->assertEquals(0, $giftCard->expense);

        $list = $service->list([]);
        $this->assertCount(1, $list->items());
        $this->assertSame('GC-0001', $list->items()[0]->card_no);
    }

    public function test_recharge_increments_amount_and_logs_a_recharge_row(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        tenancy()->initialize($company);

        $service = app(GiftCardServiceInterface::class);
        $giftCard = $service->create(['card_no' => 'GC-0002', 'amount' => 50]);

        $recharged = $service->recharge($giftCard->id, 25, null);

        $this->assertEquals(75, $recharged->amount);
        $this->assertDatabaseHas('gift_card_recharges', [
            'gift_card_id' => $giftCard->id,
            'amount' => 25,
        ]);
    }
}
