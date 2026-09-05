import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { calculateStress, type StressInput, type StressResult } from '../api/calculators'
import { AxiosError } from 'axios'

export function useStressCalculator(data: StressInput, enabled: boolean) {
  return useQuery<StressResult, AxiosError>({
    queryKey: ['stress-strain', data],
    queryFn: ({ signal }) => calculateStress(data, signal),
    enabled: enabled,
    placeholderData: keepPreviousData,
    staleTime: Infinity, // The result of physics calculation never gets stale
  })
}