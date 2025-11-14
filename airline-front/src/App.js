import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";

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
          <Route path="/create-flight" element={<CreateFlight />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/invoice/:paymentId" element={<Invoice />} />
          <Route path="/checkin/:bookingId" element={<CheckIn />} />
          <Route path="/ticket/:bookingId" element={<Ticket />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-payments" element={<MyPayments />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
