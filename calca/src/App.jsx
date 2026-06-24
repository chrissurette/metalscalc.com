import { useState, useEffect, useRef } from 'react'
import './App.css'

const TROY_PER_GRAM = 1 / 31.1035
const TROY_PER_DWT  = 1 / 20

const CUSTOM = 'custom'

const DEFAULT_FIELDS = { weight: true, purity: true, scrapValue: true, payoutPct: true, payoutAmt: true }

const METALS = {
  gold: {
    spot: 3300.00,
    defaultPurity: 0.583,
    purities: [
      { label: '24K — 99.9%', value: 0.999  },
      { label: '23K — 95.8%', value: 0.958  },
      { label: '22K  — 91.7%', value: 0.917  },
      { label: '21.6K — 90.0%', value: 0.900  },
      { label: '21K  — 87.5%', value: 0.875  },
      { label: '20K — 83.3%', value: 0.833  },
      { label: '18K — 75.0%', value: 0.750  },
      { label: '16K — 66.7%', value: 0.667  },
      { label: '14K — 58.3%', value: 0.583  },
      { label: '12K — 50.0%', value: 0.500  },
      { label: '10K — 41.7%', value: 0.417  },
      { label: '9K  — 37.5%', value: 0.375  },
      { label: '8K  — 33.3%', value: 0.333  },
      { label: 'Custom',      value: CUSTOM },
    ],
  },
  silver: {
    spot: 25.00,
    defaultPurity: 0.925,
    purities: [
      { label: '.999 Fine Silver',        value: 0.999  },
      { label: '.958 Britannia',          value: 0.958  },
      { label: '.925 Sterling Silver',    value: 0.925  },
      { label: '.900 Coin Silver',        value: 0.900  },
      { label: '.835 European Silver',    value: 0.835  },
      { label: '.800 Continental Silver', value: 0.800  },
      { label: 'Custom',                  value: CUSTOM },
    ],
  },
  platinum: {
    spot: 1050.00,
    defaultPurity: 0.950,
    purities: [
      { label: '950 Platinum — 95.0%', value: 0.950  },
      { label: '900 Platinum — 90.0%', value: 0.900  },
      { label: '850 Platinum — 85.0%', value: 0.850  },
      { label: '750 Platinum — 75.0%', value: 0.750  },
      { label: 'Custom',               value: CUSTOM },
    ],
  },
}

const fmt = (n) => '$' + n.toFixed(2)
const spotInputValue = (n) => Number(n || 0).toFixed(2)

const chevron = (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

export default function App() {
  const [metal, setMetal]         = useState(() => {
    try { return localStorage.getItem('scrap-calc-metal') || 'gold' } catch { return 'gold' }
  })
  const [weight, setWeight]       = useState('')
  const [unit, setUnit]           = useState('grams')
  const [purity, setPurity]       = useState(() => {
    try {
      const m = localStorage.getItem('scrap-calc-metal') || 'gold'
      const saved = localStorage.getItem('scrap-calc-purity-' + m)
      return saved ? (parseFloat(saved) || METALS[m].defaultPurity) : METALS[m].defaultPurity
    } catch { return METALS.gold.defaultPurity }
  })
  const [customPct, setCustomPct] = useState('')
  const [payout, setPayout]       = useState(80)
  const [result, setResult]       = useState(null)
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const stored = localStorage.getItem('scrap-calc-items')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [showConfirm, setShowConfirm]   = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode]         = useState(() => {
    try { return localStorage.getItem('scrap-calc-dark') === 'true' } catch { return false }
  })
  const [showFields, setShowFields]     = useState(() => {
    try {
      const s = localStorage.getItem('scrap-calc-fields')
      return s ? { ...DEFAULT_FIELDS, ...JSON.parse(s) } : DEFAULT_FIELDS
    } catch { return DEFAULT_FIELDS }
  })

  // ── Theme palette (recomputed each render) ──
  const PAGE_BG   = darkMode ? '#000000' : '#ffffff'
  const FIELD_BG  = darkMode ? '#252320' : '#f2ede6'
  const BORDER    = '#c4a45a'
  const GOLD_FLAT = '#c4a45a'
  const TEXT      = darkMode ? '#f0ebe3' : '#1a1a1a'
  const TEXT_SEC  = darkMode ? '#8a8480' : '#7a7570'
  const DIVIDER   = darkMode ? '#38332e' : '#e5e0d8'
  const OPT_BG    = darkMode ? '#252320' : '#f2ede6'

  const field = {
    background: FIELD_BG,
    border: `1.5px solid ${BORDER}`,
    borderRadius: '0.5rem',
    color: TEXT,
    boxShadow: 'none',
  }

  const divider = {
    borderBottom: `1px solid ${DIVIDER}`,
    paddingBottom: '1rem',
  }
  const [spotPrices, setSpotPrices] = useState({
    gold:      METALS.gold.spot,
    silver:    METALS.silver.spot,
    platinum:  METALS.platinum.spot,
    updatedAt: null,
  })
  const spotEditedRef = useRef({ gold: false, silver: false, platinum: false })
  const [spotInputs, setSpotInputs] = useState({
    gold:      spotInputValue(METALS.gold.spot),
    silver:    spotInputValue(METALS.silver.spot),
    platinum:  spotInputValue(METALS.platinum.spot),
  })

  const { purities } = METALS[metal]
  const spot = parseFloat(spotInputs[metal])

  useEffect(() => {
    const apply = (prices) => {
      setSpotPrices(prev => ({
        gold:      prices.gold      ?? prev.gold,
        silver:    prices.silver    ?? prev.silver,
        platinum:  prices.platinum  ?? prev.platinum,
        updatedAt: prices.updatedAt ?? prev.updatedAt,
      }))
      setSpotInputs(prev => {
        const next = { ...prev }
        ;['gold', 'silver', 'platinum'].forEach((m) => {
          if (!spotEditedRef.current[m] && prices[m] != null) {
            next[m] = spotInputValue(prices[m])
          }
        })
        return next
      })
    }
    const handler = (e) => apply(e.detail)
    window.addEventListener('metalprices:update', handler)
    if (window.metalPrices) apply(window.metalPrices)
    return () => window.removeEventListener('metalprices:update', handler)
  }, [])

  useEffect(() => {
    try { localStorage.setItem('scrap-calc-items', JSON.stringify(savedItems)) } catch {}
  }, [savedItems])

  useEffect(() => {
    try { localStorage.setItem('scrap-calc-dark', String(darkMode)) } catch {}
  }, [darkMode])

  useEffect(() => {
    try { localStorage.setItem('scrap-calc-fields', JSON.stringify(showFields)) } catch {}
  }, [showFields])

  useEffect(() => {
    try { localStorage.setItem('scrap-calc-metal', metal) } catch {}
  }, [metal])

  useEffect(() => {
    if (purity !== CUSTOM) {
      try { localStorage.setItem('scrap-calc-purity-' + metal, String(purity)) } catch {}
    }
  }, [metal, purity])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scrap-calc-purity-' + metal)
      setPurity(saved ? (parseFloat(saved) || METALS[metal].defaultPurity) : METALS[metal].defaultPurity)
    } catch {
      setPurity(METALS[metal].defaultPurity)
    }
    setCustomPct('')
    setResult(null)
  }, [metal])

  const handleWeightChange = (e) => {
    const v = e.target.value
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setWeight(v)
      setResult(null)
    }
  }

  const handleSpotChange = (e) => {
    const v = e.target.value
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      spotEditedRef.current[metal] = true
      setSpotInputs(prev => ({ ...prev, [metal]: v }))
      setResult(null)
    }
  }

  const handleSpotBlur = () => {
    setSpotInputs(prev => {
      const value = parseFloat(prev[metal])
      if (!value || value <= 0) return prev
      return { ...prev, [metal]: spotInputValue(value) }
    })
  }

  const refreshSpot = () => {
    const currentSpot = spotPrices[metal]
    if (!currentSpot || currentSpot <= 0) return
    spotEditedRef.current[metal] = false
    setSpotInputs(prev => ({ ...prev, [metal]: spotInputValue(currentSpot) }))
    setResult(null)
  }

  const calculate = () => {
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    const purityVal = purity === CUSTOM ? parseFloat(customPct) / 100 : purity
    if (!purityVal || purityVal <= 0 || purityVal > 1) return
    const effectiveSpot = spot && spot > 0 ? spot : spotPrices[metal]
    if (!effectiveSpot || effectiveSpot <= 0) return
    if (!spot || spot <= 0) {
      spotEditedRef.current[metal] = false
      setSpotInputs(prev => ({ ...prev, [metal]: spotInputValue(effectiveSpot) }))
    }
    const troyOz = unit === 'grams' ? w * TROY_PER_GRAM : unit === 'dwt' ? w * TROY_PER_DWT : w
    setResult(troyOz * purityVal * effectiveSpot)
  }

  const UNIT_LABEL = { grams: 'g', dwt: 'dwt', troy_oz: 'ozt' }

  const handleAdd = () => {
    if (result === null || savedItems.length >= 20) return
    const purityLabel = purity === CUSTOM
      ? `${customPct}% custom`
      : METALS[metal].purities.find(p => p.value === purity)?.label ?? `${(purity * 100).toFixed(1)}%`
    setSavedItems(prev => [...prev, {
      id: Date.now(),
      metal,
      weight,
      unitLabel: UNIT_LABEL[unit],
      purityLabel,
      payout,
      scrapValue: result,
      payoutAmount: result * payout / 100,
    }])
    setWeight('')
    setResult(null)
    setCustomPct('')
    setPurity(METALS[metal].defaultPurity)
  }

  const payoutValue = result !== null ? result * payout / 100 : null

  const handleClearReset = () => {
    setSavedItems([])
    setWeight('')
    setResult(null)
    setCustomPct('')
    setMetal('gold')
    setUnit('grams')
    setPurity(METALS.gold.defaultPurity)
    spotEditedRef.current = { gold: false, silver: false, platinum: false }
    setSpotInputs({
      gold:      spotInputValue(spotPrices.gold),
      silver:    spotInputValue(spotPrices.silver),
      platinum:  spotInputValue(spotPrices.platinum),
    })
    setPayout(80)
    setShowConfirm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const updateTime = spotPrices.updatedAt
    ? new Date(spotPrices.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div style={{
      backgroundColor: PAGE_BG,
      color: TEXT,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      paddingBottom: '1.5rem',
    }}>

      {/* ── Metal Toggle ── */}
      <header style={{ width: '100%', maxWidth: '28rem', padding: '1rem 1.5rem 0.75rem' }}>
        <div style={{ background: FIELD_BG, border: `1.5px solid ${BORDER}`, borderRadius: '0.5rem', display: 'flex', padding: '3px', gap: '3px' }}>
          {['gold', 'silver', 'platinum'].map((m) => {
            const active = metal === m
            return (
              <button
                key={m}
                onClick={() => setMetal(m)}
                style={{
                  flex: 1, padding: '7px 0', fontSize: '1rem', fontWeight: 700,
                  borderRadius: '0.35rem', border: 'none', cursor: 'pointer',
                  background: active ? GOLD_FLAT : 'transparent',
                  color: active ? '#ffffff' : TEXT_SEC,
                  transition: 'all 0.15s',
                }}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            )
          })}
        </div>
      </header>

      <main style={{ width: '100%', maxWidth: '28rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {/* ── Step 1: Weight ── */}
        <section style={divider}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>
            <span style={{ color: GOLD_FLAT }}>1.</span> Enter Weight
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={weight}
              onChange={handleWeightChange}
              style={{
                ...field,
                flex: 1, minWidth: 0, fontSize: '1.625rem', fontWeight: 600,
                padding: '0.6rem 0.875rem', boxSizing: 'border-box',
              }}
            />
            <div style={{ width: '6.5rem', minWidth: '6.5rem', flexShrink: 0, position: 'relative' }}>
              <select
                value={unit}
                onChange={(e) => { setUnit(e.target.value); setResult(null) }}
                style={{
                  ...field,
                  width: '100%', fontSize: '1rem', fontWeight: 600,
                  padding: '0.6rem 0.5rem 0.6rem 0.875rem', appearance: 'none', boxSizing: 'border-box',
                  cursor: 'pointer', lineHeight: '1.4',
                }}
              >
                <option value="grams"   style={{ background: OPT_BG, color: TEXT }}>Grams</option>
                <option value="dwt"     style={{ background: OPT_BG, color: TEXT }}>DWT</option>
                <option value="troy_oz" style={{ background: OPT_BG, color: TEXT }}>Troy Oz</option>
              </select>
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: TEXT_SEC }}>
                {chevron}
              </span>
            </div>
          </div>
        </section>

        {/* ── Step 2: Purity ── */}
        <section style={divider}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>
            <span style={{ color: GOLD_FLAT }}>2.</span> Select Purity
          </h2>
          <div style={{ position: 'relative' }}>
            <select
              value={purity}
              onChange={(e) => {
                const v = e.target.value
                setPurity(v === CUSTOM ? CUSTOM : parseFloat(v))
                setCustomPct('')
                setResult(null)
              }}
              style={{
                ...field,
                width: '100%', fontSize: '1.1rem',
                padding: '0.6rem 0.875rem', appearance: 'none',
                boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              {purities.map((p) => (
                <option key={p.value} value={p.value} style={{ background: OPT_BG, color: TEXT }}>{p.label}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: TEXT_SEC }}>
              {chevron}
            </span>
          </div>

          {purity === CUSTOM && (
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter purity % (e.g. 58.5)"
              value={customPct}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || /^\d*\.?\d*$/.test(v)) { setCustomPct(v); setResult(null) }
              }}
              style={{
                ...field,
                marginTop: '0.4rem', width: '100%', fontSize: '1.1rem',
                padding: '0.6rem 0.875rem', boxSizing: 'border-box',
              }}
            />
          )}
        </section>

        {/* ── Step 3: Spot Price + Calculate ── */}
        <section style={divider}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>
            <span style={{ color: GOLD_FLAT }}>3.</span> Current Spot Price
          </h2>

          <div style={{ ...field, padding: '0.6rem 0.875rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                aria-label="Current spot price"
                value={spotInputs[metal]}
                onChange={handleSpotChange}
                onBlur={handleSpotBlur}
                onFocus={(e) => e.target.select()}
                style={{
                  width: '100%',
                  minWidth: 0,
                  border: 'none',
                  background: 'transparent',
                  color: TEXT,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  padding: 0,
                  margin: 0,
                }}
              />
            </label>
            <span style={{ fontSize: '0.75rem', color: TEXT_SEC }}>Troy oz · {today}{updateTime ? ` · ${updateTime}` : ''}</span>
            <button
              type="button"
              onClick={refreshSpot}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: '0.35rem',
                background: 'transparent',
                color: GOLD_FLAT,
                flexShrink: 0,
                fontFamily: 'inherit',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '0.22rem 0.45rem',
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>

          <button
            onClick={calculate}
            style={{
              display: 'block', width: '100%', background: GOLD_FLAT,
              padding: '13px', borderRadius: '0.5rem', color: '#ffffff',
              fontWeight: 900, fontSize: '1.15rem', border: 'none',
              cursor: 'pointer', marginBottom: '0.4rem', letterSpacing: '0.03em',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b8930a'}
            onMouseLeave={e => { e.currentTarget.style.background = GOLD_FLAT; e.currentTarget.style.transform = 'scale(1)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            CALCULATE SCRAP VALUE
          </button>

          {/* Result */}
          <div style={{ ...field, padding: '0.4rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: TEXT_SEC, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated Scrap Value</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: result !== null ? GOLD_FLAT : '#ccc8be' }}>
              {result !== null ? fmt(result) : '—'}
            </span>
          </div>
        </section>

        {/* ── Step 4: Payout Slider ── */}
        <section style={{ paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
              <span style={{ color: GOLD_FLAT }}>4.</span> Adjust Percentage
            </h2>
            <button
              onClick={handleAdd}
              disabled={result === null || savedItems.length >= 20}
              style={{
                background: result !== null && savedItems.length < 20 ? GOLD_FLAT : 'transparent',
                border: `1.5px solid ${result !== null && savedItems.length < 20 ? GOLD_FLAT : DIVIDER}`,
                borderRadius: '0.35rem',
                color: result !== null && savedItems.length < 20 ? '#ffffff' : TEXT_SEC,
                fontWeight: 700, fontSize: '0.78rem', padding: '3px 10px',
                cursor: result !== null && savedItems.length < 20 ? 'pointer' : 'default',
                letterSpacing: '0.04em', transition: 'all 0.15s',
              }}
            >
              {savedItems.length >= 20 ? 'LIST FULL' : 'ADD +'}
            </button>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Payout: {payout}%{payoutValue !== null ? ` (${fmt(payoutValue)})` : ''}
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={payout}
            onChange={(e) => { setPayout(parseInt(e.target.value)) }}
            className="scrap-range"
            style={{ background: `linear-gradient(to right, ${GOLD_FLAT} ${payout}%, ${DIVIDER} ${payout}%)` }}
          />
        </section>

        {/* ── Saved Items List ── */}
        {savedItems.length > 0 && (
          <section style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            {savedItems.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0',
                borderBottom: idx < savedItems.length - 1 ? `1px solid ${DIVIDER}` : 'none',
                fontSize: '0.82rem',
              }}>
                <span style={{ fontWeight: 700, textTransform: 'capitalize', minWidth: '4.2rem', color: TEXT }}>
                  {item.metal}
                </span>
                <span style={{ flex: 1, color: TEXT_SEC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[
                    showFields.weight    && `${item.weight}${item.unitLabel}`,
                    showFields.purity    && item.purityLabel,
                    showFields.scrapValue && fmt(item.scrapValue),
                    showFields.payoutPct && `${item.payout}%`,
                  ].filter(Boolean).join(' · ')}
                </span>
                {showFields.payoutAmt && (
                  <span style={{ fontWeight: 700, color: GOLD_FLAT, whiteSpace: 'nowrap' }}>
                    {fmt(item.payoutAmount)}
                  </span>
                )}
                <button
                  onClick={() => setSavedItems(prev => prev.filter(i => i.id !== item.id))}
                  style={{ background: 'none', border: 'none', color: TEXT_SEC, cursor: 'pointer', fontSize: '1rem', padding: '0 0 0 2px', lineHeight: 1, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
            {savedItems.length > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '0.45rem', marginTop: '0.25rem',
                borderTop: `1.5px solid ${BORDER}`,
                fontWeight: 900, fontSize: '0.88rem',
              }}>
                <span>
                  Total
                  {showFields.weight && (() => {
                    const grams = savedItems.reduce((sum, item) => {
                      const w = parseFloat(item.weight) || 0
                      if (item.unitLabel === 'dwt') return sum + w * 1.55517
                      if (item.unitLabel === 'ozt') return sum + w * 31.1035
                      return sum + w
                    }, 0)
                    return (
                      <span style={{ fontWeight: 600, fontSize: '0.78rem', color: TEXT_SEC, marginLeft: '0.4rem' }}>
                        {grams.toFixed(2)}g
                      </span>
                    )
                  })()}
                </span>
                <span style={{ color: GOLD_FLAT }}>{fmt(savedItems.reduce((s, i) => s + i.payoutAmount, 0))}</span>
              </div>
            )}
            {savedItems.length >= 20 && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: TEXT_SEC, marginTop: '0.5rem' }}>
                List is full — remove an item to add another.
              </p>
            )}
          </section>
        )}

        {/* ── Bottom Buttons ── */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              flex: 1, background: 'transparent',
              border: `1.5px solid ${DIVIDER}`, borderRadius: '0.5rem',
              color: TEXT_SEC, fontWeight: 600, fontSize: '0.85rem',
              padding: '8px', cursor: 'pointer', letterSpacing: '0.04em',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD_FLAT }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = DIVIDER; e.currentTarget.style.color = TEXT_SEC }}
          >
            SETTINGS
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              flex: 1, background: 'transparent',
              border: `1.5px solid ${DIVIDER}`, borderRadius: '0.5rem',
              color: TEXT_SEC, fontWeight: 600, fontSize: '0.85rem',
              padding: '8px', cursor: 'pointer', letterSpacing: '0.04em',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = DIVIDER; e.currentTarget.style.color = TEXT_SEC }}
          >
            CLEAR &amp; RESET
          </button>
        </div>

      </main>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowSettings(false)}>
          <div style={{
            background: PAGE_BG, border: `1.5px solid ${BORDER}`,
            borderRadius: '0.75rem', padding: '1.5rem',
            width: '88%', maxWidth: '22rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 900, color: TEXT }}>Settings</h3>

            {/* Dark Mode toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.6rem 0', borderBottom: `1px solid ${DIVIDER}`,
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: TEXT }}>Dark Mode</span>
              <div
                onClick={() => setDarkMode(d => !d)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
                  background: darkMode ? GOLD_FLAT : DIVIDER,
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '2px',
                  left: darkMode ? '22px' : '2px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#ffffff', transition: 'left 0.2s',
                }} />
              </div>
            </div>

            {/* Field visibility toggles */}
            <p style={{ margin: '0.9rem 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, color: TEXT_SEC, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Row Display Fields
            </p>
            {[
              { key: 'weight',     label: 'Show Weight'      },
              { key: 'purity',     label: 'Show Purity'      },
              { key: 'scrapValue', label: 'Show Scrap Value' },
              { key: 'payoutPct',  label: 'Show % Payout'    },
              { key: 'payoutAmt',  label: 'Show $ Payout'    },
            ].map(({ key, label }) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0', borderBottom: `1px solid ${DIVIDER}`,
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: TEXT }}>{label}</span>
                <div
                  onClick={() => setShowFields(f => ({ ...f, [key]: !f[key] }))}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
                    background: showFields[key] ? GOLD_FLAT : DIVIDER,
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '2px',
                    left: showFields[key] ? '22px' : '2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#ffffff', transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowSettings(false)}
              style={{
                marginTop: '1rem', width: '100%', padding: '9px',
                borderRadius: '0.5rem', border: `1.5px solid ${BORDER}`,
                background: 'transparent', color: GOLD_FLAT,
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: PAGE_BG, border: `1.5px solid ${BORDER}`,
              borderRadius: '0.75rem', padding: '1.5rem 1.5rem 1.25rem',
              width: '88%', maxWidth: '22rem', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 900 }}>Clear All &amp; Reset?</h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: TEXT_SEC }}>
              This will delete all saved items and reset the calculator to its default state.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '9px', borderRadius: '0.5rem',
                  border: `1.5px solid ${BORDER}`, background: 'transparent',
                  color: GOLD_FLAT, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearReset}
                style={{
                  flex: 1, padding: '9px', borderRadius: '0.5rem',
                  border: 'none', background: '#c0392b',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
