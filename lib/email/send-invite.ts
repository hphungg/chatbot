import { sendMail } from "@/lib/mail"

interface SendInviteEmailInput {
    email: string
    inviteLink: string
}

function buildHtml(inviteLink: string): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tài khoản của bạn đã có thể truy cập vào hệ thống Chatbot của MavenXCore</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                                Tài khoản của bạn đã có thể truy cập vào hệ thống Chatbot của MavenXCore
                            </h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Xin chào,
                            </p>
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Chúng tôi vui mừng thông báo rằng tài khoản của bạn đã được cấp quyền để sử dụng hệ thống chatbot được phát triển bởi <strong>MavenXCore</strong>.
                            </p>
                            <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Bạn có thể bắt đầu sử dụng hệ thống bằng cách truy cập vào đường dẫn bên dưới:
                            </p>
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="https://digiz.tech/" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Truy cập hệ thống
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Hoặc copy đường dẫn sau vào trình duyệt:
                            </p>
                            <p style="margin: 0 0 30px 0;">
                                <a href="https://digiz.tech/" style="color: #667eea; text-decoration: none; word-break: break-all;">https://digiz.tech/</a>
                            </p>
                            <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Trân trọng,
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 600; line-height: 1.6;">
                                MavenXCore Team
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                                Email này được gửi tự động, vui lòng không trả lời email này.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} MavenXCore. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

function buildText(inviteLink: string): string {
    return `Tài khoản của bạn đã có thể truy cập vào hệ thống Chatbot của MavenXCore

Xin chào,

Chúng tôi vui mừng thông báo rằng tài khoản của bạn đã được cấp quyền để sử dụng hệ thống chatbot được phát triển bởi MavenXCore.

Truy cập hệ thống tại: https://digiz.tech/

Trân trọng,
MavenXCore Team`
}

export async function sendInviteEmail({
    email,
    inviteLink,
}: SendInviteEmailInput): Promise<void> {
    await sendMail({
        to: email,
        name: "Người dùng",
        subject:
            "Tài khoản của bạn đã có thể truy cập vào hệ thống Chatbot của MavenXCore",
        body: buildHtml(inviteLink),
    })
}
