export function getAnnouncementTemplate(params: {
    recipientName: string
    subject: string
    message: string
    departmentName?: string
    isCompanyWide?: boolean
}): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .badge {
                    display: inline-block;
                    background-color: rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-top: 10px;
                }
                .content {
                    padding: 30px 20px;
                }
                .greeting {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 20px;
                    color: #333;
                }
                .message-box {
                    background-color: #f8f9fa;
                    border-left: 4px solid #f5576c;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .message-content {
                    color: #2d3748;
                    line-height: 1.8;
                    font-size: 15px;
                }
                .footer {
                    background-color: #f7fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 13px;
                    color: #718096;
                    border-top: 1px solid #e2e8f0;
                }
                .footer p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📢 Thông báo</h1>
                    ${
                        params.isCompanyWide
                            ? '<div class="badge">📊 Toàn công ty</div>'
                            : params.departmentName
                              ? `<div class="badge">🏢 ${params.departmentName}</div>`
                              : ""
                    }
                </div>
                <div class="content">
                    <div class="greeting">
                        Xin chào ${params.recipientName},
                    </div>
                    <div class="message-box">
                        <div class="message-content">
                            ${params.message.replace(/\n/g, "<br>")}
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>Email tự động từ hệ thống Chatbot</strong></p>
                    ${
                        params.isCompanyWide
                            ? "<p>Thông báo này được gửi đến toàn bộ nhân viên công ty</p>"
                            : params.departmentName
                              ? `<p>Thông báo này được gửi đến tất cả thành viên phòng ban ${params.departmentName}</p>`
                              : ""
                    }
                </div>
            </div>
        </body>
        </html>
    `
}
