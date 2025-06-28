import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse } from '@/types';

interface UseApiOptions<T> {
    initialData?: T;
    autoFetch?: boolean;
    dependencies?: unknown[];
}

export function useApi<T = unknown>(
    url: string,
    options: UseApiOptions<T> = {}
) {
    const { initialData, autoFetch = false, dependencies = [] } = options;
    
    const [data, setData] = useState<T | null>(initialData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (params?: Record<string, unknown>) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url + (params ? '?' + new URLSearchParams(params as Record<string, string>) : ''), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<T> = await response.json();
            
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || 'Unknown error occurred');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setLoading(false);
        }
    }, [url]);

    const postData = useCallback(async (postData: Record<string, unknown>) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<T> = await response.json();
            
            if (result.success) {
                setData(result.data);
                return result;
            } else {
                setError(result.message || 'Unknown error occurred');
                return result;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, fetchData, ...dependencies]);

    return {
        data,
        loading,
        error,
        fetchData,
        postData,
        setData,
        setError,
    };
}

export function usePaginatedApi<T = unknown>(
    url: string,
    options: UseApiOptions<PaginatedResponse<T>> = {}
) {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    
    const { data, loading, error, fetchData } = useApi<PaginatedResponse<T>>(url, {
        ...options,
        dependencies: [currentPage, perPage, ...(options.dependencies || [])],
    });

    const loadPage = useCallback((page: number) => {
        setCurrentPage(page);
        fetchData({ page: page.toString(), per_page: perPage.toString() });
    }, [fetchData, perPage]);

    const changePerPage = useCallback((newPerPage: number) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
        fetchData({ page: '1', per_page: newPerPage.toString() });
    }, [fetchData]);

    return {
        data: data?.data || [],
        pagination: data ? {
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
            from: data.from,
            to: data.to,
        } : null,
        loading,
        error,
        currentPage,
        perPage,
        loadPage,
        changePerPage,
        refresh: () => fetchData({ page: currentPage.toString(), per_page: perPage.toString() }),
    };
}
