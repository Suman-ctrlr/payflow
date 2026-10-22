package com.payflow.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "reference_id", nullable = false, unique = true)
    private UUID referenceId;

    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Payment() {
    }

    public Payment(
            UUID id,
            UUID referenceId,
            BigDecimal amount,
            String currency,
            String status) {
        this.id = id;
        this.referenceId = referenceId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public UUID getReferenceId() {
        return referenceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
