import { useEffect, useRef, useState, useMemo } from "react";
import { createChart } from "lightweight-charts";

const ADMIN_ID = "admin@wickverse.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_LINK = `https://www.instagram.com/sam_builds_9`;
const GOOGLE_CLIENT_ID = "PASTE-YOUR-GOOGLE-CLIENT-ID-HERE";

const BLUE = "#2563EB";
const DEEP_BLUE = "#0A1633";
const LIGHT_BLUE = "#00C2FF";
const BG_WHITE = "#F4F8FF";
const CARD_WHITE = "#FFFFFF";

const PAIRS = [
  { name: "BTC/USD", type: "Crypto", binance: "BTCUSDT", base: 97000 },
  { name: "ETH/USD", type: "Crypto", binance: "ETHUSDT", base: 3400 },
  { name: "XAU/USD", type: "Metal", binance: null, base: 2640 },
  { name: "XAG/USD", type: "Metal", binance: null, base: 31.2 },
  { name: "USOIL", type: "Metal", binance: null, base: 71.5 },
  { name: "EUR/USD", type: "Forex", binance: "EURUSDT", base: 1.084 },
  { name: "GBP/USD", type: "Forex", binance: "GBPUSDT", base: 1.27 },
  { name: "GBP/JPY", type: "Forex", binance: null, base: 192.5 },
  { name: "AUD/JPY", type: "Forex", binance: null, base: 98.2 },
  { name: "US30", type: "US Index", binance: null, base: 43800 },
  { name: "NAS100", type: "US Index", binance: null, base: 21400 },
  { name: "SPX500", type: "US Index", binance: null, base: 5980 },
  { name: "DXY", type: "US Index", binance: null, base: 106.2 },
];

const TFS = ["1m","5m","15m","30m","1h","4h","1D"];
const TF_MAP = { "1m":"1m","5m":"5m","15m":"15m","30m":"30m","1h":"1h","4h":"4h","1D":"1d" };
const TF_SEC = { "1m":60,"5m":300,"15m":900,"30m":1800,"1h":3600,"4h":14400,"1D":86400 };

function makeCandles(base, tf, count=1000){
  const sec = TF_SEC[tf]||3600;
  const now = Math.floor(Date.now()/1000/sec)*sec;
  let price = base; const out=[];
  for(let i=count-1;i>=0;i--){
    const t = now - i*sec;
    const open = price;
    const close = open + (Math.random()-0.48)*base*0.002;
    const high = Math.max(open,close)+Math.random()*base*0.001;
    const low = Math.min(open,close)-Math.random()*base*0.001;
    out.push({ time:t, open, high, low, close, volume: Math.random()*100 });
    price = close;
  }
  return out;
}

// === ONLY NEON CANDLES - NO TEXT, NO BULL/BEAR, NO LONG/SHORT ===
function CandleBackground(){
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    let candles = [];
    let raf = null;
    const initCandles = ()=>{
      candles = [];
      let y = h * 0.85;
      const count = 38;
      for(let i=0;i<count;i++){
        const isUp = Math.random() > 0.35;
        const bodyH = 20 + Math.random()*38;
        const wickTop = 8 + Math.random()*16;
        const wickBottom = 8 + Math.random()*16;
        y = y - (isUp ? 12 + Math.random()*14 : -(6 + Math.random()*9));
        if(y < h*0.08) y = h*0.55;
        if(y > h*0.92) y = h*0.82;
        candles.push({ x: (i / count) * w + 15, y: y, bodyH: bodyH, wickTop: wickTop, wickBottom: wickBottom, isUp: isUp, born: Date.now() + i * 180 });
      }
    };
    const draw = ()=>{
      ctx.clearRect(0,0,w,h);
      const grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0, "#F4F8FF");
      grad.addColorStop(0.45, "#EAF1FF");
      grad.addColorStop(1, "#D6E2FF");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);
      const now = Date.now();
      candles.forEach((c)=>{
        if(now < c.born) return;
        const age = (now - c.born) / 500;
        const alpha = Math.min(1, age);
        const cw = 14;
        const neonColor = c.isUp ? "#00E5A0" : "#FF3B5C";
        ctx.save();
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = neonColor;
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - c.bodyH/2 - c.wickTop);
        ctx.lineTo(c.x, c.y + c.bodyH/2 + c.wickBottom);
        ctx.stroke();
        ctx.fillStyle = neonColor;
        ctx.fillRect(c.x - cw/2, c.y - c.bodyH/2, cw, c.bodyH);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillRect(c.x - cw/2 + 3, c.y - c.bodyH/2 + 2, 3, c.bodyH - 4);
        ctx.restore();
      });
      const glow = ctx.createRadialGradient(w*0.85, h*0.15, 0, w*0.85, h*0.15, 380);
      glow.addColorStop(0, "rgba(37,99,235,0.15)");
      glow.addColorStop(1, "rgba(37,99,235,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0,0,w,h);
      raf = requestAnimationFrame(draw);
    };
    const onResize = ()=>{
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      initCandles();
    };
    initCandles();
    draw();
    window.addEventListener("resize", onResize);
    const loop = setInterval(()=>{ initCandles(); }, 9000);
    return ()=>{ cancelAnimationFrame(raf); clearInterval(loop); window.removeEventListener("resize", onResize); };
  },[]);
  return (
    <div style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
    </div>
  );
}

function ChartPane({ pair, tf, onPairChange, onTfChange, id, chartHeight }){
  const chartRef = useRef(null);
  const [price, setPrice] = useState(0);
  const [countdown, setCountdown] = useState("00:00:00");
  const [liveDot, setLiveDot] = useState(true);
  useEffect(()=>{
    const tick = ()=>{
      const sec = TF_SEC[tf] || 3600;
      const now = Math.floor(Date.now()/1000);
      const remain = sec - (now % sec);
      const h = String(Math.floor(remain/3600)).padStart(2,"0");
      const m = String(Math.floor((remain%3600)/60)).padStart(2,"0");
      const s = String(remain%60).padStart(2,"0");
      setCountdown(`${h}:${m}:${s}`);
      setLiveDot(v=>!v);
    };
    tick();
    const int = setInterval(tick, 1000);
    return ()=>clearInterval(int);
  },[tf]);
  useEffect(()=>{
    if(!chartRef.current) return;
    const width = chartRef.current.clientWidth || 600;
    const height = chartHeight || 480;
    const chart = createChart(chartRef.current,{
      width: width, height: height,
      layout:{ background:{ color: "#0A1633" }, textColor: "#D1D4DC", fontSize:11 },
      grid:{ vertLines:{ color: "#1E2A4A" }, horzLines:{ color: "#1E2A4A" } },
      timeScale:{ timeVisible:true, secondsVisible:false, rightOffset:5, barSpacing:6 },
      rightPriceScale:{ borderColor:"#1E2A4A" },
      crosshair:{ mode:1 },
    });
    const candle = chart.addCandlestickSeries({
      upColor:"#26A69A", downColor:"#EF5350",
      wickUpColor:"#26A69A", wickDownColor:"#EF5350",
      borderUpColor:"#000000", borderDownColor:"#000000",
    });
    const vol = chart.addHistogramSeries({ priceFormat:{type:"volume"}, priceScaleId:"" });
    chart.priceScale("").applyOptions({ scaleMargins:{ top:0.82, bottom:0 }});
    const interval = TF_MAP[tf] || "1h";
    const sym = pair.binance;
    let ws=null; let stopped=false; let tickId=null;
    const load = async ()=>{
      let candles=[];
      if(sym){
        try{
          const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=1000`);
          const d = await r.json();
          if(Array.isArray(d) && d.length>10) candles = d.map(x=>({ time:x[0]/1000, open:+x[1], high:+x[2], low:+x[3], close:+x[4], volume:+x[5] }));
        }catch{}
      }
      if(candles.length<10) candles = makeCandles(pair.base, tf, 1000);
      if(stopped) return;
      candle.setData(candles);
      vol.setData(candles.map(c=>({ time:c.time, value:c.volume||10, color: c.close>=c.open ? "#26A69A55" : "#EF535055" })));
      setPrice(candles[candles.length-1].close);
      try{ chart.timeScale().setVisibleLogicalRange({ from: candles.length - 200, to: candles.length + 5 }); }catch{}
      if(sym){
        try{
          ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@kline_${interval}`);
          ws.onmessage = (e)=>{
            const k = JSON.parse(e.data).k;
            const upd = { time:k.t/1000, open:+k.o, high:+k.h, low:+k.l, close:+k.c };
            try{ candle.update(upd); }catch{}
            setPrice(parseFloat(k.c));
          };
        }catch{}
      } else {
        tickId = setInterval(()=>{
          setPrice(prev=>{
            const np = (prev || pair.base) + (Math.random()-0.5)*pair.base*0.0004;
            const lastBar = candles[candles.length-1];
            if(lastBar){
              const upd = { ...lastBar, close: np, high: Math.max(lastBar.high, np), low: Math.min(lastBar.low, np) };
              try{ candle.update(upd); }catch{}
            }
            return np;
          });
        },2000);
      }
    };
    load();
    const ro = new ResizeObserver((entries)=>{
      const w = entries[0].contentRect.width;
      if(w > 50){ chart.applyOptions({ width: w, height: chartHeight || 480 }); chart.timeScale().fitContent(); }
    });
    if(chartRef.current) ro.observe(chartRef.current);
    const t = setTimeout(()=>{ chart.timeScale().fitContent(); }, 100);
    return ()=>{ stopped=true; clearTimeout(t); ro.disconnect(); try{ws?.close();}catch{} if(tickId) clearInterval(tickId); chart.remove(); };
  },[pair, tf, chartHeight]);
  return (
    <div style={{ background:"#0A1633", border:`1px solid ${BLUE}`, borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column", width:"100%", height:"100%", minHeight:0, boxShadow:"0 8px 30px rgba(37,99,235,0.15)" }}>
      <div style={{ display:"flex", gap:6, padding:"8px", background:"#13204A", alignItems:"center", flexWrap:"wrap", flexShrink:0 }}>
        <select value={pair.name} onChange={e=>onPairChange(PAIRS.find(p=>p.name===e.target.value))} style={{ background:"#0A1633", color:"white", border:"none", padding:"6px 8px", borderRadius:6, fontWeight:800 }}>
          {PAIRS.map(p=> <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
        <select value={tf} onChange={e=>onTfChange(e.target.value)} style={{ background:"#0A1633", color:"white", border:"none", padding:"6px 8px", borderRadius:6, fontWeight:700 }}>
          {TFS.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontWeight:800, fontSize:13, color:"#26A69A", display:"flex", gap:5, alignItems:"center" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background: liveDot ? "#26A69A" : "#1E2A4A", display:"inline-block" }}></span>
          {price.toFixed(pair.base<10 ? 4 : 2)}
        </span>
        <span style={{ background: BLUE, padding:"6px 12px", borderRadius:6, fontSize:14, fontWeight:900, marginLeft:"auto", letterSpacing:1, whiteSpace:"nowrap", color:"white" }}>{countdown}</span>
      </div>
      <div ref={chartRef} style={{ width:"100%", flex:1, minHeight:0, position:"relative" }} />
    </div>
  );
}

export default function App(){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem("wv_user")||"null"));
  const [emailInput, setEmailInput] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loginTab, setLoginTab] = useState("manual");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState("");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const [pendingUsers, setPendingUsers] = useState(()=> JSON.parse(localStorage.getItem("wv_pending")||"[]"));
  const [utrInput, setUtrInput] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showHomeView, setShowHomeView] = useState(false);
  const subStatus = useMemo(()=>{
    if(!user) return "no-user";
    if(!user.approved) return "pending";
    if(!user.expiry) return "pending";
    if(Date.now() > user.expiry) return "expired";
    return "active";
  },[user]);
  const goHome = ()=>{
    setShowHomeView(true);
    setIsAdmin(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBackToCharts = ()=>{ setShowHomeView(false); };
  const handleAdminLogin = ()=>{
    if(adminIdInput.trim().toLowerCase()===ADMIN_ID.toLowerCase() && adminPassInput===ADMIN_PASSWORD){
      setIsAdmin(true); setAdminError(""); setShowAdminLogin(false);
      setPendingUsers(JSON.parse(localStorage.getItem("wv_pending")||"[]"));
    } else setAdminError("Wrong ID or Password!");
  };
  const loginUser = (email)=>{
    const cleanEmail = email.trim().toLowerCase();
    if(!cleanEmail.endsWith("@gmail.com")){ setLoginMsg("Please use a Gmail account."); return; }
    const existing = JSON.parse(localStorage.getItem("wv_pending")||"[]");
    const already = existing.find(u=>u.email===cleanEmail);
    if(!already){
      const nu={email:cleanEmail,created:Date.now(),approved:false,expiry:null,plan:"",utr:"",loginVia: loginTab};
      const n=[...existing,nu]; localStorage.setItem("wv_pending",JSON.stringify(n)); setPendingUsers(n);
      localStorage.setItem("wv_user",JSON.stringify(nu)); setUser(nu);
    } else { localStorage.setItem("wv_user",JSON.stringify(already)); setUser(already); }
  };
  const handleGoogleLogin = ()=>{
    if(!agreed){ setLoginMsg("Please accept Terms to continue."); return; }
    if(GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("PASTE-YOUR")){
      setGoogleLoading(true);
      const scriptId = "google-gsi-script";
      if(!document.getElementById(scriptId)){
        const s = document.createElement("script");
        s.id = scriptId; s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
        s.onload = ()=> openGooglePopup();
        document.head.appendChild(s);
      } else openGooglePopup();
      return;
    }
    setLoginMsg("Google login is not configured yet. Please use Manual Login.");
  };
  const openGooglePopup = ()=>{
    try{
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res)=>{
          try{
            const payload = JSON.parse(atob(res.credential.split(".")[1]));
            if(payload.email) loginUser(payload.email);
          }catch{ setLoginMsg("Google login failed. Try Manual."); }
          setGoogleLoading(false);
        },
      });
      window.google.accounts.id.prompt();
      setGoogleLoading(false);
    }catch{ setGoogleLoading(false); setLoginMsg("Google login failed. Try Manual."); }
  };
  const sendOtp = ()=>{
    const email = emailInput.trim().toLowerCase();
    if(!email.endsWith("@gmail.com")){ setLoginMsg("Please enter valid Gmail."); return; }
    if(!agreed){ setLoginMsg("Please accept Terms to continue."); return; }
    const otp = String(Math.floor(100000+Math.random()*900000));
    setGeneratedOtp(otp); setOtpSent(true);
    setLoginMsg("OTP sent. Please enter OTP to continue.");
  };
  const verifyOtp = ()=>{
    if(otpInput!==generatedOtp){ setLoginMsg("Invalid OTP."); return; }
    loginUser(emailInput);
  };
  const submitUtr = ()=>{
    const all = JSON.parse(localStorage.getItem("wv_pending")||"[]");
    const n = all.map(u=> u.email===user.email ? {...u, utr:utrInput} : u);
    localStorage.setItem("wv_pending",JSON.stringify(n));
    setPendingUsers(n);
    setLoginMsg("UTR Submitted Successfully.");
  };
  const logout = ()=>{ localStorage.removeItem("wv_user"); setUser(null); setOtpSent(false); setOtpInput(""); setIsAdmin(false); setShowHomeView(false); };
  const approveUser = (email,utr)=>{
    const all=JSON.parse(localStorage.getItem("wv_pending")||"[]");
    const n=all.map(u=> u.email===email ? {...u,approved:true,expiry:Date.now()+30*24*60*60*1000,plan:"1 Month Plan",utr:utr||u.utr} : u);
    localStorage.setItem("wv_pending",JSON.stringify(n)); setPendingUsers(n);
    if(user && user.email===email){ const me=n.find(u=>u.email===email); localStorage.setItem("wv_user",JSON.stringify(me)); setUser(me); }
  };
  const rejectUser = (email)=>{
    const n=pendingUsers.filter(u=>u.email!==email);
    localStorage.setItem("wv_pending",JSON.stringify(n)); setPendingUsers(n);
  };
  const [layout, setLayout] = useState(2);
  const [panes, setPanes] = useState([
    { pair: PAIRS[0], tf: "1h" },
    { pair: PAIRS[2], tf: "15m" },
    { pair: PAIRS[4], tf: "1h" },
    { pair: PAIRS[1], tf: "5m" },
  ]);
  const visiblePanes = panes.slice(0, layout);
  const updatePane = (idx, newPair, newTf)=>{
    setPanes(prev=>{
      const n=[...prev];
      n[idx]={ pair: newPair ?? n[idx].pair, tf: newTf ?? n[idx].tf };
      return n;
    });
  };
  const AdminBox = (
    <div style={{ background: CARD_WHITE, color: DEEP_BLUE, padding:16, borderRadius:14, marginTop:16, border:`2px solid ${BLUE}`, boxShadow:"0 10px 30px rgba(37,99,235,0.15)", position:"relative", zIndex:1 }}>
      <div style={{ fontWeight:900, fontSize:15, color: BLUE, textAlign:"center" }}>Admin Login</div>
      <div style={{ fontSize:12, textAlign:"center", color:"#64748B", marginTop:4 }}>Only for Admin</div>
      <input value={adminIdInput} onChange={e=>setAdminIdInput(e.target.value)} placeholder="Admin ID" style={{ width:"100%", padding:12, borderRadius:10, border:"1px solid #CBD5E1", boxSizing:"border-box", marginTop:12, fontSize:14 }} />
      <input type="password" value={adminPassInput} onChange={e=>setAdminPassInput(e.target.value)} placeholder="Admin Password" style={{ width:"100%", padding:12, borderRadius:10, border:"1px solid #CBD5E1", boxSizing:"border-box", marginTop:10, fontSize:14 }} />
      {adminError && <p style={{ color:"red", fontSize:13, textAlign:"center" }}>{adminError}</p>}
      <button onClick={handleAdminLogin} style={{ width:"100%", padding:13, background: BLUE, color:"white", border:"none", borderRadius:10, marginTop:12, cursor:"pointer", fontWeight:900, fontSize:14 }}>Login as Admin</button>
    </div>
  );
  if(isAdmin){
    return (
      <div style={{ minHeight:"100vh", background: BG_WHITE, padding:20, fontFamily:"Archivo, Inter, sans-serif", overflowY:"auto" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
            <button onClick={goHome} style={{ padding:"8px 14px", background:"white", color: DEEP_BLUE, border:`1px solid ${DEEP_BLUE}`, borderRadius:8, cursor:"pointer", fontWeight:800 }}>Back to Home</button>
            <h2 style={{ fontSize:24, fontWeight:900, color: DEEP_BLUE, margin:0 }}>Admin <span style={{ color: BLUE }}>Panel</span></h2>
            <button onClick={()=>setIsAdmin(false)} style={{ padding:"8px 14px", background: DEEP_BLUE, color:"white", border:"none", borderRadius:8, cursor:"pointer" }}>Back</button>
          </div>
          {pendingUsers.length===0 && <p style={{ textAlign:"center", marginTop:20 }}>No users yet.</p>}
          {pendingUsers.map(u=>(
            <div key={u.email} style={{ background:"white", padding:14, borderRadius:12, marginTop:12, fontSize:13, border:"1px solid #DCE6FF" }}>
              <b>{u.email}</b><br/>UTR: <b>{u.utr || "Not submitted"}</b><br/>Login Via: <b>{u.loginVia || "-"}</b><br/>Status: <b style={{ color: u.approved?"green":"#EF4444" }}>{u.approved ? "Active" : "Pending"}</b>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button onClick={()=>approveUser(u.email, u.utr)} style={{ flex:1, padding:10, background: BLUE, color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:800 }}>Approve - 1 Month</button>
                <button onClick={()=>rejectUser(u.email)} style={{ padding:10, background: DEEP_BLUE, color:"white", border:"none", borderRadius:8, cursor:"pointer" }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if(!user || subStatus==="pending" || subStatus==="expired"){
    return (
      <>
      <style>{`
        html, body, #root { height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; }
        ::selection { background: #DBEAFE !important; color: #0A1633 !important; }
        * { -webkit-tap-highlight-color: transparent; }
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&display=swap');
        .outline-text{ color: transparent; -webkit-text-stroke: 2.5px #0A1633; }
        @keyframes spinSlow{ from{ transform: rotate(0deg)} to{ transform: rotate(360deg)} }
        @keyframes marquee{ from{ transform: translateX(0)} to{ transform: translateX(-50%)} }
        @keyframes floatUp{ from{ opacity:0; transform: translateY(30px)} to{ opacity:1; transform: translateY(0)} }
        .spin-slow{ animation: spinSlow 18s linear infinite; }
        .marquee{ animation: marquee 18s linear infinite; display:flex; width:max-content; }
        .fade-up{ animation: floatUp 0.8s ease both; }
      `}</style>
      <div style={{ minHeight:"100vh", background: BG_WHITE, color: DEEP_BLUE, fontFamily:"Archivo, Inter, sans-serif", position:"relative", overflowX:"hidden", overflowY:"auto" }}>
        <CandleBackground />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"white", borderBottom:"1px solid #DCE6FF", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ background: BLUE, color:"white", padding:"8px 10px", fontWeight:900, borderRadius:6 }}>W</div>
            <span style={{ fontWeight:800, letterSpacing:1 }}>WickVerse</span>
          </div>
          <div style={{ fontSize:18 }}>💙</div>
        </div>
        <div style={{ padding:"10px 20px", position:"relative", zIndex:1 }} className="fade-up">
          <div style={{ fontSize:10, letterSpacing:3, opacity:.6, fontWeight:700, color: BLUE }}>TRADING PLATFORM • LIVE CHARTS • INDIA</div>
          <h1 style={{ fontSize:64, lineHeight:0.95, fontWeight:900, margin:"12px 0" }}>
            WICK<br/>
            <span className="outline-text">VERSE<span style={{ color: BLUE, WebkitTextStroke:"0px" }}>.</span></span>
          </h1>
          <p style={{ fontSize:15, lineHeight:1.5, maxWidth:340, fontWeight:500 }}>
            I build <b>fast, live and visually sharp</b> charts — modern trading, multi-charts, countdown and real price.
          </p>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={()=>document.getElementById("login-box")?.scrollIntoView({behavior:"smooth"})} style={{ background: BLUE, color:"white", border:"none", padding:"13px 18px", fontWeight:800, fontSize:13, cursor:"pointer", borderRadius:8 }}>VIEW CHARTS</button>
            <a href={ADMIN_LINK} target="_blank" rel="noreferrer" style={{ background:"white", border:`1px solid ${DEEP_BLUE}`, padding:"13px 18px", fontWeight:800, fontSize:13, cursor:"pointer", color: DEEP_BLUE, textDecoration:"none", borderRadius:8 }}>CONTACT ADMIN</a>
          </div>
          <div style={{ fontSize:10, letterSpacing:2, marginTop:26, opacity:.6 }}>— SCROLL TO EXPLORE</div>
          <div style={{ fontSize:10, letterSpacing:1, marginTop:6, fontWeight:700, color: BLUE }}>13+ PAIRS • FOREX • CRYPTO • GOLD • US INDEX</div>
        </div>
        <div style={{ borderTop:"1px solid #DCE6FF", borderBottom:"1px solid #DCE6FF", padding:"12px 0", overflow:"hidden", marginTop:20, background:"white", position:"relative", zIndex:1 }}>
          <div className="marquee" style={{ gap:30, fontWeight:800, fontSize:16, whiteSpace:"nowrap" }}>
            <span>BTC/USD ✦</span><span>ETH/USD ✦</span><span style={{ color:"transparent", WebkitTextStroke:"1px #2563EB" }}>XAU/USD ✦</span><span>EUR/USD ✦</span><span>US30 ✦</span><span style={{ color:"transparent", WebkitTextStroke:"1px #2563EB" }}>NAS100 ✦</span>
            <span>BTC/USD ✦</span><span>ETH/USD ✦</span><span style={{ color:"transparent", WebkitTextStroke:"1px #2563EB" }}>XAU/USD ✦</span><span>EUR/USD ✦</span><span>US30 ✦</span><span style={{ color:"transparent", WebkitTextStroke:"1px #2563EB" }}>NAS100 ✦</span>
          </div>
        </div>
        <div style={{ padding:20, position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:13, fontWeight:800, color: BLUE, background:"#EAF1FF", padding:"6px 12px", borderRadius:20 }}>01</span>
            <div style={{ fontSize:28, fontWeight:900, color: DEEP_BLUE }}>About <span style={{ color: BLUE }}>WickVerse</span></div>
            <div style={{ flex:1, height:1, background:"#DCE6FF" }}></div>
          </div>
          <div style={{ background:"white", border:"1px solid #E2E8F0", padding:22, marginTop:16, borderRadius:16, boxShadow:"0 8px 24px rgba(10,22,51,0.06)", display:"flex", gap:18, alignItems:"flex-start" }}>
            <div style={{ width:56, height:56, minWidth:56, borderRadius:14, background: DEEP_BLUE, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900 }}>WV</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, letterSpacing:2, fontWeight:800, color:"#64748B" }}>PROFILE • 2026</div>
              <div style={{ fontSize:17, fontWeight:800, color: DEEP_BLUE, marginTop:4 }}>Live Trading Platform</div>
              <div style={{ fontSize:13, color:"#475569", lineHeight:1.6, marginTop:4 }}>Clean charts, real price and fast performance. Built for traders who want clarity, not clutter.</div>
            </div>
          </div>
          <div style={{ background:"white", border:"1px solid #E2E8F0", borderRadius:16, marginTop:12, overflow:"hidden" }}>
            {[
              ["Base", "India"],
              ["Role", "Trading Platform"],
              ["Builds", "Web • Charts • Live Price"],
              ["Status", "Live Now"],
            ].map(([label, value], i)=>(
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 18px", background: i%2===0 ? "white" : "#F8FAFF", borderBottom: i===3 ? "none" : "1px solid #F1F5F9" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#64748B", letterSpacing:1, textTransform:"uppercase" }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:800, color: DEEP_BLUE, textAlign:"right" }}>
                  {label==="Status" ? <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", display:"inline-block" }}></span>Live Now</span> : value}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:17, fontWeight:700, lineHeight:1.5, marginTop:18, color: DEEP_BLUE }}>
            I design and build charts that live everywhere — <span style={{ color: BLUE }}>fast charts</span>, <span style={{ color:"#059669" }}>live price</span>, multi-charts — with clean code.
          </p>
        </div>
        <div id="login-box" style={{ padding:"0 20px 60px", position:"relative", zIndex:1 }}>
          <button onClick={goHome} style={{ width:"100%", padding:12, background:"white", color: DEEP_BLUE, border:`1px solid ${DEEP_BLUE}`, borderRadius:10, cursor:"pointer", fontWeight:800, fontSize:13, marginBottom:12 }}>Back to Home</button>
          <div style={{ background: DEEP_BLUE, color:"white", padding:20, borderRadius:16, boxShadow:"0 20px 50px rgba(10,22,51,0.25)" }}>
            {!user ? <>
              <h2 style={{ margin:0 }}>Login to WickVerse</h2>
              <p style={{ fontSize:13, opacity:.6, margin:"6px 0 0" }}>Choose any 1 method - Manual or Direct</p>
              <div style={{ display:"flex", background:"#13204A", borderRadius:10, padding:4, marginTop:16 }}>
                <button onClick={()=>setLoginTab("manual")} style={{ flex:1, padding:11, background: loginTab==="manual"? BLUE : "transparent", color:"white", border:"none", borderRadius:7, cursor:"pointer", fontWeight:800, fontSize:13 }}>Manual Login</button>
                <button onClick={()=>setLoginTab("direct")} style={{ flex:1, padding:11, background: loginTab==="direct"? BLUE : "transparent", color:"white", border:"none", borderRadius:7, cursor:"pointer", fontWeight:800, fontSize:13 }}>Direct Login</button>
              </div>
              <label style={{ display:"flex", gap:8, fontSize:13, marginTop:14 }}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} /> I agree to Terms and Conditions</label>
              {loginTab==="manual" && <>
                <p style={{ fontSize:12, opacity:.6, margin:"14px 0 0" }}>Manual - Enter Gmail, Enter OTP</p>
                <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="your@gmail.com" style={{ width:"100%", padding:13, marginTop:10, border:"none", borderRadius:10, boxSizing:"border-box" }} />
                {!otpSent ? <button onClick={sendOtp} style={{ marginTop:14, width:"100%", padding:13, background: BLUE, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:800 }}>Send OTP</button> : <>
                  <input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="Enter 6-digit OTP" style={{ width:"100%", padding:13, marginTop:14, border:"none", borderRadius:10, boxSizing:"border-box", textAlign:"center", letterSpacing:4 }} />
                  <button onClick={verifyOtp} style={{ marginTop:12, width:"100%", padding:13, background: BLUE, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:800 }}>Verify OTP and Login</button>
                </>}
              </>}
              {loginTab==="direct" && <>
                <p style={{ fontSize:12, opacity:.6, margin:"14px 0 0", textAlign:"center" }}>Direct - 1 Click Login with Google, No OTP Needed</p>
                <button onClick={handleGoogleLogin} style={{ marginTop:14, width:"100%", padding:14, background:"white", color:"#0A1633", border:"none", borderRadius:10, cursor:"pointer", fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ background:"#4285F4", color:"white", width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900 }}>G</span>
                  {googleLoading ? "Opening Google..." : "Continue with Google"}
                </button>
                <p style={{ fontSize:12, opacity:.5, textAlign:"center", marginTop:10 }}>Select your Google account to login directly</p>
              </>}
              {loginMsg && <p style={{ color:"#FF8A8A", fontSize:13 }}>{loginMsg}</p>}
            </> : <>
              <h2 style={{ margin:0 }}>Subscription Not Active</h2>
              <p style={{ opacity:.6, fontSize:14 }}>Logged in as: <b>{user.email}</b><br/>Status: {subStatus}</p>
              <a href={ADMIN_LINK} target="_blank" rel="noreferrer" style={{ display:"block", padding:13, background: BLUE, color:"white", borderRadius:10, textAlign:"center", textDecoration:"none", fontWeight:800, marginTop:14 }}>BUY NOW - Contact Admin</a>
              <input value={utrInput} onChange={e=>setUtrInput(e.target.value)} placeholder="Enter UTR ID after payment" style={{ width:"100%", padding:13, marginTop:14, border:"none", borderRadius:10, boxSizing:"border-box" }} />
              <button onClick={submitUtr} style={{ width:"100%", padding:12, background: LIGHT_BLUE, color:"white", border:"none", borderRadius:10, marginTop:10, cursor:"pointer" }}>Submit UTR ID</button>
              {loginMsg && <p style={{ color:"#FF8A8A", fontSize:13 }}>{loginMsg}</p>}
              <button onClick={logout} style={{ width:"100%", padding:12, background:"white", border:"none", borderRadius:10, marginTop:10, cursor:"pointer" }}>Use Another Account</button>
            </>}
          </div>
          {showAdminLogin && AdminBox}
          <div style={{ height:40 }}></div>
        </div>
      </div>
      </>
    );
  }
  if(showHomeView){
    return (
      <div style={{ minHeight:"100vh", background: BG_WHITE, padding:20, fontFamily:"Archivo, Inter, sans-serif", textAlign:"center", position:"relative", overflowY:"auto" }}>
        <CandleBackground />
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 style={{ fontSize:48, fontWeight:900, color: DEEP_BLUE }}>WICK<br/>VERSE.</h1>
          <p>You are logged in as {user.email}</p>
          <button onClick={goBackToCharts} style={{ padding:13, background: BLUE, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:800, marginRight:10 }}>Go to Charts</button>
          <button onClick={logout} style={{ padding:13, background:"white", color: DEEP_BLUE, border:`1px solid ${DEEP_BLUE}`, borderRadius:10, cursor:"pointer", fontWeight:800 }}>Logout</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0A1633", color:"white", fontFamily:"Inter", padding:12, boxSizing:"border-box", overflow:"hidden" }}>
      <div style={{ display:"flex", gap:10, padding:"10px 12px", background:"#13204A", borderRadius:10, alignItems:"center", flexWrap:"wrap", flexShrink:0 }}>
        <span style={{ fontWeight:800, fontSize:20 }}>WickVerse</span>
        <span style={{ fontSize:12, color:"#D1D4DC" }}>Hi, {user.email} • Active</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:6, background:"#0A1633", padding:4, borderRadius:8 }}>
          <button onClick={()=>setLayout(1)} style={{ padding:"7px 14px", background: layout===1? BLUE : "transparent", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:800 }}>1 Chart</button>
          <button onClick={()=>setLayout(2)} style={{ padding:"7px 14px", background: layout===2? BLUE : "transparent", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:800 }}>2 Charts</button>
          <button onClick={()=>setLayout(4)} style={{ padding:"7px 14px", background: layout===4? BLUE : "transparent", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:800 }}>4 Charts</button>
        </div>
        <button onClick={goHome} style={{ padding:"7px 12px", background:"white", color: DEEP_BLUE, border:"none", borderRadius:6, cursor:"pointer", fontWeight:700 }}>Home</button>
        <button onClick={logout} style={{ padding:"7px 12px", background:"#EF4444", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontWeight:700 }}>Logout</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: layout===1 ? "1fr" : "1fr 1fr", gridTemplateRows: layout===4 ? "1fr 1fr" : "1fr", gap:12, marginTop:12, flex:1, minHeight:0 }}>
        {visiblePanes.map((p, i)=>(
          <ChartPane key={i} id={i} pair={p.pair} tf={p.tf} chartHeight={layout===1 ? 550 : layout===2 ? 480 : 260} onPairChange={(np)=>updatePane(i, np, null)} onTfChange={(ntf)=>updatePane(i, null, ntf)} />
        ))}
      </div>
    </div>
  );
}