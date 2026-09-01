import apiClient from "./client";


export interface StressInput{
    force:number;
    force_unit?:string;

    area:number;

    youngs_modulus:number;
    youngs_modulus_unit?:string;

    original_length:number;
}


export async function calculateStress(
    data:StressInput
){

    const response =
        await apiClient.post(
            "/calculators/stress-strain/",
            data
        );

    return response.data;
}