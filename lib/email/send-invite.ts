const RESEND_API_URL = "https://api.resend.com/emails"

type SendInviteEmailInput = {
    email: string
    inviteLink: string
    inviterName?: string
    role: string
}

function getFromAddress(): string {
    const value = process.env.INVITE_EMAIL_FROM || process.env.RESEND_FROM_EMAIL
    if (!value) {
        throw new Error("Missing invite sender address")
    }
    return value
}

function getSubject(inviterName?: string): string {
    if (inviterName && inviterName.trim().length > 0) {
        return `${inviterName} mời bạn tham gia nền tảng`
    }
    return "Bạn được mời tham gia nền tảng"
}

function buildHtml(
    inviteLink: string,
    role: string,
    inviterName?: string,
): string {
    const displayName =
        inviterName && inviterName.trim().length > 0
            ? inviterName.trim()
            : "Quản trị viên"
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8" /></head><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111"><h1 style="font-size:20px;margin-bottom:16px">Lời mời tham gia hệ thống</h1><p>Xin chào,</p><p>${displayName} đã mời bạn tham gia hệ thống với vai trò <strong>${role}</strong>.</p><p>Nhấn vào liên kết sau để truy cập: <a href="${inviteLink}" style="color:#2563eb">${inviteLink}</a></p><p>Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p><p>Trân trọng,</p><p>${displayName}</p></body></html>`
}

function buildText(
    inviteLink: string,
    role: string,
    inviterName?: string,
): string {
    const displayName =
        inviterName && inviterName.trim().length > 0
            ? inviterName.trim()
            : "Quản trị viên"
    return `${displayName} đã mời bạn tham gia hệ thống với vai trò ${role}. Truy cập ${inviteLink}`
}

export async function sendInviteEmail({
    email,
    inviteLink,
    inviterName,
    role,
}: SendInviteEmailInput): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        throw new Error("Missing RESEND_API_KEY")
    }
    const from = getFromAddress()
    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [email],
            subject: getSubject(inviterName),
            html: buildHtml(inviteLink, role, inviterName),
            text: buildText(inviteLink, role, inviterName),
        }),
    })
    if (!response.ok) {
        let message = "Failed to send invite email"
        try {
            const data = await response.json()
            if (data && typeof data.error === "string") {
                message = data.error
            }
        } catch {}
        throw new Error(message)
    }
}
