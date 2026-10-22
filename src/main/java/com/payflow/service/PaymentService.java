package com.payflow.service;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payflow.dto.CreatePaymentRequest;
import com.payflow.entity.Payment;
import com.payflow.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EntityManager entityManager;

    public PaymentService(
            PaymentRepository paymentRepository,
            EntityManager entityManager) {
        this.paymentRepository = paymentRepository;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Transactional
    public Payment createPayment(CreatePaymentRequest request) {
        Payment payment = new Payment(
            UUID.randomUUID(),
            UUID.randomUUID(),
            request.amount(),
            request.currency(),
            "PENDING"
        );

        Payment savedPayment = paymentRepository.saveAndFlush(payment);

        // Reload the database-generated created_at timestamp.
        entityManager.refresh(savedPayment);

        return savedPayment;
    }
}
