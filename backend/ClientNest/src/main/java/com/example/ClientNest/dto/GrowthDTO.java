package com.example.ClientNest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class GrowthDTO {
    private int customers;
    private int leads;
    private int sales;
}