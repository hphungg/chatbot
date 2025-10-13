"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ProjectWithMembers } from "@/lib/types"

interface ProjectsContextValue {
    projects: ProjectWithMembers[]
    selectedProjectId: string | null
    selectedProject: ProjectWithMembers | null
    isMembersDialogOpen: boolean
    openMembers: (projectId: string) => void
    closeMembers: () => void
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

interface ProjectsProviderProps {
    children: React.ReactNode
    projects: ProjectWithMembers[]
}

export function ProjectsProvider({ children, projects }: ProjectsProviderProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false)

    const openMembers = useCallback((projectId: string) => {
        setSelectedProjectId(projectId)
        setIsMembersDialogOpen(true)
    }, [])

    const closeMembers = useCallback(() => {
        setIsMembersDialogOpen(false)
        setSelectedProjectId(null)
    }, [])

    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null
        return projects.find((project) => project.id === selectedProjectId) ?? null
    }, [projects, selectedProjectId])

    const value = useMemo<ProjectsContextValue>(
        () => ({
            projects,
            selectedProjectId,
            selectedProject,
            isMembersDialogOpen,
            openMembers,
            closeMembers,
        }),
        [closeMembers, isMembersDialogOpen, openMembers, projects, selectedProject, selectedProjectId],
    )

    return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext() {
    const context = useContext(ProjectsContext)
    if (!context) throw new Error("useProjectsContext must be used within ProjectsProvider")
    return context
}
