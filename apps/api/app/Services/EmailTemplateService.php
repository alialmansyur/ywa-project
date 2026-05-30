<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class EmailTemplateService
{
    /**
     * Send email using a specific template code.
     *
     * @param string $templateCode The code of the template (e.g. 'auth.otp')
     * @param string $toEmail Recipient email address
     * @param array $variables Key-value pairs to replace in the template body e.g. ['otp' => '123456']
     * @return bool
     */
    public function sendByCode(string $templateCode, string $toEmail, array $variables = []): bool
    {
        $template = EmailTemplate::where('code', $templateCode)->where('is_active', true)->first();

        if (!$template) {
            Log::warning("Email template not found or inactive: {$templateCode}");
            return false;
        }

        $subject = $this->replaceVariables($template->subject, $variables);
        $bodyHtml = $this->replaceVariables($template->body_html, $variables);

        try {
            Mail::html($bodyHtml, function ($message) use ($toEmail, $subject) {
                $message->to($toEmail)->subject($subject);
            });
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send email template {$templateCode} to {$toEmail}: " . $e->getMessage());
            return false;
        }
    }

    private function replaceVariables(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }
        return $content;
    }
}
