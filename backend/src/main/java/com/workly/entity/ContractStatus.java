package com.workly.entity;

public enum ContractStatus {
    ACTIVE("Ativo"),
    INACTIVE("Inativo"),
    PENDING("Pendente"),
    COMPLETED("Concluído"),
    CANCELLED("Cancelado");

    private String status;


    ContractStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
