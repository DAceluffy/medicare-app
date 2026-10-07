import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMedicine } from '../data/medicines'

const StoreContext = createContext(null)

function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// Simulated order tracking: status advances with time since order was placed.
export const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', afterMin: 0 },
  { key: 'confirmed', label: 'Confirmed by Pharmacist', afterMin: 1 },
  { key: 'packed', label: 'Packed', afterMin: 3 },
  { key: 'shipped', label: 'Out for Delivery', afterMin: 5 },
  { key: 'delivered', label: 'Delivered', afterMin: 8 },
]

export function getOrderStepIndex(order) {
  if (order.cancelled) return -1
  const mins = (Date.now() - order.createdAt) / 60000
  let idx = 0
  ORDER_STEPS.forEach((s, i) => {
    if (mins >= s.afterMin) idx = i
  })
  return idx
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export function StoreProvider({ children }) {
  const [cart, setCart] = usePersistentState('mc_cart', []) // [{id, qty}]
  const [orders, setOrders] = usePersistentState('mc_orders', [])
  const [prescriptions, setPrescriptions] = usePersistentState('mc_prescriptions', [])
  const [reminders, setReminders] = usePersistentState('mc_reminders', [])
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(window.__mcToast)
    window.__mcToast = setTimeout(() => setToast(null), 2200)
  }

  // ---------- Cart ----------
  const addToCart = (id, qty = 1) => {
    setCart((c) => {
      const found = c.find((i) => i.id === id)
      if (found) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
      return [...c, { id, qty }]
    })
    showToast('Added to cart')
  }
  const updateQty = (id, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))))
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id))
  const clearCart = () => setCart([])

  const cartDetails = useMemo(() => {
    const items = cart
      .map((i) => ({ ...i, medicine: getMedicine(i.id) }))
      .filter((i) => i.medicine)
    const subtotal = items.reduce((s, i) => s + i.medicine.price * i.qty, 0)
    const mrpTotal = items.reduce((s, i) => s + i.medicine.mrp * i.qty, 0)
    const delivery = subtotal === 0 || subtotal >= 299 ? 0 : 40
    const needsRx = items.some((i) => i.medicine.rx)
    const count = items.reduce((s, i) => s + i.qty, 0)
    return { items, subtotal, mrpTotal, savings: mrpTotal - subtotal, delivery, total: subtotal + delivery, needsRx, count }
  }, [cart])

  // ---------- Prescriptions ----------
  const addPrescription = (p) => {
    const rx = { id: 'RX' + Date.now(), createdAt: Date.now(), ...p }
    setPrescriptions((list) => [rx, ...list])
    return rx
  }
  const deletePrescription = (id) => setPrescriptions((list) => list.filter((p) => p.id !== id))

  // ---------- Orders ----------
  const placeOrder = ({ address, payment, prescriptionId }) => {
    const order = {
      id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
      createdAt: Date.now(),
      items: cartDetails.items.map((i) => ({ id: i.id, name: i.medicine.name, price: i.medicine.price, qty: i.qty })),
      subtotal: cartDetails.subtotal,
      delivery: cartDetails.delivery,
      total: cartDetails.total,
      address,
      payment,
      prescriptionId: prescriptionId || null,
      cancelled: false,
    }
    setOrders((o) => [order, ...o])
    clearCart()
    return order
  }
  const cancelOrder = (id) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, cancelled: true } : x)))

  // ---------- Reminders ----------
  const addReminder = (r) => setReminders((list) => [...list, { id: 'R' + Date.now(), active: true, taken: {}, ...r }])
  const toggleReminder = (id) => setReminders((list) => list.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  const deleteReminder = (id) => setReminders((list) => list.filter((r) => r.id !== id))
  const markTaken = (id, time) =>
    setReminders((list) =>
      list.map((r) => {
        if (r.id !== id) return r
        const day = todayKey()
        const takenToday = r.taken?.[day] || []
        const next = takenToday.includes(time) ? takenToday.filter((t) => t !== time) : [...takenToday, time]
        return { ...r, taken: { [day]: next } }
      }),
    )

  // Fire browser notifications for reminders (checks every 20s while app is open).
  useEffect(() => {
    const fired = new Set()
    const check = () => {
      const now = new Date()
      const hhmm = now.toTimeString().slice(0, 5)
      reminders.forEach((r) => {
        if (!r.active || !r.times.includes(hhmm)) return
        const key = `${r.id}-${todayKey()}-${hhmm}`
        if (fired.has(key)) return
        fired.add(key)
        const body = `${r.dose || ''} ${r.instructions || ''}`.trim() || 'Time to take your medicine'
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`💊 ${r.medicine}`, { body })
        }
        showToast(`⏰ Time to take ${r.medicine}`)
      })
    }
    check()
    const t = setInterval(check, 20000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders])

  const value = {
    cart, cartDetails, addToCart, updateQty, removeFromCart, clearCart,
    orders, placeOrder, cancelOrder,
    prescriptions, addPrescription, deletePrescription,
    reminders, addReminder, toggleReminder, deleteReminder, markTaken, todayKey,
    toast, showToast,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext)
