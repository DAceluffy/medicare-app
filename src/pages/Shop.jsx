import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Search, ScanLine, Truck, ShieldCheck, BadgePercent, ArrowLeft, Bell } from 'lucide-react'
import { CATEGORIES, MEDICINES, getCategory, getMedicine } from '../data/medicines'
import { MedicineCard, QtyControl, Empty } from '../components/ui'
import { useStore } from '../context/StoreContext'

export function HomePage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const { orders } = useStore()
  const popular = ['m1', 'm22', 'm27', 'm19', 'm5', 'm24'].map(getMedicine)

  return (
    <div className="page">
      <form className="search-bar" onSubmit={(e) => { e.preventDefault(); navigate(`/medicines?q=${encodeURIComponent(q)}`) }}>
        <Search size={18} />
        <input placeholder="Search medicines, e.g. Dolo, Paracetamol" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <section className="hero">
        <div>
          <h1>Order medicines with your prescription</h1>
          <p>Scan your doctor's slip — we find the medicines and add them to your cart.</p>
          <Link to="/scan" className="btn btn-light"><ScanLine size={18} /> Scan Prescription</Link>
        </div>
        <div className="hero-art">📋</div>
      </section>

      <div className="perks">
        <div><Truck size={20} /> Free delivery above ₹299</div>
        <div><BadgePercent size={20} /> Up to 15% off</div>
        <div><ShieldCheck size={20} /> 100% genuine medicines</div>
      </div>

      <div className="quick-actions">
        <Link to="/scan" className="qa"><ScanLine /> <span>Upload Rx</span></Link>
        <Link to="/medicines" className="qa"><Search /> <span>Search</span></Link>
        <Link to="/reminders" className="qa"><Bell /> <span>Reminders</span></Link>
        <Link to="/orders" className="qa"><Truck /> <span>Track Order{orders.length ? ` (${orders.length})` : ''}</span></Link>
      </div>

      <h2 className="section-title">Shop by Category</h2>
      <div className="categories">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/medicines?cat=${c.id}`} className="cat" style={{ background: c.color }}>
            <span className="cat-icon">{c.icon}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Popular Medicines</h2>
      <div className="grid">
        {popular.map((m) => <MedicineCard key={m.id} medicine={m} />)}
      </div>
    </div>
  )
}

export function MedicinesPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const [rxOnly, setRxOnly] = useState('all')
  const [sort, setSort] = useState('relevance')

  const update = (key, val) => {
    const p = new URLSearchParams(params)
    val ? p.set(key, val) : p.delete(key)
    setParams(p, { replace: true })
  }

  let list = MEDICINES.filter((m) => {
    const text = `${m.name} ${m.generic} ${m.manufacturer}`.toLowerCase()
    return (!q || text.includes(q.toLowerCase())) && (!cat || m.category === cat)
      && (rxOnly === 'all' || (rxOnly === 'otc' ? !m.rx : m.rx))
  })
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
  if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)

  return (
    <div className="page">
      <div className="search-bar">
        <Search size={18} />
        <input autoFocus placeholder="Search medicines…" value={q} onChange={(e) => update('q', e.target.value)} />
      </div>

      <div className="chips">
        <button className={!cat ? 'chip active' : 'chip'} onClick={() => update('cat', '')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={cat === c.id ? 'chip active' : 'chip'} onClick={() => update('cat', c.id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={rxOnly} onChange={(e) => setRxOnly(e.target.value)}>
          <option value="all">All types</option>
          <option value="otc">No prescription needed</option>
          <option value="rx">Prescription required</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="relevance">Sort: Relevance</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
        <span className="muted">{list.length} results</span>
      </div>

      {list.length ? (
        <div className="grid">{list.map((m) => <MedicineCard key={m.id} medicine={m} />)}</div>
      ) : (
        <Empty icon="🔍" title="No medicines found" text="Try a different name or upload your prescription."
          action={<Link className="btn" to="/scan">Scan Prescription</Link>} />
      )}
    </div>
  )
}

export function MedicineDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const m = getMedicine(id)
  const { cart, addToCart, updateQty } = useStore()
  if (!m) return <Empty icon="❓" title="Medicine not found" />
  const cat = getCategory(m.category)
  const inCart = cart.find((i) => i.id === m.id)
  const similar = MEDICINES.filter((x) => x.category === m.category && x.id !== m.id).slice(0, 4)
  const off = Math.round(((m.mrp - m.price) / m.mrp) * 100)

  return (
    <div className="page">
      <button className="back" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <div className="detail">
        <div className="detail-thumb" style={{ background: cat?.color }}>{cat?.icon}</div>
        <div className="detail-info">
          {m.rx && <div className="rx-banner">℞ Prescription required</div>}
          <h1>{m.name}</h1>
          <p className="muted">{m.generic} • {m.manufacturer}</p>
          <p className="muted">{m.pack}</p>
          <div className="detail-price">
            <span className="price big">₹{m.price}</span>
            <span className="mrp">MRP ₹{m.mrp}</span>
            {off > 0 && <span className="off">{off}% off</span>}
          </div>
          <div className="row gap">
            {inCart ? (
              <>
                <QtyControl qty={inCart.qty} onChange={(q) => updateQty(m.id, q)} />
                <Link to="/cart" className="btn">Go to Cart</Link>
              </>
            ) : (
              <button className="btn btn-lg" onClick={() => addToCart(m.id)}>Add to Cart</button>
            )}
          </div>
          <div className="card mt">
            <h3>About this medicine</h3>
            <p>{m.description}</p>
            <p className="muted small">Category: {cat?.name}. Consult your doctor before use.</p>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <>
          <h2 className="section-title">Similar Medicines</h2>
          <div className="grid">{similar.map((s) => <MedicineCard key={s.id} medicine={s} />)}</div>
        </>
      )}
    </div>
  )
}
