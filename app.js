/* ==========================================================
   NOVA V3 — APP
========================================================== */

const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Header */
const header = $(".site-header");
const navLinks = $$(".desktop-nav a");
const sections = $$("main section[id]");
function updateHeader(){
  header.classList.toggle("scrolled", window.scrollY > 20);
  let current = "inicio";
  sections.forEach(section => {
    if(window.scrollY >= section.offsetTop - 180) current = section.id;
  });
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
}
window.addEventListener("scroll", updateHeader, {passive:true});
updateHeader();

/* Mobile menu */
const menuBtn = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");
const mobileLinks = $$(".mobile-menu a");
function closeMenu(){
  menuBtn?.setAttribute("aria-expanded","false");
  menuBtn?.setAttribute("aria-label","Abrir menú");
  mobileMenu?.classList.remove("open");
  mobileMenu?.setAttribute("aria-hidden","true");
}
menuBtn?.addEventListener("click", ()=>{
  const open = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  mobileMenu.setAttribute("aria-hidden", String(!open));
});
mobileLinks.forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("click", e=>{
  if(mobileMenu.classList.contains("open") && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
});
window.addEventListener("resize", ()=>{ if(innerWidth > 1000) closeMenu(); });

/* Theme */
const themeBtn = $(".theme-toggle");
const storedTheme = localStorage.getItem("nova-theme");
if(storedTheme === "light") document.body.classList.add("light");
function updateThemeIcon(){ themeBtn.textContent = document.body.classList.contains("light") ? "☾" : "☼"; }
updateThemeIcon();
themeBtn?.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("nova-theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeIcon();
});

/* Reveal */
const reveals = $$(".reveal");
if(prefersReduced){
  reveals.forEach(el => el.classList.add("visible"));
}else{
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  reveals.forEach(el=>observer.observe(el));
}

/* Counters */
const counters = $$("[data-counter]");
const counterObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.counter);
    const decimals = String(target).includes(".") ? 1 : 0;
    const duration = 1300;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now-start)/duration,1);
      const eased = 1-Math.pow(1-p,3);
      el.textContent = (target*eased).toFixed(decimals);
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
},{threshold:.7});
if(!prefersReduced) counters.forEach(el=>counterObserver.observe(el));
else counters.forEach(el=>el.textContent=el.dataset.counter);

/* Tilt — disabled on touch/reduced motion */
const canTilt = !prefersReduced && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
if(canTilt){
  $$("[data-tilt]").forEach(card=>{
    card.addEventListener("pointermove", e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.classList.add("js-tilt");
      card.style.transform = `perspective(900px) rotateX(${y*-5}deg) rotateY(${x*6}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", ()=>{
      card.style.transform = "";
    });
  });
}

/* Magnetic buttons only on desktop */
if(canTilt){
  $$(".magnetic").forEach(btn=>{
    btn.addEventListener("pointermove", e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.13}px,${(e.clientY-r.top-r.height/2)*.13}px)`;
    });
    btn.addEventListener("pointerleave", ()=>btn.style.transform="");
  });
}

/* Cursor glow */
const glow = $(".cursor-glow");
if(glow && canTilt){
  window.addEventListener("pointermove", e=>{
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, {passive:true});
}

/* Particle canvas — lightweight and responsive */
const canvas = $("#particles");
const ctx = canvas?.getContext("2d");
let particles = [];
let raf;
function resizeCanvas(){
  if(!canvas) return;
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+"px"; canvas.style.height=innerHeight+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function createParticles(){
  if(!canvas) return;
  const count = innerWidth < 600 ? 24 : innerWidth < 1000 ? 38 : 58;
  particles = Array.from({length:count},()=>({
    x:Math.random()*innerWidth,y:Math.random()*innerHeight,
    r:Math.random()*1.4+.3,
    vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16,
    a:Math.random()*.45+.1
  }));
}
function drawParticles(){
  if(!ctx) return;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  particles.forEach((p,i)=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=innerWidth;if(p.x>innerWidth)p.x=0;
    if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(180,174,255,${p.a})`;ctx.fill();
    if(innerWidth>800){
      for(let j=i+1;j<particles.length;j++){
        const q=particles[j], dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
        if(d<105){
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
          ctx.strokeStyle=`rgba(139,124,255,${.055*(1-d/105)})`;ctx.stroke();
        }
      }
    }
  });
  raf=requestAnimationFrame(drawParticles);
}
if(canvas && !prefersReduced){
  resizeCanvas();createParticles();drawParticles();
  window.addEventListener("resize",()=>{resizeCanvas();createParticles()});
}else if(canvas){
  canvas.style.display="none";
}

/* Contact */
const form = $("#contactForm");
const toast = $("#toast");
form?.addEventListener("submit", e=>{
  e.preventDefault();
  const data = new FormData(form);
  if(!data.get("name") || !data.get("email") || !data.get("message")) return;
  form.reset();
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),4000);
});

/* Year */
$("#year").textContent = new Date().getFullYear();

/* Escape */
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeMenu(); });
