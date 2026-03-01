import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

export function useFilters() {
    const [searchParams, setSearchParams] = useSearchParams()

    const category = searchParams.get('category') || ''
    const branch = searchParams.get('branch') || ''
    const search = searchParams.get('search') || ''
    const date = searchParams.get('date') || ''

    const setFilters = useCallback((updates) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            Object.entries(updates).forEach(([key, value]) => {
                if (value) next.set(key, value)
                else next.delete(key)
            })
            return next
        }, { replace: true })
    }, [setSearchParams])

    const setFilter = useCallback((key, value) => {
        setFilters({ [key]: value })
    }, [setFilters])

    const clearFilters = useCallback(() => {
        setSearchParams({}, { replace: true })
    }, [setSearchParams])

    const hasFilters = !!(category || branch || search || date)

    return { category, branch, search, date, setFilter, setFilters, clearFilters, hasFilters }
}
