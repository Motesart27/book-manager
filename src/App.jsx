import { useState, useEffect, useRef } from 'react'
const BUILD_ID='v3.0-'+Date.now().toString(36)
const API = import.meta.env.VITE_BOOK_API_URL || 'https://book-manager-production-e2cc.up.railway.app'
const G = {bg:'#08080a',surface:'#101013',s2:'#16161a',s3:'#1e1e24',border:'rgba(255,255,255,0.06)',border2:'rgba(255,255,255,0.11)',gold:'#c9a84c',gold2:'#e8c96e',gdim:'rgba(201,168,76,0.13)',gglow:'rgba(201,168,76,0.06)',text:'#ede9e0',t2:'#9b9790',t3:'#54524d',green:'#4db87a',red:'#e05555',reddim:'rgba(224,85,85,0.13)',blue:'#5b8dee'}
const MS_COLORS = {legal:'#5b8dee',manuscript:'#9b72ef',design:'#e8834a',publishing:'#4db87a',print:'#c9a84c',convention:'#e8c96e'}
const MILESTONES = [
  {id:'m1',label:'File Copyright',date:'2026-04-14',type:'legal'},
  {id:'m2',label:'Purchase ISBN',date:'2026-04-14',type:'legal'},
  {id:'m3',label:'Manuscript Final',date:'2026-04-18',type:'manuscript'},
  {id:'m4',label:'Cover Design Due',date:'2026-04-28',type:'design'},
  {id:'m5',label:'Interior Layout Done',date:'2026-05-05',type:'design'},
  {id:'m6',label:'Upload to IngramSpark',date:'2026-05-08',type:'publishing'},
  {id:'m7',label:'Order Proof Copy',date:'2026-05-10',type:'publishing'},
  {id:'m8',label:'Proof Approved',date:'2026-05-18',type:'publishing'},
  {id:'m9',label:'Bulk Print Order',date:'2026-05-19',type:'print'},
  {id:'m10',label:'Books Delivered',date:'2026-06-05',type:'print'},
  {id:'m11',label:'CONVENTION',date:'2026-06-15',type:'convention'}
]
async function apiFetch(path,opts={}){try{const r=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json'},...opts});const j=await r.json();return j.data||j}catch(e){console.warn('API error:',e);return null}}
function Badge({text,color}){return <span style={{padding:'2px 7px',borderRadius:10,background:`${color}18`,border:`1px solid ${color}40`,fontSize:9,color,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{text}</span>}
function Widget({icon,title,count,children,defaultOpen=true}){const[open,setOpen]=useState(defaultOpen);return(<div style={{background:G.s2,border:`1px solid ${G.border}`,borderRadius:10,overflow:'hidden',marginBottom:10}}><div onClick={()=>setOpen(o=>!o)} style={{padding:'10px 13px',borderBottom:open?`1px solid ${G.border}`:'none',display:'flex',alignItems:'center',gap:7,cursor:'pointer'}}><span>{icon}</span><span style={{fontSize:11,fontWeight:700,color:G.text,flex:1}}>{title}</span>{count!==undefined&&<span style={{fontFamily:'monospace',fontSize:10,color:G.t3}}>{count}</span>}<span style={{fontSize:9,color:G.t3,transform:open?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>▼</span></div>{open&&<div style={{padding:12}}>{children}</div>}</div>)}

export default function App(){
  const[tab,setTab]=useState('chat')
  const[dash,setDash]=useState(null)
  const[loading,setLoading]=useState(true)
  const[msgs,setMsgs]=useState([{role:'agent',text:'**Book Manager Executive online.**\n\nLoading project data...'}])
  const[input,setInput]=useState('')
  const[sending,setSending]=useState(false)
  const[taskModal,setTaskModal]=useState(false)
  const[taskName,setTaskName]=useState('')
  const chatRef=useRef(null)
  const[apiTime,setApiTime]=useState('')
  const[updatingTask,setUpdatingTask]=useState(null)
  const[purchased,setPurchased]=useState(()=>{try{return JSON.parse(localStorage.getItem('bm_purchased')||'{}')}catch{return{}}})
  const[selectedMilestone,setSelectedMilestone]=useState(null)

  useEffect(()=>{loadDash()},[])
  useEffect(()=>{localStorage.setItem('bm_purchased',JSON.stringify(purchased))},[purchased])
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight},[msgs])

  async function loadDash(){
    setLoading(true)
    const d=await apiFetch('/api/book/dashboard')
    if(d){
      setDash(d)
      setApiTime(d.generatedAt||'')
      setMsgs([{role:'agent',text:`**Project: ${d.project?.name||'Tales from the Hood'}**\n\nPhase: **${d.project?.phase||'Writing'}** | Manuscript: **${d.manuscriptPct}%** | Convention: **${d.daysToConvention} days away**\n\nBlockers: **${d.blockers?.length||0}** | Open tasks: **${d.openTasks?.length||0}**\n\nWhat do you want to tackle today?`}])
    }
    setLoading(false)
  }

  async function send(text){
    const msg=text||input.trim()
    if(!msg)return
    setInput('')
    setMsgs(prev=>[...prev,{role:'user',text:msg}])
    setSending(true)
    const d=await apiFetch('/api/book/agent',{method:'POST',body:JSON.stringify({message:msg,history:msgs.slice(-10).map(m=>({role:m.role==='agent'?'assistant':'user',content:m.text}))})})
    setMsgs(prev=>[...prev,{role:'agent',text:d?.reply||'Connection error. Please try again.'}])
    setSending(false)
  }

  async function toggleTask(tid,currentStatus){
    setUpdatingTask(tid)
    const newStatus=currentStatus==='Done'?'Open':'Done'
    await apiFetch('/api/book/tasks/'+tid,{method:'PATCH',body:JSON.stringify({Status:newStatus})})
    await loadDash()
    setUpdatingTask(null)
  }

  function togglePurchased(id){setPurchased(p=>({...p,[id]:!p[id]}))}

  async function createTask(name){
    if(!name.trim())return
    await apiFetch('/api/book/tasks',{method:'POST',body:JSON.stringify({'Task Name':name.trim(),'Status':'Open','Priority':'Medium'})})
    await loadDash()
    setTaskModal(false)
    setTaskName('')
  }

  function fmt(text){return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>')}

  const d=dash,project=d?.project||{},chapters=d?.chapters||[],blockers=d?.blockers||[],openTasks=d?.openTasks||[],revenue=d?.revenue||{total:0,byPlatform:{}}
  const convDays=d?.daysToConvention||0,msPct=d?.manuscriptPct||0,pubPct=d?.publishingPct||0
  const sortedTasks=[...openTasks].sort((a,b)=>{const p={High:0,Medium:1,Low:2};return(p[a.priority]||1)-(p[b.priority]||1)})
  const nextTask=sortedTasks[0]
  const statusColor={Draft:G.t3,'In Review':G.blue,Edited:'#9b72ef',Final:G.green}
  const today=new Date()
  const convDaysCalc=Math.ceil((new Date('2026-06-15')-today)/86400000)

  const BUDGET_ITEMS=[{id:'b1',label:'Copyright Filing',cost:65,urgent:true},{id:'b2',label:'ISBN',cost:125,urgent:true},{id:'b3',label:'Cover Design',cost:900},{id:'b4',label:'Interior Layout',cost:550},{id:'b5',label:'Proof Copy',cost:25},{id:'b6',label:'150 Hardcovers',cost:1350},{id:'b7',label:'Shipping',cost:120}]
  const budgetTotal=BUDGET_ITEMS.reduce((s,i)=>s+i.cost,0)
  const budgetSpent=BUDGET_ITEMS.filter(i=>purchased[i.id]).reduce((s,i)=>s+i.cost,0)
  const budgetRemaining=budgetTotal-budgetSpent
  const purchasedCount=BUDGET_ITEMS.filter(i=>purchased[i.id]).length

  const convDate=new Date('2026-06-15')
  const upcoming=MILESTONES.filter(m=>new Date(m.date+'T12:00:00')>=new Date(today.getFullYear(),today.getMonth(),today.getDate())).sort((a,b)=>new Date(a.date)-new Date(b.date))

  const weeks=[]
  const weekStart=new Date(today)
  weekStart.setDate(weekStart.getDate()-weekStart.getDay())
  const ws=new Date(weekStart)
  while(ws<=convDate){
    const wEnd=new Date(ws);wEnd.setDate(wEnd.getDate()+6)
    const wMilestones=MILESTONES.filter(m=>{const md=new Date(m.date+'T12:00:00');return md>=ws&&md<=wEnd})
    const weekLabel=ws.toLocaleDateString('en-US',{month:'short',day:'numeric'})
    const isCurrentWeek=today>=ws&&today<=wEnd
    const isPast=wEnd<today
    weeks.push({start:new Date(ws),end:new Date(wEnd),label:weekLabel,milestones:wMilestones,isCurrent:isCurrentWeek,isPast})
    ws.setDate(ws.getDate()+7)
  }

  const TABS=[{id:'chat',label:'Chat',icon:'◬'},{id:'overview',label:'Overview',icon:'◫'},{id:'chapters',label:'Chapters',icon:'☰'},{id:'calendar',label:'Timeline',icon:'▦'},{id:'tasks',label:'Tasks',icon:'◉'},{id:'budget',label:'Budget',icon:'◈'}]
  const QUICK=[['Daily','Give me today\'s highest-impact move for the book'],['Content','Generate a 7-day social content batch for pre-launch'],['Copyright','Walk me through filing copyright at copyright.gov right now'],['Publishing','Walk me through KDP and IngramSpark setup step by step with URLs'],['Narration','What is the full ACX audiobook pipeline for Dr. Motes to record?'],['Press Kit','Build my full press kit: bio, Amazon description, interview questions, pitch email']]

  return(
    <div style={{background:G.bg,color:G.text,height:'100dvh',fontFamily:"'DM Sans',system-ui,sans-serif",display:'flex',flexDirection:'column',overflow:'hidden',paddingTop:'env(safe-area-inset-top)'}}>
      {/* TOPBAR */}
      <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:10,padding:'0 calc(14px + env(safe-area-inset-right)) 0 calc(14px + env(safe-area-inset-left))',height:52,flexShrink:0}}>
        <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#2a1f06,#4a3510)',border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,color:G.gold,fontWeight:700}}>BM</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:800,color:G.text}}>Book Manager</div><div style={{fontSize:8,color:G.gold,letterSpacing:'.06em',textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Tales from the Hood · MotesArt</div></div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{textAlign:'center',padding:'3px 8px',background:G.gdim,border:`1px solid ${G.gold}44`,borderRadius:6}}><div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:G.gold}}>{msPct}%</div><div style={{fontSize:7,color:G.t3,textTransform:'uppercase'}}>Draft</div></div>
          <div style={{textAlign:'center',padding:'3px 8px',background:convDaysCalc<30?'rgba(224,85,85,0.1)':G.gdim,border:`1px solid ${convDaysCalc<30?G.red:G.gold}44`,borderRadius:6}}><div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:convDaysCalc<30?G.red:G.gold}}>{convDaysCalc}d</div><div style={{fontSize:7,color:G.t3,textTransform:'uppercase'}}>Conv.</div></div>
          <button onClick={loadDash} style={{padding:'5px 9px',background:G.gdim,border:`1px solid ${G.gold}`,borderRadius:6,color:G.gold,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>↻</button>
        </div>
      </div>
      <div style={{background:G.s2,padding:'2px 14px',fontSize:8,fontFamily:'monospace',color:G.t3,display:'flex',justifyContent:'space-between',flexShrink:0}}><span>{BUILD_ID}</span><span>API: {apiTime?.substring?.(11,19)||'...'}</span><span>{tab}</span></div>

      {/* CONTENT */}
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>

        {/* CHAT */}
        {tab==='chat'&&<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
            {loading&&<div style={{textAlign:'center',padding:40,color:G.t3,fontSize:12}}>Loading project data...</div>}
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                <div style={{width:28,height:28,borderRadius:8,background:m.role==='agent'?G.gdim:G.s3,border:`1px solid ${m.role==='agent'?G.gold:G.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,flexShrink:0,color:m.role==='agent'?G.gold:G.t2,fontWeight:700}}>{m.role==='agent'?'BM':'You'}</div>
                <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:12,fontSize:13,lineHeight:1.6,background:m.role==='agent'?G.surface:G.gdim,border:`1px solid ${m.role==='agent'?G.border:'rgba(201,168,76,0.2)'}`,borderTopLeftRadius:m.role==='agent'?3:12,borderTopRightRadius:m.role==='user'?3:12}}>
                  <div style={{fontSize:8,color:G.t3,letterSpacing:'.06em',textTransform:'uppercase',fontWeight:700,marginBottom:4}}>{m.role==='agent'?'Book Manager Executive':'Denarius'}</div>
                  <div dangerouslySetInnerHTML={{__html:fmt(m.text)}}/>
                  {m.role==='agent'&&i>0&&<div style={{display:'flex',gap:6,marginTop:8,paddingTop:7,borderTop:`1px solid ${G.border}`}}>
                    <button onClick={()=>{setTaskName(m.text.split('\n')[0].replace(/[*#]/g,'').trim().substring(0,60));setTaskModal(true)}} style={{padding:'4px 10px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:6,color:G.t2,fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>+ Task</button>
                    <button onClick={()=>navigator.clipboard?.writeText(m.text)} style={{padding:'4px 10px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:6,color:G.t2,fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>Copy</button>
                  </div>}
                </div>
              </div>
            ))}
            {sending&&<div style={{display:'flex',gap:8}}><div style={{width:28,height:28,borderRadius:8,background:G.gdim,border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:G.gold,fontWeight:700}}>BM</div><div style={{padding:'10px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:'12px 12px 12px 3px'}}><div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:G.gold,animation:`pulse 1.2s ${i*.2}s infinite`}}/>)}</div></div></div>}
          </div>
          <div style={{padding:'8px 14px 6px',display:'flex',gap:6,overflowX:'auto',flexShrink:0}}>
            {QUICK.map(([label,prompt])=><button key={label} onClick={()=>send(prompt)} style={{padding:'5px 11px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:14,fontSize:11,color:G.t2,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0}}>{label}</button>)}
          </div>
          <div style={{padding:'10px 14px',paddingBottom:'calc(10px + env(safe-area-inset-bottom))',borderTop:`1px solid ${G.border}`,background:G.surface,display:'flex',gap:8,alignItems:'flex-end',flexShrink:0}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask the Book Manager anything..." rows={1} style={{flex:1,background:G.s2,border:`1px solid ${G.border2}`,borderRadius:10,padding:'9px 13px',color:G.text,fontSize:14,resize:'none',outline:'none',fontFamily:'inherit',minHeight:40,maxHeight:120}} onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}/>
            <button onClick={()=>send()} style={{width:40,height:40,background:G.gold,border:'none',borderRadius:10,color:'#000',cursor:'pointer',fontSize:16,fontWeight:700,flexShrink:0}}>➤</button>
          </div>
        </div>}

        {/* OVERVIEW */}
        {tab==='overview'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            {[{label:'Phase',val:project.phase||'Writing',col:G.gold},{label:'Manuscript',val:`${msPct}%`,col:'#9b72ef'},{label:'Publishing',val:`${pubPct}%`,col:G.green},{label:'Convention',val:`${convDaysCalc}d left`,col:convDaysCalc<30?G.red:G.gold}].map((s,i)=><div key={i} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:'12px 14px'}}><div style={{fontFamily:'monospace',fontSize:18,fontWeight:700,color:s.col}}>{s.val}</div><div style={{fontSize:9,color:G.t3,textTransform:'uppercase',letterSpacing:'.05em',marginTop:3}}>{s.label}</div></div>)}
          </div>
          <div style={{padding:'14px',background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,border:`1px solid rgba(201,168,76,0.3)`,borderRadius:12,marginBottom:12,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:28}}>▸</span><div style={{flex:1}}><div style={{fontSize:10,color:G.gold,fontWeight:700,textTransform:'uppercase'}}>Convention Deadline</div><div style={{fontSize:16,fontWeight:800,color:G.text}}>June 15, 2026 — PAW</div></div>
            <div style={{textAlign:'right'}}><div style={{fontFamily:'monospace',fontSize:28,fontWeight:700,color:G.gold2}}>{convDaysCalc}</div><div style={{fontSize:8,color:G.t3,textTransform:'uppercase'}}>days left</div></div>
          </div>
          {blockers.length>0&&<div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Active Blockers ({blockers.length})</div>
            <div style={{background:G.reddim,border:'1px solid rgba(224,85,85,0.22)',borderRadius:10,padding:'10px 12px'}}>
              {blockers.map((b,i)=><div key={b.id||i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:i<blockers.length-1?'1px solid rgba(224,85,85,0.1)':'none'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:b.severity==='Critical'?G.red:G.gold,flexShrink:0}}/>
                <div style={{fontSize:12,color:G.text,flex:1}}>{b.name||b['Blocker Name']}</div>
                {b.severity&&<Badge text={b.severity} color={b.severity==='Critical'?G.red:G.gold}/>}
              </div>)}
            </div>
          </div>}
          {nextTask&&<div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Next Up</div>
            <div style={{background:G.gdim,border:`1px solid rgba(201,168,76,0.25)`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:G.gold,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:G.text}}>{nextTask.name}</div><div style={{fontSize:10,color:G.t3,marginTop:2}}>{nextTask.module} · {nextTask.priority}</div></div>
            </div>
          </div>}
          <Widget icon="◈" title="Revenue" count={`$${(revenue.total||0).toFixed(2)}`} defaultOpen={false}>
            <div style={{fontFamily:'monospace',fontSize:24,fontWeight:700,color:G.gold,marginBottom:10}}>${(revenue.total||0).toFixed(2)}</div>
            {['Amazon KDP','IngramSpark','ACX Audio','Direct'].map(p=><div key={p} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${G.border}`}}><div style={{fontSize:11,color:G.t3,textTransform:'uppercase'}}>{p}</div><div style={{fontFamily:'monospace',fontSize:11,color:G.t2}}>${((revenue.byPlatform?.[p]?.gross)||0).toFixed(2)}</div></div>)}
          </Widget>
        </div>}

        {/* CHAPTERS */}
        {tab==='chapters'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Chapter Status ({chapters.length||0})</div>
          {chapters.map(ch=>{const st=ch.status||ch.Status||'Draft',col=statusColor[st]||G.t3;return(
            <div key={ch.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:`${col}22`,border:`1px solid ${col}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:col,fontWeight:700,flexShrink:0}}>{ch.number||ch['Chapter Number']||'?'}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:G.text,marginBottom:3}}>{ch.name||ch['Chapter Name']||'Untitled'}</div>
                <div style={{fontSize:11,color:G.t3}}>{ch.caseStudyStatus==='Missing'?'Case study needed':st}</div>
              </div>
              <Badge text={st} color={col}/>
            </div>
          )})}
          {chapters.length===0&&<div style={{textAlign:'center',color:G.t3,fontSize:13,padding:40}}>No chapters loaded. Tap ↻ to refresh.</div>}
        </div>}

        {/* TIMELINE */}
        {tab==='calendar'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          {/* Countdown Header */}
          <div style={{background:`linear-gradient(135deg,${G.s2},${G.surface})`,border:`1px solid ${G.border2}`,borderRadius:12,padding:'16px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div><div style={{fontSize:9,color:G.gold,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Convention Countdown</div><div style={{fontSize:11,color:G.t2,marginTop:2}}>PAW Convention · June 15, 2026</div></div>
              <div style={{textAlign:'right'}}><div style={{fontFamily:'monospace',fontSize:32,fontWeight:800,color:convDaysCalc<=30?G.red:convDaysCalc<=45?G.gold:G.gold2,lineHeight:1}}>{convDaysCalc}</div><div style={{fontSize:8,color:G.t3,textTransform:'uppercase',letterSpacing:'.06em'}}>days</div></div>
            </div>
            <div style={{position:'relative',height:6,background:G.s3,borderRadius:3,overflow:'hidden'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',borderRadius:3,background:`linear-gradient(90deg,${G.gold},${G.gold2})`,width:`${Math.max(2,Math.min(98,(1-convDaysCalc/90)*100))}%`,transition:'width 0.5s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}><span style={{fontSize:8,color:G.t3}}>Today</span><span style={{fontSize:8,color:G.t3}}>June 15</span></div>
          </div>

          {/* Legend */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
            {Object.entries(MS_COLORS).map(([k,v])=><div key={k} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:2,background:v}}/><span style={{fontSize:9,color:G.t3,textTransform:'capitalize'}}>{k}</span></div>)}
          </div>

          {/* Week Timeline */}
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Week-by-Week Timeline</div>
          {weeks.map((w,wi)=>{
            const hasMs=w.milestones.length>0
            return(
              <div key={wi} style={{marginBottom:2,position:'relative'}}>
                {wi<weeks.length-1&&<div style={{position:'absolute',left:11,top:24,bottom:-2,width:1,background:w.isPast?G.border:G.border2,zIndex:0}}/>}
                <div style={{display:'flex',gap:10,padding:'8px 0',position:'relative',zIndex:1}}>
                  <div style={{width:22,height:22,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,background:w.isCurrent?G.gold:w.isPast?G.s3:G.s2,border:`1.5px solid ${w.isCurrent?G.gold2:w.isPast?G.border:G.border2}`}}>
                    {w.isCurrent&&<div style={{width:8,height:8,borderRadius:4,background:'#000'}}/>}
                    {w.isPast&&<span style={{fontSize:9,color:G.t3}}>✓</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:hasMs?6:0}}>
                      <span style={{fontSize:11,fontWeight:w.isCurrent?800:600,color:w.isCurrent?G.gold:w.isPast?G.t3:G.text}}>{w.label}</span>
                      {w.isCurrent&&<span style={{fontSize:8,background:G.gdim,border:`1px solid ${G.gold}44`,borderRadius:4,padding:'1px 5px',color:G.gold,fontWeight:700}}>NOW</span>}
                    </div>
                    {hasMs&&<div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {w.milestones.map(m=>{
                        const col=MS_COLORS[m.type]||G.t3
                        const dt=new Date(m.date+'T12:00:00')
                        const diff=Math.ceil((dt-today)/86400000)
                        const isConv=m.type==='convention'
                        return(
                          <div key={m.id} onClick={()=>setSelectedMilestone(selectedMilestone===m.id?null:m.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:isConv?`${col}22`:selectedMilestone===m.id?`${col}15`:`${col}08`,border:`1px solid ${isConv?col:`${col}33`}`,borderRadius:8,cursor:'pointer',transition:'all 0.15s'}}>
                            <div style={{width:6,height:6,borderRadius:isConv?1:3,background:col,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:isConv?800:600,color:isConv?col:G.text}}>{m.label}</div>
                              <div style={{fontSize:9,color:G.t3}}>{dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
                            </div>
                            <div style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:diff<=0?G.green:diff<=7?G.red:diff<=14?G.gold:G.t2}}>{diff<=0?'NOW':`${diff}d`}</div>
                          </div>
                        )
                      })}
                    </div>}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Next Milestones */}
          <div style={{marginTop:14,background:G.s2,border:`1px solid ${G.border}`,borderRadius:10,padding:'12px'}}>
            <div style={{fontSize:9,color:G.t3,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Next Milestones</div>
            {upcoming.slice(0,5).map(m=>{
              const col=MS_COLORS[m.type]
              const dt=new Date(m.date+'T12:00:00')
              const diff=Math.ceil((dt-today)/86400000)
              return(
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${G.border}`}}>
                  <div style={{width:3,height:20,borderRadius:2,background:col,flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontSize:11,color:G.text,fontWeight:600}}>{m.label}</div><div style={{fontSize:9,color:G.t3}}>{dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div>
                  <div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:diff<=7?G.red:diff<=14?G.gold:G.t2}}>{diff}d</div>
                </div>
              )
            })}
          </div>
        </div>}

        {/* TASKS */}
        {tab==='tasks'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase'}}>Open Tasks ({sortedTasks.length})</div>
            <button onClick={()=>setTaskModal(true)} style={{padding:'6px 14px',background:G.gdim,border:`1px solid ${G.gold}`,borderRadius:8,color:G.gold,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Add Task</button>
          </div>
          {nextTask&&<div style={{marginBottom:12,padding:'12px 14px',background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,border:`1px solid rgba(201,168,76,0.25)`,borderRadius:12}}>
            <div style={{fontSize:8,color:G.gold,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Next Up</div>
            <div style={{fontSize:14,fontWeight:700,color:G.text}}>{nextTask.name}</div>
            <div style={{fontSize:10,color:G.t2,marginTop:3}}>{nextTask.module&&`${nextTask.module} · `}{nextTask.priority} Priority{nextTask.due&&` · Due ${nextTask.due}`}</div>
          </div>}
          {sortedTasks.map(t=>{
            const isUpdating=updatingTask===t.id
            const pColor={High:G.red,Medium:G.gold,Low:G.t3}[t.priority]||G.t3
            return(
              <div key={t.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,marginBottom:8,opacity:isUpdating?0.5:1,transition:'opacity 0.2s'}}>
                <div onClick={()=>!isUpdating&&toggleTask(t.id,t.status)} style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${t.status==='Done'?G.green:G.border2}`,background:t.status==='Done'?G.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#000',flexShrink:0,marginTop:1,cursor:isUpdating?'wait':'pointer'}}>
                  {isUpdating?<div style={{width:10,height:10,border:`2px solid ${G.gold}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>:t.status==='Done'?'✓':''}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:t.status==='Done'?G.t3:G.text,textDecoration:t.status==='Done'?'line-through':'none',lineHeight:1.4,fontWeight:600}}>{t.name||t['Task Name']}</div>
                  <div style={{display:'flex',gap:6,marginTop:4,alignItems:'center',flexWrap:'wrap'}}>
                    {t.module&&<span style={{fontSize:9,color:G.t3}}>{t.module}</span>}
                    <Badge text={t.priority||'Medium'} color={pColor}/>
                    {t.due&&<span style={{fontSize:9,color:G.t3}}>{t.due}</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {sortedTasks.length===0&&!loading&&<div style={{textAlign:'center',color:G.t3,fontSize:13,padding:40}}>No open tasks. Tap + Add Task to create one.</div>}
        </div>}

        {/* BUDGET */}
        {tab==='budget'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Convention Print Budget</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
            <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:16,fontWeight:700,color:G.gold}}>${budgetTotal.toLocaleString()}</div>
              <div style={{fontSize:8,color:G.t3,textTransform:'uppercase',marginTop:2}}>Total</div>
            </div>
            <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:16,fontWeight:700,color:G.green}}>${budgetSpent.toLocaleString()}</div>
              <div style={{fontSize:8,color:G.t3,textTransform:'uppercase',marginTop:2}}>Spent</div>
            </div>
            <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:16,fontWeight:700,color:budgetRemaining>0?G.gold2:G.green}}>${budgetRemaining.toLocaleString()}</div>
              <div style={{fontSize:8,color:G.t3,textTransform:'uppercase',marginTop:2}}>Remaining</div>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:9,color:G.t3}}>{purchasedCount}/{BUDGET_ITEMS.length} items purchased</span>
              <span style={{fontSize:9,color:G.t3,fontFamily:'monospace'}}>{Math.round(purchasedCount/BUDGET_ITEMS.length*100)}%</span>
            </div>
            <div style={{height:4,background:G.s3,borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${G.green},${G.gold})`,width:`${purchasedCount/BUDGET_ITEMS.length*100}%`,transition:'width 0.3s'}}/>
            </div>
          </div>
          {BUDGET_ITEMS.map(item=>{
            const isPurchased=purchased[item.id]
            return(
              <div key={item.id} onClick={()=>togglePurchased(item.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:isPurchased?`${G.green}08`:G.surface,border:`1px solid ${isPurchased?`${G.green}33`:item.urgent?'rgba(224,85,85,0.3)':G.border}`,borderRadius:12,marginBottom:8,cursor:'pointer',transition:'all 0.15s'}}>
                <div style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${isPurchased?G.green:G.border2}`,background:isPurchased?G.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#000',flexShrink:0}}>
                  {isPurchased?'✓':''}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:isPurchased?G.t2:G.text,textDecoration:isPurchased?'line-through':'none',fontWeight:600}}>{item.label}</div>
                </div>
                {item.urgent&&!isPurchased&&<span style={{fontSize:8,background:'rgba(224,85,85,0.15)',color:G.red,border:'1px solid rgba(224,85,85,0.3)',borderRadius:4,padding:'1px 5px',fontWeight:700}}>URGENT</span>}
                <div style={{fontFamily:'monospace',fontSize:13,color:isPurchased?G.t3:item.urgent?G.red:G.gold,fontWeight:700}}>${item.cost.toLocaleString()}</div>
              </div>
            )
          })}
        </div>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:G.surface,borderTop:`1px solid ${G.border}`,display:'flex',flexShrink:0,paddingBottom:'calc(4px + env(safe-area-inset-bottom))',paddingLeft:'env(safe-area-inset-left)',paddingRight:'env(safe-area-inset-right)',position:'relative',zIndex:9999}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'10px 2px 6px',background:'none',border:'none',borderTop:`2px solid ${tab===t.id?G.gold:'transparent'}`,color:tab===t.id?G.gold:G.t3,cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:3,position:'relative',zIndex:10000,minHeight:48}}><span style={{fontSize:18}}>{t.icon}</span><span style={{fontSize:8,fontWeight:700}}>{t.label}</span></button>)}
      </div>

      {/* TASK MODAL */}
      {taskModal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',zIndex:20000}} onClick={e=>{if(e.target===e.currentTarget)setTaskModal(false)}}>
        <div style={{background:G.s2,border:`1px solid ${G.border2}`,borderRadius:'18px 18px 0 0',padding:'20px',width:'100%',boxSizing:'border-box',paddingBottom:'calc(20px + env(safe-area-inset-bottom))'}}>
          <div style={{width:40,height:4,borderRadius:2,background:G.border2,margin:'0 auto 18px'}}/>
          <div style={{fontSize:17,fontWeight:800,color:G.text,marginBottom:14}}>Save as Task</div>
          <input value={taskName} onChange={e=>setTaskName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createTask(taskName)} placeholder="What needs to be done?" autoFocus style={{width:'100%',background:G.surface,border:`1px solid ${G.border2}`,borderRadius:10,padding:'11px 14px',color:G.text,fontSize:15,outline:'none',fontFamily:'inherit',marginBottom:14,boxSizing:'border-box'}}/>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setTaskModal(false)} style={{flex:1,padding:'12px',borderRadius:10,background:G.s3,border:`1px solid ${G.border}`,color:G.t2,cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}>Cancel</button>
            <button onClick={()=>createTask(taskName)} style={{flex:1,padding:'12px',borderRadius:10,background:G.gold,border:'none',color:'#000',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}>Save Task</button>
          </div>
        </div>
      </div>}

      {/* Milestone Detail Modal */}
      {selectedMilestone&&(()=>{
        const m=MILESTONES.find(ms=>ms.id===selectedMilestone)
        if(!m)return null
        const col=MS_COLORS[m.type]
        const dt=new Date(m.date+'T12:00:00')
        const diff=Math.ceil((dt-today)/86400000)
        return(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:20000,padding:20}} onClick={()=>setSelectedMilestone(null)}>
            <div style={{background:G.s2,border:`1px solid ${col}44`,borderRadius:14,padding:20,maxWidth:320,width:'100%'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:2,background:col}}/>
                <span style={{fontSize:9,color:col,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{m.type}</span>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:G.text,marginBottom:6}}>{m.label}</div>
              <div style={{fontSize:12,color:G.t2,marginBottom:12}}>{dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
              <div style={{flex:1,background:G.surface,borderRadius:8,padding:'10px',textAlign:'center'}}><div style={{fontFamily:'monospace',fontSize:20,fontWeight:700,color:diff<=0?G.green:diff<=7?G.red:col}}>{diff<=0?'TODAY':`${diff}d`}</div><div style={{fontSize:8,color:G.t3,textTransform:'uppercase'}}>Until Due</div></div>
              <button onClick={()=>setSelectedMilestone(null)} style={{width:'100%',padding:10,marginTop:12,background:G.s3,border:`1px solid ${G.border}`,borderRadius:8,color:G.t2,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Close</button>
            </div>
          </div>
        )
      })()}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *::-webkit-scrollbar{width:3px;height:3px}
        *::-webkit-scrollbar-thumb{background:#26262e;border-radius:2px}
        button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  )
}
