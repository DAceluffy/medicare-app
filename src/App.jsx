import { HashRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { Layout } from './components/ui'
import { HomePage, MedicinesPage, MedicineDetailPage } from './pages/Shop'
import { ScanPage } from './pages/Scan'
import { CartPage, CheckoutPage, OrdersPage, OrderDetailPage } from './pages/Orders'
import { RemindersPage } from './pages/Reminders'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/medicine/:id" element={<MedicineDetailPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
