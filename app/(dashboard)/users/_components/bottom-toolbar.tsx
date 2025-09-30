import { useRef } from "react"
import { type Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

type BottomToolbarProps<TData> = {
    table: Table<TData>
    entityName: string
    children: React.ReactNode
}

export function BottomToolbar<TData>({
    table,
    entityName,
    children,
}: BottomToolbarProps<TData>): React.ReactNode | null {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length
    const toolbarRef = useRef<HTMLDivElement>(null)

    const handleClearSelection = () => {
        table.resetRowSelection()
    }

    if (selectedCount === 0) {
        return null
    }

    return (
        <>
            <div
                ref={toolbarRef}
                role="toolbar"
                aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${selectedCount > 1 ? "s" : ""}`}
                aria-describedby="bulk-actions-description"
                tabIndex={-1}
                className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 cursor-pointer rounded-xl"
            >
                <div
                    className={cn(
                        "p-2 shadow-xl",
                        "rounded-xl border",
                        "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg",
                        "flex items-center gap-x-2",
                    )}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleClearSelection}
                                className="size-6 rounded-md"
                                aria-label="Xóa lựa chọn"
                                title="Xóa lựa chọn"
                            >
                                <X />
                                <span className="sr-only">Bỏ chọn</span>
                            </Button>
                        </TooltipTrigger>
                    </Tooltip>

                    <Separator
                        className="h-5"
                        orientation="vertical"
                        aria-hidden="true"
                    />

                    <div
                        className="flex items-center gap-x-1 text-sm font-bold"
                        id="bulk-actions-description"
                    >
                        {selectedCount}
                        <span className="hidden sm:inline">
                            {entityName}
                        </span>{" "}
                        được chọn
                    </div>

                    <Separator
                        className="h-5"
                        orientation="vertical"
                        aria-hidden="true"
                    />
                    {children}
                </div>
            </div>
        </>
    )
}
