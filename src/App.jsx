import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_BOOK_API_URL || 'https://book-manager-api.up.railway.app'

const G = {
  bg:      '#08080a',
  surface: '#101013',
  s2:      '#16161a',
  s3:      '#1e1e24',
  s4:      '#26262e',
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.11)',
  gold:    '#c9a84c',
  gold2:   '#e8c96e',
  gdim:    'rgba(201,168,76,0.13)',
  gglow:   'rgba(201,168,76,0.06)',
  text:    '#ede9e0',
  t2:      '#9b9790',
  t3:      '#54524d',
  green:   '#4db87a',
  gndim:   'rgba(77,184,122,0.13)',
  red:     '#e05555',
  reddim:  'rgba(224,85,85,0.13)',
  blue:    '#5b8dee',
  bdim:    'rgba(91,141,238,0.13)',
}

const MS_COLORS = {
  legal:'#5b8dee', manuscript:'#9b72ef', design:'#e8834a',
  publishing:'#4db87a', print:'#c9a84c', convention:'#e8c96e',
}

const DEFAULT_MILESTONES = [
  {id:'m1',label:'File Copyright',       date:'2026-04-14',type:'legal'},
  {id:'m2',label:'Purchase ISBN',         date:'2026-04-14',type:'legal'},
  {id:'m3',label:'Manuscript Final',      date:'2026-04-18',type:'manuscript'},
  {id:'m4',label:'Cover Design Due',      date:'2026-04-28',type:'design'},
  {id:'m5',label:'Interior Layout Done',  date:'2026-05-05',type:'design'},
  {id:'m6',label:'Upload to IngramSpark', date:'2026-05-08',type:'publishing'},
  {id:'m7',label:'Order Proof Copy',      date:'2026-05-10',type:'publishing'},
  {id:'m8',label:'Proof Approved',        date:'2026-05-18',type:'publishing'},
  {id:'m9',label:'Bulk Print Order',      date:'2026-05-19',type:'print'},
  {id:'m10',label:'Books Delivered',      date:'2026-06-05',type:'print'},
  {id:'m11',label:'🏛️ CONVENTION',       date:'2026-06-15',type:'convention'},
]

// ── API HELPERS ───────────────────────────────────────────────────────────────
async function apiFetch(path, opts={}) {
  try {
    const r = await fetch(`${API}${path}`, {
      headers: {'Content-Type':'application/json'},
      ...opts
    })
    const j = await r.json()
    return j.data || j
  } catch(e) {
    console.warn(`API ${path}:`, e.message)
    return null
  }
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function Badge({text, color}) {
  return (
    <span style={{padding:'2px 7px',borderRadius:10,background:`${color}18`,
      border:`1px solid ${color}40`,fontSize:9,color,fontWeight:700,letterSpacing:'.04em',
      textTransform:'uppercase',whiteSpace:'nowrap'}}>{text}</span>
  )
}

function Widget({icon, title, count, children, defaultOpen=true}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{background:G.s2,border:`1px solid ${G.border}`,borderRadius:10,overflow:'hidden',marginBottom:10}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:'10px 13px',borderBottom:open?`1px solid ${G.border}`:'none',
        display:'flex',alignItems:'center',gap:7,cursor:'pointer',transition:'background .15s'}}
        onMouseEnter={e=>e.currentTarget.style.background=G.s3}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <span>{icon}</span>
        <span style={{fontSize:11,fontWeight:700,color:G.text,flex:1}}>{title}</span>
        {count !== undefined && <span style={{fontFamily:'monospace',fontSize:10,color:G.t3}}>{count}</span>}
        <span style={{fontSize:9,color:G.t3,transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}>▼</span>
      </div>
      {open && <div style={{padding:12}}>{children}</div>}
    </div>
  )
}

// ── CALENDAR ─────────────────────────────────────────────────────────────────
function BookCalendar({milestones}) {
  const [calMonth, setCalMonth] = useState(3) // April
  const [calYear,  setCalYear]  = useState(2026)
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  const today = new Date()
  const convDays = Math.ceil((new Date('2026-06-15') - today) / 86400000)
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()

  const msMap = {}
  milestones.forEach(m => {
    const d = new Date(m.date+'T12:00:00')
    if (d.getFullYear()===calYear && d.getMonth()===calMonth) {
      if (!msMap[d.getDate()]) msMap[d.getDate()] = []
      msMap[d.getDate()].push(m)
    }
  })

  const upcoming = milestones
    .filter(m => new Date(m.date+'T12:00:00') >= today)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0,5)

  return (
    <Widget icon="📅" title="Book Calendar" count={`${convDays}d to conv.`}>
      {/* Convention banner */}
      <div style={{padding:'8px 10px',background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,
        border:`1px solid rgba(201,168,76,0.3)`,borderRadius:8,marginBottom:10,
        display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:18}}>🏛️</span>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:G.gold,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>Convention Deadline</div>
          <div style={{fontSize:13,fontWeight:800,color:G.text}}>Mid-June 2026</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:'monospace',fontSize:20,fontWeight:700,color:G.gold2}}>{convDays}</div>
          <div style={{fontSize:8,color:G.t3,letterSpacing:'.05em',textTransform:'uppercase'}}>days left</div>
        </div>
      </div>

      {/* Month nav */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <button onClick={()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--}setCalMonth(m);setCalYear(y)}}
          style={{background:'none',border:'none',color:G.t2,cursor:'pointer',fontSize:14,padding:'2px 6px'}}>‹</button>
        <div style={{fontSize:13,fontWeight:700,color:G.text}}>{months[calMonth]} {calYear}</div>
        <button onClick={()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++}setCalMonth(m);setCalYear(y)}}
          style={{background:'none',border:'none',color:G.t2,cursor:'pointer',fontSize:14,padding:'2px 6px'}}>›</button>
      </div>

      {/* Day headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:3}}>
        {['S','M','T','W','T','F','S'].map((d,i)=>(
          <div key={i} style={{textAlign:'center',fontSize:8,color:G.t3,fontWeight:700}}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} style={{height:24}}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const d=i+1
          const isToday = today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===d
          const ms = msMap[d]
          const m0 = ms?.[0]
          const col = m0 ? MS_COLORS[m0.type] : null
          const isConv = m0?.type==='convention'
          return (
            <div key={d} title={m0?.label||''} style={{
              height:24,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:'monospace',fontSize:9,position:'relative',
              background:isConv?col:isToday?G.gdim:ms?`${col}18`:'transparent',
              border:isConv?`1px solid ${col}`:isToday?`1px solid ${G.gold}`:ms?`1px solid ${col}55`:'none',
              color:isConv?'#000':isToday?G.gold:ms?col:G.t3,
              fontWeight:(isToday||ms)?700:400,
            }}>
              {d}
              {ms&&!isConv&&<div style={{position:'absolute',bottom:1,left:'50%',transform:'translateX(-50%)',
                width:3,height:3,borderRadius:'50%',background:col}}/>}
            </div>
          )
        })}
      </div>

      {/* Upcoming milestones */}
      <div style={{borderTop:`1px solid ${G.border}`,marginTop:10,paddingTop:8}}>
        <div style={{fontSize:9,color:G.t3,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:6}}>Upcoming</div>
        {upcoming.map(m=>{
          const d = new Date(m.date+'T12:00:00')
          const diff = Math.ceil((d-today)/86400000)
          const col = MS_COLORS[m.type]
          return (
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:7,padding:'4px 0',
              borderBottom:`1px solid ${G.border}`}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:col,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:G.text,fontWeight:600}}>{m.label}</div>
                <div style={{fontSize:9,color:G.t3}}>{d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
              </div>
              <div style={{fontSize:9,fontFamily:'monospace',fontWeight:700,
                color:diff<=7?G.red:diff<=14?G.gold:G.t3}}>{diff}d</div>
            </div>
          )
        })}
      </div>
    </Widget>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]        = useState('dashboard')
  const [dashboard,  setDashboard]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [messages,   setMessages]   = useState([{
    role:'agent',
    text:'**Book Manager Executive online.**\n\nLoading live project data from Airtable...'
  }])
  const [input,      setInput]      = useState('')
  const [sending,    setSending]    = useState(false)
  const [taskModal,  setTaskModal]  = useState(false)
  const [taskName,   setTaskName]   = useState('')
  const [tasks,      setTasks]      = useState([])
  const chatRef = useRef(null)

  // Load dashboard
  useEffect(()=>{
    loadDashboard()
  },[])

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  },[messages])

  async function loadDashboard() {
    setLoading(true)
    const data = await apiFetch('/api/book/dashboard')
    if(data) {
      setDashboard(data)
      setMessages([{role:'agent', text:
        `**Project loaded: ${data.project?.name || 'Tales from the Hood'}**\n\n` +
        `Phase: **${data.project?.phase || 'Writing'}** · Manuscript: **${data.manuscriptPct}%** · ` +
        `Convention: **${data.daysToConvention} days away**\n\n` +
        `Active blockers: **${data.blockers?.length || 0}** · Open tasks: **${data.openTasks?.length || 0}**\n\n` +
        `What do you want to tackle today?`
      }])
    }
    setLoading(false)
  }

  // Agent chat
  async function sendMessage(text) {
    const msg = text || input.trim()
    if(!msg) return
    setInput('')
    const newHistory = [...messages, {role:'user',text:msg}]
    setMessages(newHistory)
    setSending(true)

    const data = await apiFetch('/api/book/agent', {
      method:'POST',
      body: JSON.stringify({
        message: msg,
        history: messages.slice(-10).map(m=>({role:m.role==='agent'?'assistant':'user',content:m.text}))
      })
    })

    if(data?.reply) {
      setMessages(prev=>[...prev,{role:'agent',text:data.reply}])
    } else {
      setMessages(prev=>[...prev,{role:'agent',text:'Connection error. Please try again.'}])
    }
    setSending(false)
  }

  function saveTask(name) {
    if(!name.trim()) return
    const newTask = {id:Date.now(),name:name.trim(),done:false,created:new Date().toLocaleDateString()}
    setTasks(prev=>[newTask,...prev])
    // Also post to Airtable
    apiFetch('/api/book/tasks',{method:'POST',body:JSON.stringify({'Task Name':name.trim(),'Status':'Open','Source':'Agent Generated'})})
    setTaskModal(false)
    setTaskName('')
  }

  function fmtMsg(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\n\n/g,'<br><br>')
      .replace(/\n/g,'<br>')
  }

  const d = dashboard
  const project = d?.project || {}
  const chapters = d?.chapters || []
  const blockers = d?.blockers || []
  const openTasks = d?.openTasks || []
  const revenue = d?.revenue || {total:0,byPlatform:{}}
  const milestones = DEFAULT_MILESTONES
  const convDays = d?.daysToConvention || 0
  const msPct = d?.manuscriptPct || 0
  const pubPct = d?.publishingPct || 0

  const TABS = [
    {id:'dashboard',label:'Dashboard',icon:'📊'},
    {id:'chapters', label:'Chapters', icon:'📖'},
    {id:'tasks',    label:'Tasks',    icon:'✅'},
    {id:'expenses', label:'Expenses', icon:'💸'},
    {id:'revenue',  label:'Revenue',  icon:'💰'},
    {id:'marketing',label:'Marketing',icon:'📣'},
    {id:'presskit', label:'Press Kit',icon:'📰'},
  ]

  const statusColor = {Draft:G.t3,'In Review':G.blue,Edited:'#9b72ef',Final:G.green}

  return (
    <div style={{background:G.bg,color:G.text,minHeight:'100vh',fontFamily:"'DM Sans',system-ui,sans-serif"}}>

      {/* TOPBAR */}
      <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,
        display:'flex',alignItems:'center',gap:16,padding:'0 24px',height:56,position:'sticky',top:0,zIndex:100}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,#2a1f06,#4a3510)`,
          border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📖</div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:G.text,letterSpacing:'-.01em'}}>Book Manager</div>
          <div style={{fontSize:9,color:G.gold,letterSpacing:'.06em',textTransform:'uppercase'}}>Tales from the Hood · MotesArt</div>
        </div>

        {/* Metric strip */}
        <div style={{display:'flex',gap:0,marginLeft:'auto',borderLeft:`1px solid ${G.border}`}}>
          {[
            {label:'Phase',    val:project.phase||'Writing',   col:G.gold},
            {label:'Manuscript',val:`${msPct}%`,               col:'#9b72ef'},
            {label:'Publishing',val:`${pubPct}%`,              col:G.green},
            {label:'Revenue',   val:`$${(revenue.total||0).toFixed(0)}`, col:G.gold2},
            {label:'Convention',val:`${convDays}d`,            col:convDays<30?G.red:G.gold},
          ].map((m,i)=>(
            <div key={i} style={{padding:'6px 16px',borderRight:`1px solid ${G.border}`,textAlign:'right'}}>
              <div style={{fontFamily:'monospace',fontSize:13,fontWeight:700,color:m.col}}>{m.val}</div>
              <div style={{fontSize:8,color:G.t3,letterSpacing:'.05em',textTransform:'uppercase'}}>{m.label}</div>
            </div>
          ))}
        </div>

        <button onClick={loadDashboard} style={{padding:'6px 12px',background:G.gdim,
          border:`1px solid ${G.gold}`,borderRadius:6,color:G.gold,fontSize:10,fontWeight:700,
          cursor:'pointer',letterSpacing:'.03em',fontFamily:'inherit'}}>↻ SYNC</button>
      </div>

      {/* TABS */}
      <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,
        display:'flex',padding:'0 24px',overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'10px 16px',background:'none',border:'none',
            borderBottom:`2px solid ${tab===t.id?G.gold:'transparent'}`,
            color:tab===t.id?G.gold:G.t2,fontSize:11,fontWeight:700,
            cursor:'pointer',letterSpacing:'.04em',whiteSpace:'nowrap',
            fontFamily:'inherit',transition:'all .15s',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr 280px',gap:0,height:'calc(100vh - 106px)'}}>

        {/* LEFT */}
        <div style={{background:G.surface,borderRight:`1px solid ${G.border}`,overflowY:'auto',padding:'12px 0 24px'}}>

          {/* Convention Banner */}
          <div style={{margin:'0 10px 14px',padding:'10px 12px',
            background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,
            border:`1px solid rgba(201,168,76,0.3)`,borderRadius:10}}>
            <div style={{fontSize:9,color:G.gold,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>🏛️ Convention</div>
            <div style={{fontSize:15,fontWeight:800,color:G.text,marginTop:2}}>Mid-June 2026</div>
            <div style={{display:'flex',alignItems:'baseline',gap:4,marginTop:4}}>
              <span style={{fontFamily:'monospace',fontSize:22,fontWeight:700,color:G.gold2}}>{convDays}</span>
              <span style={{fontSize:9,color:G.t2}}>days left</span>
            </div>
          </div>

          {/* Blockers */}
          {blockers.length > 0 && (
            <div style={{padding:'0 10px',marginBottom:14}}>
              <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',padding:'0 4px',marginBottom:6}}>🚨 Active Blockers</div>
              <div style={{background:G.reddim,border:'1px solid rgba(224,85,85,0.22)',borderRadius:8,padding:'8px 10px'}}>
                {blockers.map((b,i)=>(
                  <div key={b.id||i} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0',
                    borderBottom:i<blockers.length-1?'1px solid rgba(224,85,85,0.1)':'none'}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:G.red,flexShrink:0}}/>
                    <div style={{fontSize:10,color:G.text}}>{b.name||b['Blocker Name']}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter status */}
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',padding:'0 14px',marginBottom:6}}>Chapters</div>
          {(chapters.length ? chapters : [
            {id:'0',number:'4',name:'Husband-Hood',status:'Draft',note:'⚠ Missing case study'},
            {id:'1',number:'5',name:'Father-Hood',status:'Draft',note:'⚠ Incomplete'},
          ]).map(ch=>{
            const st = ch.status||ch.Status||'Draft'
            const col = statusColor[st]||G.t3
            return (
              <div key={ch.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px',
                transition:'background .15s',cursor:'default'}}
                onMouseEnter={e=>e.currentTarget.style.background=G.s2}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:22,height:22,borderRadius:5,background:`${col}22`,
                  border:`1px solid ${col}55`,display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:9,color:col,fontWeight:700,flexShrink:0}}>{ch.number||ch['Chapter Number']}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:G.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ch.name||ch['Chapter Name']}</div>
                  <div style={{fontSize:9,color:G.t3,marginTop:1}}>{ch.note||st}</div>
                </div>
                <Badge text={st} color={col}/>
              </div>
            )
          })}

          {/* Open tasks */}
          {openTasks.length > 0 && (
            <>
              <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',padding:'10px 14px 4px'}}>Open Tasks</div>
              {openTasks.slice(0,5).map((t,i)=>(
                <div key={t.id||i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 14px'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:G.gold,flexShrink:0}}/>
                  <div style={{fontSize:10,color:G.t2,flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.name||t['Task Name']}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CENTER — AGENT */}
        <div style={{display:'flex',flexDirection:'column',background:G.bg,overflow:'hidden'}}>

          {/* Agent header */}
          <div style={{padding:'12px 18px',borderBottom:`1px solid ${G.border}`,background:G.surface,flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#1c1505,#3d2c0a)',
                border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📚</div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:G.text}}>Book Manager Executive</div>
                <div style={{fontSize:10,color:G.gold,letterSpacing:'.04em'}}>Writing · Publishing · Marketing · Revenue · Distribution · Narration</div>
              </div>
              <div style={{marginLeft:'auto',padding:'4px 10px',background:G.gdim,border:`1px solid ${G.gold}`,
                borderRadius:6,fontSize:10,color:G.gold,fontWeight:700}}>{project.phase||'Writing'}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:G.gglow,borderRadius:7}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:G.gold,animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:10,color:G.gold,fontWeight:700}}>PHASE: {(project.phase||'WRITING').toUpperCase()}</span>
              <span style={{fontSize:10,color:G.t2}}>→ Complete Ch.4 case study · File copyright ($65) · Purchase ISBN ($125)</span>
            </div>
          </div>

          {/* Chat */}
          <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:12}}>
            {loading && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:G.t3,fontSize:12}}>
                Loading project data...
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                <div style={{width:28,height:28,borderRadius:7,
                  background:m.role==='agent'?G.gdim:G.s3,
                  border:`1px solid ${m.role==='agent'?G.gold:G.border2}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                  {m.role==='agent'?'📚':'👤'}
                </div>
                <div style={{maxWidth:'76%',padding:'10px 14px',borderRadius:10,fontSize:12,lineHeight:1.65,
                  background:m.role==='agent'?G.surface:G.gdim,
                  border:`1px solid ${m.role==='agent'?G.border:'rgba(201,168,76,0.2)'}`,
                  borderTopLeftRadius:m.role==='agent'?3:10,
                  borderTopRightRadius:m.role==='user'?3:10}}>
                  <div style={{fontSize:9,color:G.t3,letterSpacing:'.06em',textTransform:'uppercase',fontWeight:700,marginBottom:4}}>
                    {m.role==='agent'?'Book Manager Executive':'Denarius'}
                  </div>
                  <div dangerouslySetInnerHTML={{__html:fmtMsg(m.text)}}/>
                  {m.role==='agent' && i>0 && (
                    <div style={{display:'flex',gap:5,marginTop:8,paddingTop:7,borderTop:`1px solid ${G.border}`}}>
                      <button onClick={()=>{setTaskName(m.text.split('\n')[0].replace(/[*#]/g,'').trim().substring(0,60));setTaskModal(true)}}
                        style={{padding:'3px 8px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:5,
                          color:G.t2,fontSize:9,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>+ Task</button>
                      <button onClick={()=>navigator.clipboard?.writeText(m.text)}
                        style={{padding:'3px 8px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:5,
                          color:G.t2,fontSize:9,cursor:'pointer',fontFamily:'inherit'}}>📋 Copy</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{display:'flex',gap:8}}>
                <div style={{width:28,height:28,borderRadius:7,background:G.gdim,border:`1px solid ${G.gold}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>📚</div>
                <div style={{padding:'10px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:'10px 10px 10px 3px'}}>
                  <div style={{display:'flex',gap:4}}>{[0,1,2].map(i=>(
                    <div key={i} style={{width:5,height:5,borderRadius:'50%',background:G.gold,
                      animation:`pulse 1.2s ${i*.2}s infinite`}}/>
                  ))}</div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{padding:'10px 18px',borderTop:`1px solid ${G.border}`,background:G.surface,flexShrink:0}}>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
              {[
                ['🎯 Daily Briefing',   'Give me today\'s highest-impact move for the book'],
                ['📲 Content Batch',    'Generate a 7-day social content batch for pre-launch'],
                ['⚖️ Copyright Now',   'Walk me through filing copyright at copyright.gov right now'],
                ['📦 KDP + Ingram',     'Walk me through KDP and IngramSpark setup step by step with URLs'],
                ['🎙️ Narration',        'What is the full ACX audiobook pipeline for Dr. Motes to record?'],
                ['📰 Press Kit',        'Build my full press kit: bio, Amazon description, interview questions, pitch email'],
              ].map(([label,prompt])=>(
                <button key={label} onClick={()=>sendMessage(prompt)}
                  style={{padding:'3px 9px',background:G.s3,border:`1px solid ${G.border}`,
                    borderRadius:12,fontSize:10,color:G.t2,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}
                  onMouseEnter={e=>{e.target.style.borderColor=G.gold;e.target.style.color=G.gold}}
                  onMouseLeave={e=>{e.target.style.borderColor=G.border;e.target.style.color=G.t2}}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}}
                placeholder="Ask the Book Manager anything..."
                rows={1} style={{flex:1,background:G.s2,border:`1px solid ${G.border2}`,borderRadius:9,
                  padding:'8px 12px',color:G.text,fontSize:12,resize:'none',outline:'none',fontFamily:'inherit',
                  minHeight:38,maxHeight:100}}
                onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}}
              />
              <button onClick={()=>sendMessage()} style={{width:36,height:36,background:G.gold,
                border:'none',borderRadius:9,color:'#000',cursor:'pointer',fontSize:14,fontWeight:700,flexShrink:0}}>➤</button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{background:G.surface,borderLeft:`1px solid ${G.border}`,overflowY:'auto',padding:12}}>
          <BookCalendar milestones={milestones}/>

          {/* Task engine */}
          <Widget icon="✅" title="Tasks" count={`${(tasks.length+openTasks.length)} open`}>
            {[...tasks,...openTasks.slice(0,5)].length === 0 ? (
              <div style={{fontSize:10,color:G.t3,textAlign:'center',padding:'8px 0'}}>No open tasks yet.</div>
            ) : (
              [...tasks,...openTasks.slice(0,5)].map((t,i)=>(
                <div key={t.id||i} style={{display:'flex',alignItems:'flex-start',gap:7,padding:'5px 0',
                  borderBottom:`1px solid ${G.border}`}}>
                  <div style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${G.border2}`,
                    background:t.done?G.green:'transparent',display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:8,color:'#000',flexShrink:0,marginTop:1,cursor:'pointer'}}
                    onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>
                    {t.done?'✓':''}
                  </div>
                  <div style={{flex:1,fontSize:10,color:t.done?G.t3:G.text,
                    textDecoration:t.done?'line-through':'none',lineHeight:1.3}}>
                    {t.name||t['Task Name']}
                  </div>
                </div>
              ))
            )}
            <button onClick={()=>setTaskModal(true)} style={{width:'100%',marginTop:8,padding:'5px',
              background:'transparent',border:`1px dashed ${G.border}`,borderRadius:6,
              color:G.t3,fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>+ Add Task</button>
          </Widget>

          {/* Revenue */}
          <Widget icon="💰" title="Revenue" count={`$${(revenue.total||0).toFixed(2)}`} defaultOpen={false}>
            <div style={{fontFamily:'monospace',fontSize:24,fontWeight:700,color:G.gold,marginBottom:4}}>
              ${(revenue.total||0).toFixed(2)}
            </div>
            <div style={{fontSize:9,color:G.t3,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:10}}>Total Lifetime Revenue</div>
            {['Amazon KDP','IngramSpark','ACX Audio','Direct'].map(p=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:`1px solid ${G.border}`}}>
                <div style={{fontSize:10,color:G.t3,textTransform:'uppercase',letterSpacing:'.03em'}}>{p}</div>
                <div style={{fontFamily:'monospace',fontSize:10,color:G.t2}}>
                  ${((revenue.byPlatform?.[p]?.gross)||0).toFixed(2)} · {(revenue.byPlatform?.[p]?.units)||0} units
                </div>
              </div>
            ))}
          </Widget>

          {/* Print budget */}
          <Widget icon="📦" title="Convention Print Budget" defaultOpen={false}>
            {[
              {label:'Copyright Filing',cost:'$65',urgent:true},
              {label:'ISBN (own it)',cost:'$125',urgent:true},
              {label:'Cover Design',cost:'$300–$1,500'},
              {label:'Interior Layout',cost:'$300–$800'},
              {label:'Proof Copy',cost:'~$25'},
              {label:'150 Hardcover Copies',cost:'~$1,350'},
              {label:'Shipping',cost:'~$120'},
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${G.border}`}}>
                <div style={{flex:1,fontSize:10,color:G.t2}}>{item.label}</div>
                <div style={{fontFamily:'monospace',fontSize:10,color:item.urgent?G.red:G.gold,fontWeight:700}}>{item.cost}</div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,paddingTop:8,borderTop:`1px solid ${G.border2}`}}>
              <div style={{fontSize:11,fontWeight:700,color:G.text}}>Total Est.</div>
              <div style={{fontFamily:'monospace',fontSize:13,fontWeight:700,color:G.gold2}}>~$2,285–$3,935</div>
            </div>
          </Widget>
        </div>
      </div>

      {/* TASK MODAL */}
      {taskModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',
          alignItems:'center',justifyContent:'center',zIndex:1000}}
          onClick={e=>{if(e.target===e.currentTarget)setTaskModal(false)}}>
          <div style={{background:G.s2,border:`1px solid ${G.border2}`,borderRadius:14,padding:24,width:380}}>
            <div style={{fontSize:18,fontWeight:800,color:G.text,marginBottom:16}}>Save as Task</div>
            <input value={taskName} onChange={e=>setTaskName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&saveTask(taskName)}
              placeholder="What needs to be done?" autoFocus
              style={{width:'100%',background:G.surface,border:`1px solid ${G.border2}`,borderRadius:7,
                padding:'8px 11px',color:G.text,fontSize:12,outline:'none',fontFamily:'inherit',
                marginBottom:14,boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setTaskModal(false)} style={{padding:'8px 16px',borderRadius:7,
                background:G.s3,border:`1px solid ${G.border}`,color:G.t2,cursor:'pointer',
                fontFamily:'inherit',fontSize:11,fontWeight:700}}>Cancel</button>
              <button onClick={()=>saveTask(taskName)} style={{padding:'8px 16px',borderRadius:7,
                background:G.gold,border:'none',color:'#000',cursor:'pointer',
                fontFamily:'inherit',fontSize:11,fontWeight:700}}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        *::-webkit-scrollbar{width:3px;height:3px}
        *::-webkit-scrollbar-thumb{background:#26262e;border-radius:2px}
        *::-webkit-scrollbar-track{background:transparent}
      `}</style>
    </div>
  )
}
