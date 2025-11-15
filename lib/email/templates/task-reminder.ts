export function getTaskReminderTemplate(params: {
    recipientName: string
    taskTitle: string
    taskDescription?: string
    dueDate?: string
    priority?: string
    calendarInviteLink?: string
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
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
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
                .task-card {
                    background-color: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .task-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 10px;
                }
                .task-description {
                    color: #4a5568;
                    margin: 15px 0;
                    line-height: 1.8;
                }
                .task-meta {
                    display: flex;
                    gap: 20px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #718096;
                }
                .meta-label {
                    font-weight: 600;
                    color: #4a5568;
                }
                .priority-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .priority-high {
                    background-color: #fed7d7;
                    color: #c53030;
                }
                .priority-medium {
                    background-color: #feebc8;
                    color: #c05621;
                }
                .priority-low {
                    background-color: #c6f6d5;
                    color: #2f855a;
                }
                .calendar-invite {
                    margin: 25px 0;
                    padding: 20px;
                    background-color: #edf2f7;
                    border-radius: 8px;
                    text-align: center;
                }
                .calendar-invite-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 12px;
                }
                .calendar-button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 15px;
                    transition: transform 0.2s;
                }
                .calendar-button:hover {
                    transform: translateY(-2px);
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
                    <h1>🔔 Nhắc nhở công việc</h1>
                </div>
                <div class="content">
                    <div class="greeting">
                        Xin chào ${params.recipientName},
                    </div>
                    <p>Bạn có một công việc cần chú ý:</p>
                    <div class="task-card">
                        <div class="task-title">${params.taskTitle}</div>
                        ${
                            params.taskDescription
                                ? `<div class="task-description">${params.taskDescription.replace(/\n/g, "<br>")}</div>`
                                : ""
                        }
                        <div class="task-meta">
                            ${
                                params.dueDate
                                    ? `
                                <div class="meta-item">
                                    <span class="meta-label">📅 Hạn chót:</span>
                                    <span>${params.dueDate}</span>
                                </div>
                            `
                                    : ""
                            }
                            ${
                                params.priority
                                    ? `
                                <div class="meta-item">
                                    <span class="meta-label">Ưu tiên:</span>
                                    <span class="priority-badge priority-${params.priority.toLowerCase()}">${params.priority}</span>
                                </div>
                            `
                                    : ""
                            }
                        </div>
                    </div>
                    <p style="color: #4a5568; margin-top: 20px;">
                        Vui lòng hoàn thành công việc này đúng hạn. Nếu có bất kỳ thắc mắc nào, 
                        hãy liên hệ với quản lý của bạn.
                    </p>
                    ${
                        params.calendarInviteLink
                            ? `
                    <div class="calendar-invite">
                        <div class="calendar-invite-title">📅 Lịch hẹn đã được tạo</div>
                        <p style="color: #4a5568; margin: 10px 0; font-size: 14px;">
                            Nhấn vào nút bên dưới để thêm sự kiện này vào Google Calendar của bạn
                        </p>
                        <a href="${params.calendarInviteLink}" class="calendar-button" target="_blank">
                            🗓️ Thêm vào Calendar
                        </a>
                    </div>
                    `
                            : ""
                    }
                </div>
                <div class="footer">
                    <p><strong>Email tự động từ hệ thống Chatbot</strong></p>
                    <p>Vui lòng không trả lời email này</p>
                </div>
            </div>
        </body>
        </html>
    `
}
