package com.medicalcenter.appointmentservice.controller;

import com.medicalcenter.appointmentservice.model.Appointment;
import com.medicalcenter.appointmentservice.repository.AppointmentRepository;
import com.medicalcenter.appointmentservice.service.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ValidationService validationService;

    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody Appointment appointment) {
        if (!validationService.patientExists(appointment.getPatientId())) {
            return ResponseEntity.badRequest().body("Invalid patientId");
        }
        if (!validationService.doctorExists(appointment.getDoctorId())) {
            return ResponseEntity.badRequest().body("Invalid doctorId");
        }
        boolean conflict = appointmentRepository.findAll().stream()
                .anyMatch(a -> a.getDoctorId().equals(appointment.getDoctorId())
                        && a.getDateTime().equals(appointment.getDateTime())
                        && "BOOKED".equals(a.getStatus()));
        if (conflict) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This doctor already has a booked appointment at that time");
        }
        appointment.setStatus("BOOKED");
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable String id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancel(@PathVariable String id) {
        return appointmentRepository.findById(id).map(appt -> {
            appt.setStatus("CANCELLED");
            return ResponseEntity.ok(appointmentRepository.save(appt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getByPatient(@RequestParam(required = false) String patientId) {
        if (patientId != null) {
            return ResponseEntity.ok(appointmentRepository.findAll().stream()
                    .filter(a -> a.getPatientId().equals(patientId)).toList());
        }
        return ResponseEntity.ok(appointmentRepository.findAll());
    }
}
