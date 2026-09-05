<?php

namespace App\Mail;

use App\Models\Quotation\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuotationDetails extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Quotation $quotation) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Quotation Details - '.$this->quotation->reference_no,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.quotation-details',
            with: [
                'quotation' => $this->quotation,
            ],
        );
    }
}
