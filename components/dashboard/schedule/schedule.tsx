"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export function Schedule() {
    const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 12))

    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
            buttonVariant="ghost"
        />
    )
}
