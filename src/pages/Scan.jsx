import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Tesseract from 'tesseract.js'
import { Camera, ImageUp, FileText, ScanLine, Trash2, CheckCircle2, RotateCcw } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { matchMedicines, generateSamplePrescription, compressImage } from '../utils/prescription'
import { getMedicine } from '../data/medicines'

export function ScanPage() {
  const navigate = useNavigate()
  const { addToCart, addPrescription, prescriptions, deletePrescription, showToast } = useStore()
  const cameraRef = useRef()
  const galleryRef = useRef()

  const [image, setImage] = useState(null)
  const [status, setStatus] = useState('idle') // idle | scanning | done | error
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState({}) // id -> qty
  const [showText, setShowText] = useState(false)

  const reset = () => {
    setImage(null); setStatus('idle'); setText(''); setMatches([]); setSelected({}); setProgress(0)
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { reset(); setImage(reader.result) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const useSample = () => { reset(); setImage(generateSamplePrescription()) }

  const scan = async () => {
    setStatus('scanning'); setProgress(0)
    try {
      const { data } = await Tesseract.recognize(image, 'eng', {
        logger: (m) => m.status === 'recognizing text' && setProgress(Math.round(m.progress * 100)),
      })
      const found = matchMedicines(data.text)
      setText(data.text)
      setMatches(found)
      setSelected(Object.fromEntries(found.map((f) => [f.medicine.id, 1])))
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const toggle = (id) => setSelected((s) => {
    const n = { ...s }
    n[id] ? delete n[id] : (n[id] = 1)
    return n
  })

  const save = async () => {
    const small = await compressImage(image)
    return addPrescription({ image: small, text, medicineIds: matches.map((m) => m.medicine.id) })
  }

  const addSelectedToCart = async () => {
    await save()
    Object.entries(selected).forEach(([id, qty]) => addToCart(id, qty))
    showToast(`${Object.keys(selected).length} medicines added to cart`)
    navigate('/cart')
  }

  const saveOnly = async () => {
    await save()
    showToast('Prescription saved')
    reset()
  }

  return (
    <div className="page">
      <h1 className="page-title">Scan Prescription</h1>
      <p className="muted">Upload a clear photo of your doctor's slip. We'll read it and find the medicines for you.</p>

      {!image && (
        <div className="upload-box">
          <div className="upload-icon"><ScanLine size={44} /></div>
          <div className="upload-actions">
            <button className="btn btn-lg" onClick={() => cameraRef.current.click()}><Camera size={18} /> Take Photo</button>
            <button className="btn btn-outline btn-lg" onClick={() => galleryRef.current.click()}><ImageUp size={18} /> Upload from Gallery</button>
          </div>
          <button className="link-btn" onClick={useSample}><FileText size={16} /> Don't have one? Try a sample prescription</button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />
          <ul className="tips">
            <li>✔ Keep the slip flat with good lighting</li>
            <li>✔ Make sure doctor's name, date and medicines are visible</li>
            <li>✔ Typed / clearly written prescriptions work best</li>
          </ul>
        </div>
      )}

      {image && (
        <div className="scan-layout">
          <div className="scan-preview">
            <img src={image} alt="Prescription" />
            {status === 'scanning' && (
              <div className="scan-overlay">
                <div className="scan-line" />
                <div className="scan-progress">Reading prescription… {progress}%</div>
              </div>
            )}
          </div>

          <div className="scan-panel">
            {status === 'idle' && (
              <>
                <button className="btn btn-lg full" onClick={scan}><ScanLine size={18} /> Scan & Find Medicines</button>
                <button className="btn btn-outline full mt-sm" onClick={reset}><RotateCcw size={16} /> Choose another image</button>
              </>
            )}

            {status === 'scanning' && (
              <div className="progress"><div style={{ width: `${progress}%` }} /></div>
            )}

            {status === 'error' && (
              <div className="card">
                <p>Couldn't read this image. Please try again with a clearer photo.</p>
                <button className="btn mt-sm" onClick={scan}>Retry</button>
              </div>
            )}

            {status === 'done' && (
              <>
                <h3>{matches.length ? `Found ${matches.length} medicines` : 'No medicines recognised'}</h3>
                {matches.length === 0 && (
                  <p className="muted">
                    We couldn't match any medicines automatically. You can still save the prescription and search medicines manually —
                    our pharmacist will verify it at checkout.
                  </p>
                )}
                <div className="match-list">
                  {matches.map(({ medicine: m, confidence }) => (
                    <label key={m.id} className={`match ${selected[m.id] ? 'on' : ''}`}>
                      <input type="checkbox" checked={!!selected[m.id]} onChange={() => toggle(m.id)} />
                      <div className="match-info">
                        <strong>{m.name}</strong> {m.rx && <span className="rx-mini">Rx</span>}
                        <div className="muted small">{m.generic} • {m.pack}</div>
                        <div className="small conf">{Math.round(confidence * 100)}% match</div>
                      </div>
                      <div className="match-price">₹{m.price}</div>
                    </label>
                  ))}
                </div>

                <button className="link-btn" onClick={() => setShowText(!showText)}>
                  {showText ? 'Hide' : 'Show'} scanned text
                </button>
                {showText && <pre className="ocr-text">{text || '(empty)'}</pre>}

                <div className="scan-cta">
                  {matches.length > 0 && (
                    <button className="btn btn-lg full" disabled={!Object.keys(selected).length} onClick={addSelectedToCart}>
                      Add {Object.keys(selected).length} to Cart
                    </button>
                  )}
                  <button className="btn btn-outline full mt-sm" onClick={saveOnly}>Save Prescription Only</button>
                  <Link className="btn btn-ghost full mt-sm" to="/medicines">Search manually</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {prescriptions.length > 0 && (
        <>
          <h2 className="section-title">My Prescriptions</h2>
          <div className="rx-list">
            {prescriptions.map((p) => (
              <div key={p.id} className="rx-item">
                <img src={p.image} alt="" />
                <div className="rx-item-info">
                  <strong>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  <div className="muted small">
                    {p.medicineIds.length
                      ? p.medicineIds.map((id) => getMedicine(id)?.name).join(', ')
                      : 'No medicines detected'}
                  </div>
                  <div className="row gap-sm mt-sm">
                    {p.medicineIds.length > 0 && (
                      <button className="btn btn-sm" onClick={() => { p.medicineIds.forEach((id) => addToCart(id)); navigate('/cart') }}>
                        <CheckCircle2 size={14} /> Reorder
                      </button>
                    )}
                    <button className="btn btn-sm btn-ghost" onClick={() => deletePrescription(p.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
