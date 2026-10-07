import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Pill, ScanLine, ShoppingCart, Package, Bell, Plus } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { getCategory } from '../data/medicines'

export function Layout() {
  const { cartDetails, toast } = useStore()
  const nav = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/medicines', icon: Pill, label: 'Medicines' },
    { to: '/scan', icon: ScanLine, label: 'Scan Rx' },
    { to: '/orders', icon: Package, label: 'Orders' },
    { to: '/reminders', icon: Bell, label: 'Reminders' },
  ]
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">✚</span> MediCare
          </Link>
          <nav className="top-nav">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
            ))}
          </nav>
          <Link to="/cart" className="cart-btn" aria-label="Cart">
            <ShoppingCart size={22} />
            {cartDetails.count > 0 && <span className="badge">{cartDetails.count}</span>}
          </Link>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={to === '/scan' ? 'scan-tab' : ''}>
            <Icon size={to === '/scan' ? 24 : 20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export function MedicineCard({ medicine }) {
  const { addToCart, cart, updateQty } = useStore()
  const navigate = useNavigate()
  const inCart = cart.find((i) => i.id === medicine.id)
  const cat = getCategory(medicine.category)
  const off = Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100)

  return (
    <div className="med-card">
      <div className="med-thumb" style={{ background: cat?.color }} onClick={() => navigate(`/medicine/${medicine.id}`)}>
        <span>{cat?.icon}</span>
        {medicine.rx && <span className="rx-tag">Rx</span>}
      </div>
      <div className="med-body">
        <Link to={`/medicine/${medicine.id}`} className="med-name">{medicine.name}</Link>
        <div className="med-generic">{medicine.generic}</div>
        <div className="med-pack">{medicine.pack}</div>
        <div className="med-footer">
          <div>
            <span className="price">₹{medicine.price}</span>
            <span className="mrp">₹{medicine.mrp}</span>
            {off > 0 && <span className="off">{off}% off</span>}
          </div>
          {inCart ? (
            <QtyControl qty={inCart.qty} onChange={(q) => updateQty(medicine.id, q)} />
          ) : (
            <button className="btn btn-sm" onClick={() => addToCart(medicine.id)}>
              <Plus size={14} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function QtyControl({ qty, onChange }) {
  return (
    <div className="qty">
      <button onClick={() => onChange(qty - 1)}>−</button>
      <span>{qty}</span>
      <button onClick={() => onChange(qty + 1)}>+</button>
    </div>
  )
}

export function Empty({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
