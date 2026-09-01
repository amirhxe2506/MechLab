import { useMutation } from '@tanstack/react-query'

import {
  calculateStress,
  type StressInput,
} from '../api/calculators'

export function useStressCalculator() {
  return useMutation({
    mutationFn: (data: StressInput) => calculateStress(data),
  })
}