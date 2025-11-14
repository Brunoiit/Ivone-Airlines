'use client'

import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Register from "../pages/Register";
import CreateFlight from "../pages/CreateFlight";
import FlightDetails from "../pages/FlightDetails";
import Payment from "../pages/Payment";
import Invoice from "../pages/Invoice";
import CheckIn from "../pages/CheckIn";
import Ticket from "../pages/Ticket";
import MyBookings from "../pages/MyBookings";
import MyPayments from "../pages/MyPayments";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import Login from "../pages/Login";
import SearchFlights from "../pages/SearchFlights";

export default function Page() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchFlights />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flight/:id" element={<FlightDetails />} />
          <Route path="/create-flight" element={<CreateFlight />} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute element={<Payment />} requiredRole="customer" />} />
          <Route path="/invoice/:paymentId" element={<ProtectedRoute element={<Invoice />} requiredRole="customer" />} />
          <Route path="/checkin/:bookingId" element={<ProtectedRoute element={<CheckIn />} requiredRole="customer" />} />
          <Route path="/ticket/:bookingId" element={<ProtectedRoute element={<Ticket />} requiredRole="customer" />} />
          <Route path="/my-bookings" element={<ProtectedRoute element={<MyBookings />} requiredRole="customer" />} />
          <Route path="/my-payments" element={<ProtectedRoute element={<MyPayments />} requiredRole="customer" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
