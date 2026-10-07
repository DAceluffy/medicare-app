import { useState } from 'react'
import { Bell, BellOff, Plus, Trash2, X, Check } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { MEDICINES } from '../data/medicines'
import { Empty } from '../components/ui'

const PRESETS = { 1: ['09:00'], 2: ['09:00', '21:00'], 3: ['08:00', '14:00', '20:00'] }

export function RemindersPage() {
  const { reminders, addReminder, toggleReminder, deleteReminder, markTaken, todayKey, orders } = useStore()
  const [open, setOpen] = useState(false)
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const today = todayKey()

  const askPermission = async () => setPerm(await Notification.requestPermission())

  // Today's schedule, sorted by time
  const schedule = reminders
    .filter((r) => r.active)
    .flatMap((r) => r.times.map((t) => ({ r, t, taken: (r.taken?.[today] || []).includes(t) })))
    .sort((a, b) => a.t.localeCompare(b.t))
  const takenCount = schedule.filter((s) => s.taken).length

  // Suggest medicines from past orders
  const ordered = [...new Set(orders.flatMap((o) => o.items.map((i) => i.name)))]

  return (
    <div className="page">
      <div className="row between">
        <h1 className="page-title">Medicine Reminders</h1>
        <button className="btn" onClick={() => setOpen(true)}><Plus size={16} /> Add</button>
      </div>

      {perm === 'default' && (
        <div className="info-banner">
          <Bell size={18} /> Turn on notifications to get reminded on time.
          <button className="btn btn-sm" onClick={askPermission}>Enable</button>
        </div>
      )}
      {perm === 'denied' && <div className="info-banner"><BellOff size={18} /> Notifications are blocked. You'll see in-app alerts while the app is open.</div>}

      {!reminders.length ? (
        <Empty icon="⏰" title="No reminders yet" text="Never miss a dose — add your medicine schedule."
          action={<button className="btn" onClick={() => setOpen(true)}>Add Reminder</button>} />
      ) : (
        <>
          <div className="card">
            <div className="row between">
              <h3>Today</h3>
              <span className="muted small">{takenCount}/{schedule.length} doses taken</span>
            </div>
            <div className="progress"><div style={{ width: `${schedule.length ? (takenCount / schedule.length) * 100 : 0}%` }} /></div>
            <div className="dose-list">
              {schedule.map(({ r, t, taken }) => (
                <button key={r.id + t} className={`dose ${taken ? 'taken' : ''}`} onClick={() => markTaken(r.id, t)}>
                  <span className="dose-time">{formatTime(t)}</span>
                  <span className="grow left">
                    <strong>{r.medicine}</strong>
                    <span className="muted small"> {r.dose} {r.instructions && `• ${r.instructions}`}</span>
                  </span>
                  <span className="dose-check">{taken ? <Check size={16} /> : null}</span>
                </button>
              ))}
              {!schedule.length && <p className="muted small">All reminders are paused.</p>}
            </div>
          </div>

          <h2 className="section-title">All Reminders</h2>
          {reminders.map((r) => (
            <div key={r.id} className={`reminder ${r.active ? '' : 'paused'}`}>
              <div className="grow">
                <strong>💊 {r.medicine}</strong>
                <div className="muted small">{r.dose} {r.instructions && `• ${r.instructions}`}</div>
                <div className="chips mt-sm">{r.times.map((t) => <span key={t} className="chip small">{formatTime(t)}</span>)}</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={r.active} onChange={() => toggleReminder(r.id)} />
                <span />
              </label>
              <button className="icon-btn" onClick={() => deleteReminder(r.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </>
      )}

      {open && <ReminderForm suggestions={ordered} onClose={() => setOpen(false)} onSave={(r) => { addReminder(r); setOpen(false) }} />}
    </div>
  )
}

function ReminderForm({ onClose, onSave, suggestions }) {
  const [medicine, setMedicine] = useState('')
  const [dose, setDose] = useState('1 tablet')
  const [instructions, setInstructions] = useState('After food')
  const [times, setTimes] = useState(PRESETS[2])
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!medicine.trim()) return setErr('Enter medicine name')
    if (!times.length) return setErr('Add at least one time')
    onSave({ medicine: medicine.trim(), dose, instructions, times: [...new Set(times)].sort() })
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="row between"><h3>New Reminder</h3><button type="button" className="icon-btn" onClick={onClose}><X size={18} /></button></div>

        <label className="field">
          <span>Medicine</span>
          <input list="med-list" value={medicine} onChange={(e) => setMedicine(e.target.value)} placeholder="e.g. Dolo 650" autoFocus />
          <datalist id="med-list">
            {[...suggestions, ...MEDICINES.map((m) => m.name)].map((n) => <option key={n} value={n} />)}
          </datalist>
        </label>
        <div className="form-grid">
          <label className="field"><span>Dose</span><input value={dose} onChange={(e) => setDose(e.target.value)} /></label>
          <label className="field">
            <span>Instructions</span>
            <select value={instructions} onChange={(e) => setInstructions(e.target.value)}>
              <option>After food</option><option>Before food</option><option>With water</option><option>At bedtime</option><option value="">None</option>
            </select>
          </label>
        </div>

        <div className="field">
          <span>How many times a day?</span>
          <div className="chips">
            {[1, 2, 3].map((n) => (
              <button type="button" key={n} className={times.length === n ? 'chip active' : 'chip'} onClick={() => setTimes(PRESETS[n])}>{n}× daily</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Times</span>
          {times.map((t, i) => (
            <div key={i} className="row gap-sm mt-sm">
              <input type="time" value={t} onChange={(e) => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="icon-btn" onClick={() => setTimes(times.filter((_, j) => j !== i))}><X size={16} /></button>
            </div>
          ))}
          <button type="button" className="link-btn" onClick={() => setTimes([...times, '12:00'])}>+ Add time</button>
        </div>

        {err && <div className="error">{err}</div>}
        <button className="btn btn-lg full mt">Save Reminder</button>
      </form>
    </div>
  )
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
