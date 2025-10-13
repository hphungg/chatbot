import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StatCard {
    title: string
    value: string
    helperText: string
    badge?: string | null
}

interface AdminStatCardsProps {
    stats: StatCard[]
}

export function AdminStatCards({ stats }: AdminStatCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-muted-foreground text-base font-medium">
                                {item.title}
                            </CardTitle>
                            <span className="mt-2 block text-3xl font-semibold">
                                {item.value}
                            </span>
                        </div>
                        {item.badge && (
                            <Badge variant="outline">{item.badge}</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            {item.helperText}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
