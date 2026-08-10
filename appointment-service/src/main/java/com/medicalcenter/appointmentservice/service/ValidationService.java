package com.medicalcenter.appointmentservice.service;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
@Service
public class ValidationService {
    private final WebClient webClient = WebClient.create();
    private static final String API_KEY = "demo-key-123";
    public boolean patientExists(String patientId) {
        try {
            webClient.get()
                    .uri("http://patient-service:8081/patients/" + patientId)
                    .header("X-API-KEY", API_KEY)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (WebClientResponseException.NotFound e) {
            return false;
        }
    }
    public boolean doctorExists(String doctorId) {
        try {
            webClient.get()
                    .uri("http://doctor-service:8082/doctors/" + doctorId)
                    .header("X-API-KEY", API_KEY)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (WebClientResponseException.NotFound e) {
            return false;
        }
    }
}