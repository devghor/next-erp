<?php

namespace App\Console\Commands;

use App\Models\Notification\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class SendTestNotification extends Command
{
    protected $signature = 'notification:test
        {user : User ID or email to notify}
        {--company= : Company UUID to scope the notification to. Defaults to the user\'s first company}
        {--title=Test notification : Notification title}
        {--body=This is a test notification. : Notification body}
        {--status=unread : Notification status (unread|read|archived)}';

    protected $description = 'Create a test notification for a user, for manual QA of the notification bell/page';

    public function handle(): int
    {
        $identifier = $this->argument('user');

        $user = is_numeric($identifier)
            ? User::find($identifier)
            : User::where('email', $identifier)->first();

        if (! $user) {
            $this->error("User [{$identifier}] not found.");

            return self::FAILURE;
        }

        $companyId = $this->option('company') ?: $user->companies()->value('companies.id');

        if (! $companyId) {
            $this->error('User has no company and none was provided via --company.');

            return self::FAILURE;
        }

        $notification = Notification::create([
            'company_id' => $companyId,
            'user_id' => $user->id,
            'title' => $this->option('title'),
            'body' => $this->option('body'),
            'status' => $this->option('status'),
            'actions' => [
                [
                    'id' => 'view',
                    'label' => 'View',
                    'type' => 'redirect',
                    'style' => 'primary',
                    'executed' => false,
                    'url' => '/dashboard/overview',
                ],
            ],
        ]);

        $this->info("Notification #{$notification->id} created for {$user->email} (company {$companyId}).");

        return self::SUCCESS;
    }
}
