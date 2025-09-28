import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function sanitizeText(text: string) {
    return text.replace('<has_function_call>', '');
}

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function getPageNumbers(currentPage: number, totalPages: number) {
    const maxVisiblePages = 5
    const rangeWithDots = []

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            rangeWithDots.push(i)
        }
    } else {
        rangeWithDots.push(1)

        if (currentPage <= 3) {
            for (let i = 2; i <= 4; i++) {
                rangeWithDots.push(i)
            }
            rangeWithDots.push('...', totalPages)
        } else if (currentPage >= totalPages - 2) {
            rangeWithDots.push('...')
            for (let i = totalPages - 3; i <= totalPages; i++) {
                rangeWithDots.push(i)
            }
        } else {
            rangeWithDots.push('...')
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                rangeWithDots.push(i)
            }
            rangeWithDots.push('...', totalPages)
        }
    }

    return rangeWithDots
}