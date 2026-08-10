package com.medicalcenter.apigateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@RestController
public class GatewayProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.patient.url:http://localhost:8081}")
    private String patientServiceUrl;

    @Value("${services.doctor.url:http://localhost:8082}")
    private String doctorServiceUrl;

    @Value("${services.appointment.url:http://localhost:8083}")
    private String appointmentServiceUrl;

    @RequestMapping("/patients/**")
    public ResponseEntity<byte[]> proxyPatients(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return proxy(request, body, patientServiceUrl);
    }

    @RequestMapping("/doctors/**")
    public ResponseEntity<byte[]> proxyDoctors(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return proxy(request, body, doctorServiceUrl);
    }

    @RequestMapping("/appointments/**")
    public ResponseEntity<byte[]> proxyAppointments(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return proxy(request, body, appointmentServiceUrl);
    }

    private ResponseEntity<byte[]> proxy(HttpServletRequest request, byte[] body, String targetBase) {
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String targetUrl = targetBase + path + (query != null ? "?" + query : "");

        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames()).forEach(name ->
                Collections.list(request.getHeaders(name)).forEach(value -> headers.add(name, value)));
        headers.remove(HttpHeaders.HOST);
        headers.remove(HttpHeaders.CONTENT_LENGTH);

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.exchange(targetUrl, method, entity, byte[].class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsByteArray());
        }
    }
}