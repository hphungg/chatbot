"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProjectsContext } from "./context"

export function ProjectMembersDialog() {
    const { isMembersDialogOpen, closeMembers, selectedProject } =
        useProjectsContext()

    return (
        <Dialog
            open={isMembersDialogOpen && Boolean(selectedProject)}
            onOpenChange={(open) => {
                if (!open) closeMembers()
            }}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {selectedProject
                            ? `${selectedProject.name} (${selectedProject.members.length})`
                            : "Thành viên dự án"}
                    </DialogTitle>
                </DialogHeader>
                {selectedProject ? (
                    <div className="space-y-4">
                        {selectedProject.members.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                                Chưa có thành viên nào trong dự án này.
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {selectedProject.members.map((member) => {
                                    const fallback =
                                        member.displayName?.charAt(0) ??
                                        member.name.charAt(0) ??
                                        "?"
                                    return (
                                        <li
                                            key={member.id}
                                            className="flex items-center gap-3"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src={
                                                        member.image ??
                                                        undefined
                                                    }
                                                    alt={member.name}
                                                />
                                                <AvatarFallback>
                                                    {fallback.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="leading-tight">
                                                <p className="text-sm font-medium">
                                                    {member.displayName ??
                                                        member.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground text-sm">
                        Chọn một dự án để xem danh sách thành viên.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
