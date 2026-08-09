package com.medicalcenter.appointmentservice.repository;

import com.medicalcenter.appointmentservice.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
}
