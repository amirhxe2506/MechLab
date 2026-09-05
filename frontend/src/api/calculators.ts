import apiClient from "./client";

export interface StressInput {
    force: number;
    force_unit?: string;

    area: number;
    area_unit?: string;

    youngs_modulus: number;
    youngs_modulus_unit?: string;

    original_length: number;
    original_length_unit?: string;

    output_unit_system?: "SI" | "Imperial";
}

export interface StressResult {
    stress: number;
    strain: number;
    deformation: number;
    lateral_strain: number | null;
    units: {
        stress: string;
        strain: string;
        deformation: string;
        lateral_strain: string;
    };
    values_si: {
        stress: number;
        deformation: number;
    };
    warnings: string[];
}

export async function calculateStress(
    data: StressInput,
    signal?: AbortSignal
): Promise<StressResult> {
    const response = await apiClient.post<StressResult>(
        "/calculators/stress-strain/",
        data,
        { signal }
    );
    return response.data;
}