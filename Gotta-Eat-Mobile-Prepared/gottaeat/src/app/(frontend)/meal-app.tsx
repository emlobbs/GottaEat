'use client'

import { useMemo, useRef, useState } from 'react'

type Tab = 'home' | 'swipe' | 'plan' | 'recipes' | 'wishlist'
type Ingredient = { id: number; name: string; quantity: string; calories: number; barcode?: string }

const meals = [
  { name: 'Sticky gochujang chicken', meta: '25 min · 486 kcal', note: 'Sweet, spicy, weeknight-fast', tone: 'from-orange-200 to-rose-300' },
  { name: 'Lemony pea orzo', meta: '18 min · 412 kcal', note: 'Fresh, creamy, one pan', tone: 'from-lime-200 to-emerald-300' },
  { name: 'Crispy taco bowls', meta: '22 min · 520 kcal', note: 'Big flavour, easy portions', tone: 'from-amber-200 to-orange-300' },
]

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z"/><path d="M4 5.5v14"/></>,
    scan: <><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3"/><path d="M7 9v6M10 8v8M14 8v8M17 9v6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    shuffle: <><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z"/>,
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="4"/></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{paths[name]}</svg>
}

export function MealApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [card, setCard] = useState(0)
  const [liked, setLiked] = useState<string[]>([])
  const [quiz, setQuiz] = useState(false)
  const [editor, setEditor] = useState(false)
  const [scanner, setScanner] = useState(false)
  const [screenshotImport, setScreenshotImport] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [scanCode, setScanCode] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: 'Chicken breast', quantity: '300g', calories: 495 },
    { id: 2, name: 'Microwave rice', quantity: '1 pouch', calories: 364, barcode: '5010251745907' },
  ])
  const videoRef = useRef<HTMLVideoElement>(null)
  const total = useMemo(() => ingredients.reduce((sum, item) => sum + item.calories, 0), [ingredients])
  const [wishes, setWishes] = useState([
    { title: 'Crispy chilli beef bowls', url: 'mob.co.uk', by: 'Sam' },
    { title: 'Roasted tomato butter beans', url: 'bbcgoodfood.com', by: 'Alex' },
  ])

  async function openScanner() {
    setScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      // Manual entry remains available when camera permission or hardware is unavailable.
    }
  }

  function addScan() {
    if (!scanCode.trim()) return
    setIngredients((items) => [...items, { id: Date.now(), name: 'Scanned food item', quantity: '1 serving', calories: 0, barcode: scanCode.trim() }])
    setScanCode('')
    setScanner(false)
  }

  const vote = (yes: boolean) => {
    if (yes) setLiked((items) => [...items, meals[card].name])
    setCard((value) => (value + 1) % meals.length)
  }

  async function readScreenshot(file?: File) {
    if (!file) return
    setOcrBusy(true)
    setOcrText('')
    try {
      const { recognize } = await import('tesseract.js')
      const result = await recognize(file, 'eng')
      setOcrText(result.data.text.trim())
    } catch {
      setOcrText('Could not read this screenshot. Try a clearer crop, or paste the recipe text here.')
    } finally {
      setOcrBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#242721]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
        <button className="brand" onClick={() => setTab('home')}><span>t</span> table for two</button>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm sm:flex"><span className="status-dot" /> Alex & Sam</div>
          <button className="icon-button" aria-label="Household profile"><Icon name="user" /></button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-28 lg:px-8">
        {tab === 'home' && <Home onQuiz={() => setQuiz(true)} onSwipe={() => setTab('swipe')} onPlan={() => setTab('plan')} />}
        {tab === 'swipe' && <Swipe card={meals[card]} onVote={vote} liked={liked} />}
        {tab === 'plan' && <Plan />}
        {tab === 'recipes' && <Recipes onAdd={() => setEditor(true)} onImport={() => setScreenshotImport(true)} />}
        {tab === 'wishlist' && <Wishlist wishes={wishes} onAdd={(wish) => setWishes((all) => [...all, wish])} />}
      </div>

      <nav className="bottom-nav">
        {([['home','home','Today'],['swipe','heart','Match'],['plan','calendar','Plan'],['recipes','book','Recipes'],['wishlist','bookmark','Wishlist']] as const).map(([key, icon, label]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon name={icon} /><span>{label}</span></button>
        ))}
      </nav>

      {quiz && <Modal title="What are you feeling?" onClose={() => setQuiz(false)}>
        <p className="mb-5 text-sm text-[#70746b]">No overthinking. Pick the vibe that sounds best right now.</p>
        <div className="grid grid-cols-2 gap-3">
          {['Cosy & comforting', 'Fresh & light', 'Spicy & exciting', 'Fakeaway night', 'Use what we have', 'Under 20 minutes'].map((item) => <button key={item} className="choice" onClick={() => { setQuiz(false); setTab('swipe') }}>{item}</button>)}
        </div>
      </Modal>}

      {editor && <Modal title="New recipe" onClose={() => setEditor(false)}>
        <label className="field-label">Recipe name<input className="field" defaultValue="Friday fajita bowls" /></label>
        <div className="mb-3 flex items-end justify-between"><div><p className="font-semibold">Ingredients</p><p className="text-xs text-[#777a72]">{total} kcal total</p></div><button className="small-action" onClick={openScanner}><Icon name="scan" /> Add ingredient</button></div>
        <div className="space-y-2">
          {ingredients.map((item) => <div className="ingredient" key={item.id}>
            <div><input value={item.name} onChange={(e) => setIngredients((all) => all.map((x) => x.id === item.id ? {...x, name: e.target.value} : x))} /><span>{item.barcode ? `Scanned · ${item.barcode}` : 'Manual ingredient'}</span></div>
            <input className="cal-input" type="number" value={item.calories} onChange={(e) => setIngredients((all) => all.map((x) => x.id === item.id ? {...x, calories: Number(e.target.value)} : x))} />
            <button aria-label={`Remove ${item.name}`} onClick={() => setIngredients((all) => all.filter((x) => x.id !== item.id))}>×</button>
          </div>)}
        </div>
        <button className="primary mt-5 w-full" onClick={() => setEditor(false)}>Save to shared recipe book</button>
      </Modal>}

      {scanner && <Modal title="Scan food label" onClose={() => setScanner(false)}>
        <div className="scanner"><video ref={videoRef} muted playsInline /><div className="scan-line" /><span>Line up any barcode or QR code</span></div>
        <p className="my-4 text-center text-sm text-[#70746b]">Camera unavailable? Enter the code below.</p>
        <input className="field" value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="EAN, UPC, QR or other code" />
        <button className="primary mt-3 w-full" onClick={addScan}>Review scanned item</button>
      </Modal>}
      {screenshotImport && <Modal title="Recipe from screenshot" onClose={() => setScreenshotImport(false)}>
        <div className="upload-zone">
          <Icon name="camera" />
          <strong>{ocrBusy ? 'Reading your screenshot…' : 'Choose a recipe screenshot'}</strong>
          <span>Crop it to the caption or recipe for the best result.</span>
          <label className="primary">Choose image<input type="file" accept="image/*" onChange={(e) => readScreenshot(e.target.files?.[0])} /></label>
        </div>
        {(ocrText || ocrBusy) && <label className="field-label mt-4">Recognised recipe text<textarea className="field min-h-44" value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="Ingredients and method will appear here…" /></label>}
        <button className="primary mt-3 w-full" disabled={!ocrText || ocrBusy} onClick={() => { setScreenshotImport(false); setEditor(true) }}>Review & create recipe</button>
        <p className="privacy-note">The image is read on this device and is not added to your recipe book.</p>
      </Modal>}
    </main>
  )
}

function Home({ onQuiz, onSwipe, onPlan }: { onQuiz: () => void; onSwipe: () => void; onPlan: () => void }) {
  return <div>
    <section className="hero">
      <div><p className="eyebrow">Tuesday · Week 14</p><h1>Make dinner the<br />easy decision.</h1><p>Quick, lighter meals you’ll both actually want to eat.</p><div className="mt-7 flex flex-wrap gap-3"><button className="primary" onClick={onQuiz}>Find our mood</button><button className="secondary" onClick={onSwipe}><Icon name="heart" /> Start matching</button></div></div>
      <div className="hero-card"><span>Tonight</span><strong>Lemony pea orzo</strong><p>18 min · 412 kcal each</p><button onClick={onPlan}>View this week →</button></div>
    </section>
    <section className="mt-10"><div className="section-title"><div><p className="eyebrow">Shared plan</p><h2>Your week, sorted</h2></div><button onClick={onPlan}>Edit plan</button></div>
      <div className="week-grid">
        <button className="day-card weekday-card">
          <span>Mon–Thu</span>
          <b>Sticky gochujang chicken</b>
          <small>4 nights · 486 kcal</small>
        </button>
        {['Fri|Flexible Friday|Choose together','Sat|Turkey burgers|510 kcal','Sun|Tomato pasta|445 kcal'].map((d) => {
          const [day, meal, detail] = d.split('|')
          return <button key={day} className="day-card"><span>{day}</span><b>{meal}</b><small>{detail}</small></button>
        })}
      </div>
    </section>
    <section className="insight"><div><p className="eyebrow">Weekend guardrail</p><h3>You have 1,180 flexible calories left</h3><p>Enough room for a takeaway-style dinner and something sweet.</p></div><div className="ring"><strong>78%</strong><span>planned</span></div></section>
  </div>
}

function Swipe({ card, onVote, liked }: { card: typeof meals[number]; onVote: (yes: boolean) => void; liked: string[] }) {
  return <section className="swipe-wrap"><div className="text-center"><p className="eyebrow">Tonight’s match round</p><h1 className="page-title">Would you eat this?</h1><p className="muted">Your votes stay private until you both say yes.</p></div>
    <div className={`meal-card bg-gradient-to-br ${card.tone}`}><div className="meal-art"><span>quick dinner</span></div><div className="meal-info"><div><h2>{card.name}</h2><p>{card.note}</p></div><strong>{card.meta}</strong></div></div>
    <div className="vote-row"><button className="no" onClick={() => onVote(false)} aria-label="No">×</button><button className="shuffle" onClick={() => onVote(false)} aria-label="Shuffle"><Icon name="shuffle" /></button><button className="yes" onClick={() => onVote(true)} aria-label="Yes"><Icon name="heart" /></button></div>
    <p className="match-note">{liked.length ? `${liked.length} liked by you · waiting for Sam` : '12 meals in this round'}</p></section>
}

function Plan() {
  return <section><div className="section-title pt-8"><div><p className="eyebrow">6–12 April</p><h1 className="page-title">This week’s dinners</h1></div><button className="secondary"><Icon name="shuffle" /> Shuffle week</button></div>
    <div className="plan-list">
      <article className="repeat-plan">
        <div className="repeat-days">{['Mon','Tue','Wed','Thu'].map((day) => <span key={day}>{day}</span>)}</div>
        <div><small>Weeknight repeat</small><h2>Sticky gochujang chicken</h2><p>25 min · 486 kcal each night</p></div>
        <div className="repeat-note"><strong>4×</strong><span>same meal</span></div>
        <button aria-label="Change Monday to Thursday meal">•••</button>
      </article>
      {['10|Friday|Flexible Friday|Takeaway budget: 700 kcal','11|Saturday|Turkey smash burgers|25 min · 510 kcal','12|Sunday|Tomato & ricotta pasta|30 min · 445 kcal'].map((row) => {
        const [date, day, meal, meta] = row.split('|')
        return <article key={day} className="plan-row"><span>{date}</span><div><small>{day}</small><h3>{meal}</h3><p>{meta}</p></div><button aria-label={`Change ${day}`}>•••</button></article>
      })}
    </div>
  </section>
}

function Recipes({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  const bookMeals = [...meals,{name:'Turkey smash burgers',meta:'25 min · 510 kcal',note:'Weekend favourite',tone:'from-sky-200 to-indigo-300'}]
  return <section className="book-section"><div className="section-title pt-8"><div><p className="eyebrow">Shared with Sam</p><h1 className="page-title">Our recipe book</h1></div><div className="flex gap-2"><button className="secondary" onClick={onImport}><Icon name="camera" /> Read screenshot</button><button className="primary" onClick={onAdd}><Icon name="plus" /> New recipe</button></div></div>
    <div className="book-tip"><span>Swipe the pages</span><i>Recipes worth repeating, scribbles and all.</i></div>
    <div className="paper-book">
      {bookMeals.map((meal, index) => <article className="paper-page" key={meal.name}>
        <div className="page-number">— {String(index + 1).padStart(2,'0')} —</div>
        <p className="paper-kicker">{meal.note}</p><h2>{meal.name}</h2>
        <div className={`paper-photo bg-gradient-to-br ${meal.tone}`}><span>{meal.name.slice(0,1)}</span><em>weeknight favourite</em></div>
        <div className="paper-meta"><span>{meal.meta.split(' · ')[0]}<small>TIME</small></span><span>{meal.meta.split(' · ')[1]}<small>PER SERVING</small></span></div>
        <div className="paper-copy"><div><b>YOU’LL NEED</b><p>Fresh ingredients, pantry staples, and a little something spicy.</p></div><div><b>NOTES</b><p>Double it for lunch. Sam says: add more lime!</p></div></div>
        <button className="paper-action">Open full recipe →</button>
      </article>)}
      <button className="paper-page add-page" onClick={onAdd}><Icon name="plus" /><strong>Add your next keeper</strong><span>From a screenshot or from scratch</span></button>
    </div>
  </section>
}

function Wishlist({ wishes, onAdd }: { wishes: { title: string; url: string; by: string }[]; onAdd: (wish: { title: string; url: string; by: string }) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const submit = () => {
    if (!title.trim() || !url.trim()) return
    onAdd({ title: title.trim(), url: url.replace(/^https?:\/\//, '').split('/')[0], by: 'Alex' })
    setTitle(''); setUrl(''); setShowForm(false)
  }
  return <section><div className="section-title pt-8"><div><p className="eyebrow">Things to try together</p><h1 className="page-title">Recipe wishlist</h1></div><button className="primary" onClick={() => setShowForm(true)}><Icon name="plus" /> Add a link</button></div>
    <p className="muted mb-7 max-w-xl">Drop interesting recipes here as you find them. When you’re ready, move a favourite into your shared recipe book.</p>
    {showForm && <div className="wish-form"><label className="field-label">Recipe name<input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Crispy salmon rice bowl" /></label><label className="field-label">Recipe link<input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></label><button className="primary" onClick={submit}>Save to wishlist</button></div>}
    <div className="wish-grid">{wishes.map((wish, index) => <article className="wish-card" key={`${wish.title}-${index}`}><div className="wish-index">{String(index + 1).padStart(2,'0')}</div><Icon name="bookmark" /><p>{wish.url}</p><h2>{wish.title}</h2><span>Added by {wish.by}</span><div><button>Open link ↗</button><button>Made it</button></div></article>)}</div>
  </section>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose} aria-label="Close">×</button></div>{children}</div></div>
}
