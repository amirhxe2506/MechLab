import { useQuery, keepPreviousData } from "@tanstack/react-query"
import {
  calculateReynolds,
  type ReynoldsInput,
  type ReynoldsResult,
} from "../api/calculators"
import { AxiosError } from "axios"

export function useReynoldsCalculator(data: ReynoldsInput, enabled: boolean) {
  return useQuery<ReynoldsResult, AxiosError>({
    queryKey: ["reynolds", data],
    queryFn: ({ signal }) => calculateReynolds(data, signal),
    enabled: enabled,
    placeholderData: keepPreviousData,
    staleTime: Infinity, // The result of physics calculation never gets stale
  })
}
