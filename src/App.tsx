import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ReceiptPage from '@/pages/Receipt'
import Login from '@/pages/admin/Login'
import DashboardLayout from '@/pages/admin/DashboardLayout'
import Overview from '@/pages/admin/Overview'
import Orders from '@/pages/admin/Orders'
import Reservations from '@/pages/admin/Reservations'
import Events from '@/pages/admin/Events'
import MenuManager from '@/pages/admin/MenuManager'
import GalleryManager from '@/pages/admin/GalleryManager'
import Customers from '@/pages/admin/Customers'
import FeedbackAdmin from '@/pages/admin/Feedback'
import Users from '@/pages/admin/Users'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { BookingProvider } from '@/context/BookingContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <CartProvider>
                <BookingProvider>
                  <HomePage />
                </BookingProvider>
              </CartProvider>
            }
          />
          {/* Reçu public (pointé par les QR codes) */}
          <Route path="/receipt/:reference" element={<ReceiptPage />} />
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="events" element={<Events />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="customers" element={<Customers />} />
            <Route path="feedback" element={<FeedbackAdmin />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
