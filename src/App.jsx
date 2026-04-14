import { useState, useEffect, useRef } from 'react'
const API = import.meta.env.VITE_BOOK_API_URL || 'https://book-manager-api.up.railway.app'
const G = {bg:'#08080a',surface:'#101013',s2:'#16161a',s3:'#1e1e24',border:'rgba(255,255,255,0.06)',border2:'rgba(255,255,255,0.11)',gold:'#c9a84c',gold2:'#e8c96e',gdim:'rgba(201,168,76,0.13)',gglow:'rgba(201,168,76,0.06)',text:'#ede9e0',t2:'#9b9790',t3:'#54524d',green:'#4db87a',red:'#e05555',reddim:'rgba(224,85,85,0.13)',blue:'#5b8dee'}
const MS_COLORS = {legal:'#5b8dee',manuscript:'#9b72ef',design:'#e8834a',publishing:'#4db87a',print:'#c9a84c',convention:'#e8c96e'}
const MILESTONES = [{id:'m1',label:'File Copyright',date:'2026-04-14',type:'legal'},{id:'m2',label:'Purchase ISBN',date:'2026-04-14',type:'legal'},{id:'m3',label:'Manuscript Final',date:'2026-04-18',type:'manuscript'},{id:'m4',label:'Cover Design Due',date:'2026-04-28',type:'design'},{id:'m5',label:'Interior Layout Done',date:'2026-05-05',type:'design'},{id:'m6',label:'Upload to IngramSpark',date:'2026-05-08',type:'publishing'},{id:'m7',label:'Order Proof Copy',date:'2026-05-10',type:'publishing'},{id:'m8',label:'Proof Approved',date:'2026-05-18',type:'publishing'},{id:'m9',label:'Bulk Print Order',date:'2026-05-19',type:'print'},{id:'m10',label:'Books Delivered',date:'2026-06-05',type:'print'},{id:'m11',label:'CONVENTION',date:'2026-06-15',type:'convention'}]
async function apiFetch(path,opts={}){try{const r=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json'},...opts});const j=await r.json();return j.data||j}catch(e){console.warn(e);return null}}
function Badge({text,color}){return <span style={{padding:'2px 7px',borderRadius:10,background:`${color}18`,border:`1px solid ${color}40`,fontSize:9,color,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{text}</span>}
function Widget({icon,title,count,children,defaultOpen=true}){const[open,setOpen]=useState(defaultOpen);return(<div style={{background:G.s2,border:`1px solid ${G.border}`,borderRadius:10,overflow:'hidden',marginBottom:10}}><div onClick={()=>setOpen(o=>!o)} style={{padding:'10px 13px',borderBottom:open?`1px solid ${G.border}`:'none',display:'flex',alignItems:'center',gap:7,cursor:'pointer'}}><span>{icon}</span><span style={{fontSize:11,fontWeight:700,color:G.text,flex:1}}>{title}</span>{count!==undefined&&<span style={{fontFamily:'monospace',fontSize:10,color:G.t3}}>{count}</span>}<span style={{fontSize:9,color:G.t3,transform:open?'rotate(180deg)':'none',display:'inline-block'}}>▼</span></div>{open&&<div style={{padding:12}}>{children}</div>}</div>)}
export default function App(){
  const[tab,setTab]=useState('chat')
  const[dash,setDash]=useState(null)
  const[loading,setLoading]=useState(true)
  const[msgs,setMsgs]=useState([{role:'agent',text:'**Book Manager Executive online.**\n\nLoading project data...'}])
  const[input,setInput]=useState('')
  const[sending,setSending]=useState(false)
  const[taskModal,setTaskModal]=useState(false)
  const[taskName,setTaskName]=useState('')
  const[tasks,setTasks]=useState([])
  const chatRef=useRef(null)
  const[calMonth,setCalMonth]=useState(3)
  const[calYear,setCalYear]=useState(2026)
  useEffect(()=>{loadDash()},[])
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight},[msgs])
  async function loadDash(){setLoading(true);const d=await apiFetch('/api/book/dashboard');if(d){setDash(d);setMsgs([{role:'agent',text:`**Project: ${d.project?.name||'Tales from the Hood'}**\n\nPhase: **${d.project?.phase||'Writing'}** | Manuscript: **${d.manuscriptPct}%** | Convention: **${d.daysToConvention} days away**\n\nBlockers: **${d.blockers?.length||0}** | Open tasks: **${d.openTasks?.length||0}**\n\nWhat do you want to tackle today?`}])};setLoading(false)}
  async function send(text){const msg=text||input.trim();if(!msg)return;setInput('');setMsgs(prev=>[...prev,{role:'user',text:msg}]);setSending(true);const d=await apiFetch('/api/book/agent',{method:'POST',body:JSON.stringify({message:msg,history:msgs.slice(-10).map(m=>({role:m.role==='agent'?'assistant':'user',content:m.text}))})});setMsgs(prev=>[...prev,{role:'agent',text:d?.reply||'Connection error. Please try again.'}]);setSending(false)}
  function saveTask(name){if(!name.trim())return;setTasks(prev=>[{id:Date.now(),name:name.trim(),done:false},...prev]);apiFetch('/api/book/tasks',{method:'POST',body:JSON.stringify({'Task Name':name.trim(),'Status':'Open'})});setTaskModal(false);setTaskName('')}
  function fmt(text){return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>')}
  const d=dash,project=d?.project||{},chapters=d?.chapters||[],blockers=d?.blockers||[],openTasks=d?.openTasks||[],revenue=d?.revenue||{total:0,byPlatform:{}}
  const convDays=d?.daysToConvention||0,msPct=d?.manuscriptPct||0,pubPct=d?.publishingPct||0
  const statusColor={Draft:G.t3,'In Review':G.blue,Edited:'#9b72ef',Final:G.green}
  const today=new Date()
  const convDaysCalc=Math.ceil((new Date('2026-06-15')-today)/86400000)
  const firstDay=new Date(calYear,calMonth,1).getDay()
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate()
  const months=['January','February','March','April','May','June','July','August','September','October','November','December']
  const msMap={}
  MILESTONES.forEach(m=>{const dt=new Date(m.date+'T12:00:00');if(dt.getFullYear()===calYear&&dt.getMonth()===calMonth){if(!msMap[dt.getDate()])msMap[dt.getDate()]=[];msMap[dt.getDate()].push(m)}})
  const upcoming=MILESTONES.filter(m=>new Date(m.date+'T12:00:00')>=today).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,4)
  const TABS=[{id:'chat',label:'Chat',icon:'📚'},{id:'overview',label:'Overview',icon:'📊'},{id:'chapters',label:'Chapters',icon:'📖'},{id:'calendar',label:'Calendar',icon:'📅'},{id:'tasks',label:'Tasks',icon:'✅'},{id:'budget',label:'Budget',icon:'💰'}]
  const QUICK=[['🎯 Daily','Give me today\'s highest-impact move for the book'],['📲 Content','Generate a 7-day social content batch for pre-launch'],['⚖️ Copyright','Walk me through filing copyright at copyright.gov right now'],['📦 Publishing','Walk me through KDP and IngramSpark setup step by step with URLs'],['🎙️ Narration','What is the full ACX audiobook pipeline for Dr. Motes to record?'],['📰 Press Kit','Build my full press kit: bio, Amazon description, interview questions, pitch email']]
  return(
    <div style={{background:G.bg,color:G.text,height:'100dvh',fontFamily:"'DM Sans',system-ui,sans-serif",display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* TOPBAR */}
      <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:10,padding:'0 14px',height:52,flexShrink:0}}>
        <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#2a1f06,#4a3510)',border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>📖</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:800,color:G.text}}>Book Manager</div><div style={{fontSize:8,color:G.gold,letterSpacing:'.06em',textTransform:'uppercase'}}>Tales from the Hood · MotesArt</div></div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{textAlign:'center',padding:'3px 8px',background:G.gdim,border:`1px solid ${G.gold}44`,borderRadius:6}}><div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:G.gold}}>{msPct}%</div><div style={{fontSize:7,color:G.t3,textTransform:'uppercase'}}>Draft</div></div>
          <div style={{textAlign:'center',padding:'3px 8px',background:convDays<30?'rgba(224,85,85,0.1)':G.gdim,border:`1px solid ${convDays<30?G.red:G.gold}44`,borderRadius:6}}><div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:convDays<30?G.red:G.gold}}>{convDays}d</div><div style={{fontSize:7,color:G.t3,textTransform:'uppercase'}}>Conv.</div></div>
          <button onClick={loadDash} style={{padding:'5px 9px',background:G.gdim,border:`1px solid ${G.gold}`,borderRadius:6,color:G.gold,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>↻</button>
        </div>
      </div>
      {/* CONTENT */}
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {/* CHAT */}
        {tab==='chat'&&<div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
            {loading&&<div style={{textAlign:'center',padding:40,color:G.t3,fontSize:12}}>Loading project data...</div>}
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                <div style={{width:28,height:28,borderRadius:8,background:m.role==='agent'?G.gdim:G.s3,border:`1px solid ${m.role==='agent'?G.gold:G.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>{m.role==='agent'?'📚':'👤'}</div>
                <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:12,fontSize:13,lineHeight:1.6,background:m.role==='agent'?G.surface:G.gdim,border:`1px solid ${m.role==='agent'?G.border:'rgba(201,168,76,0.2)'}`,borderTopLeftRadius:m.role==='agent'?3:12,borderTopRightRadius:m.role==='user'?3:12}}>
                  <div style={{fontSize:8,color:G.t3,letterSpacing:'.06em',textTransform:'uppercase',fontWeight:700,marginBottom:4}}>{m.role==='agent'?'Book Manager Executive':'Denarius'}</div>
                  <div dangerouslySetInnerHTML={{__html:fmt(m.text)}}/>
                  {m.role==='agent'&&i>0&&<div style={{display:'flex',gap:6,marginTop:8,paddingTop:7,borderTop:`1px solid ${G.border}`}}><button onClick={()=>{setTaskName(m.text.split('\n')[0].replace(/[*#]/g,'').trim().substring(0,60));setTaskModal(true)}} style={{padding:'4px 10px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:6,color:G.t2,fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>+ Task</button><button onClick={()=>navigator.clipboard?.writeText(m.text)} style={{padding:'4px 10px',background:G.s3,border:`1px solid ${G.border}`,borderRadius:6,color:G.t2,fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>📋</button></div>}
                </div>
              </div>
            ))}
            {sending&&<div style={{display:'flex',gap:8}}><div style={{width:28,height:28,borderRadius:8,background:G.gdim,border:`1px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>📚</div><div style={{padding:'10px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:'12px 12px 12px 3px'}}><div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:G.gold,animation:`pulse 1.2s ${i*.2}s infinite`}}/>)}</div></div></div>}
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
            {[{label:'Phase',val:project.phase||'Writing',col:G.gold},{label:'Manuscript',val:`${msPct}%`,col:'#9b72ef'},{label:'Publishing',val:`${pubPct}%`,col:G.green},{label:'Convention',val:`${convDays}d left`,col:convDays<30?G.red:G.gold}].map((s,i)=><div key={i} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:'12px 14px'}}><div style={{fontFamily:'monospace',fontSize:18,fontWeight:700,color:s.col}}>{s.val}</div><div style={{fontSize:9,color:G.t3,textTransform:'uppercase',letterSpacing:'.05em',marginTop:3}}>{s.label}</div></div>)}
          </div>
          <div style={{padding:'14px',background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,border:`1px solid rgba(201,168,76,0.3)`,borderRadius:12,marginBottom:12,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:28}}>🏛️</span><div style={{flex:1}}><div style={{fontSize:10,color:G.gold,fontWeight:700,textTransform:'uppercase'}}>Convention Deadline</div><div style={{fontSize:16,fontWeight:800,color:G.text}}>Mid-June 2026</div></div>
            <div style={{textAlign:'right'}}><div style={{fontFamily:'monospace',fontSize:28,fontWeight:700,color:G.gold2}}>{convDays}</div><div style={{fontSize:8,color:G.t3,textTransform:'uppercase'}}>days left</div></div>
          </div>
          {blockers.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>🚨 Active Blockers</div><div style={{background:G.reddim,border:'1px solid rgba(224,85,85,0.22)',borderRadius:10,padding:'10px 12px'}}>{blockers.map((b,i)=><div key={b.id||i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:i<blockers.length-1?'1px solid rgba(224,85,85,0.1)':'none'}}><div style={{width:6,height:6,borderRadius:'50%',background:G.red,flexShrink:0}}/><div style={{fontSize:12,color:G.text}}>{b.name||b['Blocker Name']}</div></div>)}</div></div>}
          <Widget icon="💰" title="Revenue" count={`$${(revenue.total||0).toFixed(2)}`} defaultOpen={false}>
            <div style={{fontFamily:'monospace',fontSize:24,fontWeight:700,color:G.gold,marginBottom:10}}>${(revenue.total||0).toFixed(2)}</div>
            {['Amazon KDP','IngramSpark','ACX Audio','Direct'].map(p=><div key={p} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${G.border}`}}><div style={{fontSize:11,color:G.t3,textTransform:'uppercase'}}>{p}</div><div style={{fontFamily:'monospace',fontSize:11,color:G.t2}}>${((revenue.byPlatform?.[p]?.gross)||0).toFixed(2)}</div></div>)}
          </Widget>
        </div>}
        {/* CHAPTERS */}
        {tab==='chapters'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Chapter Status</div>
          {(chapters.length?chapters:[{id:'0',number:'4',name:'Husband-Hood',status:'Draft',note:'⚠ Missing case study'},{id:'1',number:'5',name:'Father-Hood',status:'Draft',note:'⚠ Incomplete'}]).map(ch=>{const st=ch.status||ch.Status||'Draft',col=statusColor[st]||G.t3;return(<div key={ch.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,marginBottom:8}}><div style={{width:32,height:32,borderRadius:8,background:`${col}22`,border:`1px solid ${col}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:col,fontWeight:700,flexShrink:0}}>{ch.number||ch['Chapter Number']}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:G.text,marginBottom:3}}>{ch.name||ch['Chapter Name']}</div><div style={{fontSize:11,color:G.t3}}>{ch.note||st}</div></div><Badge text={st} color={col}/></div>)})}
        </div>}
        {/* CALENDAR */}
        {tab==='calendar'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{background:G.s2,border:`1px solid ${G.border}`,borderRadius:10,overflow:'hidden',marginBottom:10}}>
            <div style={{padding:'10px 13px',borderBottom:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:7}}><span>📅</span><span style={{fontSize:11,fontWeight:700,color:G.text,flex:1}}>Calendar</span><span style={{fontFamily:'monospace',fontSize:10,color:G.t3}}>{convDaysCalc}d to conv.</span></div>
            <div style={{padding:12}}>
              <div style={{padding:'8px 10px',background:`linear-gradient(135deg,${G.gdim},${G.gglow})`,border:`1px solid rgba(201,168,76,0.3)`,borderRadius:8,marginBottom:10,display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:16}}>🏛️</span><div style={{flex:1}}><div style={{fontSize:9,color:G.gold,fontWeight:700,textTransform:'uppercase'}}>Convention</div><div style={{fontSize:12,fontWeight:800,color:G.text}}>Mid-June 2026</div></div><div style={{textAlign:'right'}}><div style={{fontFamily:'monospace',fontSize:18,fontWeight:700,color:G.gold2}}>{convDaysCalc}</div><div style={{fontSize:8,color:G.t3,textTransform:'uppercase'}}>days left</div></div></div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><button onClick={()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--}setCalMonth(m);setCalYear(y)}} style={{background:'none',border:'none',color:G.t2,cursor:'pointer',fontSize:16,padding:'4px 10px'}}>‹</button><div style={{fontSize:12,fontWeight:700,color:G.text}}>{months[calMonth]} {calYear}</div><button onClick={()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++}setCalMonth(m);setCalYear(y)}} style={{background:'none',border:'none',color:G.t2,cursor:'pointer',fontSize:16,padding:'4px 10px'}}>›</button></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:3}}>{['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:8,color:G.t3,fontWeight:700}}>{d}</div>)}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
                {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} style={{height:26}}/>)}
                {Array(daysInMonth).fill(null).map((_,i)=>{const d=i+1,isToday=today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d,ms=msMap[d],m0=ms?.[0],col=m0?MS_COLORS[m0.type]:null,isConv=m0?.type==='convention';return<div key={d} style={{height:26,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',fontSize:9,position:'relative',background:isConv?col:isToday?G.gdim:ms?`${col}18`:'transparent',border:isConv?`1px solid ${col}`:isToday?`1px solid ${G.gold}`:ms?`1px solid ${col}55`:'none',color:isConv?'#000':isToday?G.gold:ms?col:G.t3,fontWeight:(isToday||ms)?700:400}}>{d}{ms&&!isConv&&<div style={{position:'absolute',bottom:1,left:'50%',transform:'translateX(-50%)',width:3,height:3,borderRadius:'50%',background:col}}/>}</div>})}
              </div>
              <div style={{borderTop:`1px solid ${G.border}`,marginTop:10,paddingTop:8}}><div style={{fontSize:9,color:G.t3,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:6}}>Upcoming</div>{upcoming.map(m=>{const dt=new Date(m.date+'T12:00:00'),diff=Math.ceil((dt-today)/86400000),col=MS_COLORS[m.type];return(<div key={m.id} style={{display:'flex',alignItems:'center',gap:7,padding:'5px 0',borderBottom:`1px solid ${G.border}`}}><div style={{width:6,height:6,borderRadius:'50%',background:col,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:10,color:G.text,fontWeight:600}}>{m.label}</div><div style={{fontSize:9,color:G.t3}}>{dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div><div style={{fontSize:9,fontFamily:'monospace',fontWeight:700,color:diff<=7?G.red:diff<=14?G.gold:G.t3}}>{diff}d</div></div>)})}</div>
            </div>
          </div>
        </div>}
        {/* TASKS */}
        {tab==='tasks'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase'}}>Open Tasks</div><button onClick={()=>setTaskModal(true)} style={{padding:'6px 12px',background:G.gdim,border:`1px solid ${G.gold}`,borderRadius:8,color:G.gold,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Add</button></div>
          {[...tasks,...(openTasks||[]).slice(0,10)].map((t,i)=><div key={t.id||i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,marginBottom:8}}><div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${G.border2}`,background:t.done?G.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#000',flexShrink:0,marginTop:1,cursor:'pointer'}} onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done?'✓':''}</div><div style={{fontSize:13,color:t.done?G.t3:G.text,textDecoration:t.done?'line-through':'none',lineHeight:1.4,flex:1}}>{t.name||t['Task Name']}</div></div>)}
          {[...tasks,...(openTasks||[])].length===0&&<div style={{textAlign:'center',color:G.t3,fontSize:13,padding:40}}>No open tasks yet.</div>}
        </div>}
        {/* BUDGET */}
        {tab==='budget'&&<div style={{flex:1,overflowY:'auto',padding:'14px'}}>
          <div style={{fontSize:9,color:G.t3,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Convention Print Budget</div>
          {[{label:'Copyright Filing',cost:'$65',urgent:true},{label:'ISBN (own it)',cost:'$125',urgent:true},{label:'Cover Design',cost:'$300–$1,500'},{label:'Interior Layout',cost:'$300–$800'},{label:'Proof Copy',cost:'~$25'},{label:'150 Hardcover Copies',cost:'~$1,350'},{label:'Shipping',cost:'~$120'}].map((item,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:G.surface,border:`1px solid ${item.urgent?'rgba(224,85,85,0.3)':G.border}`,borderRadius:12,marginBottom:8}}><div style={{flex:1,fontSize:13,color:G.text}}>{item.label}{item.urgent&&<span style={{marginLeft:8,fontSize:8,background:'rgba(224,85,85,0.15)',color:G.red,border:'1px solid rgba(224,85,85,0.3)',borderRadius:4,padding:'1px 5px',fontWeight:700}}>URGENT</span>}</div><div style={{fontFamily:'monospace',fontSize:13,color:item.urgent?G.red:G.gold,fontWeight:700}}>{item.cost}</div></div>)}
          <div style={{display:'flex',justifyContent:'space-between',padding:'14px',background:G.s2,border:`1px solid ${G.border2}`,borderRadius:12}}><div style={{fontSize:13,fontWeight:700,color:G.text}}>Total Est.</div><div style={{fontFamily:'monospace',fontSize:15,fontWeight:700,color:G.gold2}}>~$2,285–$3,935</div></div>
        </div>}
      </div>
      {/* BOTTOM NAV */}
      <div style={{background:G.surface,borderTop:`1px solid ${G.border}`,display:'flex',flexShrink:0,paddingBottom:'env(safe-area-inset-bottom)',position:'relative',zIndex:9999}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'8px 2px',background:'none',border:'none',borderTop:`2px solid ${tab===t.id?G.gold:'transparent'}`,color:tab===t.id?G.gold:G.t3,cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative',zIndex:10000}}><span style={{fontSize:18}}>{t.icon}</span><span style={{fontSize:8,fontWeight:700}}>{t.label}</span></button>)}
      </div>
      {/* TASK MODAL */}
      {taskModal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',zIndex:1000}} onClick={e=>{if(e.target===e.currentTarget)setTaskModal(false)}}><div style={{background:G.s2,border:`1px solid ${G.border2}`,borderRadius:'18px 18px 0 0',padding:'20px',width:'100%',boxSizing:'border-box',paddingBottom:'calc(20px + env(safe-area-inset-bottom))'}}><div style={{width:40,height:4,borderRadius:2,background:G.border2,margin:'0 auto 18px'}}/><div style={{fontSize:17,fontWeight:800,color:G.text,marginBottom:14}}>Save as Task</div><input value={taskName} onChange={e=>setTaskName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveTask(taskName)} placeholder="What needs to be done?" autoFocus style={{width:'100%',background:G.surface,border:`1px solid ${G.border2}`,borderRadius:10,padding:'11px 14px',color:G.text,fontSize:15,outline:'none',fontFamily:'inherit',marginBottom:14,boxSizing:'border-box'}}/><div style={{display:'flex',gap:10}}><button onClick={()=>setTaskModal(false)} style={{flex:1,padding:'12px',borderRadius:10,background:G.s3,border:`1px solid ${G.border}`,color:G.t2,cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}>Cancel</button><button onClick={()=>saveTask(taskName)} style={{flex:1,padding:'12px',borderRadius:10,background:G.gold,border:'none',color:'#000',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}>Save Task</button></div></div></div>}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} *::-webkit-scrollbar{width:3px;height:3px} *::-webkit-scrollbar-thumb{background:#26262e;border-radius:2px} button{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  )
}
