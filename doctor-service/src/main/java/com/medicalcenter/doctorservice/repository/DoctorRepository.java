package com.medicalcenter.doctorservice.repository;

import com.medicalcenter.doctorservice.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
}
