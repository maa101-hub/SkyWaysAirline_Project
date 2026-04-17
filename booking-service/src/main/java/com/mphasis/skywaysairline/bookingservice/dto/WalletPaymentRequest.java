package com.mphasis.skywaysairline.bookingservice.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class WalletPaymentRequest {
    @NotNull
    @Valid
    private BookingRequest bookingRequest;

    public BookingRequest getBookingRequest() {
        return bookingRequest;
    }

    public void setBookingRequest(BookingRequest bookingRequest) {
        this.bookingRequest = bookingRequest;
    }
}

