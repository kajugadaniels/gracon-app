import { apiClient } from '@/api/client';

export interface CitizenLookupPayload {
    documentNumber: string;
}

export interface CitizenData {
    documentType: string;
    nid: string;
    surName: string;
    postNames: string;
    sex: string;
    dateOfBirth: string;
    countryOfBirth: string;
}

export interface CitizenLookupResponse {
    success: boolean;
    data: CitizenData;
}

// Looks up citizen data from the national ID API via our gateway
// Called when user enters their NID on the registration form
export const citizenLookupApi = (payload: CitizenLookupPayload) =>
    apiClient.post<CitizenLookupResponse>('/citizen/lookup', payload);