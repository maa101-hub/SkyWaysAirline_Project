package com.mphasis.skywaysairline.bookingservice.dto;

public class PaymentConfirmRequest {

    private String orderId;     // ORDER_123
    private String paymentId;   // PAY_123 (transaction id)
    private String signature;   // future (Razorpay verification)

    private BookingRequest bookingRequest;

    // 🔹 getters setters
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public BookingRequest getBookingRequest() {
        return bookingRequest;
    }

    public void setBookingRequest(BookingRequest bookingRequest) {
        this.bookingRequest = bookingRequest;
    }
}
