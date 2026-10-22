package com.payflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.payflow.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
}
