import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import CreateFlight from "./pages/CreateFlight";
import FlightDetails from "./pages/FlightDetails";
import Payment from "./pages/Payment";
import Invoice from "./pages/Invoice";
import CheckIn from "./pages/CheckIn";
import Ticket from "./pages/Ticket";
import MyBookings from "./pages/MyBookings";
import MyPayments from "./pages/MyPayments";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingDetails from "./pages/BookingDetails";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import SearchFlights from "./pages/SearchFlights";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchFlights />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flight/:id" element={<FlightDetails />} />
          <Route 
            path="/create-flight" 
            element={
              <ProtectedRoute requiredRole="airline">
                <CreateFlight />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment/:bookingId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Payment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/:paymentId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Invoice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkin/:bookingId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <CheckIn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ticket/:bookingId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Ticket />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute requiredRole="customer">
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-payments" 
            element={
              <ProtectedRoute requiredRole="customer">
                <MyPayments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/:id" 
            element={
              <ProtectedRoute requiredRole="customer">
                <BookingDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;