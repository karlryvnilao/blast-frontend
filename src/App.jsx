import { useState, useEffect, useRef } from "react";
import { LOGO } from "./logo.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS  = Array.from({ length: 10 }, (_, i) => i);
const SHAPES = [
  { name:"Circle",   emoji:"🔵"},{name:"Square",    emoji:"🟦"},
  { name:"Triangle", emoji:"🔷"},{name:"Rectangle", emoji:"🟪"},
  { name:"Star",     emoji:"🔷"},{name:"Heart",     emoji:"🔵"},
  { name:"Diamond",  emoji:"🔷"},{name:"Oval",      emoji:"🔵"},
  { name:"Pentagon", emoji:"🟦"},{name:"Hexagon",   emoji:"🟦"},
];
const COLORS = [
  {name:"Red",hex:"#FF4444"},{name:"Blue",hex:"#4488FF"},{name:"Yellow",hex:"#FFDD00"},
  {name:"Green",hex:"#44BB44"},{name:"Orange",hex:"#FF8800"},{name:"Purple",hex:"#9944CC"},
  {name:"Pink",hex:"#FF77AA"},{name:"Brown",hex:"#885533"},{name:"Black",hex:"#222222"},{name:"White",hex:"#EEEEEE"},
];
const CATEGORIES = [
  {id:"alphabets",label:"Alphabets",emoji:"🔤",color1:"#FF0080",color2:"#7B00D4",mascot:"🦄",glow:"#FF0080"},
  {id:"numbers",label:"Numbers",emoji:"🔢",color1:"#00D4FF",color2:"#0047AB",mascot:"🐙",glow:"#00D4FF"},
  {id:"shapes",label:"Shapes",emoji:"🔷",color1:"#FFD700",color2:"#FF6B00",mascot:"🦁",glow:"#FFD700"},
  {id:"colors",label:"Colors",emoji:"🎨",color1:"#00FF88",color2:"#007744",mascot:"🦋",glow:"#00FF88"},
];
const EMOJIS={A:"🍎",B:"⚽",C:"🐱",D:"🐶",E:"🐘",F:"🐟",G:"🐐",H:"🎩",I:"🏔️",J:"🫙",K:"🪁",L:"🦁",M:"🌙",N:"🪺",O:"🍊",P:"✏️",Q:"👑",R:"🌧️",S:"☀️",T:"🌲",U:"☂️",V:"🚐",W:"💧",X:"🩻",Y:"🧶",Z:"🦓"};
const NUM_EMOJI=["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];

const AVATARS=[
  {id:"unicorn",emoji:"🦄",label:"Unicorn",bg:"linear-gradient(135deg,#FF77DD,#AA00FF)"},
  {id:"dragon",emoji:"🐲",label:"Dragon",bg:"linear-gradient(135deg,#00CC44,#006622)"},
  {id:"rocket",emoji:"🚀",label:"Rocket",bg:"linear-gradient(135deg,#FF6600,#CC0000)"},
  {id:"star",emoji:"⭐",label:"Star",bg:"linear-gradient(135deg,#FFD700,#FF8800)"},
  {id:"rainbow",emoji:"🌈",label:"Rainbow",bg:"linear-gradient(135deg,#FF0080,#00D4FF)"},
  {id:"penguin",emoji:"🐧",label:"Penguin",bg:"linear-gradient(135deg,#4488FF,#002266)"},
  {id:"fox",emoji:"🦊",label:"Fox",bg:"linear-gradient(135deg,#FF6600,#882200)"},
  {id:"panda",emoji:"🐼",label:"Panda",bg:"linear-gradient(135deg,#888888,#222222)"},
  {id:"cat",emoji:"🐱",label:"Cat",bg:"linear-gradient(135deg,#FF99CC,#CC4488)"},
  {id:"dino",emoji:"🦕",label:"Dino",bg:"linear-gradient(135deg,#66DD00,#226600)"},
  {id:"owl",emoji:"🦉",label:"Owl",bg:"linear-gradient(135deg,#CC8800,#664400)"},
  {id:"butterfly",emoji:"🦋",label:"Butterfly",bg:"linear-gradient(135deg,#FF00FF,#6600AA)"},
  {id:"lion",emoji:"🦁",label:"Lion",bg:"linear-gradient(135deg,#FFAA00,#885500)"},
  {id:"dolphin",emoji:"🐬",label:"Dolphin",bg:"linear-gradient(135deg,#00AAFF,#003366)"},
  {id:"koala",emoji:"🐨",label:"Koala",bg:"linear-gradient(135deg,#AAAAAA,#444444)"},
  {id:"monkey",emoji:"🐵",label:"Monkey",bg:"linear-gradient(135deg,#CC7722,#663300)"},
];

const CORRECT_COMPLIMENTS=[
  "Wow, you are SO smart!","That is amazing! You got it right!","You are a superstar!",
  "Fantastic job! Keep going!","Yes! That is correct! Great job!","Oh my goodness, you are so brilliant!",
  "Incredible! You are so clever!","Perfect! You are doing amazing!","Woohoo! You are on fire!",
  "That is wonderful! I am so proud of you!",
];
const WRONG_COMPLIMENTS=[
  "Good try! You can do it, keep going!","Almost there! Try one more time!",
  "Don't give up! You are so close!","Nice try! You are learning so well!",
  "That is okay! Every try makes you smarter!","Keep going! You are doing great!",
  "Oops! But you are still a superstar!","Try again! I believe in you!",
];

function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5);}
function randomOf(arr){return arr[Math.floor(Math.random()*arr.length)];}

// ─── GIRL VOICE ────────────────────────────────────────────────────────────
// ─── SPEAK via Capacitor Native TTS (Android) ──────────────────────────────
function speak(text, rate=0.9){
  const TTS = window?.Capacitor?.Plugins?.TextToSpeech;
  if(!TTS) return;
  TTS.stop().catch(()=>{});
  // rate < 0.5 = SLOW mode: use very low rate so a single letter takes ~5s
  // rate >= 0.5 = FAST mode: normal speed ~1s
  const nativeRate = rate < 0.5 ? 0.15 : 1.1;
  TTS.speak({
    text,
    lang: "en-US",
    rate: nativeRate,
    pitch: 1.4,
    volume: 0.5,
    category: "ambient",
  }).catch(()=>{});
}

// ─── SOUND ENGINE ──────────────────────────────────────────────────────────

let _ctx=null;
function getCtx(){if(!_ctx)_ctx=new(window.AudioContext||window.webkitAudioContext)();return _ctx;}
function playTone(freq,type="sine",duration=0.18,vol=0.3,delay=0){
  try{
    const ctx=getCtx();
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.type=type;osc.frequency.value=freq;
    const t=ctx.currentTime+delay;
    gain.gain.setValueAtTime(0,t);
    gain.gain.linearRampToValueAtTime(vol,t+0.02);
    gain.gain.linearRampToValueAtTime(0,t+duration);
    osc.start(t);osc.stop(t+duration+0.05);
  }catch(_){}
}
function playSplashJingle(){
  [{f:523,d:0.15,v:0.35},{f:659,d:0.15,v:0.35},{f:784,d:0.15,v:0.35},
   {f:1047,d:0.2,v:0.4},{f:784,d:0.1,v:0.3},{f:1047,d:0.1,v:0.3},{f:1319,d:0.35,v:0.45}]
  .reduce((t,n)=>{playTone(n.f,"sine",n.d,n.v,t);return t+n.d+0.03;},0);
  setTimeout(()=>speak("Welcome to B L A S T! Let's learn and play!",0.85),1500);
}
function playPop(){playTone(880,"sine",0.1,0.3);setTimeout(()=>playTone(1100,"sine",0.08,0.2),60);}
function playCorrect(){[523,659,784,1047].forEach((f,i)=>playTone(f,"sine",0.15,0.35,i*0.1));}
function playWrong(){playTone(220,"sawtooth",0.2,0.25);setTimeout(()=>playTone(180,"sawtooth",0.2,0.2),150);}
function playTimeout(){[440,330,220].forEach((f,i)=>playTone(f,"triangle",0.18,0.3,i*0.15));}
function playTick(){playTone(1200,"sine",0.06,0.15);}
function playFlip(){playTone(660,"sine",0.08,0.2);setTimeout(()=>playTone(880,"sine",0.1,0.25),60);}
function playAvatarPop(){[880,1047,1319].forEach((f,i)=>playTone(f,"sine",0.1,0.25,i*0.08));}

// ─── BACKGROUND MUSIC (energetic kids soundtrack) ──────────────────────────
let _bgOn = true;
let _bgNodes = [];
let _bgLoopTimeout = null;
let _currentMusicType = null;
let _masterGain = null;

function getMasterGain() {
  const ctx = getCtx();
  if (!_masterGain) {
    _masterGain = ctx.createGain();
    _masterGain.gain.value = 1.0;
    _masterGain.connect(ctx.destination);
  }
  return _masterGain;
}

function duckMusic()   { try { getMasterGain().gain.linearRampToValueAtTime(0.15, getCtx().currentTime + 0.2); } catch(_){} }
function unduckMusic() { try { getMasterGain().gain.linearRampToValueAtTime(1.0,  getCtx().currentTime + 0.3); } catch(_){} }

function stopBgMusic() {
  if (_bgLoopTimeout) { clearTimeout(_bgLoopTimeout); _bgLoopTimeout = null; }
  _bgNodes.forEach(n => { try { n.stop(0); } catch(_){} });
  _bgNodes = [];
  _currentMusicType = null;
}

function toggleMusic() {
  _bgOn = !_bgOn;
  if (!_bgOn) stopBgMusic();
  return _bgOn;
}

// Play a single note with attack/decay envelope
function note(ctx, freq, start, dur, vol=0.12, type="square", detune=0) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(getMasterGain());
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.setValueAtTime(vol, start + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, start + dur);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    _bgNodes.push(osc);
  } catch(_) {}
}

// Kick drum
function kick(ctx, start) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(getMasterGain());
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, start);
    osc.frequency.exponentialRampToValueAtTime(30, start + 0.18);
    gain.gain.setValueAtTime(0.5, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
    osc.start(start); osc.stop(start + 0.25);
    _bgNodes.push(osc);
  } catch(_) {}
}

// Hi-hat click
function hihat(ctx, start, vol=0.06) {
  try {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = "highpass"; filter.frequency.value = 7000;
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(getMasterGain());
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.04);
    src.start(start);
    _bgNodes.push(src);
  } catch(_) {}
}

// ── MENU MUSIC: cheerful, bouncy, child-friendly ──────────────────────────
// Key of C major, 120 BPM feel
function playMenuLoop() {
  if (!_bgOn || _currentMusicType !== "menu") return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const BPM = 120;
    const B = 60 / BPM; // beat duration

    // ── Melody (glockenspiel-like, triangle wave) ──
    const melody = [
    // bar 1: C D E G  E D C E
      {f:523,t:0},{f:587,t:0.5},{f:659,t:1},{f:784,t:1.5},
      {f:659,t:2},{f:587,t:2.5},{f:523,t:3},{f:659,t:3.5},
    // bar 2: A G F E  D C D E
      {f:880,t:4},{f:784,t:4.5},{f:698,t:5},{f:659,t:5.5},
      {f:587,t:6},{f:523,t:6.5},{f:587,t:7},{f:659,t:7.5},
    // bar 3: C E G C(hi)  G E C G
      {f:523,t:8},{f:659,t:8.5},{f:784,t:9},{f:1047,t:9.5},
      {f:784,t:10},{f:659,t:10.5},{f:523,t:11},{f:784,t:11.5},
    // bar 4: F E D C  D E G C
      {f:698,t:12},{f:659,t:12.5},{f:587,t:13},{f:523,t:13.5},
      {f:587,t:14},{f:659,t:14.5},{f:784,t:15},{f:523,t:15.5},
    ];
    melody.forEach(({f,t}) => note(ctx, f, now + t*B, B*0.45, 0.14, "triangle"));

    // ── Counter melody (higher octave bells) ──
    const bells = [
      {f:1047,t:1},{f:1175,t:3},{f:1047,t:5},{f:880,t:7},
      {f:1319,t:9},{f:1047,t:11},{f:880,t:13},{f:1047,t:15},
    ];
    bells.forEach(({f,t}) => note(ctx, f, now + t*B, B*0.35, 0.07, "sine"));

    // ── Bass line (square wave, low) ──
    const bass = [
      {f:131,t:0},{f:131,t:2},{f:110,t:4},{f:110,t:6},
      {f:131,t:8},{f:131,t:10},{f:175,t:12},{f:131,t:14},
    ];
    bass.forEach(({f,t}) => note(ctx, f, now + t*B, B*1.8, 0.1, "sawtooth"));

    // ── Chords (warm pad) ──
    const chords = [
      [523,659,784], [523,659,784],
      [440,554,659], [440,554,659],
      [523,659,784], [523,659,784],
      [349,440,523], [523,659,784],
    ];
    chords.forEach((chord, i) => {
      chord.forEach(f => note(ctx, f, now + i*2*B, B*1.9, 0.04, "sine", 5));
    });

    // ── Drums ──
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) kick(ctx, now + i*B);          // kick on beat
      if (i % 2 !== 0) hihat(ctx, now + i*B, 0.05);   // hihat offbeats
    }

    // Loop after 16 beats
    const loopDur = 16 * B * 1000;
    _bgLoopTimeout = setTimeout(playMenuLoop, loopDur - 50);
  } catch(_) {}
}

// ── GAME MUSIC: fast, hype, exciting energy ────────────────────────────────
// Key of A minor, 150 BPM — energetic and urgent
function playGameLoop() {
  if (!_bgOn || _currentMusicType !== "game") return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const BPM = 150;
    const B = 60 / BPM;

    // ── Fast hype melody ──
    const melody = [
    // bar 1
      {f:880,t:0},{f:988,t:0.5},{f:1047,t:1},{f:880,t:1.5},
      {f:784,t:2},{f:880,t:2.5},{f:988,t:3},{f:1047,t:3.5},
    // bar 2
      {f:1175,t:4},{f:1047,t:4.5},{f:988,t:5},{f:880,t:5.5},
      {f:784,t:6},{f:698,t:6.5},{f:784,t:7},{f:880,t:7.5},
    // bar 3 — climax
      {f:1319,t:8},{f:1175,t:8.5},{f:1047,t:9},{f:988,t:9.5},
      {f:880,t:10},{f:784,t:10.5},{f:698,t:11},{f:784,t:11.5},
    // bar 4 — resolve
      {f:880,t:12},{f:988,t:12.5},{f:1047,t:13},{f:1175,t:13.5},
      {f:1319,t:14},{f:1175,t:14.5},{f:1047,t:15},{f:880,t:15.5},
    ];
    melody.forEach(({f,t}) => note(ctx, f, now + t*B, B*0.4, 0.13, "square"));

    // ── Punchy counter melody ──
    const counter = [
      {f:659,t:1},{f:698,t:3},{f:784,t:5},{f:659,t:7},
      {f:880,t:9},{f:784,t:11},{f:698,t:13},{f:784,t:15},
    ];
    counter.forEach(({f,t}) => note(ctx, f, now + t*B, B*0.5, 0.08, "sawtooth"));

    // ── Driving bass ──
    const bass = [
      {f:110,t:0},{f:110,t:0.5},{f:110,t:1},{f:98,t:1.5},
      {f:110,t:2},{f:110,t:2.5},{f:123,t:3},{f:110,t:3.5},
      {f:110,t:4},{f:110,t:4.5},{f:110,t:5},{f:98,t:5.5},
      {f:110,t:6},{f:123,t:6.5},{f:110,t:7},{f:123,t:7.5},
      {f:146,t:8},{f:146,t:8.5},{f:131,t:9},{f:131,t:9.5},
      {f:123,t:10},{f:123,t:10.5},{f:110,t:11},{f:110,t:11.5},
      {f:110,t:12},{f:110,t:12.5},{f:123,t:13},{f:123,t:13.5},
      {f:131,t:14},{f:146,t:14.5},{f:165,t:15},{f:146,t:15.5},
    ];
    bass.forEach(({f,t}) => note(ctx, f, now + t*B, B*0.8, 0.12, "sawtooth"));

    // ── Energetic drums: kick on every beat + fast hihats ──
    for (let i = 0; i < 16; i++) {
      kick(ctx, now + i*B);                               // kick every beat
      hihat(ctx, now + i*B, 0.05);                       // hihat on beat
      hihat(ctx, now + (i + 0.5)*B, 0.07);               // hihat on offbeat
      if (i % 4 === 2) hihat(ctx, now + (i + 0.25)*B, 0.04); // extra 16th
    }

    // ── Accent stabs on strong beats ──
    [0, 4, 8, 12].forEach(t => {
      [220, 277, 330].forEach(f => note(ctx, f, now + t*B, B*0.15, 0.08, "square"));
    });

    const loopDur = 16 * B * 1000;
    _bgLoopTimeout = setTimeout(playGameLoop, loopDur - 50);
  } catch(_) {}
}

function startBgMusic(type = "menu") {
  stopBgMusic();
  if (!_bgOn) return;
  _currentMusicType = type;
  if (type === "game") playGameLoop();
  else playMenuLoop();
}

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────
function GlobalStyles(){return(
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Baloo+2:wght@600;700;800;900&display=swap');
    *{box-sizing:border-box;}
    html{font-size:20px;}
    body{margin:0;background:#C9B8F0;font-size:20px;}
    @keyframes bounce-in{0%{transform:scale(0.1) rotate(-20deg);opacity:0}55%{transform:scale(1.18) rotate(6deg);opacity:1}75%{transform:scale(0.95)}100%{transform:scale(1) rotate(0)}}
    @keyframes float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-20px) rotate(3deg)}}
    @keyframes wiggle{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(6deg) scale(1.1)}}
    @keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.35)}70%{transform:scale(0.92)}100%{transform:scale(1)}}
    @keyframes fall{to{top:115%;transform:rotate(720deg) scale(0.5)}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-14px) rotate(-3deg)}40%,80%{transform:translateX(14px) rotate(3deg)}}
    @keyframes glow-pulse{0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #FF6B9D}50%{text-shadow:0 0 50px #FFD700,0 0 90px #00BCD4}}
    @keyframes neon-border{0%,100%{box-shadow:0 0 10px #FF0080,0 0 30px #FF0080}50%{box-shadow:0 0 20px #7B00D4,0 0 60px #7B00D4}}
    @keyframes spin-in{0%{transform:rotate(-180deg) scale(0);opacity:0}100%{transform:rotate(0) scale(1);opacity:1}}
    @keyframes pulse-btn{0%,100%{box-shadow:0 8px 30px rgba(255,0,128,0.6)}50%{box-shadow:0 12px 50px rgba(255,0,128,0.9)}}
    @keyframes timer-warn{0%,100%{background:linear-gradient(135deg,#FF4444,#CC0000)}50%{background:linear-gradient(135deg,#FF0000,#880000)}}
    @keyframes slide-up{0%{transform:translateY(60px) scale(0.9);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
    @keyframes compliment-pop{0%{transform:scale(0) translateY(10px);opacity:0}60%{transform:scale(1.12) translateY(-4px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}
    @keyframes avatar-sel{0%{transform:scale(1)}50%{transform:scale(1.25) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
    @keyframes rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
    .b-float{animation:float 3s ease-in-out infinite;}
    .b-wiggle{animation:wiggle 1.2s ease-in-out infinite;}
    .b-bounce{animation:bounce-in 0.6s cubic-bezier(.34,1.56,.64,1) both;}
    .b-btn{transition:transform 0.1s,box-shadow 0.1s,filter 0.1s;cursor:pointer;}
    .b-btn:active{transform:scale(0.85)!important;filter:brightness(1.3);}
    .b-btn:hover{transform:scale(1.08) translateY(-4px);}
    .b-pop{animation:pop 0.4s cubic-bezier(.34,1.56,.64,1);}
    .b-shake{animation:shake 0.5s ease;}
    .b-glow{animation:glow-pulse 2s ease-in-out infinite;}
    .b-rainbow{animation:rainbow 3s linear infinite;}
    .b-slide{animation:slide-up 0.4s cubic-bezier(.34,1.56,.64,1) both;}
    .b-spin{animation:spin-in 0.5s cubic-bezier(.34,1.56,.64,1) both;}
    .b-compliment{animation:compliment-pop 0.5s cubic-bezier(.34,1.56,.64,1) both;}
    .b-avatar-sel{animation:avatar-sel 0.4s cubic-bezier(.34,1.56,.64,1);}
    ::-webkit-scrollbar{width:8px;}
    ::-webkit-scrollbar-thumb{background:linear-gradient(#FF0080,#7B00D4);border-radius:8px;}
  `}</style>
);}

// ─── CONFETTI ──────────────────────────────────────────────────────────────
function Confetti(){
  const items=["🎉","⭐","🌟","✨","🎊","💫","🥳","🏆","💥","🔥","🌈","💎","🎈","🦄","🎀"];
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {Array.from({length:45}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:"-60px",
          fontSize:`${1+Math.random()*2.5}rem`,
          animation:`fall ${0.8+Math.random()*2}s linear forwards`,
          animationDelay:`${Math.random()*0.8}s`}}>{items[i%items.length]}</div>
      ))}
    </div>
  );
}

// ─── BG SPACE ──────────────────────────────────────────────────────────────
function BgSpace(){
  return(
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0,
      background:"linear-gradient(180deg,#C9B8F0 0%,#E8C5E8 25%,#F7D4C8 55%,#F9E4C0 75%,#FDEFD4 100%)"}}>
      {/* Soft glow orbs */}
      <div style={{position:"absolute",top:"-10%",left:"10%",width:"55%",height:"55%",background:"radial-gradient(circle,rgba(255,182,255,0.35),transparent 70%)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",top:"5%",right:"-5%",width:"45%",height:"45%",background:"radial-gradient(circle,rgba(180,210,255,0.35),transparent 70%)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",bottom:"10%",left:"-5%",width:"50%",height:"40%",background:"radial-gradient(circle,rgba(255,220,180,0.3),transparent 70%)",borderRadius:"50%"}}/>
      {/* Fluffy clouds */}
      {[
        {top:"8%",left:"5%",w:110,op:0.55,delay:0},
        {top:"12%",left:"55%",w:130,op:0.5,delay:1.5},
        {top:"22%",left:"30%",w:90,op:0.4,delay:0.8},
        {top:"72%",left:"60%",w:120,op:0.45,delay:2},
        {top:"80%",left:"2%",w:100,op:0.4,delay:1},
        {top:"65%",left:"35%",w:80,op:0.35,delay:2.5},
      ].map((c,i)=>(
        <div key={i} className="b-float" style={{position:"absolute",top:c.top,left:c.left,
          opacity:c.op,animationDuration:"6s",animationDelay:`${c.delay}s`}}>
          <div style={{position:"relative",width:c.w,height:c.w*0.5}}>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"rgba(255,255,255,0.85)",borderRadius:999}}/>
            <div style={{position:"absolute",bottom:"30%",left:"15%",width:"40%",height:"70%",background:"rgba(255,255,255,0.85)",borderRadius:"50%"}}/>
            <div style={{position:"absolute",bottom:"25%",left:"40%",width:"35%",height:"60%",background:"rgba(255,255,255,0.85)",borderRadius:"50%"}}/>
            <div style={{position:"absolute",bottom:"15%",right:"10%",width:"28%",height:"50%",background:"rgba(255,255,255,0.85)",borderRadius:"50%"}}/>
          </div>
        </div>
      ))}
      {/* Sparkles */}
      {Array.from({length:18}).map((_,i)=>(
        <div key={i} className="b-float" style={{position:"absolute",
          left:`${5+i*5.5}%`,top:`${8+(i%7)*12}%`,
          fontSize:`${0.6+((i*7)%10)*0.12}rem`,
          opacity:0.5+((i*3)%5)*0.1,
          animationDelay:`${(i*0.4)%4}s`,animationDuration:`${2+(i*0.3)%3}s`,
          color:["#FFD700","#FF9EBD","#B8AAFF","#FFB347","#89CFF0"][i%5]
        }}>{"⭐✨💫🌟★"[i%5]}</div>
      ))}
    </div>
  );
}

// ─── MUSIC BUTTON ──────────────────────────────────────────────────────────
function MusicBtn({type="menu"}){
  const [on,setOn]=useState(true);
  function toggle(){
    const nowOn=toggleMusic();
    setOn(nowOn);
    if(nowOn)startBgMusic(type);
    playTick();
  }
  return(
    <button className="b-btn" onClick={toggle} style={{
      position:"fixed",bottom:16,right:16,zIndex:50,
      background:"rgba(0,0,0,0.6)",border:"2px solid rgba(255,215,0,0.5)",
      borderRadius:14,padding:"8px 14px",cursor:"pointer",
      fontFamily:"'Baloo 2',cursive",color:"#FFD700",fontWeight:800,fontSize:"1.3rem",
      backdropFilter:"blur(5px)",boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
    }}>{on?"🎵":"🔇"}</button>
  );
}

// ─── AVATAR PICKER ─────────────────────────────────────────────────────────
function AvatarPicker({selected,onSelect}){
  return(
    <div>
      <p style={{fontWeight:800,color:"#FFD700",fontFamily:"'Baloo 2',cursive",fontSize:"1rem",marginBottom:10,textAlign:"center",textShadow:"0 0 10px #FFD700"}}>
        🎨 Pick your avatar!
      </p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxHeight:280,overflowY:"auto",padding:"4px 2px"}}>
        {AVATARS.map(av=>(
          <button key={av.id} className="b-btn" onClick={()=>{playAvatarPop();onSelect(av.id);}} style={{
            background:av.bg,borderRadius:18,padding:"12px 6px",
            border:`4px solid ${selected===av.id?"#FFD700":"rgba(255,255,255,0.15)"}`,
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,
            boxShadow:selected===av.id?"0 0 28px #FFD700,0 6px 20px rgba(0,0,0,0.5)":"0 4px 12px rgba(0,0,0,0.4)",
            transform:selected===av.id?"scale(1.14)":"scale(1)",
            transition:"all 0.15s",
          }}>
            <div className={selected===av.id?"b-avatar-sel":""} style={{fontSize:"2.2rem"}}>{av.emoji}</div>
            <div style={{fontSize:"0.6rem",fontWeight:800,color:"#fff",fontFamily:"'Baloo 2',cursive",textShadow:"0 1px 4px rgba(0,0,0,0.6)",textAlign:"center"}}>{av.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AVATAR DISPLAY ────────────────────────────────────────────────────────
function AvatarDisplay({avatarId,size="md"}){
  const av=AVATARS.find(a=>a.id===avatarId)||AVATARS[0];
  const sz=size==="sm"?38:size==="lg"?72:52;
  const fs=size==="sm"?"1.3rem":size==="lg"?"2.6rem":"1.9rem";
  return(
    <div style={{width:sz,height:sz,borderRadius:sz/3,background:av.bg,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:fs,boxShadow:"0 4px 16px rgba(0,0,0,0.5)",border:"3px solid rgba(255,255,255,0.3)",flexShrink:0}}>
      {av.emoji}
    </div>
  );
}

// ─── COUNTDOWN TIMER ───────────────────────────────────────────────────────
function CountdownTimer({seconds,onDone,speed}){
  const [timeLeft,setTimeLeft]=useState(seconds);
  const ref=useRef(null);
  const warned=useRef(false);
  useEffect(()=>{
    setTimeLeft(seconds);warned.current=false;
    clearInterval(ref.current);
    ref.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(ref.current);onDone();return 0;}
        if(t===6&&!warned.current){warned.current=true;playTimeout();}
        return t-1;
      });
    },1000);
    return()=>clearInterval(ref.current);
  },[seconds]);
  const pct=timeLeft/seconds;
  const col=pct>0.5?"#00FF88":pct>0.25?"#FFD700":"#FF4444";
  const warn=timeLeft<=5;
  return(
    <div style={{textAlign:"center",marginBottom:12}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:10,
        background:warn?"linear-gradient(135deg,#FF4444,#CC0000)":"rgba(0,0,0,0.6)",
        border:`4px solid ${col}`,borderRadius:20,padding:"7px 22px",
        boxShadow:`0 0 20px ${col}66`,animation:warn?"timer-warn 0.5s ease infinite":"none"}}>
        <span style={{fontSize:"1.5rem"}}>⏱️</span>
        <span style={{fontSize:"2.2rem",fontWeight:900,fontFamily:"'Lilita One',cursive",color:col}}>{timeLeft}s</span>
        <span style={{fontSize:"0.75rem",color:"#aaa",fontWeight:700}}>{speed==="fast"?"⚡FAST":"🐢SLOW"}</span>
      </div>
      <div style={{height:12,background:"rgba(255,255,255,0.1)",borderRadius:10,margin:"8px auto",maxWidth:300,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct*100}%`,background:`linear-gradient(90deg,${col},#FFD700)`,borderRadius:10,transition:"width 0.9s linear",boxShadow:`0 0 14px ${col}`}}/>
      </div>
    </div>
  );
}

// ─── SPEED SELECTOR ────────────────────────────────────────────────────────
function SpeedSelector({speed,onSelect}){
  return(
    <div style={{display:"flex",gap:10,justifyContent:"center",margin:"6px 0 10px"}}>
      {[
        {id:"slow",icon:"🐢",label:"SLOW",sub:"5 sec",g:"linear-gradient(135deg,#006400,#00CC44)",glow:"#00FF88"},
        {id:"fast",icon:"⚡",label:"FAST",sub:"1 sec",g:"linear-gradient(135deg,#8B0000,#FF2222)",glow:"#FF4444"},
      ].map(s=>(
        <button key={s.id} className="b-btn" onClick={()=>{playTick();onSelect(s.id);}} style={{
          background:speed===s.id?s.g:"rgba(255,255,255,0.6)",
          border:`3px solid ${speed===s.id?s.glow:"rgba(0,0,0,0.1)"}`,
          borderRadius:16,padding:"8px 18px",
          color:speed===s.id?"#fff":"#555",
          fontFamily:"'Baloo 2',cursive",cursor:"pointer",
          minWidth:100,textAlign:"center",
          boxShadow:speed===s.id?`0 0 20px ${s.glow}88`:"0 2px 8px rgba(0,0,0,0.1)",
          transform:speed===s.id?"scale(1.05)":"scale(1)",transition:"all 0.2s",
        }}>
          <div style={{fontSize:"1.6rem"}}>{s.icon}</div>
          <div style={{fontWeight:800,fontSize:"0.85rem"}}>{s.label}</div>
          <div style={{fontSize:"0.65rem",opacity:0.85}}>{s.sub}</div>
        </button>
      ))}
    </div>
  );
}

// ─── SPLASH SCREEN ─────────────────────────────────────────────────────────
function SplashScreen({onDone}){
  const [fading,setFading]=useState(false);
  const [step,setStep]=useState(0);
  useEffect(()=>{
    playSplashJingle();
    const t1=setTimeout(()=>setStep(1),600);
    const t2=setTimeout(()=>setStep(2),1100);
    const t3=setTimeout(()=>setFading(true),3200);
    const t4=setTimeout(()=>{startBgMusic("menu");onDone();},3900);
    return()=>[t1,t2,t3,t4].forEach(clearTimeout);
  },[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,
      background:"linear-gradient(180deg,#C9B8F0 0%,#E8C5E8 30%,#F7D4C8 60%,#FDEFD4 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      transition:"opacity 0.7s ease",opacity:fading?0:1,overflow:"hidden"}}>
      <GlobalStyles/><BgSpace/>
      <div style={{textAlign:"center",position:"relative",zIndex:1,padding:24}}>
        {/* Logo image */}
        <img src={LOGO} alt="B.L.A.S.T." className="b-float" style={{
          width:180,height:180,borderRadius:36,objectFit:"cover",
          boxShadow:"0 12px 50px rgba(180,100,255,0.35),0 4px 16px rgba(0,0,0,0.12)",
          border:"5px solid rgba(255,255,255,0.9)",marginBottom:16,
        }}/>
        <h1 style={{fontFamily:"'Lilita One',cursive",fontSize:"3.6rem",margin:"0 0 2px",
          background:"linear-gradient(135deg,#FF6B9D 0%,#C44DFF 50%,#4D9FFF 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          animation:"glow-pulse 2s ease-in-out infinite"}}>B.L.A.S.T.</h1>
        <p style={{color:"#9933CC",fontWeight:700,fontSize:"0.68rem",letterSpacing:3,margin:"0 0 20px",fontFamily:"'Baloo 2',cursive"}}>BASIC LEARNING APPLICATION SOFTWARE FOR TYKES</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:24}}>
          {["B","L","A","S","T"].map((l,i)=>(
            <div key={l} className={step>=1?"b-bounce b-wiggle":""} style={{
              width:50,height:50,background:`linear-gradient(135deg,hsl(${i*60},85%,60%),hsl(${i*60+30},85%,48%))`,
              borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Lilita One',cursive",fontSize:"1.8rem",color:"#fff",
              boxShadow:`0 6px 20px hsl(${i*60},80%,55%)`,border:"3px solid rgba(255,255,255,0.6)",
              animationDelay:`${i*0.12}s`,opacity:step>=1?1:0,transition:"opacity 0.3s"}}>
              {l}
            </div>
          ))}
        </div>
        {step>=2&&(
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{width:14,height:14,borderRadius:"50%",
                background:`hsl(${i*80+300},80%,65%)`,
                animation:`float ${0.7+i*0.15}s ease-in-out infinite`,
                animationDelay:`${i*0.18}s`,boxShadow:`0 0 12px hsl(${i*80+300},80%,65%)`}}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ───────────────────────────────────────────────────────────
function HomeScreen({students,currentStudent,onLogin,onSwitchAccount,onStart,onTeacher,backendOk,onTeacherLogin}){
  const [step,setStep]=useState("login");
  const [nameInput,setNameInput]=useState("");
  const [pin,setPin]=useState("");
  const [selectedAvatar,setSelectedAvatar]=useState("unicorn");

  useEffect(()=>{startBgMusic("menu");},[]);

  function handleNext(){
    if(!nameInput.trim())return;
    const isExisting=students.some(s=>s.name.toLowerCase()===nameInput.trim().toLowerCase());
    if(isExisting){playCorrect();onLogin(nameInput.trim(),pin,null);setNameInput("");setPin("");}
    else setStep("avatar");
  }

  function handleCreate(){
    playCorrect();
    onLogin(nameInput.trim(),pin,selectedAvatar);
    setNameInput("");setPin("");setStep("login");
  }

  const isExisting=students.some(s=>s.name.toLowerCase()===nameInput.trim().toLowerCase());

  return(
    <div style={S.home}>
      <GlobalStyles/><BgSpace/><MusicBtn type="menu"/>
      <button className="b-btn" style={S.teacherBtn} onClick={()=>{playTick();onTeacher();}}>🍎 Teacher's Corner</button>
      <div className="b-bounce" style={S.homeCard}>
        <img src={LOGO} alt="B.L.A.S.T." className="b-float" style={{
          width:120,height:120,borderRadius:26,objectFit:"cover",
          boxShadow:"0 8px 30px rgba(180,100,255,0.3)",
          border:"4px solid rgba(255,255,255,0.9)",marginBottom:10,
        }}/>
        <h1 className="b-glow" style={S.title}>B.L.A.S.T.</h1>
        <p style={{color:"#9933CC",fontWeight:700,fontSize:"0.68rem",letterSpacing:3,margin:"2px 0 12px",fontFamily:"'Baloo 2',cursive"}}>BASIC LEARNING APPLICATION SOFTWARE FOR TYKES</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
          {["B","L","A","S","T"].map((l,i)=>(
            <div key={l} className="b-wiggle" style={{width:40,height:40,background:`linear-gradient(135deg,hsl(${i*60},85%,60%),hsl(${i*60+30},80%,48%))`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Lilita One',cursive",fontSize:"1.4rem",color:"#fff",boxShadow:`0 4px 16px hsl(${i*60},80%,55%)`,animationDelay:`${i*0.15}s`}}>{l}</div>
          ))}
        </div>

        {currentStudent?(
          <div style={{textAlign:"center",width:"100%"}}>
            <div className="b-pop" style={S.loggedInBadge}>
              <AvatarDisplay avatarId={currentStudent.avatar} size="lg"/>
              <div>
                <div style={{fontWeight:800,fontSize:"1.3rem",color:"#FFD700",textShadow:"0 0 10px #FFD700"}}>{currentStudent.name}</div>
                <div style={{color:"#FF8800",fontWeight:700,fontSize:"0.95rem"}}>⭐ {currentStudent.stars} stars</div>
              </div>
            </div>
            <button className="b-btn b-wiggle" style={S.btnStart} onClick={()=>{playPop();onStart();}}>🚀 START PLAYING!</button>
            <button className="b-btn" style={{...S.btnSec,marginTop:10}} onClick={()=>{playTick();onSwitchAccount();}}>🔄 Switch Account</button>
          </div>
        ):step==="login"?(
          <div style={{width:"100%"}}>
            <p style={{fontWeight:800,marginBottom:8,color:"#FFD700",fontFamily:"'Baloo 2',cursive",fontSize:"1rem"}}>✏️ Type your name:</p>
            <input style={S.input} placeholder="Your name here..." value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNext()}/>
            {isExisting&&<>
              <p style={{fontSize:"0.88rem",color:"#aaa",margin:"4px 0 8px",fontWeight:700}}>👋 Welcome back! PIN (optional):</p>
              <input style={S.input} placeholder="PIN" type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNext()} maxLength={4}/>
            </>}
            {students.length>0&&(
              <div style={{marginBottom:12}}>
                <p style={{fontSize:"0.82rem",color:"#aaa",marginBottom:6,fontWeight:700}}>👇 Or tap your name:</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
                  {students.map(s=>(
                    <button key={s.name} className="b-btn" style={{...S.namePill,display:"flex",alignItems:"center",gap:6}} onClick={()=>{playTick();setNameInput(s.name);}}>
                      <AvatarDisplay avatarId={s.avatar} size="sm"/>{s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button className="b-btn" style={S.btnStart} onClick={handleNext} disabled={!nameInput.trim()}>
              {isExisting?"🎈 Let's Go!":"➡️ Next: Pick Avatar!"}
            </button>
          </div>
        ):(
          <div style={{width:"100%"}}>
            <p style={{fontWeight:800,color:"#FF77FF",fontSize:"1rem",textAlign:"center",marginBottom:8,fontFamily:"'Baloo 2',cursive"}}>
              👋 Hi <span style={{color:"#FFD700"}}>{nameInput}</span>! Choose your character!
            </p>
            <AvatarPicker selected={selectedAvatar} onSelect={setSelectedAvatar}/>
            <button className="b-btn" style={{...S.btnStart,marginTop:14}} onClick={handleCreate}>🚀 Start Adventure!</button>
            <button className="b-btn" style={{...S.btnSec,marginTop:8}} onClick={()=>setStep("login")}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORY PICKER ───────────────────────────────────────────────────────
function CategoryPicker({student,onPick,onHome}){
  const [pressed,setPressed]=useState(null);
  useEffect(()=>{startBgMusic("menu");},[]);
  function handlePick(cat){
    playPop();setPressed(cat.id);
    setTimeout(()=>{setPressed(null);stopBgMusic();startBgMusic("game");onPick(cat);},200);
  }
  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="menu"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();stopBgMusic();startBgMusic("menu");onHome();}}>🏠 Home</button>
        <div className="b-bounce" style={{textAlign:"center",marginBottom:16}}>
          <AvatarDisplay avatarId={student.avatar} size="lg"/>
          <h2 className="b-glow" style={{...S.title,fontSize:"1.9rem",margin:"6px 0 2px"}}>Hi, {student.name}! 🎉</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.5)",borderRadius:20,padding:"6px 20px",border:"3px solid #FFD700",boxShadow:"0 0 20px rgba(255,215,0,0.3)"}}>
            <span style={{color:"#FFD700",fontWeight:800,fontFamily:"'Baloo 2',cursive",fontSize:"1.1rem",textShadow:"0 0 10px #FFD700"}}>⭐ {student.stars} Stars</span>
          </div>
        </div>
        <p style={{textAlign:"center",fontWeight:800,color:"#FF77FF",fontSize:"1.1rem",marginBottom:16,fontFamily:"'Baloo 2',cursive",textShadow:"0 0 10px #FF77FF"}}>🌟 Pick a category to start!</p>
        <div style={S.catGrid}>
          {CATEGORIES.map((cat,i)=>(
            <button key={cat.id} className="b-btn b-bounce" style={{...S.catCard,background:`linear-gradient(160deg,${cat.color1},${cat.color2})`,boxShadow:`0 10px 40px ${cat.glow}66,0 4px 14px rgba(0,0,0,0.5)`,border:`4px solid ${cat.glow}88`,transform:pressed===cat.id?"scale(0.88)":"scale(1)",animationDelay:`${i*0.1}s`}} onClick={()=>handlePick(cat)}>
              <div className="b-float" style={{fontSize:"3rem",animationDelay:`${i*0.3}s`,filter:"drop-shadow(0 0 10px rgba(255,255,255,0.5))"}}>{cat.mascot}</div>
              <div style={{fontSize:"2.5rem"}}>{cat.emoji}</div>
              <div style={{fontWeight:800,fontSize:"1.1rem",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.6)",fontFamily:"'Baloo 2',cursive"}}>{cat.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MODE PICKER ───────────────────────────────────────────────────────────
function ModePicker({category,student,onMode,onBack}){
  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="game"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();stopBgMusic();startBgMusic("menu");onBack();}}>← Back</button>
        <div className="b-bounce" style={{textAlign:"center",marginBottom:28}}>
          <div className="b-float" style={{fontSize:"5rem",filter:`drop-shadow(0 0 20px ${category.glow})`}}>{category.mascot}</div>
          <h2 style={{...S.title,fontSize:"2rem",margin:"6px 0"}}>{category.label}</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.5)",borderRadius:14,padding:"6px 18px",border:"3px solid #FFD700"}}>
            <AvatarDisplay avatarId={student.avatar} size="sm"/>
            <span style={{color:"#FFD700",fontWeight:800,fontFamily:"'Baloo 2',cursive",textShadow:"0 0 8px #FFD700"}}>⭐ {student.stars}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:18,maxWidth:360,margin:"0 auto"}}>
          <button className="b-btn" style={{...S.modeBtn,background:"linear-gradient(135deg,#4B0082,#9400D3)"}} onClick={()=>{playPop();onMode("module");}}>
            <span className="b-wiggle" style={{fontSize:"3rem",filter:"drop-shadow(0 0 10px rgba(255,0,255,0.5))"}}>📖</span>
            <div><div style={{fontWeight:800,fontSize:"1.3rem"}}>LEARN!</div><div style={{fontSize:"0.85rem",opacity:0.9}}>Sounds and pictures — pick your speed!</div></div>
          </button>
          <button className="b-btn" style={{...S.modeBtn,background:"linear-gradient(135deg,#8B0000,#CC0044)"}} onClick={()=>{playPop();onMode("activity");}}>
            <span className="b-wiggle" style={{fontSize:"3rem",animationDelay:"0.3s",filter:"drop-shadow(0 0 10px rgba(255,0,100,0.5))"}}>🎮</span>
            <div><div style={{fontWeight:800,fontSize:"1.3rem"}}>PLAY GAMES!</div><div style={{fontSize:"0.85rem",opacity:0.9}}>Voice and matching — win stars!</div></div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE HELPER ─────────────────────────────────────────────────────────
function ModuleShell({title,onBack,speed,onSpeedChange,navRow,children}){
  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="game"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();stopBgMusic();startBgMusic("menu");onBack();}}>← Back</button>
        <h2 style={{...S.title,fontSize:"1.4rem",textAlign:"center",margin:"2px 0 4px"}}>{title}</h2>
        <SpeedSelector speed={speed} onSelect={onSpeedChange}/>
        {children}
        {navRow}
      </div>
    </div>
  );
}

// ─── KID CHARACTER SVG COMPONENTS ────────────────────────────────────────────
// Style: shape has its OWN face (eyes+smile on the shape body)
// Kid character peeks from BEHIND the shape (head + arms showing around edges)

const SHAPE_COLS={Heart:"#FF6B9D",Diamond:"#5BC8FF",Circle:"#C97DD4",Rectangle:"#52B788",Square:"#5BA4E6",Star:"#FFD166",Oval:"#9B89C4",Crescent:"#B39DDB",Flower:"#FF80AB"};
const LETTER_BG=["#FF6B6B","#FF9F43","#FECA57","#48DBFB","#FF9FF3","#54A0FF","#5F27CD","#00D2D3","#1DD1A1","#F368E0","#EE5A24","#009432","#0652DD","#9980FA","#ED4C67","#B53471","#006266","#1289A7","#C4E538","#FDA7DF","#D980FA","#12CBC4","#FFC312","#C4E538","#7158e2","#3d3d3d"];
const NUM_BG=["#FF6B6B","#FF9F43","#FECA57","#48DBFB","#FF9FF3","#54A0FF","#5F27CD","#00D2D3","#1DD1A1","#F368E0"];

// Face drawn ON the shape itself
function ShapeFace({cx,cy,r,dark=false}){
  const tc=dark?"rgba(0,0,0,0.7)":"#3d1a0a";
  return(<>
    {/* white eyes */}
    <ellipse cx={cx-r*0.28} cy={cy-r*0.08} rx={r*0.16} ry={r*0.18} fill="#fff"/>
    <ellipse cx={cx+r*0.28} cy={cy-r*0.08} rx={r*0.16} ry={r*0.18} fill="#fff"/>
    {/* pupils */}
    <circle cx={cx-r*0.28} cy={cy-r*0.06} r={r*0.09} fill={tc}/>
    <circle cx={cx+r*0.28} cy={cy-r*0.06} r={r*0.09} fill={tc}/>
    {/* eye shine */}
    <circle cx={cx-r*0.22} cy={cy-r*0.13} r={r*0.04} fill="#fff"/>
    <circle cx={cx+r*0.34} cy={cy-r*0.13} r={r*0.04} fill="#fff"/>
    {/* rosy cheeks */}
    <ellipse cx={cx-r*0.44} cy={cy+r*0.14} rx={r*0.15} ry={r*0.09} fill="rgba(255,120,120,0.4)"/>
    <ellipse cx={cx+r*0.44} cy={cy+r*0.14} rx={r*0.15} ry={r*0.09} fill="rgba(255,120,120,0.4)"/>
    {/* big smile with teeth */}
    <path d={`M${cx-r*0.26} ${cy+r*0.2} Q${cx} ${cy+r*0.44} ${cx+r*0.26} ${cy+r*0.2}`} fill="none" stroke={tc} strokeWidth={r*0.07} strokeLinecap="round"/>
    <ellipse cx={cx} cy={cy+r*0.3} rx={r*0.18} ry={r*0.08} fill="#fff" opacity={0.7}/>
  </>);
}

// Kid head that peeks behind the shape
function KidHead({cx,cy,r,pigtails=false}){
  return(<>
    {/* hair back */}
    <ellipse cx={cx} cy={cy-r*0.1} rx={r*1.08} ry={r*1.05} fill="#6B3A1F"/>
    {pigtails&&<>
      <circle cx={cx-r*1.15} cy={cy-r*0.4} r={r*0.32} fill="#6B3A1F"/>
      <circle cx={cx+r*1.15} cy={cy-r*0.4} r={r*0.32} fill="#6B3A1F"/>
    </>}
    {/* face */}
    <circle cx={cx} cy={cy} r={r} fill="#FFCB99" stroke="#e8a87c" strokeWidth={r*0.06}/>
    {/* hair front */}
    <ellipse cx={cx} cy={cy-r*0.72} rx={r*0.9} ry={r*0.5} fill="#6B3A1F"/>
    {/* eyes */}
    <ellipse cx={cx-r*0.32} cy={cy-r*0.1} rx={r*0.12} ry={r*0.14} fill="#3d1a0a"/>
    <ellipse cx={cx+r*0.32} cy={cy-r*0.1} rx={r*0.12} ry={r*0.14} fill="#3d1a0a"/>
    <circle cx={cx-r*0.26} cy={cy-r*0.16} r={r*0.05} fill="#fff"/>
    <circle cx={cx+r*0.38} cy={cy-r*0.16} r={r*0.05} fill="#fff"/>
    {/* cheeks */}
    <ellipse cx={cx-r*0.5} cy={cy+r*0.15} rx={r*0.16} ry={r*0.1} fill="rgba(255,140,140,0.5)"/>
    <ellipse cx={cx+r*0.5} cy={cy+r*0.15} rx={r*0.16} ry={r*0.1} fill="rgba(255,140,140,0.5)"/>
    {/* smile */}
    <path d={`M${cx-r*0.24} ${cy+r*0.22} Q${cx} ${cy+r*0.42} ${cx+r*0.24} ${cy+r*0.22}`} fill="none" stroke="#3d1a0a" strokeWidth={r*0.07} strokeLinecap="round"/>
    {/* teeth */}
    <ellipse cx={cx} cy={cy+r*0.32} rx={r*0.16} ry={r*0.07} fill="#fff" opacity={0.8}/>
  </>);
}

function KidShape({name,color,size=190}){
  const c=color||SHAPE_COLS[name]||"#C97DD4";
  const s=size;
  const cx=s/2;
  // Shape sits in lower portion; kid head peeks from top-behind
  const shapecy=s*0.62;  // shape center Y
  const sh=s*0.38;       // shape half-size
  const kidHeadCY=s*0.22; // kid head center Y (above shape)
  const kidR=s*0.14;      // kid head radius

  // Shade color for shape
  const shade=(hex)=>{
    const n=parseInt(hex.slice(1),16);
    const r=Math.max(0,(n>>16)-30);const g=Math.max(0,((n>>8)&0xff)-30);const b=Math.max(0,(n&0xff)-30);
    return`#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  };

  const shapeBody={
    Heart:   <path d={`M${cx} ${shapecy+sh*0.8} C${cx-sh*1.3} ${shapecy-sh*0.1} ${cx-sh*1.2} ${shapecy-sh*1.1} ${cx} ${shapecy-sh*0.3} C${cx+sh*1.2} ${shapecy-sh*1.1} ${cx+sh*1.3} ${shapecy-sh*0.1} ${cx} ${shapecy+sh*0.8}`} fill={c}/>,
    Diamond: <polygon points={`${cx},${shapecy-sh*1.1} ${cx+sh*0.9},${shapecy} ${cx},${shapecy+sh*1.1} ${cx-sh*0.9},${shapecy}`} fill={c}/>,
    Circle:  <circle cx={cx} cy={shapecy} r={sh*1.05} fill={c}/>,
    Rectangle:<rect x={cx-sh*1.3} y={shapecy-sh*0.75} width={sh*2.6} height={sh*1.5} rx={sh*0.12} fill={c}/>,
    Square:  <rect x={cx-sh*1.0} y={shapecy-sh*1.0} width={sh*2.0} height={sh*2.0} rx={sh*0.14} fill={c}/>,
    Star:    <polygon points={Array.from({length:10},(_,i)=>{const a=Math.PI/5*i-Math.PI/2;const r2=i%2?sh*0.45:sh*1.05;return`${cx+r2*Math.cos(a)},${shapecy+r2*Math.sin(a)}`;}).join(" ")} fill={c}/>,
    Oval:    <ellipse cx={cx} cy={shapecy} rx={sh*0.82} ry={sh*1.05} fill={c}/>,
    Crescent:<><circle cx={cx} cy={shapecy} r={sh*1.0} fill={c}/><circle cx={cx+sh*0.44} cy={shapecy-sh*0.2} r={sh*0.82} fill="#E8D5F5"/></>,
    Flower:  <>{Array.from({length:6},(_,i)=>{const a=Math.PI/3*i;return<ellipse key={i} cx={cx+sh*0.62*Math.cos(a)} cy={shapecy+sh*0.62*Math.sin(a)} rx={sh*0.44} ry={sh*0.62} fill={c} transform={`rotate(${i*60},${cx+sh*0.62*Math.cos(a)},${shapecy+sh*0.62*Math.sin(a)})`}/>})}<circle cx={cx} cy={shapecy} r={sh*0.36} fill="#FFD93D"/></>,
  };

  // Face position on shape (center of shape body)
  const faceCY = name==="Heart"?shapecy+sh*0.1 : name==="Star"?shapecy+sh*0.25 : shapecy;
  const faceR  = name==="Rectangle"?sh*0.48 : name==="Diamond"?sh*0.38 : sh*0.45;

  return(
    <svg width={s} height={s*0.92} viewBox={`0 0 ${s} ${s*0.92}`} style={{overflow:"visible",display:"block"}}>
      {/* shadow */}
      <ellipse cx={cx} cy={s*0.9} rx={sh*0.9} ry={sh*0.12} fill="rgba(0,0,0,0.12)"/>
      {/* kid body/torso behind shape */}
      <ellipse cx={cx} cy={s*0.78} rx={kidR*1.4} ry={kidR*0.9} fill="#FF9F43"/>
      {/* kid arms behind shape */}
      <ellipse cx={cx-sh*0.95} cy={shapecy+sh*0.15} rx={sh*0.28} ry={sh*0.16} fill="#FFCB99" transform={`rotate(-25,${cx-sh*0.95},${shapecy+sh*0.15})`}/>
      <ellipse cx={cx+sh*0.95} cy={shapecy+sh*0.15} rx={sh*0.28} ry={sh*0.16} fill="#FFCB99" transform={`rotate(25,${cx+sh*0.95},${shapecy+sh*0.15})`}/>
      {/* kid head BEHIND shape */}
      <KidHead cx={cx} cy={kidHeadCY} r={kidR} pigtails={true}/>
      {/* shape body ON TOP */}
      {shapeBody[name]||shapeBody.Circle}
      {/* shape face ON the shape */}
      <ShapeFace cx={cx} cy={faceCY} r={faceR} dark={name==="Star"||name==="Flower"}/>
    </svg>
  );
}

function KidLetter({letter,size=180}){
  const idx="ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter);
  const c=LETTER_BG[idx]||"#FF6B6B";
  const s=size, cx=s/2;
  const shapecy=s*0.6, sh=s*0.35;
  const kidR=s*0.135;
  return(
    <svg width={s} height={s*0.92} viewBox={`0 0 ${s} ${s*0.92}`} style={{overflow:"visible",display:"block"}}>
      <ellipse cx={cx} cy={s*0.9} rx={sh*0.9} ry={sh*0.11} fill="rgba(0,0,0,0.12)"/>
      {/* kid torso */}
      <ellipse cx={cx} cy={s*0.78} rx={kidR*1.4} ry={kidR*0.9} fill="#5BA4E6"/>
      {/* arms behind */}
      <ellipse cx={cx-sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(-22,${cx-sh*0.95},${shapecy+sh*0.1})`}/>
      <ellipse cx={cx+sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(22,${cx+sh*0.95},${shapecy+sh*0.1})`}/>
      {/* kid head behind */}
      <KidHead cx={cx} cy={s*0.22} r={kidR} pigtails={false}/>
      {/* circle badge */}
      <circle cx={cx} cy={shapecy} r={sh*1.05} fill={c}/>
      {/* letter on badge */}
      <text x={cx} y={shapecy+sh*0.42} textAnchor="middle" fontFamily="'Lilita One',cursive" fontSize={sh*1.15} fill="#fff" opacity={0.95}>{letter}</text>
      {/* face on badge */}
      <ShapeFace cx={cx} cy={shapecy} r={sh*0.46}/>
    </svg>
  );
}

function KidNumber({num,size=180}){
  const c=NUM_BG[num]||"#54A0FF";
  const s=size, cx=s/2;
  const shapecy=s*0.6, sh=s*0.34;
  const kidR=s*0.135;
  return(
    <svg width={s} height={s*0.92} viewBox={`0 0 ${s} ${s*0.92}`} style={{overflow:"visible",display:"block"}}>
      <ellipse cx={cx} cy={s*0.9} rx={sh*0.9} ry={sh*0.11} fill="rgba(0,0,0,0.12)"/>
      <ellipse cx={cx} cy={s*0.78} rx={kidR*1.4} ry={kidR*0.9} fill="#FF6B6B"/>
      <ellipse cx={cx-sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(-22,${cx-sh*0.95},${shapecy+sh*0.1})`}/>
      <ellipse cx={cx+sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(22,${cx+sh*0.95},${shapecy+sh*0.1})`}/>
      <KidHead cx={cx} cy={s*0.22} r={kidR} pigtails={false}/>
      {/* rounded square badge */}
      <rect x={cx-sh} y={shapecy-sh} width={sh*2} height={sh*2} rx={sh*0.28} fill={c}/>
      <text x={cx} y={shapecy+sh*0.44} textAnchor="middle" fontFamily="'Lilita One',cursive" fontSize={sh*1.18} fill="#fff" opacity={0.95}>{num}</text>
      <ShapeFace cx={cx} cy={shapecy} r={sh*0.44}/>
    </svg>
  );
}

function KidColor({hex,size=180}){
  const s=size, cx=s/2;
  const shapecy=s*0.6, sh=s*0.35;
  const kidR=s*0.135;
  const isDark=hex==="#222222";
  return(
    <svg width={s} height={s*0.92} viewBox={`0 0 ${s} ${s*0.92}`} style={{overflow:"visible",display:"block"}}>
      <ellipse cx={cx} cy={s*0.9} rx={sh*0.9} ry={sh*0.11} fill="rgba(0,0,0,0.12)"/>
      <ellipse cx={cx} cy={s*0.78} rx={kidR*1.4} ry={kidR*0.9} fill="#52B788"/>
      <ellipse cx={cx-sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(-22,${cx-sh*0.95},${shapecy+sh*0.1})`}/>
      <ellipse cx={cx+sh*0.95} cy={shapecy+sh*0.1} rx={sh*0.28} ry={sh*0.15} fill="#FFCB99" transform={`rotate(22,${cx+sh*0.95},${shapecy+sh*0.1})`}/>
      <KidHead cx={cx} cy={s*0.22} r={kidR} pigtails={true}/>
      <circle cx={cx} cy={shapecy} r={sh*1.05} fill={hex} stroke={isDark?"#555":"rgba(0,0,0,0.08)"} strokeWidth={3}/>
      {!isDark&&<ellipse cx={cx-sh*0.35} cy={shapecy-sh*0.45} rx={sh*0.28} ry={sh*0.34} fill="rgba(255,255,255,0.25)" transform={`rotate(-20,${cx-sh*0.35},${shapecy-sh*0.45})`}/>}
      <ShapeFace cx={cx} cy={shapecy} r={sh*0.46} dark={isDark}/>
    </svg>
  );
}




function AlphabetModule({onBack}){
  const [idx,setIdx]=useState(0);
  const [speed,setSpeed]=useState("slow");
  const letter=ALPHABET[idx];
  useEffect(()=>{playFlip();},[letter,speed]);
  return(
    <ModuleShell title="🔤 Alphabets" onBack={onBack} speed={speed} onSpeedChange={setSpeed}
      navRow={
        <div style={S.navRow}>
          <button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.max(0,i-1));}} disabled={idx===0}>◀ Prev</button>
          <div style={S.navPill}>{idx+1} / 26</div>
          <button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.min(25,i+1));}} disabled={idx===25}>Next ▶</button>
        </div>
      }>
      <div key={letter+speed} className="b-spin" style={{...S.moduleCard,background:"linear-gradient(160deg,#FF6B6B,#FFE66D)",border:"4px solid #fff",boxShadow:"0 8px 40px rgba(255,107,107,0.5)",padding:"18px 16px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:4}}>
          <div style={{fontSize:"4rem",lineHeight:1,fontFamily:"'Lilita One',cursive",color:"#7B2FBE",filter:"drop-shadow(2px 2px 0 #fff)"}}>{letter}</div>
          <div style={{width:3,height:50,background:"linear-gradient(#7B2FBE,#FF6B6B)",borderRadius:4,margin:"0 4px"}}/>
          <div style={{fontSize:"4rem",lineHeight:1,fontFamily:"'Lilita One',cursive",color:"#FF6B6B",filter:"drop-shadow(2px 2px 0 #fff)"}}>{letter.toLowerCase()}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center"}} className="b-bounce">
          <KidLetter letter={letter} size={150}/>
        </div>
        <button className="b-btn" style={{...S.soundBtn,background:"linear-gradient(135deg,#7B2FBE,#FF6B6B)",color:"#fff",padding:"10px 24px",fontSize:"0.9rem",marginTop:4}} onClick={()=>{duckMusic();speak(letter,speed==="slow"?0.1:0.9);setTimeout(unduckMusic,speed==="slow"?6000:2000);}}>🔊 Hear it!</button>
      </div>
    </ModuleShell>
  );
}

// ─── NUMBER MODULE ─────────────────────────────────────────────────────────
function NumberModule({onBack}){
  const [idx,setIdx]=useState(0);
  const [speed,setSpeed]=useState("slow");
  const num=NUMBERS[idx];
  const NUM_WORDS=["zero","one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
  useEffect(()=>{playFlip();},[num,speed]);
  return(
    <ModuleShell title="🔢 Numbers" onBack={onBack} speed={speed} onSpeedChange={setSpeed}
      navRow={<div style={S.navRow}><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.max(0,i-1));}} disabled={idx===0}>◀ Prev</button><div style={S.navPill}>{idx+1} / 10</div><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.min(9,i+1));}} disabled={idx===9}>Next ▶</button></div>}>
      <div key={num+speed} className="b-spin" style={{...S.moduleCard,background:"linear-gradient(160deg,#4FC3F7,#B2EBF2)",border:"4px solid #fff",boxShadow:"0 8px 40px rgba(79,195,247,0.5)",padding:"18px 16px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"center"}} className="b-bounce">
          <KidNumber num={num} size={150}/>
        </div>
        <button className="b-btn" style={{...S.soundBtn,background:"linear-gradient(135deg,#0077B6,#00B4D8)",padding:"10px 24px",fontSize:"0.9rem",marginTop:4}} onClick={()=>{duckMusic();speak(NUM_WORDS[num]||String(num),speed==="slow"?0.1:0.9);setTimeout(unduckMusic,speed==="slow"?6000:2000);}}>🔊 Hear it!</button>
      </div>
    </ModuleShell>
  );
}

// ─── SHAPE MODULE ──────────────────────────────────────────────────────────
function ShapeModule({onBack}){
  const [idx,setIdx]=useState(0);
  const [speed,setSpeed]=useState("slow");
  const shape=SHAPES[idx];
  useEffect(()=>{playFlip();},[shape,speed]);
  return(
    <ModuleShell title="🔷 Shapes" onBack={onBack} speed={speed} onSpeedChange={setSpeed}
      navRow={<div style={S.navRow}><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.max(0,i-1));}} disabled={idx===0}>◀ Prev</button><div style={S.navPill}>{idx+1} / 10</div><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.min(9,i+1));}} disabled={idx===9}>Next ▶</button></div>}>
      <div key={shape.name+speed} className="b-spin" style={{...S.moduleCard,background:"linear-gradient(160deg,#FF5252,#FF1744)",border:"4px solid #fff",boxShadow:"0 8px 40px rgba(255,23,68,0.5)",padding:"18px 16px",marginBottom:8}}>
        <p style={{fontWeight:900,fontSize:"1.3rem",color:"#fff",fontFamily:"'Lilita One',cursive",marginBottom:2,textShadow:"2px 2px 0 rgba(0,0,0,0.3)"}}>{shape.name}</p>
        <div style={{display:"flex",justifyContent:"center"}} className="b-bounce">
          <KidShape name={shape.name} color={shape.color} size={160}/>
        </div>
        <button className="b-btn" style={{...S.soundBtn,background:"linear-gradient(135deg,#B71C1C,#FF5252)",marginTop:4,padding:"10px 24px",fontSize:"0.9rem"}} onClick={()=>{duckMusic();speak(shape.name,speed==="slow"?0.1:0.9);setTimeout(unduckMusic,speed==="slow"?6000:2000);}}>🔊 Hear it!</button>
      </div>
    </ModuleShell>
  );
}

// ─── COLOR MODULE ──────────────────────────────────────────────────────────
function ColorModule({onBack}){
  const [idx,setIdx]=useState(0);
  const [speed,setSpeed]=useState("slow");
  const color=COLORS[idx];
  useEffect(()=>{playFlip();},[color,speed]);
  return(
    <ModuleShell title="🎨 Colors" onBack={onBack} speed={speed} onSpeedChange={setSpeed}
      navRow={<div style={S.navRow}><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.max(0,i-1));}} disabled={idx===0}>◀ Prev</button><div style={S.navPill}>{idx+1} / 10</div><button className="b-btn" style={S.navBtn} onClick={()=>{playFlip();setIdx(i=>Math.min(9,i+1));}} disabled={idx===9}>Next ▶</button></div>}>
      <div key={color.name+speed} className="b-spin" style={{...S.moduleCard,background:"#FFFFFF",border:`6px solid ${color.hex}`,boxShadow:`0 8px 40px ${color.hex}88`,padding:"18px 16px",marginBottom:8}}>
        <p style={{fontWeight:900,fontSize:"1.6rem",color:color.hex,fontFamily:"'Lilita One',cursive",marginBottom:4,textShadow:"1px 1px 0 rgba(0,0,0,0.1)"}}>{color.name}</p>
        <div style={{display:"flex",justifyContent:"center"}} className="b-bounce">
          <KidColor hex={color.hex} name={color.name} size={150}/>
        </div>
        <button className="b-btn" style={{...S.soundBtn,background:color.hex,color:"#fff",padding:"10px 24px",fontSize:"0.9rem",marginTop:4}} onClick={()=>{duckMusic();speak(color.name,speed==="slow"?0.1:0.9);setTimeout(unduckMusic,speed==="slow"?6000:2000);}}>🔊 Hear it!</button>
      </div>
    </ModuleShell>
  );
}

// ─── GAME RESULT SCREEN ────────────────────────────────────────────────────
function GameResult({score,total,emoji,title,onBack,student}){
  useEffect(()=>{
    playCorrect();
    setTimeout(()=>speak(`${title} You got ${score} out of ${total}! You earned ${score} stars!`,0.9),600);
  },[]);
  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><Confetti/><MusicBtn type="game"/>
      <div className="b-bounce" style={{textAlign:"center",padding:32,position:"relative",zIndex:1}}>
        <AvatarDisplay avatarId={student?.avatar} size="lg"/>
        <div className="b-float" style={{fontSize:"6rem",filter:"drop-shadow(0 0 30px #FFD700)",margin:"10px 0"}}>{emoji}</div>
        <h2 style={{...S.title,fontSize:"2.5rem"}}>{title}</h2>
        <p style={{fontSize:"1.4rem",fontWeight:800,color:"#fff",fontFamily:"'Baloo 2',cursive"}}>You got {score} out of {total}!</p>
        <p style={{fontSize:"2rem",fontWeight:900,color:"#FFD700",textShadow:"0 0 20px #FFD700"}}>⭐ +{score} stars!</p>
        <button className="b-btn b-wiggle" style={S.btnStart} onClick={()=>{playTick();stopBgMusic();startBgMusic("menu");onBack();}}>🏠 Back</button>
      </div>
    </div>
  );
}

// ─── MATCHING ACTIVITY ─────────────────────────────────────────────────────
function MatchingActivity({category,speed,onEarn,onBack,student,onFinish}){
  const [questions,setQuestions]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [result,setResult]=useState(null);
  const [score,setScore]=useState(0);
  const [showConfetti,setShowConfetti]=useState(false);
  const [compliment,setCompliment]=useState("");
  const [timerKey,setTimerKey]=useState(0);
  const [answers,setAnswers]=useState([]);  // track for backend
  const timeLimit=speed==="fast"?15:30;

  useEffect(()=>{ generate(); },[category]);

  function generate(){
    let pool=[];
    if(category.id==="alphabets") pool=ALPHABET.map(l=>({question:l,correct:l,distractors:shuffle(ALPHABET.filter(x=>x!==l)).slice(0,3),type:"letter"}));
    else if(category.id==="numbers") pool=NUMBERS.map(n=>({question:String(n),correct:String(n),distractors:shuffle(NUMBERS.filter(x=>x!==n).map(String)).slice(0,3),type:"number"}));
    else if(category.id==="shapes") pool=SHAPES.map(s=>({question:s.emoji,correct:s.name,distractors:shuffle(SHAPES.filter(x=>x.name!==s.name).map(x=>x.name)).slice(0,3),type:"shape"}));
    else if(category.id==="colors") pool=COLORS.map(c=>({question:c.hex,correct:c.name,distractors:shuffle(COLORS.filter(x=>x.name!==c.name).map(x=>x.name)).slice(0,3),type:"color"}));
    const qs=shuffle(pool).slice(0,6).map(q=>({...q,options:shuffle([q.correct,...q.distractors])}));
    setQuestions(qs);setQIdx(0);setSelected(null);setResult(null);setScore(0);setCompliment("");setTimerKey(k=>k+1);setAnswers([]);
  }

  function handleTimeout(){
    if(result)return;
    const msg=randomOf(WRONG_COMPLIMENTS);
    setCompliment(msg);setResult("timeout");
    playTimeout();
    setAnswers(a=>[...a,{question:q?.correct||"",heard:"timeout",correct:false}]);
    setTimeout(()=>speak(msg,0.9),300);
  }

  const q=questions[qIdx];

  function pick(opt){
    if(result)return;
    setSelected(opt);
    const ok=opt===q.correct;
    setAnswers(a=>[...a,{question:q.correct,heard:opt,correct:ok}]);
    if(ok){
      const msg=randomOf(CORRECT_COMPLIMENTS);
      setCompliment(msg);setResult("correct");
      setScore(s=>s+1);setShowConfetti(true);
      playCorrect();onEarn(1);
      setTimeout(()=>speak(msg,0.9),300);
      setTimeout(()=>setShowConfetti(false),2500);
    } else {
      const msg=randomOf(WRONG_COMPLIMENTS);
      setCompliment(msg);setResult("wrong");
      playWrong();
      setTimeout(()=>speak(msg,0.9),200);
    }
  }

  function next(){
    playTick();
    if(qIdx+1>=questions.length){
      setResult("done");
      if(onFinish) onFinish(score+(selected===q?.correct?0:0), questions.length, answers);
    }
    else{setQIdx(i=>i+1);setSelected(null);setResult(null);setCompliment("");setTimerKey(k=>k+1);}
  }

  if(!q)return <div style={S.page}><GlobalStyles/><button className="b-btn" style={S.backBtn} onClick={onBack}>← Back</button></div>;
  if(result==="done")return <GameResult score={score} total={questions.length} emoji="🏆" title="AMAZING!" onBack={onBack} student={student}/>;

  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="game"/>
      {showConfetti&&<Confetti/>}
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();stopBgMusic();startBgMusic("menu");onBack();}}>← Back</button>
        <h2 style={{...S.title,fontSize:"1.6rem",textAlign:"center",margin:"4px 0 6px"}}>🃏 Matching Game</h2>
        <p style={{textAlign:"center",color:"#aaa",fontWeight:700,marginBottom:8,fontFamily:"'Baloo 2',cursive"}}>Q{qIdx+1} of {questions.length} | ⭐{score}</p>
        {!result&&<CountdownTimer key={timerKey} seconds={timeLimit} onDone={handleTimeout} speed={speed}/>}
        <div key={qIdx} className="b-bounce" style={{...S.moduleCard,background:"linear-gradient(160deg,#FFF9C4,#FFEAA7)",border:"4px solid #FFD700",boxShadow:"0 8px 30px rgba(255,215,0,0.4)"}}>
          <p style={{fontWeight:800,color:"#E65100",marginBottom:10,fontFamily:"'Baloo 2',cursive",fontSize:"1rem"}}>What is this? 🤔</p>
          {q.type==="color"?(<div style={{width:120,height:120,borderRadius:"50%",background:q.question,margin:"0 auto 10px",border:"6px solid white",boxShadow:`0 0 30px ${q.question}88`}}/>)
          :q.type==="shape"?(<div className="b-float" style={{fontSize:"8rem",filter:"drop-shadow(4px 4px 0 rgba(183,28,28,0.3))"}}>{q.question}</div>)
          :(<div style={{fontSize:"6rem",lineHeight:1,fontFamily:"'Lilita One',cursive",color:"#7B2FBE",filter:"drop-shadow(3px 3px 0 #FFD700)"}}>{q.question}</div>)}
          {compliment&&(
            <div className="b-compliment" style={{
              color:result==="correct"?"#006400":"#E65100",
              fontSize:"1.05rem",fontWeight:900,margin:"10px 4px 2px",
              fontFamily:"'Baloo 2',cursive",lineHeight:1.3,
            }}>
              {result==="correct"?"✅ ":"💪 "}{compliment}
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:380,margin:"12px auto"}}>
          {q.options.map(opt=>(
            <button key={opt} className="b-btn" onClick={()=>pick(opt)} style={{
              ...S.matchOption,
              background:selected===opt?(opt===q.correct?"linear-gradient(135deg,#00C853,#69F0AE)":"linear-gradient(135deg,#FF5252,#FF8A80)"):(result&&opt===q.correct?"linear-gradient(135deg,#00C853,#69F0AE)":"linear-gradient(135deg,#E3F2FD,#BBDEFB)"),
              color:selected===opt?"#fff":(result&&opt===q.correct?"#fff":"#1565C0"),
              border:`3px solid ${selected===opt?(opt===q.correct?"#00C853":"#FF5252"):(result&&opt===q.correct?"#00C853":"#90CAF9")}`,
              fontWeight:900,fontSize:"1.1rem",
              boxShadow:selected===opt?(opt===q.correct?"0 4px 20px #00C85388":"0 4px 20px #FF525288"):"0 3px 10px rgba(0,0,0,0.1)",
            }}>{opt}</button>
          ))}
        </div>
        {result&&result!=="done"&&<div style={{textAlign:"center"}}><button className="b-btn" style={S.navBtn} onClick={next}>{qIdx+1>=questions.length?"Finish 🎉":"Next ▶"}</button></div>}
      </div>
    </div>
  );
}

// ─── VOICE ACTIVITY ────────────────────────────────────────────────────────
function VoiceActivity({category,speed,onEarn,onBack,student,onFinish}){
  const [items,setItems]               = useState([]);
  const [currentIdx,setIdx]            = useState(0);
  const [listening,setListening]       = useState(false);
  const [result,setResult]             = useState(null);
  const [showConfetti,setShowConfetti] = useState(false);
  const [score,setScore]               = useState(0);
  const [compliment,setCompliment]     = useState("");
  const [timerKey,setTimerKey]         = useState(0);
  const [statusMsg,setStatusMsg]       = useState("");
  const [heardText,setHeardText]       = useState("");
  const [sessionAnswers,setSessionAnswers] = useState([]); // track for backend
  const recogRef                       = useRef(null);
  const timeLimit = speed==="fast" ? 15 : 30;

  useEffect(()=>{
    let arr=[];
    if(category.id==="alphabets") arr=ALPHABET.map(l=>({label:l,say:l}));
    else if(category.id==="numbers") arr=NUMBERS.map(n=>({label:String(n),say:String(n)}));
    else if(category.id==="shapes") arr=SHAPES.map(s=>({label:s.name,say:s.name}));
    else if(category.id==="colors") arr=COLORS.map(c=>({label:c.name,say:c.name}));
    setItems(shuffle(arr).slice(0,8));
    setIdx(0);setResult(null);setScore(0);
    setCompliment("");setStatusMsg("");setHeardText("");setTimerKey(k=>k+1);
  },[category]);

  const current = items[currentIdx];

  const NUM_WORDS_MAP={"0":"zero","1":"one","2":"two","3":"three","4":"four",
    "5":"five","6":"six","7":"seven","8":"eight","9":"nine","10":"ten",
    "11":"eleven","12":"twelve","13":"thirteen","14":"fourteen","15":"fifteen",
    "16":"sixteen","17":"seventeen","18":"eighteen","19":"nineteen","20":"twenty"};

  function lev(a,b){
    const dp=Array.from({length:a.length+1},(_,i)=>[i]);
    for(let j=0;j<=b.length;j++) dp[0][j]=j;
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
      dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return dp[a.length][b.length];
  }

  // Every way Google speech-to-text returns a letter when spoken aloud
  const LETTER_SOUNDS={
    A:["a","ay","hey","ei","8","age"],
    B:["b","be","bee","beat","bit","beam"],
    C:["c","see","sea","si","key","ce"],
    D:["d","de","dee","deal","the"],
    E:["e","ee","he","eat","easy","me"],
    F:["f","ef","if","eif","eff"],
    G:["g","ge","gee","gi","jee","jay","je"],
    H:["h","h.","aitch","ach","haitch","ha","age"],
    I:["i","eye","ai","aye","igh","hi"],
    J:["j","jay","ja","jae","ge"],
    K:["k","ka","kay","ke","cay","kae"],
    L:["l","el","ell","elle","al","elbow"],
    M:["m","em","emma","me","im"],
    N:["n","en","enn","in","and"],
    O:["o","oh","owe","oh!","0","open"],
    P:["p","pe","pee","pea","pi"],
    Q:["q","cue","queue","ku","kyoo"],
    R:["r","ar","are","err","ra"],
    S:["s","es","ess","ass","as","ese"],
    T:["t","te","tee","tea","ti"],
    U:["u","you","yoo","yu","ewe","oo"],
    V:["v","ve","vee","vi","bee"],
    W:["w","double you","double-you","doubleyou","dub","double u"],
    X:["x","ex","ecks","eggs","ecs"],
    Y:["y","why","wi","wai","ye"],
    Z:["z","ze","zee","zed","sed","zee"],
  };

  function isMatch(heard, target){
    const h = heard.toLowerCase().trim();
    const t = target.toLowerCase().trim();
    const numWord  = NUM_WORDS_MAP[t]||"";

    // For single letters use the comprehensive phonetic map
    const letterSounds = LETTER_SOUNDS[t.toUpperCase()]||[];

    const heardWords = h.split(/\s+/);

    // Check letter sounds first (most important for alphabet)
    for(const s of letterSounds){
      if(h===s) return true;
      if(heardWords.includes(s)) return true;
    }

    // General matching
    const variants = [t, numWord].filter(Boolean);
    for(const v of variants){
      if(!v) continue;
      if(h===v) return true;
      if(h.includes(v)) return true;
      if(v.includes(h) && h.length>=2) return true;
      if(lev(h,v) <= Math.max(1, Math.floor(v.length*0.4))) return true;
      if(heardWords.some(w => w===v)) return true;
      if(heardWords.some(w => lev(w,v)<=1)) return true;
    }
    return false;
  }

  function processAnswer(heard){
    const ok = isMatch(heard, current.say);
    setHeardText(`I heard: "${heard}"`);
    setSessionAnswers(a=>[...a,{question:current.say,heard,correct:ok}]);
    if(ok){
      const msg=randomOf(CORRECT_COMPLIMENTS);
      setCompliment(msg); setResult("correct");
      setScore(s=>s+1); setShowConfetti(true);
      playCorrect(); onEarn(1);
      setTimeout(()=>speak(msg,0.9),300);
      setTimeout(()=>{ setShowConfetti(false); startBgMusic("game"); },2500);
    } else {
      const msg=randomOf(WRONG_COMPLIMENTS);
      setCompliment(msg); setResult("wrong");
      playWrong();
      setTimeout(()=>speak(msg,0.9),200);
      setTimeout(()=>startBgMusic("game"),800);
    }
  }

  function handleTimeout(){
    if(result) return;
    const msg=randomOf(WRONG_COMPLIMENTS);
    setCompliment(msg); setResult("timeout");
    playTimeout(); setTimeout(()=>speak(msg,0.9),300);
  }

  function startListening(){
    if(result||listening) return;
    stopBgMusic();
    setHeardText(""); setStatusMsg("");

    // ── Try Capacitor native plugin first (Android APK) ──
    const SpeechRec = window?.Capacitor?.Plugins?.SpeechRecognition;
    if(SpeechRec){
      setListening(true);
      setStatusMsg("🎙️ Listening...");
      let handled = false;

      function handleResult(matches){
        if(handled) return;
        handled = true;
        setListening(false); setStatusMsg("");
        SpeechRec.stop().catch(()=>{});
        SpeechRec.removeAllListeners();
        if(matches.length>0){
          const hit = matches.find(m=>isMatch(m, current.say));
          processAnswer(hit || matches[0]);
        } else {
          setStatusMsg("❓ Didn't catch that — try again!"); startBgMusic("game");
        }
      }

      // Grab partialResults the instant ANY word is heard — don't wait for silence
      SpeechRec.addListener("partialResults",(data)=>{
        const m = (data?.matches||[]).filter(x=>x&&x.trim());
        if(m.length>0) handleResult(m);
      });

      SpeechRec.requestPermissions()
        .then(()=> SpeechRec.start({
          language:"en-US",
          maxResults:10,
          partialResults:true,
          popup:false,
        }))
        .then(res=>{
          if(!handled){
            const m = (res?.matches||[]).filter(x=>x&&x.trim());
            if(m.length>0) handleResult(m);
          }
          // Fallback: stop after 5s if nothing heard
          setTimeout(()=>{ if(!handled) handleResult([]); }, 5000);
        })
        .catch(e=>{
          if(!handled){
            handled = true;
            setListening(false); setStatusMsg("");
            SpeechRec.removeAllListeners();
            const msg=String(e?.message||e||"");
            if(msg.includes("cancel")||msg.includes("abort")){ startBgMusic("game"); return; }
            tryWebSpeech();
          }
        });
      return;
    }

    // ── Web Speech API (browser / Chrome on Android) ──
    tryWebSpeech();
  }

  function tryWebSpeech(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){
      setStatusMsg("🚫 Voice not available — needs mic permission & internet");
      startBgMusic("game");
      return;
    }
    setListening(true);
    setStatusMsg("🎙️ Listening...");
    const r = new SR();
    r.lang="en-US"; r.maxAlternatives=10;
    r.continuous=true; r.interimResults=true;
    let wsHandled = false;
    r.onend  = ()=>{ setListening(false); setStatusMsg(""); };
    r.onerror = (e)=>{
      setListening(false); setStatusMsg("");
      if(e.error==="not-allowed"||e.error==="service-not-allowed")
        setStatusMsg("🚫 Mic blocked! Settings → Apps → B.L.A.S.T. → Permissions → Mic → Allow");
      else if(e.error==="network")
        setStatusMsg("📶 Voice needs internet — connect to WiFi!");
      else if(e.error==="no-speech")
        setStatusMsg("❓ No speech heard — tap and try again!");
      else
        setStatusMsg(`❓ ${e.error} — tap and try again!`);
      startBgMusic("game");
    };
    r.onresult = (e)=>{
      if(wsHandled) return;
      // Grab first non-empty transcript — interim or final — stop right away
      for(let i=0;i<e.results.length;i++){
        const transcript = e.results[i][0].transcript.trim();
        if(transcript){
          wsHandled = true;
          try{ r.stop(); }catch(_){}
          processAnswer(transcript);
          return;
        }
      }
    };
    try{ recogRef.current=r; r.start(); }
    catch(e){
      setListening(false);
      setStatusMsg("🚫 Voice failed to start — try again!");
      startBgMusic("game");
    }
  }

  function next(){
    playTick();
    if(currentIdx+1>=items.length) setResult("done");
    else{
      setIdx(i=>i+1); setResult(null);
      setCompliment(""); setHeardText(""); setStatusMsg("");
      setTimerKey(k=>k+1);
    }
  }

  if(!current) return <div style={S.page}><GlobalStyles/><button className="b-btn" style={S.backBtn} onClick={onBack}>← Back</button></div>;
  if(result==="done") return <GameResult score={score} total={items.length} emoji="🎤" title="SUPERSTAR!" onBack={onBack} student={student}/>;

  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="game"/>
      {showConfetti&&<Confetti/>}
      <div style={{position:"relative",zIndex:1}}>

        <button className="b-btn" style={S.backBtn} onClick={()=>{
          playTick();
          if(recogRef.current){try{recogRef.current.stop();}catch(_){}}
          stopBgMusic(); startBgMusic("menu"); onBack();
        }}>← Back</button>

        <h2 style={{...S.title,fontSize:"1.6rem",textAlign:"center",margin:"4px 0 6px"}}>
          🎤 Talk to Win!
        </h2>

        <p style={{textAlign:"center",color:"#aaa",fontWeight:700,marginBottom:6,
          fontFamily:"'Baloo 2',cursive",fontSize:"0.88rem"}}>
          Q{currentIdx+1} of {items.length} | ⭐{score}
        </p>

        {!result && <CountdownTimer key={timerKey} seconds={timeLimit} onDone={handleTimeout} speed={speed}/>}

        {/* Question card */}
        <div key={currentIdx} className="b-bounce" style={{...S.moduleCard,
          background: category.id==="shapes" ? "linear-gradient(160deg,#FF5252,#FF1744)"
            : category.id==="colors" ? "#FFFFFF"
            : category.id==="numbers" ? "linear-gradient(160deg,#4FC3F7,#B2EBF2)"
            : "linear-gradient(160deg,#FF6B6B,#FFE66D)",
          border: category.id==="shapes" ? "4px solid #fff"
            : category.id==="colors" ? `6px solid ${COLORS.find(c=>c.name===current.label)?.hex||"#ccc"}`
            : category.id==="numbers" ? "4px solid #fff"
            : "4px solid #fff",
          boxShadow: category.id==="shapes" ? "0 8px 40px rgba(255,23,68,0.5)"
            : "0 8px 30px rgba(206,147,216,0.4)",
        }}>
          <p style={{fontWeight:800,color:"#7B2FBE",marginBottom:8,
            fontFamily:"'Baloo 2',cursive",fontSize:"0.9rem"}}>
            Say this out loud! 🎤
          </p>

          {category.id==="colors"?(
            <>
              <p style={{fontWeight:900,fontSize:"1.6rem",color:COLORS.find(c=>c.name===current.label)?.hex,fontFamily:"'Lilita One',cursive",marginBottom:4}}>{current.label}</p>
              <div style={{width:130,height:130,borderRadius:"50%",
                background:COLORS.find(c=>c.name===current.label)?.hex||"#ccc",
                margin:"0 auto 10px",border:"6px solid white",
                boxShadow:`0 0 30px ${COLORS.find(c=>c.name===current.label)?.hex}88`}}/>
            </>
          ):category.id==="shapes"?(
            <>
              <p style={{fontWeight:900,fontSize:"1.4rem",color:"#fff",fontFamily:"'Lilita One',cursive",marginBottom:2,textShadow:"2px 2px 0 rgba(0,0,0,0.3)"}}>{current.label}</p>
              <div className="b-float" style={{fontSize:"7rem",filter:"drop-shadow(4px 4px 0 rgba(0,0,0,0.2))"}}>
                {SHAPES.find(s=>s.name===current.label)?.emoji}
              </div>
            </>
          ):(
            <div style={{fontSize:"6rem",lineHeight:1,fontFamily:"'Lilita One',cursive",
              color:"#7B2FBE",filter:"drop-shadow(3px 3px 0 #CE93D8)"}}>
              {current.label}
            </div>
          )}

          {statusMsg&&(
            <p style={{color:"#E65100",fontSize:"0.85rem",fontWeight:700,
              margin:"8px 0 0",fontFamily:"'Baloo 2',cursive",lineHeight:1.3}}>
              {statusMsg}
            </p>
          )}
          {heardText&&!statusMsg&&(
            <p style={{color:"#7B2FBE",fontSize:"0.8rem",margin:"6px 0 0",
              fontFamily:"'Baloo 2',cursive"}}>{heardText}</p>
          )}
          {compliment&&(
            <div className="b-compliment" style={{
              color:result==="correct"?"#00800A":"#E65100",
              fontSize:"1rem",fontWeight:900,margin:"10px 4px 0",
              fontFamily:"'Baloo 2',cursive",lineHeight:1.3,
            }}>
              {result==="correct"?"✅ ":"💪 "}{compliment}
            </div>
          )}
        </div>

        {/* Mic button — only shown while waiting for answer */}
        {!result&&(
          <div style={{textAlign:"center",marginTop:14}}>
            <button
              className={`b-btn ${listening?"":"b-wiggle"}`}
              disabled={listening}
              onClick={startListening}
              style={{
                ...S.soundBtn,
                background:listening
                  ?"linear-gradient(135deg,#8B0000,#FF2222)"
                  :"linear-gradient(135deg,#4B0082,#FF0080)",
                boxShadow:listening
                  ?"0 0 40px #FF4444,0 0 80px rgba(255,0,0,0.3)"
                  :"0 0 20px #FF0080,0 8px 30px rgba(0,0,0,0.4)",
                fontSize:"1.3rem",padding:"18px 44px",
                animation:listening?"none":"pulse-btn 1.5s ease infinite",
              }}
            >
              {listening?"🎙️ Listening...":"🎤 Speak Now!"}
            </button>

            {listening&&(
              <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:12}}>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} className="b-float" style={{
                    width:8,borderRadius:4,background:"#FF0080",
                    height:`${20+i*8}px`,boxShadow:"0 0 8px #FF0080",
                    animationDelay:`${i*0.1}s`,animationDuration:`${0.4+i*0.1}s`,
                  }}/>
                ))}
              </div>
            )}

            <p style={{color:"#555",fontSize:"0.72rem",marginTop:10,
              fontFamily:"'Baloo 2',cursive",lineHeight:1.4}}>
              ⚠️ Needs microphone permission + internet (WiFi/data)
            </p>
          </div>
        )}

        {/* Next / Finish buttons after answer */}
        {result&&(
          <div style={{textAlign:"center",marginTop:14}}>
            {result==="wrong"&&(
              <p style={{color:"#FF4444",fontWeight:800,
                fontFamily:"'Baloo 2',cursive",fontSize:"0.9rem",marginBottom:10}}>
                ❌ Answer was: <span style={{color:"#FFD700"}}>{current.label}</span>
              </p>
            )}
            <button className="b-btn" style={S.navBtn} onClick={next}>
              {currentIdx+1>=items.length?"Finish 🎉":"Next ▶"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── ACTIVITY PICKER ───────────────────────────────────────────────────────
function ActivityPicker({category,student,onPick,onBack}){
  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="game"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();onBack();}}>← Back</button>
        <div className="b-bounce" style={{textAlign:"center",marginBottom:24}}>
          <div className="b-float" style={{fontSize:"4.5rem",filter:`drop-shadow(0 0 20px ${category.glow})`}}>{category.emoji}</div>
          <h2 style={{...S.title,fontSize:"1.9rem",margin:"4px 0"}}>{category.label} Games</h2>
          <p style={{color:"#FFD700",fontWeight:800,fontFamily:"'Baloo 2',cursive",textShadow:"0 0 8px #FFD700"}}>⭐ {student.stars} stars</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:18,maxWidth:360,margin:"0 auto"}}>
          <button className="b-btn" style={{...S.modeBtn,background:"linear-gradient(135deg,#7B3F00,#FF6B00)"}} onClick={()=>{playPop();onPick("voice");}}>
            <span className="b-wiggle" style={{fontSize:"3rem",filter:"drop-shadow(0 0 10px rgba(255,107,0,0.6))"}}>🎤</span>
            <div><div style={{fontWeight:800,fontSize:"1.3rem"}}>TALK TO WIN!</div><div style={{fontSize:"0.85rem",opacity:0.9}}>Say the answer aloud</div></div>
          </button>
          <button className="b-btn" style={{...S.modeBtn,background:"linear-gradient(135deg,#2E0060,#8800FF)"}} onClick={()=>{playPop();onPick("matching");}}>
            <span className="b-wiggle" style={{fontSize:"3rem",animationDelay:"0.3s",filter:"drop-shadow(0 0 10px rgba(136,0,255,0.6))"}}>🃏</span>
            <div><div style={{fontWeight:800,fontSize:"1.3rem"}}>TAP AND MATCH!</div><div style={{fontSize:"0.85rem",opacity:0.9}}>Tap the right answer</div></div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER DASHBOARD — backend connected ────────────────────────────────────
function TeacherDashboard({students,onDeleteStudent,onBack,backendOk}){
  const [pin,setPin]           = useState("");
  const [unlocked,setUnlocked] = useState(false);
  const [tab,setTab]           = useState("students");
  const [overview,setOverview] = useState(null);
  const [leaderboard,setLeaderboard] = useState([]);
  const [catStats,setCatStats] = useState([]);
  const [loading,setLoading]   = useState(false);
  const sorted = [...students].sort((a,b)=>b.stars-a.stars);
  const medals = ["🥇","🥈","🥉"];
  const borders= ["#FFD700","#C0C0C0","#CD7F32"];

  async function unlock(){
    if(backendOk){
      const res = await (await import('./api.js')).verifyPin(pin);
      if(res?.ok){ playCorrect(); setUnlocked(true); fetchAnalytics(); }
      else { playWrong(); }
    } else {
      if(pin==="1234"){ playCorrect(); setUnlocked(true); }
      else { playWrong(); }
    }
  }

  async function fetchAnalytics(){
    if(!backendOk) return;
    setLoading(true);
    const [ov, lb, cs] = await Promise.all([
      (await import('./api.js')).getOverview(),
      (await import('./api.js')).getLeaderboard(10),
      (await import('./api.js')).getCategoryStats(),
    ]);
    if(ov) setOverview(ov);
    if(lb) setLeaderboard(lb);
    if(cs) setCatStats(cs);
    setLoading(false);
  }

  if(!unlocked) return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="menu"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();onBack();}}>← Back</button>
        <div className="b-bounce" style={{textAlign:"center",maxWidth:340,margin:"40px auto"}}>
          <div style={{fontSize:"4rem"}}>🍎</div>
          <h2 style={{...S.title,fontSize:"1.9rem",margin:"8px 0"}}>Teacher's Corner</h2>
          <p style={{color:"#7B2FBE",marginBottom:4,fontWeight:700,fontFamily:"'Baloo 2',cursive"}}>
            {backendOk?"🟢 Connected to server":"🔴 Offline mode"}
          </p>
          <p style={{color:"#aaa",marginBottom:16,fontWeight:700,fontFamily:"'Baloo 2',cursive"}}>Enter PIN to access dashboard</p>
          <input style={S.input} type="password" placeholder="PIN (default: 1234)" value={pin}
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&unlock()} maxLength={4}/>
          <button className="b-btn" style={S.btnStart} onClick={unlock}>🔓 Unlock</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={S.page}><GlobalStyles/><BgSpace/><MusicBtn type="menu"/>
      <div style={{position:"relative",zIndex:1}}>
        <button className="b-btn" style={S.backBtn} onClick={()=>{playTick();onBack();}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:"2.5rem"}}>🍎</div>
          <h2 style={{...S.title,fontSize:"1.7rem",margin:"4px 0"}}>Teacher Dashboard</h2>
          <p style={{color:"#7B2FBE",fontSize:"0.75rem",fontWeight:700,fontFamily:"'Baloo 2',cursive"}}>
            {backendOk?"🟢 Server connected":"🔴 Offline — data saved locally"}
          </p>
        </div>

        {/* Overview stats — backend only */}
        {overview&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:480,margin:"0 auto 14px",padding:"0 4px"}}>
            {[
              {label:"Students",value:overview.totalStudents,icon:"👦",color:"#C44DFF"},
              {label:"Games Played",value:overview.totalGames,icon:"🎮",color:"#FF6B9D"},
              {label:"Total Stars",value:overview.totalStars,icon:"⭐",color:"#FFD700"},
              {label:"Accuracy",value:overview.accuracy+"%",icon:"🎯",color:"#00C853"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,0.85)",borderRadius:16,padding:"12px",textAlign:"center",boxShadow:"0 4px 16px rgba(196,77,255,0.15)",border:`2px solid ${s.color}44`}}>
                <div style={{fontSize:"1.6rem"}}>{s.icon}</div>
                <div style={{fontWeight:900,fontSize:"1.4rem",color:s.color,fontFamily:"'Lilita One',cursive"}}>{s.value}</div>
                <div style={{fontSize:"0.7rem",color:"#666",fontWeight:700,fontFamily:"'Baloo 2',cursive"}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:8,maxWidth:480,margin:"0 auto 14px",padding:"0 4px",overflowX:"auto"}}>
          {[
            {id:"students",label:"👦 Students"},
            {id:"leaderboard",label:"🏆 Leaderboard"},
            ...(backendOk?[{id:"categories",label:"📊 Categories"}]:[]),
          ].map(t=>(
            <button key={t.id} className="b-btn" onClick={()=>{playTick();setTab(t.id);}} style={{
              flex:1,minWidth:100,padding:"9px 6px",borderRadius:12,fontWeight:800,
              fontFamily:"'Baloo 2',cursive",fontSize:"0.78rem",cursor:"pointer",
              background:tab===t.id?"linear-gradient(135deg,#C44DFF,#FF6B9D)":"rgba(255,255,255,0.7)",
              color:tab===t.id?"#fff":"#7B2FBE",
              border:`2px solid ${tab===t.id?"#C44DFF":"rgba(196,77,255,0.3)"}`,
              boxShadow:tab===t.id?"0 4px 16px rgba(196,77,255,0.4)":"none",
              whiteSpace:"nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{maxWidth:480,margin:"0 auto"}}>

          {/* STUDENTS TAB */}
          {tab==="students"&&(
            sorted.length===0
              ?<p style={{textAlign:"center",color:"#555",fontWeight:700,fontFamily:"'Baloo 2',cursive",marginTop:20}}>No students yet!</p>
              :sorted.map((s,i)=>(
              <div key={s.name||i} style={{background:"rgba(255,255,255,0.85)",borderRadius:18,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 14px rgba(196,77,255,0.1)",border:"2px solid rgba(196,77,255,0.15)"}}>
                <div style={{fontSize:"1.6rem",minWidth:36,textAlign:"center"}}>{medals[i]||`#${i+1}`}</div>
                <AvatarDisplay avatarId={s.avatar} size="sm"/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:"1rem",color:"#333",fontFamily:"'Baloo 2',cursive"}}>{s.name}</div>
                  <div style={{color:"#888",fontSize:"0.72rem"}}>Joined: {s.joined||"Today"}</div>
                  {s.games_played!==undefined&&<div style={{color:"#C44DFF",fontSize:"0.7rem",fontWeight:700}}>🎮 {s.games_played} games</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:900,fontSize:"1.2rem",color:"#FFD700",textShadow:"0 0 8px rgba(255,215,0,0.5)"}}>⭐ {s.stars}</div>
                  <button className="b-btn" style={{background:"rgba(255,0,0,0.1)",color:"#FF4444",border:"2px solid rgba(255,0,0,0.3)",borderRadius:8,padding:"3px 10px",cursor:"pointer",fontSize:"0.7rem",fontFamily:"'Baloo 2',cursive",fontWeight:700,marginTop:4}}
                    onClick={()=>{if(window.confirm(`Remove ${s.name}?`))onDeleteStudent(s.name);}}>🗑️ Remove</button>
                </div>
              </div>
            ))
          )}

          {/* LEADERBOARD TAB */}
          {tab==="leaderboard"&&(()=>{
            const rows = leaderboard.length>0 ? leaderboard : sorted;
            return rows.length===0
              ?<p style={{textAlign:"center",color:"#666",fontWeight:700,fontFamily:"'Baloo 2',cursive",marginTop:20}}>No players yet!</p>
              :rows.map((s,i)=>(
              <div key={s.name||i} className="b-slide" style={{
                background:i===0?"linear-gradient(135deg,#FFF8E1,#FFE082)":i===1?"linear-gradient(135deg,#F5F5F5,#E0E0E0)":i===2?"linear-gradient(135deg,#FBE9E7,#FFCCBC)":"rgba(255,255,255,0.8)",
                border:`3px solid ${borders[i]||"rgba(196,77,255,0.2)"}`,
                borderRadius:20,padding:"14px 16px",marginBottom:12,
                display:"flex",alignItems:"center",gap:14,
                boxShadow:i===0?"0 6px 24px rgba(255,215,0,0.3)":"0 4px 14px rgba(0,0,0,0.06)",
                animationDelay:`${i*0.08}s`,
              }}>
                <div style={{fontSize:"2rem",minWidth:40,textAlign:"center"}}>{medals[i]||`#${i+1}`}</div>
                <AvatarDisplay avatarId={s.avatar} size="sm"/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:"1.05rem",color:"#333",fontFamily:"'Baloo 2',cursive"}}>{s.name}</div>
                  {s.games_played!==undefined&&<div style={{color:"#888",fontSize:"0.72rem"}}>🎮 {s.games_played} games played</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:900,fontSize:"1.4rem",color:"#E65100",textShadow:"0 0 8px rgba(255,215,0,0.4)"}}>⭐ {s.stars}</div>
                  <div style={{fontSize:"0.68rem",color:"#888",fontFamily:"'Baloo 2',cursive"}}>stars</div>
                </div>
              </div>
            ));
          })()}

          {/* CATEGORIES TAB — backend only */}
          {tab==="categories"&&(
            loading
              ?<p style={{textAlign:"center",color:"#666",fontWeight:700,fontFamily:"'Baloo 2',cursive",marginTop:20}}>Loading...</p>
              :catStats.length===0
              ?<p style={{textAlign:"center",color:"#666",fontWeight:700,fontFamily:"'Baloo 2',cursive",marginTop:20}}>No game data yet!</p>
              :catStats.map((c,i)=>(
              <div key={c.category} style={{background:"rgba(255,255,255,0.85)",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 4px 14px rgba(196,77,255,0.1)",border:"2px solid rgba(196,77,255,0.15)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontWeight:800,fontSize:"1rem",color:"#333",fontFamily:"'Baloo 2',cursive",textTransform:"capitalize"}}>{c.category}</span>
                  <span style={{fontWeight:700,fontSize:"0.85rem",color:"#C44DFF",fontFamily:"'Baloo 2',cursive"}}>🎮 {c.games} games</span>
                </div>
                <div style={{height:16,background:"rgba(196,77,255,0.12)",borderRadius:8,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${c.avg_accuracy||0}%`,background:"linear-gradient(90deg,#C44DFF,#FF6B9D)",borderRadius:8,transition:"width 1s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:"0.7rem",color:"#888",fontFamily:"'Baloo 2',cursive"}}>Accuracy</span>
                  <span style={{fontSize:"0.78rem",fontWeight:800,color:"#C44DFF",fontFamily:"'Baloo 2',cursive"}}>{c.avg_accuracy||0}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP — Firebase + Backend Connected ────────────────────────────────
import * as API from './api.js';

export default function App(){
  const [showSplash,setShowSplash]         = useState(true);
  const [screen,setScreen]                 = useState("home");
  const [students,setStudents]             = useState([]);
  const [currentStudent,setCurrentStudent] = useState(null);
  const [selectedCategory,setSelectedCategory] = useState(null);
  const [speed,setSpeed]                   = useState("slow");
  const [backendOk,setBackendOk]           = useState(false);
  const [sessionId,setSessionId]           = useState(null);
  const [sessionStart,setSessionStart]     = useState(null);

  // ── Init: try to reach backend, load students ─────────────────────────────
  useEffect(()=>{
    initApp();
  },[]);

  async function initApp(){
    // Test backend connectivity
    try{
      const res = await fetch(`${(await import('./firebase.js')).API_BASE}/api/health`);
      if(res.ok) setBackendOk(true);
    }catch(_){ setBackendOk(false); }

    // If we have a saved token, load students from backend
    if(API.hasToken()){
      const list = await API.getStudents();
      if(list){
        setBackendOk(true);
        setStudents(list);
        localStorage.setItem('blast_students', JSON.stringify(list));
      } else {
        loadLocalStudents();
      }
    } else {
      loadLocalStudents();
    }

    // Restore last logged-in student
    try{
      const saved = JSON.parse(localStorage.getItem('blast_current')||'null');
      if(saved) setCurrentStudent(saved);
    }catch(_){}
  }

  function loadLocalStudents(){
    try{ setStudents(JSON.parse(localStorage.getItem('blast_students')||'[]')); }catch{}
  }

  // ── Teacher login ─────────────────────────────────────────────────────────
  async function handleTeacherLogin(email, password){
    const data = await API.teacherLogin(email, password);
    if(data?.token){
      setBackendOk(true);
      const list = await API.getStudents();
      if(list){
        setStudents(list);
        localStorage.setItem('blast_students', JSON.stringify(list));
      }
      return { ok: true, teacher: data.teacher };
    }
    return { ok: false, error: 'Login failed. Check email/password.' };
  }

  async function handleTeacherRegister(name, email, password, schoolName){
    const data = await API.teacherRegister(name, email, password, schoolName);
    if(data?.token){
      setBackendOk(true);
      return { ok: true };
    }
    return { ok: false, error: data?.error || 'Registration failed' };
  }

  // ── Student login / create ────────────────────────────────────────────────
  async function login(name, pin, avatar){
    let student = null;

    if(backendOk){
      student = await API.createStudent(name, avatar||'unicorn', pin||'');
      if(student){
        // Refresh student list from server
        const list = await API.getStudents();
        if(list){
          setStudents(list);
          localStorage.setItem('blast_students', JSON.stringify(list));
        }
      }
    }

    // Offline fallback
    if(!student){
      const ex = students.find(s=>s.name.toLowerCase()===name.toLowerCase());
      if(ex){
        student = ex;
      } else {
        student = {
          id: 'local_'+Date.now(),
          name, avatar: avatar||'unicorn',
          pin: pin||'', stars: 0,
          joined: new Date().toLocaleDateString()
        };
        const updated = [...students, student];
        setStudents(updated);
        localStorage.setItem('blast_students', JSON.stringify(updated));
      }
    }

    playCorrect();
    setCurrentStudent(student);
    localStorage.setItem('blast_current', JSON.stringify(student));
    setScreen('categories');
  }

  // ── Earn star ─────────────────────────────────────────────────────────────
  async function earnStar(n=1){
    if(!currentStudent) return;
    const up = {...currentStudent, stars: (currentStudent.stars||0) + n};
    setCurrentStudent(up);
    localStorage.setItem('blast_current', JSON.stringify(up));
    setStudents(prev => prev.map(s =>
      (s.id===up.id || s.name===up.name) ? up : s
    ));
    // Sync to backend
    if(backendOk && currentStudent.id && !String(currentStudent.id).startsWith('local_')){
      await API.earnStarAPI(currentStudent.id, n);
    }
  }

  // ── Game session tracking ─────────────────────────────────────────────────
  async function startGameSession(category, mode){
    setSessionStart(Date.now());
    if(backendOk && currentStudent?.id && !String(currentStudent.id).startsWith('local_')){
      const res = await API.startSession(currentStudent.id, category, mode);
      if(res?.session_id) setSessionId(res.session_id);
    }
  }

  async function finishGameSession(score, total, answers=[]){
    if(backendOk && sessionId && currentStudent?.id){
      const dur = sessionStart ? Math.round((Date.now()-sessionStart)/1000) : 0;
      await API.finishSession(sessionId, currentStudent.id, score, total, dur);
      if(answers.length > 0)
        await API.saveAnswers(sessionId, currentStudent.id, answers);
    }
    setSessionId(null);
    setSessionStart(null);
  }

  // ── Account management ────────────────────────────────────────────────────
  function switchAccount(){
    setCurrentStudent(null);
    localStorage.removeItem('blast_current');
    stopBgMusic(); startBgMusic('menu');
    setScreen('home');
  }

  async function deleteStudent(name){
    const s = students.find(x=>x.name===name);
    if(backendOk && s?.id && !String(s.id).startsWith('local_'))
      await API.deleteStudentAPI(s.id);
    const updated = students.filter(x=>x.name!==name);
    setStudents(updated);
    localStorage.setItem('blast_students', JSON.stringify(updated));
    if(currentStudent?.name===name) switchAccount();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if(showSplash) return <SplashScreen onDone={()=>setShowSplash(false)}/>;

  if(screen==="home") return <HomeScreen
    students={students} currentStudent={currentStudent}
    onLogin={login} onSwitchAccount={switchAccount}
    onStart={()=>setScreen("categories")}
    onTeacher={()=>setScreen("teacher")}
    backendOk={backendOk}
    onTeacherLogin={handleTeacherLogin}
    onTeacherRegister={handleTeacherRegister}
  />;

  if(screen==="teacher") return <TeacherDashboard
    students={students} onDeleteStudent={deleteStudent}
    onBack={()=>setScreen("home")} backendOk={backendOk}
  />;

  if(screen==="categories") return <CategoryPicker
    student={currentStudent}
    onPick={cat=>{ setSelectedCategory(cat); setScreen("mode"); }}
    onHome={()=>setScreen("home")}
  />;

  if(screen==="mode") return <ModePicker
    category={selectedCategory} student={currentStudent}
    onMode={m=>{
      if(m!=="module") startGameSession(selectedCategory.id, m);
      setScreen(m==="module"?"module":"activity_pick");
    }}
    onBack={()=>setScreen("categories")}
  />;

  if(screen==="activity_pick") return <ActivityPicker
    category={selectedCategory} student={currentStudent}
    onPick={t=>{ startGameSession(selectedCategory.id, t); setScreen(t==="voice"?"voice":"matching"); }}
    onBack={()=>setScreen("mode")}
  />;

  if(screen==="voice") return <VoiceActivity
    category={selectedCategory} speed={speed}
    onEarn={earnStar} onFinish={finishGameSession}
    onBack={()=>setScreen("categories")} student={currentStudent}
  />;

  if(screen==="matching") return <MatchingActivity
    category={selectedCategory} speed={speed}
    onEarn={earnStar} onFinish={finishGameSession}
    onBack={()=>setScreen("categories")} student={currentStudent}
  />;

  if(screen==="module"){
    if(selectedCategory.id==="alphabets") return <AlphabetModule onBack={()=>setScreen("mode")}/>;
    if(selectedCategory.id==="numbers")   return <NumberModule   onBack={()=>setScreen("mode")}/>;
    if(selectedCategory.id==="shapes")    return <ShapeModule    onBack={()=>setScreen("mode")}/>;
    if(selectedCategory.id==="colors")    return <ColorModule    onBack={()=>setScreen("mode")}/>;
  }
  return null;
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const FONT="'Baloo 2','Lilita One',cursive";
const S={
  home:{minHeight:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:FONT,position:"relative",overflow:"hidden"},
  homeCard:{background:"rgba(255,255,255,0.75)",borderRadius:32,padding:"28px 24px",maxWidth:410,width:"100%",textAlign:"center",boxShadow:"0 8px 40px rgba(180,120,255,0.25),0 2px 12px rgba(0,0,0,0.1)",border:"3px solid rgba(255,255,255,0.9)",position:"relative",zIndex:1,backdropFilter:"blur(16px)"},
  title:{fontFamily:"'Lilita One',cursive",fontSize:"3rem",fontWeight:900,background:"linear-gradient(135deg,#FF6B9D 0%,#C44DFF 40%,#4D9FFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"4px 0"},
  loggedInBadge:{display:"flex",alignItems:"center",gap:14,background:"rgba(255,200,240,0.4)",borderRadius:22,padding:"14px 20px",marginBottom:14,textAlign:"left",border:"3px solid rgba(200,150,255,0.5)"},
  page:{minHeight:"100vh",background:"transparent",padding:"8px 14px",fontFamily:FONT,position:"relative",overflow:"hidden"},
  moduleCard:{borderRadius:24,padding:"16px",textAlign:"center",boxShadow:"0 8px 30px rgba(0,0,0,0.12)",maxWidth:390,margin:"0 auto 10px",border:"4px solid rgba(255,255,255,0.9)",backdropFilter:"blur(8px)"},
  catGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,maxWidth:430,margin:"0 auto"},
  catCard:{borderRadius:26,padding:"26px 14px",cursor:"pointer",fontFamily:FONT,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.15s"},
  modeBtn:{display:"flex",alignItems:"center",gap:18,padding:"22px 24px",borderRadius:24,border:"3px solid rgba(255,255,255,0.6)",color:"#fff",cursor:"pointer",fontFamily:FONT,textAlign:"left",boxShadow:"0 8px 30px rgba(0,0,0,0.2)"},
  navRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,maxWidth:390,margin:"0 auto",padding:"6px 0"},
  navBtn:{background:"linear-gradient(135deg,#C44DFF,#FF6B9D)",color:"#fff",border:"none",borderRadius:14,padding:"9px 20px",fontWeight:800,cursor:"pointer",fontFamily:FONT,fontSize:"0.9rem",boxShadow:"0 4px 16px rgba(196,77,255,0.4)"},
  navPill:{background:"rgba(255,255,255,0.7)",border:"2px solid rgba(196,77,255,0.5)",borderRadius:20,padding:"5px 14px",color:"#8833CC",fontWeight:800,fontSize:"0.9rem"},
  soundBtn:{background:"linear-gradient(135deg,#C44DFF,#FF6B9D)",color:"#fff",border:"none",borderRadius:16,padding:"11px 26px",fontWeight:800,cursor:"pointer",fontFamily:FONT,fontSize:"0.95rem",marginTop:8,boxShadow:"0 4px 18px rgba(196,77,255,0.4)"},
  input:{width:"100%",padding:"13px 18px",borderRadius:16,border:"3px solid rgba(196,77,255,0.4)",fontSize:"1rem",marginBottom:10,boxSizing:"border-box",fontFamily:FONT,outline:"none",fontWeight:700,background:"rgba(255,255,255,0.8)",color:"#333"},
  btnStart:{background:"linear-gradient(135deg,#FF6B9D,#C44DFF,#4D9FFF)",color:"#fff",border:"none",borderRadius:20,padding:"16px 28px",fontWeight:900,fontSize:"1.2rem",cursor:"pointer",width:"100%",marginBottom:8,fontFamily:FONT,boxShadow:"0 8px 30px rgba(196,77,255,0.4)",animation:"pulse-btn 2s ease infinite"},
  btnSec:{background:"rgba(196,77,255,0.1)",color:"#9933CC",border:"3px solid rgba(196,77,255,0.4)",borderRadius:16,padding:"10px 18px",fontWeight:800,cursor:"pointer",width:"100%",fontFamily:FONT},
  backBtn:{background:"rgba(255,255,255,0.7)",border:"2px solid rgba(196,77,255,0.4)",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontFamily:FONT,color:"#7B2FBE",fontWeight:700,marginBottom:6,display:"block",backdropFilter:"blur(5px)",fontSize:"0.85rem"},
  teacherBtn:{position:"fixed",top:16,right:16,zIndex:50,background:"rgba(255,255,255,0.7)",color:"#9933CC",border:"3px solid rgba(196,77,255,0.4)",borderRadius:16,padding:"8px 16px",fontWeight:800,fontSize:"0.82rem",cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 20px rgba(196,77,255,0.2)",whiteSpace:"nowrap",backdropFilter:"blur(5px)"},
  namePill:{background:"rgba(255,200,240,0.5)",border:"2px solid rgba(196,77,255,0.4)",borderRadius:20,padding:"5px 14px",color:"#9933CC",fontWeight:700,cursor:"pointer",fontFamily:FONT,fontSize:"0.88rem"},
  matchOption:{padding:"18px 10px",borderRadius:18,cursor:"pointer",fontWeight:800,fontSize:"1.05rem",fontFamily:FONT,boxShadow:"0 4px 14px rgba(0,0,0,0.12)",color:"#fff"},
};
