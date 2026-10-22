package com.payflow.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.payflow.dto.CreatePaymentRequest;
import com.payflow.entity.Payment;
import com.payflow.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final PaymentService paymentService;

    public HealthController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("application", "PayFlow", "status", "UP");
    }

    @GetMapping("/payments")
    public Map<String, Object> payments() {
        var payments = paymentService.getAllPayments();
        return Map.of(
            "application", "PayFlow",
            "count", payments.size(),
            "payments", payments
        );
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public Payment createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }
}
