import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

const statement = {
    ...defaultStatements,
    user: ["manage", "view", "set-role"],
} as const

export const ac = createAccessControl(statement)

export const boss = ac.newRole({
    ...adminAc.statements,
    user: ["manage"],
})

export const manager = ac.newRole({
    user: ["set-role"],
})

export const employee = ac.newRole({
    user: ["view"],
})
