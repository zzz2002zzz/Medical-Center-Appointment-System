package com.medicalcenter.patientservice.repository;

import com.medicalcenter.patientservice.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PatientRepository extends MongoRepository<Patient, String> {
}