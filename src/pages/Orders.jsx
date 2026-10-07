import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2, ArrowLeft, CheckCircle2, Circle, XCircle, MapPin, CreditCard } from 'lucide-react'
import { useStore, ORDER_STEPS, getOrderStepIndex } from '../context/StoreContext'
import { getCategory } from '../data/medicines'
import { QtyControl, Empty } from '../components/ui'

function Bill({ d }) {
  return (
    <div className="card bill">
      <h3>Bill Summary</h3>
      <div className="bill-row"><span>Item total (MRP)</span><span>₹{d.mrpTotal}</span></div>
      <div className="bill-row green"><span>Discount</span><span>−₹{d.savings}</span></div>
      <div className="bill-row"><span>Delivery</span><span>{d.delivery ? `₹${d.delivery}` : 'FREE'}</span></div>
      <div className="bill-row total"><span>To pay</span><span>₹{d.total}</span></div>
      {d.subtotal > 0 && d.subtotal < 299 && <p className="small muted">Add ₹{299 - d.subtotal} more for free delivery</p>}
    </div>
  )
}

export function CartPage() {
  const { cartDetails: d, updateQty, removeFromCart } = useStore()
  const navigate = useNavigate()

  if (!d.items.length)
    return <Empty icon="🛒" title="Your cart is empty" text="Search medicines or scan your prescription to add items."
      action={<div className="row gap"><Link className="btn" to="/medicines">Browse Medicines</Link><Link className="btn btn-outline" to="/scan">Scan Rx</Link></div>} />

  return (
    <div className="page">
      <h1 className="page-title">My Cart ({d.count})</h1>
      <div className="two-col">
        <div>
          {d.needsRx && (
            <div className="rx-banner">℞ Some items need a prescription. You'll attach it at checkout.</div>
          )}
          {d.items.map(({ id, qty, medicine: m }) => (
            <div key={id} className="cart-item">
              <div className="cart-thumb" style={{ background: getCategory(m.category)?.color }}>{getCategory(m.category)?.icon}</div>
              <div className="grow">
                <Link to={`/medicine/${id}`} className="med-name">{m.name}</Link> {m.rx && <span className="rx-mini">Rx</span>}
                <div className="muted small">{m.pack}</div>
                <div><span className="price">₹{m.price * qty}</span> <span className="mrp">₹{m.mrp * qty}</span></div>
              </div>
              <div className="cart-actions">
                <QtyControl qty={qty} onChange={(q) => updateQty(id, q)} />
                <button className="icon-btn" onClick={() => removeFromCart(id)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <Bill d={d} />
          <button className="btn btn-lg full mt" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { cartDetails: d, prescriptions, placeOrder } = useStore()
  const navigate = useNavigate()
  const saved = JSON.parse(localStorage.getItem('mc_address') || 'null')
  const [addr, setAddr] = useState(saved || { name: '', phone: '', line: '', city: '', pincode: '' })
  const [payment, setPayment] = useState('cod')
  const [rxId, setRxId] = useState(prescriptions[0]?.id || '')
  const [upi, setUpi] = useState('')
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => { if (!d.items.length && !paying) navigate('/cart') }, [d.items.length, paying, navigate])

  const submit = (e) => {
    e.preventDefault()
    if (!addr.name || !/^\d{10}$/.test(addr.phone) || !addr.line || !addr.city || !/^\d{6}$/.test(addr.pincode))
      return setError('Please fill a valid address (10-digit phone, 6-digit pincode).')
    if (d.needsRx && !rxId) return setError('Your cart has prescription medicines. Please attach a prescription.')
    if (payment === 'upi' && !/^[\w.-]+@[\w]+$/.test(upi)) return setError('Enter a valid UPI ID (e.g. name@okaxis).')
    setError('')
    localStorage.setItem('mc_address', JSON.stringify(addr))
    setPaying(true)
    // Dummy payment delay
    setTimeout(() => {
      const order = placeOrder({ address: addr, payment, prescriptionId: rxId })
      navigate(`/orders/${order.id}?new=1`)
    }, payment === 'cod' ? 400 : 1500)
  }

  const field = (k, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} {...props} />
    </label>
  )

  return (
    <form className="page" onSubmit={submit}>
      <button type="button" className="back" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <h1 className="page-title">Checkout</h1>
      <div className="two-col">
        <div>
          <div className="card">
            <h3><MapPin size={18} /> Delivery Address</h3>
            <div className="form-grid">
              {field('name', 'Full name')}
              {field('phone', 'Phone', { inputMode: 'numeric', maxLength: 10 })}
              {field('line', 'House no., street, area', { className: 'span2' })}
              {field('city', 'City')}
              {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}
            </div>
          </div>

          {d.needsRx && (
            <div className="card mt">
              <h3>℞ Attach Prescription</h3>
              {prescriptions.length ? (
                <div className="rx-choose">
                  {prescriptions.map((p) => (
                    <label key={p.id} className={`rx-opt ${rxId === p.id ? 'on' : ''}`}>
                      <input type="radio" name="rx" checked={rxId === p.id} onChange={() => setRxId(p.id)} />
                      <img src={p.image} alt="" />
                      <span className="small">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="muted">No prescription found. <Link to="/scan">Upload one here</Link> — your cart will be kept.</p>
              )}
              <p className="small muted">A pharmacist will verify the prescription before dispatch.</p>
            </div>
          )}

          <div className="card mt">
            <h3><CreditCard size={18} /> Payment</h3>
            {[
              ['cod', '💵 Cash on Delivery'],
              ['upi', '📱 UPI (demo)'],
              ['card', '💳 Card (demo)'],
            ].map(([k, label]) => (
              <label key={k} className={`pay-opt ${payment === k ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={payment === k} onChange={() => setPayment(k)} /> {label}
              </label>
            ))}
            {payment === 'upi' && (
              <label className="field mt-sm"><span>UPI ID</span><input placeholder="name@okaxis" value={upi} onChange={(e) => setUpi(e.target.value)} /></label>
            )}
            {payment === 'card' && <p className="small muted mt-sm">Demo mode — no real card is charged.</p>}
          </div>
        </div>

        <div>
          <Bill d={d} />
          {error && <div className="error mt">{error}</div>}
          <button className="btn btn-lg full mt" disabled={paying}>
            {paying ? 'Processing…' : payment === 'cod' ? `Place Order • ₹${d.total}` : `Pay ₹${d.total}`}
          </button>
        </div>
      </div>
    </form>
  )
}

function useTick(ms = 15000) {
  const [, set] = useState(0)
  useEffect(() => { const t = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(t) }, [ms])
}

export function OrdersPage() {
  const { orders } = useStore()
  useTick()
  if (!orders.length)
    return <Empty icon="📦" title="No orders yet" text="Your orders will appear here." action={<Link className="btn" to="/medicines">Start Shopping</Link>} />
  return (
    <div className="page">
      <h1 className="page-title">My Orders</h1>
      {orders.map((o) => {
        const idx = getOrderStepIndex(o)
        const status = idx < 0 ? 'Cancelled' : ORDER_STEPS[idx].label
        return (
          <Link key={o.id} to={`/orders/${o.id}`} className="order-card">
            <div className="row between">
              <strong>#{o.id}</strong>
              <span className={`status s-${idx < 0 ? 'cancelled' : ORDER_STEPS[idx].key}`}>{status}</span>
            </div>
            <div className="muted small">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
            <div className="small mt-sm">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</div>
            <div className="row between mt-sm"><span className="muted small">{o.payment.toUpperCase()}</span><strong>₹{o.total}</strong></div>
          </Link>
        )
      })}
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const { orders, cancelOrder, addToCart, prescriptions } = useStore()
  const navigate = useNavigate()
  useTick(5000)
  const o = orders.find((x) => x.id === id)
  if (!o) return <Empty icon="❓" title="Order not found" />
  const idx = getOrderStepIndex(o)
  const isNew = new URLSearchParams(location.search).get('new')
  const rx = prescriptions.find((p) => p.id === o.prescriptionId)

  return (
    <div className="page">
      <button className="back" onClick={() => navigate('/orders')}><ArrowLeft size={18} /> All orders</button>
      {isNew && (
        <div className="success-banner">
          <CheckCircle2 size={28} />
          <div><strong>Order placed successfully!</strong><div className="small">We'll deliver your medicines soon.</div></div>
        </div>
      )}
      <h1 className="page-title">Order #{o.id}</h1>
      <p className="muted">Placed on {new Date(o.createdAt).toLocaleString('en-IN')}</p>

      <div className="two-col">
        <div className="card">
          <h3>Tracking</h3>
          {idx < 0 ? (
            <div className="row gap-sm cancelled-text"><XCircle /> This order was cancelled.</div>
          ) : (
            <ol className="timeline">
              {ORDER_STEPS.map((s, i) => (
                <li key={s.key} className={i <= idx ? 'done' : ''}>
                  {i <= idx ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  <div>
                    <div>{s.label}</div>
                    {i <= idx && <div className="small muted">{new Date(o.createdAt + s.afterMin * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="small muted">Demo: status updates automatically every few minutes.</p>
        </div>

        <div>
          <div className="card">
            <h3>Items</h3>
            {o.items.map((i) => (
              <div key={i.id} className="bill-row"><span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span></div>
            ))}
            <div className="bill-row"><span>Delivery</span><span>{o.delivery ? `₹${o.delivery}` : 'FREE'}</span></div>
            <div className="bill-row total"><span>Total ({o.payment.toUpperCase()})</span><span>₹{o.total}</span></div>
          </div>
          <div className="card mt">
            <h3>Delivering to</h3>
            <p>{o.address.name} • {o.address.phone}<br />{o.address.line}, {o.address.city} - {o.address.pincode}</p>
            {rx && <><h3 className="mt-sm">Prescription</h3><img className="rx-thumb" src={rx.image} alt="Prescription" /></>}
          </div>
          <div className="row gap mt">
            <button className="btn" onClick={() => { o.items.forEach((i) => addToCart(i.id, i.qty)); navigate('/cart') }}>Reorder</button>
            {idx >= 0 && idx < 3 && <button className="btn btn-outline danger" onClick={() => cancelOrder(o.id)}>Cancel Order</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
