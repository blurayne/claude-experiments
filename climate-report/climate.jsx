import React, { useState, useEffect } from "react";

const DATA = {"years": [1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], "monthly": [[-1.8, -0.1, 5.1, 6.8, 13.6, 17.6, 19.8, 18.1, 17.2, 10.0, 6.4, 3.0], [4.4, -1.7, 5.3, 10.0, 12.6, 16.9, 22.5, 18.7, 15.1, 10.5, 3.2, 1.3], [1.6, -0.7, 2.8, 7.2, 11.4, 15.2, 17.4, 17.8, 13.3, 11.1, 4.9, 1.3], [-5.1, -2.0, 3.4, 8.6, 13.7, 14.6, 19.6, 18.2, 16.2, 9.4, 1.1, 4.8], [0.6, -5.7, 3.8, 8.0, 15.6, 15.9, 17.6, 18.4, 14.1, 10.7, 6.1, 2.3], [-4.7, 0.4, 0.5, 9.8, 10.4, 14.8, 18.7, 17.1, 17.7, 10.4, 4.7, 2.1], [4.0, 2.3, 4.0, 9.6, 15.0, 16.1, 19.3, 19.0, 14.6, 11.5, 2.9, 2.8], [2.1, 4.2, 9.1, 8.7, 14.7, 15.5, 18.9, 18.6, 14.6, 11.8, 3.3, 2.9], [0.9, 7.2, 8.1, 7.4, 15.1, 16.0, 18.3, 19.8, 13.3, 11.6, 4.6, -0.3], [1.3, -1.8, 7.1, 7.8, 9.8, 15.5, 19.9, 19.4, 16.6, 8.3, 3.9, -0.8], [0.7, 2.8, 5.6, 8.6, 15.3, 17.4, 20.0, 22.6, 15.2, 8.0, 6.7, 0.8], [3.7, -1.2, 4.1, 11.2, 16.2, 17.1, 17.5, 18.1, 14.3, 8.9, 0.7, 4.0], [3.0, 1.8, 8.7, 8.3, 13.9, 17.6, 22.0, 20.4, 15.0, 9.2, 8.3, 3.8], [-0.0, 5.7, 4.1, 9.5, 13.6, 14.4, 21.4, 18.2, 13.4, 13.1, 2.6, -0.8], [-2.8, -1.5, 1.6, 9.1, 12.8, 17.7, 17.4, 17.6, 11.3, 9.9, 5.1, -2.1], [-2.3, 5.1, 7.4, 7.2, 14.8, 16.8, 17.7, 19.9, 15.9, 8.8, 4.7, 2.4], [2.1, 5.1, 4.9, 10.1, 15.0, 18.4, 18.8, 19.2, 14.0, 10.5, 1.9, 1.7], [2.5, -0.4, 6.5, 9.6, 15.1, 16.2, 19.2, 18.7, 18.1, 10.5, 3.0, 1.9], [-0.6, 4.9, 6.1, 11.2, 15.9, 18.9, 17.1, 20.1, 15.2, 11.2, 6.8, 3.6], [0.9, 3.6, 7.2, 8.2, 16.6, 15.8, 19.6, 20.3, 12.3, 14.5, 3.2, -0.9], [0.8, 6.3, 7.2, 9.0, 14.9, 20.0, 19.2, 19.0, 13.4, 10.1, 7.3, 2.4], [-0.0, -2.5, 7.1, 9.7, 16.2, 22.3, 20.8, 23.7, 15.5, 7.3, 5.8, 1.5], [0.2, 2.7, 4.4, 10.5, 12.4, 17.0, 18.8, 20.1, 15.7, 12.2, 4.6, 0.3], [1.6, -1.4, 4.5, 10.7, 14.8, 19.1, 19.6, 17.3, 16.9, 12.1, 4.3, -0.2], [-2.7, 0.2, 2.9, 10.1, 14.6, 19.1, 23.8, 16.5, 18.3, 14.2, 7.5, 3.8], [5.2, 5.8, 7.6, 14.5, 16.6, 20.0, 20.1, 18.8, 14.2, 10.1, 2.9, 1.1], [4.2, 5.2, 5.8, 9.7, 16.4, 19.3, 19.8, 19.9, 14.0, 11.5, 5.9, 1.5], [-1.7, 0.4, 4.7, 14.0, 16.2, 17.0, 20.2, 21.3, 17.0, 10.2, 8.5, 1.2], [-2.2, 1.0, 5.9, 10.8, 12.3, 17.6, 21.8, 18.5, 14.1, 9.4, 6.1, -1.1], [1.1, 2.4, 7.3, 13.6, 16.0, 17.9, 17.9, 21.0, 17.6, 10.4, 5.0, 4.1], [2.0, -2.8, 8.8, 10.3, 16.2, 18.8, 19.9, 20.9, 15.7, 10.5, 6.5, 2.8], [1.1, -0.6, 3.2, 10.5, 12.9, 17.3, 22.9, 20.8, 15.4, 12.3, 5.0, 4.4], [3.7, 5.9, 9.2, 12.1, 14.0, 19.3, 19.9, 17.9, 16.2, 13.3, 6.9, 3.5], [2.7, 0.6, 7.0, 11.1, 14.7, 18.8, 23.3, 23.1, 15.3, 9.8, 9.2, 7.0], [3.1, 5.3, 6.0, 10.5, 14.4, 18.4, 21.3, 20.2, 18.6, 10.0, 5.3, 2.5], [-2.5, 5.9, 10.2, 9.2, 16.4, 21.7, 21.3, 21.6, 14.6, 13.4, 5.7, 2.5], [5.6, -1.4, 4.7, 16.0, 18.0, 19.7, 22.0, 23.2, 17.7, 12.8, 5.9, 3.5], [0.2, 5.1, 8.3, 11.7, 12.0, 21.6, 20.9, 20.2, 15.8, 12.3, 5.4, 3.9], [4.1, 6.5, 6.5, 13.3, 13.6, 17.2, 20.6, 20.8, 16.6, 10.4, 6.4, 2.5], [0.8, 4.7, 6.0, 8.1, 11.7, 20.6, 19.4, 17.9, 17.0, 10.3, 4.2, 3.6], [2.6, 5.2, 7.1, 9.0, 16.8, 20.9, 22.1, 21.5, 14.5, 14.7, 7.4, 3.0], [3.8, 3.9, 7.4, 8.4, 14.6, 20.6, 21.6, 20.8, 19.3, 14.3, 6.3, 5.1], [2.4, 8.3, 9.4, 11.8, 15.6, 19.2, 21.4, 22.2, 15.9, 12.4, 5.5, 2.5], [2.9, 3.0, 7.8, 12.7, 14.4, 21.6, 19.6, 20.4, 16.1, 10.6, 5.8, 2.7]], "months": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "precip": [50, 43, 38, 46, 99, 118, 106, 138, 89, 54, 77, 68], "raindays": [14, 13, 11, 12, 14, 13, 20, 16, 13, 13, 18, 16], "sun": [95, 107, 180, 200, 241, 291, 243, 245, 200, 137, 84, 65], "uvi": [1, 2, 3, 5, 6, 7, 7, 6, 5, 3, 1, 1], "tmean": [1.9, 4.6, 7.0, 10.1, 14.9, 19.8, 20.1, 19.7, 15.7, 11.6, 5.3, 2.9], "tmax": [5.2, 8.4, 12.3, 15.3, 20.4, 25.8, 25.6, 25.3, 21.1, 16.6, 8.7, 5.6], "tmin": [-1.3, 1.3, 2.4, 5.0, 9.4, 14.1, 15.1, 14.7, 11.0, 7.5, 2.3, 0.3], "refperiods": {"1961-1990": 9.14, "1971-2000": 9.49, "1981-2010": 9.72, "1991-2020": 10.11}};

/* ============ Datenaufbereitung ============ */
const YEARS = DATA.years;
const MON = DATA.monthly;                 // [yearIdx][0..11]
const MONTHS = DATA.months;
const SVGNS = "http://www.w3.org/2000/svg";

function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function annualMeans(){return MON.map(r=>mean(r));}
const ANN = annualMeans();

function ols(xs,ys){
  const n=xs.length, mx=mean(xs), my=mean(ys);
  let sxx=0,sxy=0; for(let i=0;i<n;i++){sxx+=(xs[i]-mx)**2; sxy+=(xs[i]-mx)*(ys[i]-my);}
  const b=sxy/sxx, a=my-b*mx;
  let tot=0,res=0; for(let i=0;i<n;i++){tot+=(ys[i]-my)**2; res+=(ys[i]-(a+b*xs[i]))**2;}
  return {a,b,r2:tot?1-res/tot:0};
}

// Basisperiode 1982-2010 fuer Anomalien
const BASE_LO=1982, BASE_HI=2010;
function baselineAnnual(){
  const v=[]; YEARS.forEach((y,i)=>{if(y>=BASE_LO&&y<=BASE_HI)v.push(ANN[i]);}); return mean(v);
}
const BASE_ANN = baselineAnnual();
function baselineMonth(m){
  const v=[]; YEARS.forEach((y,i)=>{if(y>=BASE_LO&&y<=BASE_HI)v.push(MON[i][m]);}); return mean(v);
}
const BASE_MON = Array.from({length:12},(_,m)=>baselineMonth(m));

/* ============ Farben ============ */
function lerp(a,b,t){return a+(b-a)*t;}
function mix(c1,c2,t){return `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;}
const COLD=[33,102,172], MIDC=[150,180,200], WHITE=[238,238,232], MIDW=[230,150,90], HOT=[178,24,43];
function anomColor(v,scale){
  let t=Math.max(-1,Math.min(1, v/scale));
  if(t<0){ // blue side
    const u=(-t); return u<0.5? mix(WHITE,MIDC,u/0.5): mix(MIDC,COLD,(u-0.5)/0.5);
  } else {
    const u=t; return u<0.5? mix(WHITE,MIDW,u/0.5): mix(MIDW,HOT,(u-0.5)/0.5);
  }
}

/* ============ SVG-Helfer ============ */
function E(name,attrs){const e=document.createElementNS(SVGNS,name);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
function clear(node){while(node.firstChild)node.removeChild(node.firstChild);}

/* ============ State ============ */
const state={ startYear:1982, threshold:5.0, showExtrap:true, showCorridor:true, month:6, extrapYear:2050, phenMode:'proxy' };
const setters={ setMonth:null };

/* ============ 1) Waermestreifen (Hero) ============ */
function renderStripes(){
  const host=document.getElementById("stripes"); clear(host);
  const W=1000,H=150, n=YEARS.length, bw=W/n;
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%",height:H,preserveAspectRatio:"none"});
  const scale=2.2; // degC fuer Farbskala
  YEARS.forEach((y,i)=>{
    const an=ANN[i]-BASE_ANN;
    const r=E("rect",{x:(i*bw).toFixed(2),y:0,width:(bw+0.6).toFixed(2),height:H,fill:anomColor(an,scale)});
    r.appendChild(E("title")).textContent=`${y}: ${ANN[i].toFixed(1)} °C (${an>=0?"+":""}${an.toFixed(1)} ggü. 1982–2010)`;
    svg.appendChild(r);
  });
  host.appendChild(svg);
  document.getElementById("stripeStart").textContent=YEARS[0];
  document.getElementById("stripeEnd").textContent=YEARS[YEARS.length-1];
}

/* ============ generischer XY-Rahmen ============ */
function frame(svg,W,H,pad,xmin,xmax,ymin,ymax){
  const xS=x=>pad.l+(x-xmin)/(xmax-xmin)*(W-pad.l-pad.r);
  const yS=y=>H-pad.b-(y-ymin)/(ymax-ymin)*(H-pad.t-pad.b);
  // Achsen
  svg.appendChild(E("line",{x1:pad.l,y1:H-pad.b,x2:W-pad.r,y2:H-pad.b,class:"axis"}));
  svg.appendChild(E("line",{x1:pad.l,y1:pad.t,x2:pad.l,y2:H-pad.b,class:"axis"}));
  return {xS,yS};
}
function gridY(svg,W,pad,yS,ticks,fmt){
  ticks.forEach(t=>{
    svg.appendChild(E("line",{x1:pad.l,y1:yS(t),x2:W-pad.r,y2:yS(t),class:"grid"}));
    const lab=E("text",{x:pad.l-8,y:yS(t)+4,class:"tick","text-anchor":"end"}); lab.textContent=fmt(t); svg.appendChild(lab);
  });
}

/* ============ 2) Jahresmittel-Trend + Extrapolation ============ */
function renderTrend(){
  const ey=state.extrapYear;
  // Fit zuerst – wird fuer dynamisches ymax benoetigt
  const xs=[],ys=[]; YEARS.forEach((y,i)=>{if(y>=state.startYear){xs.push(y);ys.push(ANN[i]);}});
  const fit=ols(xs,ys);
  const base2025=fit.a+fit.b*2025;
  const projVal=fit.a+fit.b*ey;
  const host=document.getElementById("trend"); clear(host);
  const W=1000,H=420,pad={l:48,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const xmin=YEARS[0], xmax=ey, ymin=7.5, ymax=Math.max(13.5,Math.ceil(projVal+1));
  const {xS,yS}=frame(svg,W,H,pad,xmin,xmax,ymin,ymax);
  const gTicks=[8,9,10,11,12,13,14,15,16,17].filter(t=>t<ymax);
  gridY(svg,W,pad,yS,gTicks,t=>t+"°");
  // X-Ticks (Dekaden + Zieljahr)
  const xTicks=[1985,1995,2005,2015,2025]; if(ey>2027) xTicks.push(ey);
  xTicks.forEach(t=>{const lab=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"}); lab.textContent=t; svg.appendChild(lab);});
  // Referenzperioden-Linien
  Object.keys(DATA.refperiods).forEach(k=>{
    const yv=DATA.refperiods[k];
    svg.appendChild(E("line",{x1:xS(xmin),y1:yS(yv),x2:xS(2025),y2:yS(yv),class:"ref"}));
  });
  // Modellkorridor
  if(state.showCorridor){
    const lo=[],hi=[]; for(let y=2025;y<=ey;y++){lo.push([y, base2025+0.025*(y-2025)]); hi.push([y, base2025+0.040*(y-2025)]);}
    let d="M"+lo.map(p=>`${xS(p[0])},${yS(p[1])}`).join(" L");
    for(let i=hi.length-1;i>=0;i--) d+=` L${xS(hi[i][0])},${yS(hi[i][1])}`;
    d+=" Z"; svg.appendChild(E("path",{d,class:"corridor"}));
  }
  // Datenpunkte + Verbindung
  let dl="M"; YEARS.forEach((y,i)=>{dl+=`${i?"L":""}${xS(y)},${yS(ANN[i])} `;});
  svg.appendChild(E("path",{d:dl.trim(),class:"series"}));
  YEARS.forEach((y,i)=>{
    const inFit=y>=state.startYear;
    const c=E("circle",{cx:xS(y),cy:yS(ANN[i]),r:inFit?3.1:2.4,class:inFit?"pt":"pt dim"});
    c.appendChild(E("title")).textContent=`${y}: ${ANN[i].toFixed(2)} °C`;
    svg.appendChild(c);
  });
  // Regressionsgerade
  svg.appendChild(E("line",{x1:xS(state.startYear),y1:yS(fit.a+fit.b*state.startYear),
                            x2:xS(2025),y2:yS(base2025),class:"fit"}));
  // Extrapolation gestrichelt 2025->ey
  if(state.showExtrap){
    svg.appendChild(E("line",{x1:xS(2025),y1:yS(base2025),x2:xS(ey),y2:yS(projVal),class:"fit dash"}));
    const p=E("circle",{cx:xS(ey),cy:yS(projVal),r:4,class:"pt2036"});
    p.appendChild(E("title")).textContent=`Extrapolation ${ey}: ${projVal.toFixed(2)} °C`;
    svg.appendChild(p);
  }
  host.appendChild(svg);
  // Kennzahlen
  document.getElementById("kSlope").textContent=(fit.b*10>=0?"+":"")+(fit.b*10).toFixed(2)+" °C / Dekade";
  document.getElementById("kR2").textContent="R² = "+fit.r2.toFixed(2);
  document.getElementById("kWindow").textContent=state.startYear+"–2025";
  document.getElementById("k2036").textContent=projVal.toFixed(1)+" °C";
  document.getElementById("kRise").textContent="+"+(fit.b*(2025-state.startYear)).toFixed(1)+" °C";
}

/* ============ 3) Dekaden-Balken ============ */
function renderDecades(){
  const ey=state.extrapYear;
  const host=document.getElementById("decades"); clear(host);
  // Gemessene Dekaden
  const hisDefs=[["1982–89",1982,1989],["1990–99",1990,1999],["2000–09",2000,2009],["2010–19",2010,2019],["2020–25",2020,2025]];
  const hisVals=hisDefs.map(d=>{const v=[];YEARS.forEach((y,i)=>{if(y>=d[1]&&y<=d[2])v.push(ANN[i]);});return mean(v);});
  // OLS-Trend fuer projizierte Dekaden
  const fit=ols(YEARS,ANN);
  const projDefs=[], projVals=[];
  let ds=2026; while(ds<=ey){
    const de=Math.min(ds+9,ey);
    projDefs.push([ds+"–"+String(de).slice(-2),ds,de]);
    const ys=[]; for(let y=ds;y<=de;y++) ys.push(fit.a+fit.b*y);
    projVals.push(mean(ys)); ds+=10;
  }
  const allDefs=[...hisDefs,...projDefs], allVals=[...hisVals,...projVals];
  const W=1000,H=300,pad={l:48,r:18,t:16,b:40};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const ymin=8.5, ymax=Math.max(12.5,Math.ceil(Math.max(...allVals)*2)/2+0.5);
  const yS=y=>H-pad.b-(y-ymin)/(ymax-ymin)*(H-pad.t-pad.b);
  const gT=[9,10,11,12,13,14,15,16].filter(t=>t<=ymax);
  gridY(svg,W,pad,yS,gT,t=>t+"°");
  svg.appendChild(E("line",{x1:pad.l,y1:H-pad.b,x2:W-pad.r,y2:H-pad.b,class:"axis"}));
  const bw=(W-pad.l-pad.r)/allDefs.length;
  allDefs.forEach((d,i)=>{
    const isProj=i>=hisDefs.length;
    const x=pad.l+i*bw+bw*0.18, w=bw*0.64, v=allVals[i], an=v-BASE_ANN;
    const clr=anomColor(an,1.6);
    if(isProj){
      svg.appendChild(E("rect",{x,y:yS(v),width:w,height:(H-pad.b)-yS(v),fill:clr,"fill-opacity":"0.32",rx:3,
        stroke:clr,"stroke-width":"1.5","stroke-dasharray":"5,3"}));
    } else {
      svg.appendChild(E("rect",{x,y:yS(v),width:w,height:(H-pad.b)-yS(v),fill:clr,rx:3}));
    }
    const vlab=E("text",{x:x+w/2,y:yS(v)-(isProj?11:7),class:"barval","text-anchor":"middle",opacity:isProj?0.75:1,"font-style":isProj?"italic":"normal"});
    vlab.textContent=v.toFixed(1); svg.appendChild(vlab);
    const lab=E("text",{x:x+w/2,y:H-pad.b+20,class:"tick","text-anchor":"middle",opacity:isProj?0.65:1});
    lab.textContent=d[0]; svg.appendChild(lab);
  });
  host.appendChild(svg);
}

/* ============ 4) Monats-Heatmap (Jahr x Monat, Anomalie) ============ */
function renderHeatmap(){
  const host=document.getElementById("heatmap"); clear(host);
  const n=YEARS.length, cols=12;
  const W=1000, cellH=Math.max(7, Math.min(16, 560/n)), labH=22, labW=44;
  const H=labH+n*cellH+6;
  const cw=(W-labW)/cols;
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  MONTHS.forEach((m,c)=>{const t=E("text",{x:labW+c*cw+cw/2,y:14,class:"tick","text-anchor":"middle"});t.textContent=m;svg.appendChild(t);});
  YEARS.forEach((y,r)=>{
    if(y%5===0||y===YEARS[0]||y===YEARS[n-1]){const t=E("text",{x:labW-6,y:labH+r*cellH+cellH-2,class:"tick","text-anchor":"end"});t.textContent=y;svg.appendChild(t);}
    for(let c=0;c<12;c++){
      const an=MON[r][c]-BASE_MON[c];
      const rect=E("rect",{x:labW+c*cw,y:labH+r*cellH,width:cw+0.5,height:cellH+0.5,fill:anomColor(an,3.2)});
      rect.appendChild(E("title")).textContent=`${MONTHS[c]} ${y}: ${MON[r][c].toFixed(1)} °C (${an>=0?"+":""}${an.toFixed(1)})`;
      svg.appendChild(rect);
    }
  });
  host.appendChild(svg);
}

/* ============ 5) Phaenologie (thermische Vegetationsperiode) ============ */
const MIDDOY=[15,46,74,105,135,166,196,227,258,288,319,349];
function seasonFor(rowIdx,thr){
  const t=MON[rowIdx]; let s=null,e=null;
  for(let i=0;i<11;i++){
    if(s===null && t[i]<thr && thr<=t[i+1]) s=MIDDOY[i]+(thr-t[i])/(t[i+1]-t[i])*(MIDDOY[i+1]-MIDDOY[i]);
    if(t[i]>=thr && thr>t[i+1]) e=MIDDOY[i]+(t[i]-thr)/(t[i]-t[i+1])*(MIDDOY[i+1]-MIDDOY[i]);
  }
  if(s===null||e===null||e<=s) return null;
  return {s,e,len:e-s};
}
function doyToDate(d){
  const base=new Date(2025,0,1); base.setDate(base.getDate()+Math.round(d)-1);
  return base.toLocaleDateString("de-DE",{day:"2-digit",month:"short"});
}
function renderPhenology(){
  if(state.phenMode==='dwd'){ renderPhenologyDWD(); return; }
  const thr=state.threshold;
  const xs=[],ss=[],ee=[],ll=[];
  YEARS.forEach((y,i)=>{const s=seasonFor(i,thr); if(s){xs.push(y);ss.push(s.s);ee.push(s.e);ll.push(s.len);}});
  const ey=state.extrapYear;
  const host=document.getElementById("phen"); clear(host);
  const W=1000,H=420,pad={l:54,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const xmin=YEARS[0],xmax=ey,ymin=40,ymax=340;
  const {xS,yS}=frame(svg,W,H,pad,xmin,xmax,ymin,ymax);
  // y-Ticks = Monatsanfaenge
  const mstart=[1,32,60,91,121,152,182,213,244,274,305,335];
  mstart.forEach((d,mi)=>{svg.appendChild(E("line",{x1:pad.l,y1:yS(d),x2:W-pad.r,y2:yS(d),class:"grid"}));
    const t=E("text",{x:pad.l-8,y:yS(d)+4,class:"tick","text-anchor":"end"});t.textContent=MONTHS[mi];svg.appendChild(t);});
  const xTph=[1985,1995,2005,2015,2025]; if(ey>2027) xTph.push(ey);
  xTph.forEach(t=>{const l=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"});l.textContent=t;svg.appendChild(l);});
  // Band zwischen Beginn und Ende (gefuellt)
  if(xs.length){
    let d="M"+xs.map((y,i)=>`${xS(y)},${yS(ss[i])}`).join(" L");
    for(let i=xs.length-1;i>=0;i--) d+=` L${xS(xs[i])},${yS(ee[i])}`;
    d+=" Z"; svg.appendChild(E("path",{d,class:"seasonband"}));
  }
  function plot(xs,ys,cls,proj){
    const fit=ols(xs,ys);
    xs.forEach((y,i)=>{const c=E("circle",{cx:xS(y),cy:yS(ys[i]),r:2.6,class:cls});c.appendChild(E("title")).textContent=`${y}: ${doyToDate(ys[i])}`;svg.appendChild(c);});
    svg.appendChild(E("line",{x1:xS(xs[0]),y1:yS(fit.a+fit.b*xs[0]),x2:xS(2025),y2:yS(fit.a+fit.b*2025),class:cls+" fitline"}));
    if(state.showExtrap) svg.appendChild(E("line",{x1:xS(2025),y1:yS(fit.a+fit.b*2025),x2:xS(ey),y2:yS(fit.a+fit.b*ey),class:cls+" fitline dash"}));
    return fit;
  }
  let fS={b:0},fE={b:0},fL={b:0};
  if(xs.length){ fS=plot(xs,ss,"pStart"); fE=plot(xs,ee,"pEnd"); fL=ols(xs,ll); }
  host.appendChild(svg);
  // Kennzahlen
  const early=arr=>mean(arr.slice(0,5)), late=arr=>mean(arr.slice(-5));
  document.getElementById("phThr").textContent=thr.toFixed(1).replace(".",",")+" °C";
  document.getElementById("phStart").textContent=(fS.b*10>=0?"+":"")+(fS.b*10).toFixed(1)+" T/Dek";
  document.getElementById("phEnd").textContent=(fE.b*10>=0?"+":"")+(fE.b*10).toFixed(1)+" T/Dek";
  document.getElementById("phLen").textContent=(fL.b*10>=0?"+":"")+(fL.b*10).toFixed(1)+" T/Dek";
  if(xs.length){
    document.getElementById("phStartShift").textContent=doyToDate(early(ss))+" → "+doyToDate(late(ss));
    document.getElementById("phEndShift").textContent=doyToDate(early(ee))+" → "+doyToDate(late(ee));
    document.getElementById("phLenShift").textContent=Math.round(early(ll))+" → "+Math.round(late(ll))+" Tage";
  }
}

/* ============ 5b) Phänologie — DWD-Beobachtungsmodus ============ */
function renderPhenologyDWD(){
  const ey=state.extrapYear;
  const host=document.getElementById("phen"); clear(host);
  const W=1000,H=420,pad={l:54,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const xmin=YEARS[0],xmax=ey,ymin=60,ymax=340;
  const {xS,yS}=frame(svg,W,H,pad,xmin,xmax,ymin,ymax);
  const mstart=[1,32,60,91,121,152,182,213,244,274,305,335];
  mstart.forEach((d,mi)=>{svg.appendChild(E("line",{x1:pad.l,y1:yS(d),x2:W-pad.r,y2:yS(d),class:"grid"}));
    const t=E("text",{x:pad.l-8,y:yS(d)+4,class:"tick","text-anchor":"end"});t.textContent=MONTHS[mi];svg.appendChild(t);});
  const xTph=[1985,1995,2005,2015,2025]; if(ey>2027) xTph.push(ey);
  xTph.forEach(t=>{const l=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"});l.textContent=t;svg.appendChild(l);});
  // Saisonband: Eiche Blattentfaltung → Eiche Herbstfärbung
  let db="M"; YEARS.forEach((y,i)=>{db+=`${i?"L":""}${xS(y)},${yS(PHEN.eiche_bl[i])} `;});
  for(let i=YEARS.length-1;i>=0;i--) db+=` L${xS(YEARS[i])},${yS(PHEN.herbst[i])}`;
  db+=" Z"; svg.appendChild(E("path",{d:db,class:"seasonband"}));
  // Plot-Hilfsfunktion
  function plot(doys,cls){
    const fit=ols(YEARS,doys);
    YEARS.forEach((y,i)=>{const c=E("circle",{cx:xS(y),cy:yS(doys[i]),r:2.4,class:cls});c.appendChild(E("title")).textContent=`${y}: ${doyToDate(doys[i])} (DOY ${Math.round(doys[i])})`;svg.appendChild(c);});
    svg.appendChild(E("line",{x1:xS(YEARS[0]),y1:yS(fit.a+fit.b*YEARS[0]),x2:xS(2025),y2:yS(fit.a+fit.b*2025),class:cls+" fitline"}));
    if(state.showExtrap) svg.appendChild(E("line",{x1:xS(2025),y1:yS(fit.a+fit.b*2025),x2:xS(ey),y2:yS(fit.a+fit.b*ey),class:cls+" fitline dash"}));
    return fit;
  }
  const fAhorn=plot(PHEN.ahorn,"pAhorn");
  const fEiche=plot(PHEN.eiche_bl,"pEicheBl");
  const fLinde=plot(PHEN.linde,"pLinde");
  const fHerbst=plot(PHEN.herbst,"pEnd");
  host.appendChild(svg);
  // Legende im SVG (oben rechts)
  const lg=[["pAhorn","Spitz-Ahorn Blüte"],["pEicheBl","Eiche Blattentf."],["pLinde","Linde Blüte"],["pEnd","Eiche Herbstfärb."]];
  // Stats
  const lenVals=YEARS.map((y,i)=>PHEN.herbst[i]-PHEN.eiche_bl[i]);
  const fLen=ols(YEARS,lenVals);
  const e5=a=>mean(a.slice(0,5)), l5=a=>mean(a.slice(-5));
  setTxt("phThr","DWD Jahresmelder (45 Stationen ≤30km)");
  setTxt("phStart",(fAhorn.b*10>=0?"+":"")+(fAhorn.b*10).toFixed(1)+" T/Dek (Ahorn Blüte)");
  setTxt("phEnd",(fHerbst.b*10>=0?"+":"")+(fHerbst.b*10).toFixed(1)+" T/Dek (Eiche Herbst)");
  setTxt("phLen",(fLen.b*10>=0?"+":"")+(fLen.b*10).toFixed(1)+" T/Dek");
  setTxt("phStartShift",doyToDate(e5(PHEN.eiche_bl))+" → "+doyToDate(l5(PHEN.eiche_bl))+" (Eiche Bl.)");
  setTxt("phEndShift",doyToDate(e5(PHEN.herbst))+" → "+doyToDate(l5(PHEN.herbst))+" (Eiche Herbst)");
  setTxt("phLenShift",Math.round(e5(lenVals))+" → "+Math.round(l5(lenVals))+" Tage (Eiche)");
}

/* ============ 6) Niederschlag / Sonne / UV (Saison) ============ */
function barChart(hostId,values,opts){
  const host=document.getElementById(hostId); clear(host);
  const W=1000,H=300,pad={l:44,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const ymax=opts.ymax, ymin=0;
  const yS=y=>H-pad.b-(y-ymin)/(ymax-ymin)*(H-pad.t-pad.b);
  (opts.ticks||[]).forEach(t=>{svg.appendChild(E("line",{x1:pad.l,y1:yS(t),x2:W-pad.r,y2:yS(t),class:"grid"}));
    const l=E("text",{x:pad.l-8,y:yS(t)+4,class:"tick","text-anchor":"end"});l.textContent=t;svg.appendChild(l);});
  svg.appendChild(E("line",{x1:pad.l,y1:H-pad.b,x2:W-pad.r,y2:H-pad.b,class:"axis"}));
  const bw=(W-pad.l-pad.r)/12;
  // tooltip group (shared, hidden by default)
  const ttg=E("g",{style:"pointer-events:none;display:none"});
  const ttr=E("rect",{rx:4,fill:"#0d1520",stroke:"#5fae7a",strokeWidth:"1.5"});
  const ttt=E("text",{"text-anchor":"middle","dominant-baseline":"middle",fill:"#e8ead0","font-size":"13","font-family":"Space Grotesk,system-ui,sans-serif"});
  ttg.appendChild(ttr); ttg.appendChild(ttt);
  const showTip=(cx,cy,label)=>{
    ttt.textContent=label;
    svg.appendChild(ttg); // bring to front
    const tw=ttt.getComputedTextLength?ttt.getComputedTextLength()+20:label.length*8+20;
    const th=22, tx=Math.min(Math.max(cx-tw/2,pad.l),W-pad.r-tw), ty=Math.max(cy-th-6,4);
    ttr.setAttribute("x",tx); ttr.setAttribute("y",ty); ttr.setAttribute("width",tw); ttr.setAttribute("height",th);
    ttt.setAttribute("x",tx+tw/2); ttt.setAttribute("y",ty+th/2);
    ttg.style.display="";
  };
  const hideTip=()=>{ ttg.style.display="none"; };
  values.forEach((v,i)=>{
    const x=pad.l+i*bw+bw*0.16,w=bw*0.68;
    const hl=(i===state.month-1);
    const rect=E("rect",{x,y:yS(v),width:w,height:(H-pad.b)-yS(v),rx:3,fill:hl?opts.hl:opts.color,opacity:hl?1:0.82,style:"cursor:pointer"});
    const label=`${MONTHS[i]}: ${v} ${opts.unit}`;
    rect.addEventListener("click",()=>setters.setMonth&&setters.setMonth(i+1));
    rect.addEventListener("mouseover",()=>showTip(x+w/2,yS(v),label));
    rect.addEventListener("mouseout",hideTip);
    rect.addEventListener("touchstart",e=>{e.preventDefault();showTip(x+w/2,yS(v),label);},{passive:false});
    rect.addEventListener("touchend",()=>{hideTip();setters.setMonth&&setters.setMonth(i+1);});
    svg.appendChild(rect);
    const lab=E("text",{x:x+w/2,y:H-pad.b+18,class:"tick","text-anchor":"middle",fontWeight:hl?"bold":"normal"});lab.textContent=MONTHS[i];svg.appendChild(lab);
    if(hl){
      const vl=E("text",{x:x+w/2,y:yS(v)-6,class:"barval","text-anchor":"middle"});vl.textContent=v;svg.appendChild(vl);
      // kleines Dreieck oben am aktiven Balken
      const tx=x+w/2, ty=yS(v)-18;
      const tri=E("polygon",{points:`${tx},${ty+8} ${tx-5},${ty} ${tx+5},${ty}`,fill:"#5fae7a"});
      svg.appendChild(tri);
    }
  });
  // optionale Linie (z.B. Regentage)
  if(opts.line){
    const lmax=opts.lineMax; const lyS=y=>H-pad.b-(y/lmax)*(H-pad.t-pad.b);
    let d="M"; opts.line.forEach((v,i)=>{const x=pad.l+i*bw+bw*0.5; d+=`${i?"L":""}${x},${lyS(v)} `;});
    svg.appendChild(E("path",{d:d.trim(),class:"lineover"}));
    opts.line.forEach((v,i)=>{
      const x=pad.l+i*bw+bw*0.5; const cy=lyS(v);
      const c=E("circle",{cx:x,cy,r:2.4,class:"lineoverpt",style:"cursor:pointer"});
      const ll=`${MONTHS[i]}: ${v} ${opts.lineUnit}`;
      c.addEventListener("mouseover",()=>showTip(x,cy,ll));
      c.addEventListener("mouseout",hideTip);
      c.addEventListener("touchstart",e=>{e.preventDefault();showTip(x,cy,ll);},{passive:false});
      c.addEventListener("touchend",hideTip);
      svg.appendChild(c);
    });
  }
  svg.appendChild(ttg);
  host.appendChild(svg);
}
function renderSeasonal(){
  barChart("precip",DATA.precip,{ymax:160,ticks:[40,80,120,160],color:"#3d7fb8",hl:"#1d5e93",unit:"mm",
    line:DATA.raindays,lineMax:24,lineUnit:"Regentage"});
  barChart("uv",DATA.uvi,{ymax:8,ticks:[2,4,6,8],color:"#d98a2b",hl:"#b5161f",unit:"UV-Index",
    line:DATA.sun,lineMax:320,lineUnit:"Sonnenstunden"});
  const m=state.month-1;
  document.getElementById("sealMonth").textContent=MONTHS[m];
  document.getElementById("seaPrecip").textContent=DATA.precip[m]+" mm";
  document.getElementById("seaRain").textContent=DATA.raindays[m]+" Tage";
  document.getElementById("seaUv").textContent=DATA.uvi[m];
  document.getElementById("seaSun").textContent=DATA.sun[m]+" h";
  document.getElementById("seaTmean").textContent=DATA.tmean[m].toFixed(1)+" °C";
}

/* ===== Extremwerte (DWD München-Stadt 03379, 1982-2025) ===== */
const EXT = {
  years: [1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
  hot: [31.8,37.5,37.1,32.4,31.6,31.1,34.0,32.9,32.0,32.7,34.8,30.9,34.0,34.5,31.0,29.0,34.8,33.7,33.5,32.1,33.9,37.0,31.5,33.5,34.8,35.2,33.0,35.2,33.7,35.8,34.7,36.9,33.9,36.9,33.2,35.8,35.1,35.3,34.2,32.3,36.8,35.9,33.7,34.3],
  cold: [-13.0,-11.0,-11.6,-21.0,-14.0,-22.2,-11.0,-10.3,-11.3,-15.2,-10.1,-12.5,-9.6,-11.5,-16.5,-12.1,-10.8,-12.6,-16.4,-15.5,-12.5,-13.1,-11.5,-16.0,-13.3,-8.9,-7.9,-15.8,-10.9,-10.5,-16.6,-9.2,-11.6,-9.1,-8.1,-14.8,-13.4,-8.0,-4.9,-11.3,-10.2,-10.8,-8.6,-8.0],
  days: [6,13,4,7,4,2,4,2,5,3,17,3,19,7,5,0,13,4,8,9,7,31,3,10,18,11,11,9,14,9,13,17,10,33,10,21,16,18,11,9,20,25,21,38],
  rec: { hotV:37.5, hotY:1983, coldV:-22.2, coldY:1987, daysV:38, daysY:2025 }
};
/* ===== Phänologie-Beobachtung (DWD CDC Jahresmelder, München ≤30 km, 1982–2025) ===== */
/* Quellen: Spitz-Ahorn Blüte (Obj 131 Ph5), Stiel-Eiche Blattentf. (Obj 132 Ph4),
   Sommer-Linde Blüte (Obj 130 Ph5), Stiel-Eiche Herbstfärbung (Obj 132 Ph31) */
const PHEN = {
  ahorn:  [110.6,111.0,120.1,113.4,117.4,117.7,112.4,90.6,87.5,105.6,110.0,110.0,91.3,102.2,115.3,93.9,99.1,100.7,104.6,101.9,90.2,106.8,102.0,106.3,110.6,96.1,101.1,103.3,104.8,94.3,103.2,110.7,88.9,103.7,98.1,93.2,103.6,95.2,93.5,102.0,100.7,96.6,86.9,97.1],
  eiche_bl:[135.3,126.9,135.3,135.1,129.9,130.7,125.3,116.6,120.9,128.3,124.2,117.8,116.2,118.6,122.2,123.4,122.6,118.4,116.4,119.0,120.7,114.5,119.3,124.0,123.1,111.5,122.2,112.3,120.8,111.4,117.3,122.8,111.3,117.0,120.1,121.6,111.1,113.8,112.7,130.5,124.4,126.8,103.5,114.4],
  linde:  [174.6,173.8,186.1,181.0,178.1,185.5,175.1,171.1,170.8,186.6,167.9,164.5,172.9,180.1,168.2,171.6,167.6,170.2,160.2,171.4,165.5,162.1,176.1,170.4,177.1,156.0,160.3,162.4,174.5,162.2,166.0,178.5,165.2,166.1,172.3,164.7,153.4,167.2,170.4,172.4,166.2,170.0,162.0,164.8],
  herbst: [293.0,289.5,290.6,296.3,282.0,286.1,283.2,286.0,284.8,288.1,288.5,287.5,287.1,287.4,281.2,297.4,288.2,293.8,289.9,287.0,281.5,285.5,296.6,293.0,298.0,282.9,289.6,289.7,291.3,303.0,296.8,296.4,293.9,292.0,300.2,293.3,296.0,296.8,302.2,302.4,298.2,301.6,298.9,292.3],
};
function setTxt(id,v){ const e=document.getElementById(id); if(e) e.textContent=v; }
function renderExtTemp(){
  const ey=state.extrapYear;
  const host=document.getElementById("extTemp"); if(!host) return; clear(host);
  // Fits zuerst fuer dynamischen y-Bereich
  const fHpre=ols(EXT.years,EXT.hot), fCpre=ols(EXT.years,EXT.cold);
  const W=1000,H=420,pad={l:46,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const xmin=EXT.years[0], xmax=ey;
  const ymin=Math.min(-24,Math.floor(fCpre.a+fCpre.b*ey-3));
  const ymax=Math.max(42,Math.ceil(fHpre.a+fHpre.b*ey+3));
  const {xS,yS}=frame(svg,W,H,pad,xmin,xmax,ymin,ymax);
  const yTicks=[-20,-10,0,10,20,30,40,50].filter(t=>t>ymin&&t<ymax);
  gridY(svg,W,pad,yS,yTicks,t=>t+"°");
  const xTe=[1985,1995,2005,2015,2025]; if(ey>2027) xTe.push(ey);
  xTe.forEach(t=>{const l=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"});l.textContent=t;svg.appendChild(l);});
  svg.appendChild(E("line",{x1:xS(xmin),y1:yS(0),x2:xS(ey),y2:yS(0),class:"ref"}));
  const extLast=EXT.years[EXT.years.length-1];
  function plot(arr,cls){
    const xs=EXT.years, fit=ols(xs,arr);
    xs.forEach((y,i)=>{const c=E("circle",{cx:xS(y),cy:yS(arr[i]),r:2.6,class:cls});c.appendChild(E("title")).textContent=`${y}: ${arr[i].toFixed(1)} °C`;svg.appendChild(c);});
    svg.appendChild(E("line",{x1:xS(xs[0]),y1:yS(fit.a+fit.b*xs[0]),x2:xS(extLast),y2:yS(fit.a+fit.b*extLast),class:cls+" fitline"}));
    svg.appendChild(E("line",{x1:xS(extLast),y1:yS(fit.a+fit.b*extLast),x2:xS(ey),y2:yS(fit.a+fit.b*ey),class:cls+" fitline dash"}));
    const p=E("circle",{cx:xS(ey),cy:yS(fit.a+fit.b*ey),r:4,class:cls});p.appendChild(E("title")).textContent=`${ey}: ${(fit.a+fit.b*ey).toFixed(1)} °C`;svg.appendChild(p);
    return fit;
  }
  const fH=plot(EXT.hot,"pEnd");
  const fC=plot(EXT.cold,"pStart");
  host.appendChild(svg);
  setTxt("exHot",(fH.a+fH.b*ey).toFixed(1)+" °C");
  setTxt("exCold",(fC.a+fC.b*ey).toFixed(1)+" °C");
  setTxt("exHotTrend",(fH.b*10>=0?"+":"")+(fH.b*10).toFixed(1)+" °C/Dek");
  setTxt("exColdTrend",(fC.b*10>=0?"+":"")+(fC.b*10).toFixed(1)+" °C/Dek");
}
function renderExtDays(){
  const ey=state.extrapYear;
  const host=document.getElementById("extDays"); if(!host) return; clear(host);
  const W=1000,H=300,pad={l:40,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const xs=EXT.years, ys=EXT.days;
  const fit=ols(xs,ys);
  const xmin=xs[0], xmax=ey;
  const ymax=Math.max(40,Math.ceil((fit.a+fit.b*ey)*1.15/10)*10);
  const xS=x=>pad.l+(x-xmin)/(xmax-xmin)*(W-pad.l-pad.r);
  const yS=v=>H-pad.b-(v/ymax)*(H-pad.t-pad.b);
  const yTicks=[10,20,30,40,50,60,70,80].filter(t=>t<=ymax);
  yTicks.forEach(t=>{svg.appendChild(E("line",{x1:pad.l,y1:yS(t),x2:W-pad.r,y2:yS(t),class:"grid"}));const l=E("text",{x:pad.l-8,y:yS(t)+4,class:"tick","text-anchor":"end"});l.textContent=t;svg.appendChild(l);});
  svg.appendChild(E("line",{x1:pad.l,y1:H-pad.b,x2:W-pad.r,y2:H-pad.b,class:"axis"}));
  const xTd=[1985,1995,2005,2015,2025]; if(ey>2027) xTd.push(ey);
  xTd.forEach(t=>{const l=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"});l.textContent=t;svg.appendChild(l);});
  const bw=(W-pad.l-pad.r)/((xmax-xmin)+1)*0.8;
  xs.forEach((y,i)=>{const x=xS(y)-bw/2;const r=E("rect",{x,y:yS(ys[i]),width:bw,height:(H-pad.b)-yS(ys[i]),rx:1.5,fill:"#d9572b",opacity:0.82});r.appendChild(E("title")).textContent=`${y}: ${ys[i]} Hitzetage`;svg.appendChild(r);});
  const extLastD=xs[xs.length-1];
  svg.appendChild(E("line",{x1:xS(xs[0]),y1:yS(Math.max(0,fit.a+fit.b*xs[0])),x2:xS(extLastD),y2:yS(fit.a+fit.b*extLastD),class:"fit"}));
  svg.appendChild(E("line",{x1:xS(extLastD),y1:yS(fit.a+fit.b*extLastD),x2:xS(ey),y2:yS(fit.a+fit.b*ey),class:"fit dash"}));
  const p=E("circle",{cx:xS(ey),cy:yS(fit.a+fit.b*ey),r:4,class:"pt2036"});p.appendChild(E("title")).textContent=`${ey}: ${Math.round(fit.a+fit.b*ey)} Hitzetage`;svg.appendChild(p);
  host.appendChild(svg);
  setTxt("exDays",Math.round(fit.a+fit.b*ey)+" Tage");
  setTxt("exDaysTrend",(fit.b*10>=0?"+":"")+(fit.b*10).toFixed(1)+" d/Dek");
}
function renderExtremes(){
  renderExtTemp(); renderExtDays();
  setTxt("exRecHot",EXT.rec.hotV.toFixed(1)+" °C ("+EXT.rec.hotY+")");
  setTxt("exRecDays",EXT.rec.daysV+" Tage ("+EXT.rec.daysY+")");
}

/* ============ 7) Saisonale Projektion ============ */
function renderProjection(){
  const ey=state.extrapYear;
  const host=document.getElementById("projection"); if(!host) return; clear(host);
  // Monatstrends aus LMU-Reihe
  const projTmean=Array.from({length:12},(_,m)=>{
    const ms=MON.map(row=>row[m]); const f=ols(YEARS,ms); return f.a+f.b*ey;
  });
  // Aktuelle Referenz: Mittel der letzten 5 Jahre (LMU)
  const refTmean=Array.from({length:12},(_,m)=>{
    const vs=YEARS.map((y,i)=>y>=2021?MON[i][m]:null).filter(x=>x!==null); return mean(vs);
  });
  // Tagesschwankung aus DWD-Klimatologie (offset von tmean)
  const dtMax=DATA.tmax.map((v,m)=>v-DATA.tmean[m]);
  const dtMin=DATA.tmin.map((v,m)=>v-DATA.tmean[m]);
  const projTmax=projTmean.map((v,m)=>v+dtMax[m]);
  const projTmin=projTmean.map((v,m)=>v+dtMin[m]);
  const refTmax=refTmean.map((v,m)=>v+dtMax[m]);
  const refTmin=refTmean.map((v,m)=>v+dtMin[m]);
  // y-Skala
  const allV=[...projTmax,...projTmin,...refTmax,...refTmin];
  const ylo=Math.floor(Math.min(...allV))-1, yhi=Math.ceil(Math.max(...allV))+2;
  const W=1000,H=400,pad={l:48,r:18,t:24,b:34};
  const yS=y=>H-pad.b-(y-ylo)/(yhi-ylo)*(H-pad.t-pad.b);
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  // Grid
  for(let t=Math.ceil(ylo/5)*5;t<=yhi;t+=5){
    svg.appendChild(E("line",{x1:pad.l,y1:yS(t),x2:W-pad.r,y2:yS(t),class:"grid"}));
    const l=E("text",{x:pad.l-8,y:yS(t)+4,class:"tick","text-anchor":"end"});l.textContent=t+"°";svg.appendChild(l);
  }
  // 0°C-Linie
  if(ylo<0&&yhi>0) svg.appendChild(E("line",{x1:pad.l,y1:yS(0),x2:W-pad.r,y2:yS(0),stroke:"#3a82c4","stroke-width":"1","stroke-dasharray":"4,3",opacity:"0.4"}));
  svg.appendChild(E("line",{x1:pad.l,y1:H-pad.b,x2:W-pad.r,y2:H-pad.b,class:"axis"}));
  const bw=(W-pad.l-pad.r)/12;
  const isSummer=m=>m>=5&&m<=8; // Jun–Sep
  projTmean.forEach((v,m)=>{
    const cx=pad.l+m*bw+bw*0.5;
    const bl=pad.l+m*bw+bw*0.15, bw2=bw*0.7;
    const summer=isSummer(m);
    // Referenz-Band (grau, hintergrund)
    svg.appendChild(E("rect",{x:bl,y:yS(refTmax[m]),width:bw2,height:yS(refTmin[m])-yS(refTmax[m]),
      fill:"#2a4060",opacity:"0.5",rx:2}));
    // Projektions-Band (farbig)
    const clr=summer?"#df6a2e":"#3a82c4";
    svg.appendChild(E("rect",{x:bl+bw2*0.15,y:yS(projTmax[m]),width:bw2*0.7,height:yS(projTmin[m])-yS(projTmax[m]),
      fill:clr,opacity:summer?0.85:0.55,rx:2}));
    // Tmean-Punkt
    const dot=E("circle",{cx,cy:yS(v),r:summer?5:3.5,fill:clr,stroke:"#e9eff5","stroke-width":"1.5"});
    dot.appendChild(E("title")).textContent=
      `${MONTHS[m]} ${ey} · Tmittel ${v.toFixed(1)} °C · Tmax ⌀ ${projTmax[m].toFixed(1)} °C · Tmin ⌀ ${projTmin[m].toFixed(1)} °C`+
      ` · Δ vs. 2021–25: ${(v-refTmean[m]>=0?"+":"")}${(v-refTmean[m]).toFixed(1)} °C`;
    svg.appendChild(dot);
    // Wert-Label bei Sommermonaten
    if(summer){
      const vl=E("text",{x:cx,y:yS(v)-9,class:"barval","text-anchor":"middle"});
      vl.textContent=v.toFixed(1)+"°"; svg.appendChild(vl);
      const dl2=E("text",{x:cx,y:yS(v)+16,class:"tick","text-anchor":"middle","font-size":"10",fill:"#5fae7a"});
      const delta=v-refTmean[m]; dl2.textContent=(delta>=0?"+":"")+delta.toFixed(1)+"°"; svg.appendChild(dl2);
    }
    // Monats-Label
    const lab=E("text",{x:cx,y:H-pad.b+18,class:"tick","text-anchor":"middle"});lab.textContent=MONTHS[m];svg.appendChild(lab);
    // Tmax-Strich oben
    svg.appendChild(E("line",{x1:bl+bw2*0.15,y1:yS(projTmax[m]),x2:bl+bw2*0.85,y2:yS(projTmax[m]),
      stroke:clr,"stroke-width":"1.5"}));
    // Tmin-Strich unten
    svg.appendChild(E("line",{x1:bl+bw2*0.15,y1:yS(projTmin[m]),x2:bl+bw2*0.85,y2:yS(projTmin[m]),
      stroke:clr,"stroke-width":"1.5"}));
  });
  host.appendChild(svg);
  // Stats
  const jjaMean=mean([5,6,7].map(m=>projTmean[m]));
  const jjaMaxMean=mean([5,6,7].map(m=>projTmax[m]));
  const winterMean=mean([11,0,1].map(m=>projTmean[m]));
  const jjaDelta=mean([5,6,7].map(m=>projTmean[m]-refTmean[m]));
  setTxt("pJJA",jjaMean.toFixed(1)+" °C");
  setTxt("pTmax",jjaMaxMean.toFixed(1)+" °C");
  setTxt("pWinter",winterMean.toFixed(1)+" °C");
  setTxt("pDelta",(jjaDelta>=0?"+":"")+jjaDelta.toFixed(1)+" °C");
}

/* ============ 8) Monats-Zeitreihe (Temperatur-Jahresverlauf) ============ */
function renderMonthTrend(){
  const m=state.month-1, ey=state.extrapYear;
  const host=document.getElementById("monthtrend"); if(!host) return; clear(host);
  const ms=MON.map(row=>row[m]);
  const fit=ols(YEARS,ms);
  const ylo=Math.floor(Math.min(...ms))-1, yhi=Math.ceil(Math.max(...ms))+2;
  const xmin=YEARS[0], xmax=ey;
  const W=1000,H=280,pad={l:48,r:18,t:18,b:34};
  const svg=E("svg",{viewBox:`0 0 ${W} ${H}`,width:"100%"});
  const {xS,yS}=frame(svg,W,H,pad,xmin,xmax,ylo,yhi);
  const step=(yhi-ylo)>15?5:(yhi-ylo)>6?2:1;
  const gT=[]; for(let t=Math.ceil(ylo/step)*step;t<=yhi;t+=step) gT.push(t);
  gridY(svg,W,pad,yS,gT,t=>t+"°");
  const xTm=[1985,1995,2005,2015,2025]; if(ey>2027) xTm.push(ey);
  xTm.forEach(t=>{const l=E("text",{x:xS(t),y:H-pad.b+18,class:"tick","text-anchor":"middle"});l.textContent=t;svg.appendChild(l);});
  // Datenpunkte + Verbindung
  let dl="M"; YEARS.forEach((y,i)=>{dl+=`${i?"L":""}${xS(y)},${yS(ms[i])} `;});
  svg.appendChild(E("path",{d:dl.trim(),class:"series",opacity:"0.5"}));
  YEARS.forEach((y,i)=>{
    const c=E("circle",{cx:xS(y),cy:yS(ms[i]),r:2.8,class:"pt"});
    c.appendChild(E("title")).textContent=`${MONTHS[m]} ${y}: ${ms[i].toFixed(1)} °C`;
    svg.appendChild(c);
  });
  // Trend + Extrapolation
  svg.appendChild(E("line",{x1:xS(YEARS[0]),y1:yS(fit.a+fit.b*YEARS[0]),x2:xS(2025),y2:yS(fit.a+fit.b*2025),class:"fit"}));
  if(state.showExtrap){
    const b25=fit.a+fit.b*2025;
    svg.appendChild(E("line",{x1:xS(2025),y1:yS(b25),x2:xS(ey),y2:yS(fit.a+fit.b*ey),class:"fit dash"}));
    const p=E("circle",{cx:xS(ey),cy:yS(fit.a+fit.b*ey),r:4,class:"pt2036"});
    p.appendChild(E("title")).textContent=`${MONTHS[m]} ${ey}: ${(fit.a+fit.b*ey).toFixed(1)} °C`;
    svg.appendChild(p);
  }
  host.appendChild(svg);
  const rec5=mean(ms.slice(-5));
  setTxt("mtSlope",(fit.b*10>=0?"+":"")+(fit.b*10).toFixed(2)+" °C/Dek");
  setTxt("mtR2","R² = "+fit.r2.toFixed(2));
  setTxt("mtMean",rec5.toFixed(1)+" °C");
  setTxt("mtProj",(fit.a+fit.b*ey).toFixed(1)+" °C");
}

const CSS = `
:root{
  --bg:#0d1520; --panel:#142030; --panel2:#19283a; --line:#273a4f;
  --ink:#e9eff5; --muted:#90a6ba; --faint:#5d7d96;
  --cool:#3a82c4; --cool2:#2a5f9a; --warm:#df6a2e; --hot:#c11f2b; --green:#5fae7a;
  --disp:"Space Grotesk",system-ui,"Segoe UI",sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(1200px 600px at 70% -10%,#16263a 0%,var(--bg) 60%);
  color:var(--ink);font-family:var(--disp);line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:1060px;margin:0 auto;padding:0 20px}
a{color:var(--cool)}
h1,h2,h3{font-weight:600;letter-spacing:-0.02em;margin:0}
.mono{font-family:var(--mono)}
.muted{color:var(--muted)}

/* HERO */
header.hero{padding:56px 0 22px}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--warm)}
h1{font-size:clamp(30px,5vw,54px);line-height:1.02;margin:.3em 0 .25em}
h1 em{font-style:normal;color:var(--warm)}
.stamp{font-family:var(--mono);font-size:12.5px;color:var(--muted)}
.thesis{font-size:clamp(16px,2.2vw,20px);color:#cdd9e4;max-width:62ch;margin:14px 0 26px}
.thesis b{color:#fff;font-weight:600}
.stripewrap{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#0a121c}
#stripes svg{display:block}
.striplab{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);padding:6px 8px}
.legend{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:10px}
.legbar{height:10px;width:160px;border-radius:5px;background:linear-gradient(90deg,#2166ac,#96b4c8,#eeeee8,#e6964f,#b2182b)}

/* CONTROLS */
.controls{position:sticky;top:0;z-index:20;background:rgba(13,21,32,.86);backdrop-filter:blur(8px);
  border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:30px}
.controls .wrap{display:flex;flex-wrap:wrap;gap:22px 30px;padding:14px 20px;align-items:center}
.ctl{display:flex;flex-direction:column;gap:4px;min-width:190px;flex:1 1 190px}
.ctl label{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}
.ctl .val{color:var(--ink)}
input[type=range]{accent-color:var(--warm);width:100%}
.checks{display:flex;gap:18px;flex-wrap:wrap}
.checks label{display:flex;gap:7px;align-items:center;font-family:var(--mono);font-size:12px;color:var(--ink);text-transform:none;letter-spacing:0}
input[type=checkbox]{accent-color:var(--cool);width:15px;height:15px}

/* SECTIONS */
section{padding:46px 0 8px}
.sec-h{display:flex;align-items:baseline;gap:14px;margin-bottom:6px}
.sec-n{font-family:var(--mono);font-size:13px;color:var(--warm)}
h2{font-size:clamp(21px,3vw,30px)}
.lead{color:var(--muted);max-width:70ch;margin:8px 0 22px}
.card{background:linear-gradient(180deg,var(--panel) 0%,var(--panel2) 100%);
  border:1px solid var(--line);border-radius:12px;padding:18px 18px 14px}
.card + .card{margin-top:18px}
.chart{width:100%}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.stat{flex:1 1 150px;background:#0e1a28;border:1px solid var(--line);border-radius:9px;padding:11px 13px}
.stat .k{font-family:var(--mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.stat .v{font-family:var(--mono);font-size:19px;color:var(--ink);margin-top:3px}
.stat.hot .v{color:var(--warm)} .stat.cool .v{color:var(--cool)} .stat.grn .v{color:var(--green)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:760px){.two{grid-template-columns:1fr}}
.cap{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px}
.pill{display:inline-block;font-family:var(--mono);font-size:11px;color:var(--muted);border:1px solid var(--line);
  border-radius:20px;padding:3px 10px;margin:2px 4px 2px 0}

/* SVG element styles */
.axis{stroke:#3a516a;stroke-width:1}
.grid{stroke:rgba(255,255,255,.06);stroke-width:1}
.tick{fill:var(--muted);font-family:var(--mono);font-size:11px}
.ref{stroke:#43617f;stroke-width:1;stroke-dasharray:2 4;opacity:.7}
.corridor{fill:rgba(223,106,46,.13);stroke:none}
.series{fill:none;stroke:rgba(180,200,216,.30);stroke-width:1.4}
.pt{fill:#e7eef5;stroke:#0d1520;stroke-width:.6}
.pt.dim{fill:#5e768c;opacity:.45}
.fit{stroke:var(--warm);stroke-width:2.6;fill:none}
.fit.dash{stroke-dasharray:7 6}
.pt2036{fill:var(--warm);stroke:#0d1520;stroke-width:1}
.barval{fill:#cdd9e4;font-family:var(--mono);font-size:12px}
.seasonband{fill:rgba(95,174,122,.16);stroke:none}
.pStart{fill:var(--cool);stroke:none}
.pStart.fitline{stroke:var(--cool);stroke-width:2.4;fill:none}
.pEnd{fill:var(--warm);stroke:none}
.pEnd.fitline{stroke:var(--warm);stroke-width:2.4;fill:none}
.fitline.dash{stroke-dasharray:7 6}
.pAhorn{fill:#7ec8e3;stroke:none}
.pAhorn.fitline{stroke:#7ec8e3;stroke-width:2;fill:none}
.pEicheBl{fill:#5fae7a;stroke:none}
.pEicheBl.fitline{stroke:#5fae7a;stroke-width:2;fill:none}
.pLinde{fill:#2a9d8f;stroke:none}
.pLinde.fitline{stroke:#2a9d8f;stroke-width:2;fill:none}
.lineover{fill:none;stroke:#cdd9e4;stroke-width:1.6;opacity:.85}
.lineoverpt{fill:#cdd9e4}

/* SOURCES */
table.src{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:6px}
table.src th,table.src td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;vertical-align:top}
table.src th{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
table.src td.mono{font-family:var(--mono);font-size:12px;color:var(--muted)}
.note{background:#0e1a28;border:1px solid var(--line);border-left:3px solid var(--warm);border-radius:8px;padding:13px 15px;color:#cbd8e3;font-size:14px;margin-top:14px}
footer{padding:40px 0 70px;color:var(--muted);font-family:var(--mono);font-size:12px}
`;


export default function App() {
  const [startYear, setStartYear] = useState(1982);
  const [threshold, setThreshold] = useState(5);
  const [month, setMonth] = useState(6);
  setters.setMonth = setMonth;
  const [showExtrap, setShowExtrap] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);
  const [extrapYear, setExtrapYear] = useState(2050);
  const [phenMode, setPhenMode] = useState('proxy');

  useEffect(() => { renderStripes(); renderHeatmap(); }, []);
  useEffect(() => {
    state.startYear = startYear; state.showExtrap = showExtrap; state.showCorridor = showCorridor; state.extrapYear = extrapYear;
    renderTrend();
  }, [startYear, showExtrap, showCorridor, extrapYear]);
  useEffect(() => {
    state.threshold = threshold; state.showExtrap = showExtrap; state.extrapYear = extrapYear; state.phenMode = phenMode;
    renderPhenology();
  }, [threshold, showExtrap, extrapYear, phenMode]);
  useEffect(() => {
    state.extrapYear = extrapYear; state.showExtrap = showExtrap;
    renderDecades(); renderExtremes(); renderProjection(); renderMonthTrend();
  }, [extrapYear, showExtrap]);
  useEffect(() => { state.month = month; renderSeasonal(); renderMonthTrend(); }, [month]);

  const thrLabel = threshold.toFixed(1).replace(".", ",") + " °C";

  return (
    <div className="root">
      <style>{CSS}</style>

      <header className="hero"><div className="wrap">
        <div className="eyebrow">Klima-Observatorium · München-Maxvorstadt</div>
        <h1>München wird <em>wärmer</em> —<br/>und die Saison verschiebt sich.</h1>
        <div className="stamp">Stand 18.06.2026 (MESZ) · interaktiv (React) · Extremwerte DWD 1982–2025 · Datenstand siehe Quellenprotokoll</div>
        <p className="thesis">Jede Säule ist ein Jahr von <b>1982</b> bis <b>2025</b>, eingefärbt nach der Abweichung des Jahresmittels von der Basisperiode 1982–2010 — blau kühler, rot wärmer. Die warme Seite häuft sich klar in den letzten beiden Jahrzehnten.</p>
        <div className="stripewrap">
          <div id="stripes"></div>
          <div className="striplab"><span id="stripeStart"></span><span>Wärmestreifen · Jahresmittel-Anomalie</span><span id="stripeEnd"></span></div>
        </div>
        <div className="legend"><span>kühler</span><span className="legbar"></span><span>wärmer</span><span>· Basis 1982–2010</span></div>
      </div></header>

      <div className="controls"><div className="wrap">
        <div className="ctl">
          <label>Trend-Analyse ab Jahr · <span className="val">{startYear}</span></label>
          <input type="range" min="1982" max="2010" step="1" value={startYear} onChange={(e) => setStartYear(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>Schwelle therm. Saison · <span className="val">{thrLabel}</span></label>
          <input type="range" min="4" max="12" step="0.5" value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>Monat (Saison-Detail) · <span className="val">{MONTHS[month - 1]}</span></label>
          <input type="range" min="1" max="12" step="1" value={month} onChange={(e) => setMonth(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>Prognose-Zieljahr · <span className="val">{extrapYear}</span></label>
          <input type="range" min="2026" max="2100" step="1" value={extrapYear} onChange={(e) => setExtrapYear(+e.target.value)} />
        </div>
        <div className="checks">
          <label><input type="checkbox" checked={showExtrap} onChange={(e) => setShowExtrap(e.target.checked)} /> Extrapolation anzeigen</label>
          <label><input type="checkbox" checked={showCorridor} onChange={(e) => setShowCorridor(e.target.checked)} /> Modellkorridor</label>
        </div>
      </div></div>

      <main className="wrap">
        <section>
          <div className="sec-h"><span className="sec-n">01</span><h2>Erwärmungstrend & Extrapolation</h2></div>
          <p className="lead">Jahresmittel-Temperatur (Punkte), lineare Regression über das per Regler gewählte Fenster (durchgezogen) und statistische Extrapolation bis zum gewählten Zieljahr (gestrichelt). Der schattierte Korridor zeigt den von aktuellen Klimaprojektionen erwarteten Bereich (+0,25 bis +0,40 °C/Dekade). Dünne gestrichelte Horizontalen = offizielle 30-jährige DWD-Mittel der Station München-Stadt.</p>
          <div className="card">
            <div id="trend" className="chart"></div>
            <div className="stats">
              <div className="stat hot"><div className="k">Trend</div><div className="v" id="kSlope">–</div></div>
              <div className="stat"><div className="k">Fitgüte</div><div className="v" id="kR2">–</div></div>
              <div className="stat"><div className="k">Fenster</div><div className="v" id="kWindow">–</div></div>
              <div className="stat hot"><div className="k">Anstieg im Fenster</div><div className="v" id="kRise">–</div></div>
              <div className="stat hot"><div className="k">Extrapol. {extrapYear}</div><div className="v" id="k2036">–</div></div>
            </div>
            <div className="cap">Tipp: „Trend-Analyse ab Jahr" verschieben — die Steigung reagiert empfindlich darauf, ob die kühlen 1980er oder nur die jüngere Reihe einbezogen werden.</div>
          </div>
          <div className="card">
            <h3 style={{fontSize:"16px",marginBottom:"4px"}}>Dekaden-Mittel</h3>
            <div id="decades" className="chart"></div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">02</span><h2>Extremwerte — was {extrapYear} zu erwarten ist</h2></div>
          <p className="lead">Offizielle Jahres-Extreme der DWD-Station München-Stadt (03379, 1982–2025): heißester Tag (TXK), kälteste Nacht (TNK) und Zahl der Hitzetage (≥30 °C) je Jahr, mit linearem Trend und gestrichelter Extrapolation bis zum Zieljahr. <b>2025 war mit 38 Hitzetagen ein neuer Rekord.</b> Wichtig: Einzeljahre streuen stark (niedriges R²) — die Linie ist die <i>Erwartung</i>, kein sicher eintretender Wert.</p>
          <div className="card">
            <div id="extTemp" className="chart"></div>
            <div className="stats">
              <div className="stat hot"><div className="k">Heißester Tag → {extrapYear}</div><div className="v" id="exHot">–</div></div>
              <div className="stat cool"><div className="k">Kälteste Nacht → {extrapYear}</div><div className="v" id="exCold">–</div></div>
              <div className="stat hot"><div className="k">Trend Tageshitze</div><div className="v" id="exHotTrend">–</div></div>
              <div className="stat cool"><div className="k">Trend Nachtkälte</div><div className="v" id="exColdTrend">–</div></div>
            </div>
            <div className="cap">Orange = heißester Tag, blau = kälteste Nacht (DWD München-Stadt). Die kälteste Nacht erwärmt sich (wird seltener streng), der heißeste Tag steigt — beide Trends mit großer Streuung. Reihe nun vollständig 1982–2025.</div>
          </div>
          <div className="card">
            <h3 style={{fontSize:"15px",marginBottom:"8px"}}>Hitzetage ≥ 30 °C pro Jahr</h3>
            <div id="extDays" className="chart"></div>
            <div className="stats">
              <div className="stat hot"><div className="k">Hitzetage → {extrapYear}</div><div className="v" id="exDays">–</div></div>
              <div className="stat"><div className="k">Trend</div><div className="v" id="exDaysTrend">–</div></div>
              <div className="stat"><div className="k">Rekord heißester Tag</div><div className="v" id="exRecHot">–</div></div>
              <div className="stat"><div className="k">Rekord meiste Hitzetage</div><div className="v" id="exRecDays">–</div></div>
            </div>
            <div className="note"><b>Einordnung:</b> Die Kennwerte oben gelten für das gewählte Zieljahr (Slider). Einzeljahre streuen weit um den Trend — die Werte sind statistische Erwartungen, keine Punktprognosen. Reihe: DWD München-Stadt (03379), 1982–2025; amtlicher Gesamtrekord München-Stadt: 37,5 °C (27.07.1983) bzw. −30,5 °C (22.01.1942).</div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">03</span><h2>Wo die Erwärmung sitzt — Monats-Matrix</h2></div>
          <p className="lead">Jede Zelle ist ein Monat eines Jahres, eingefärbt nach Abweichung vom jeweiligen Monatsmittel 1982–2010. So wird sichtbar, dass nicht alle Monate gleich stark zulegen — besonders Spätwinter, Frühjahr und Hochsommer fallen auf.</p>
          <div className="card"><div id="heatmap" className="chart"></div>
            <div className="legend" style={{marginTop:"12px"}}><span>−3 °C</span><span className="legbar"></span><span>+3 °C</span></div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">04</span><h2>Verschiebt sich Frühling & Herbst?</h2></div>
          <p className="lead">{phenMode==='proxy'
            ? <>Proxy für die <b>thermische Vegetationsperiode</b>: aus den Monatsmitteln wird der Tag interpoliert, an dem die Temperatur im Frühjahr die Schwelle (Regler) über- und im Herbst wieder unterschreitet.</>
            : <>Echte DWD-Phänologiebeobachtungen: <b>Spitz-Ahorn Blüte</b> (hellblau, frühestes Frühjahr), <b>Stiel-Eiche Blattentfaltung</b> (grün), <b>Sommer-Linde Blüte</b> (türkis) und <b>Stiel-Eiche Herbstfärbung</b> (orange). 45 Beobachterstationen ≤30 km um München, Mittel pro Jahr. Gestrichelt = Extrapolation bis Zieljahr.</>
          }</p>
          <div className="checks" style={{marginBottom:"16px"}}>
            <label><input type="radio" name="phenMode" checked={phenMode==='proxy'} onChange={()=>setPhenMode('proxy')} /> Temperatur-Proxy</label>
            <label><input type="radio" name="phenMode" checked={phenMode==='dwd'} onChange={()=>setPhenMode('dwd')} /> DWD-Phänologie (real)</label>
          </div>
          {phenMode==='proxy' && <div className="note" style={{marginBottom:"16px"}}><b>Tipp:</b> Schalte auf „DWD-Phänologie" um für echte Beobachtungsdaten (Spitz-Ahorn, Stiel-Eiche, Sommer-Linde) von 45 Münchener Beobachterstationen, 1982–2025.</div>}
          <div className="card">
            <div id="phen" className="chart"></div>
            <div className="stats">
              <div className="stat cool"><div className="k">{phenMode==='proxy'?'Schwelle':'Quelle'}</div><div className="v" id="phThr">–</div></div>
              <div className="stat cool"><div className="k">Frühlingsbeginn</div><div className="v" id="phStart">–</div></div>
              <div className="stat hot"><div className="k">Herbstende</div><div className="v" id="phEnd">–</div></div>
              <div className="stat grn"><div className="k">Saisonlänge</div><div className="v" id="phLen">–</div></div>
            </div>
            <div className="stats">
              <div className="stat"><div className="k">Beginn: erste→letzte 5 J.</div><div className="v" id="phStartShift">–</div></div>
              <div className="stat"><div className="k">Ende: erste→letzte 5 J.</div><div className="v" id="phEndShift">–</div></div>
              <div className="stat"><div className="k">Länge: erste→letzte 5 J.</div><div className="v" id="phLenShift">–</div></div>
            </div>
            <div className="cap">{phenMode==='proxy'
              ? "Negative Tage/Dekade beim Beginn = früher; positive beim Ende = später. Proxy aus Monatsmitteln, daher etwas träge."
              : "Negative Tage/Dekade = Frühjahrsereignisse verschieben sich früher; positive = Herbstereignisse später. Quelle: DWD CDC Jahresmelder, 45 Stationen ≤30 km um München (48.13°N, 11.58°E), gemittelt pro Jahr."
            }</div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">05</span><h2>Niederschlag, Sonne & UV</h2></div>
          <p className="lead">Jahresgang der aktuellen Klimatologie (Station München-Stadt, Basis 06/2021–05/2026). Balken links = Niederschlag (mm), Linie = Regentage; rechts Balken = UV-Index (typischer wolkenfreier Tageshöchstwert), Linie = Sonnenstunden. Den Detail-Monat wählt der „Monat"-Regler oben.</p>
          <div className="two">
            <div className="card"><h3 style={{fontSize:"15px",marginBottom:"8px"}}>Niederschlag & Regentage</h3><div id="precip" className="chart"></div></div>
            <div className="card"><h3 style={{fontSize:"15px",marginBottom:"8px"}}>UV-Index & Sonnenstunden</h3><div id="uv" className="chart"></div></div>
          </div>
          <div className="card" style={{marginTop:"18px"}}>
            <h3 style={{fontSize:"15px",marginBottom:"8px"}}>Detail · <span id="sealMonth" className="mono" style={{color:"var(--warm)"}}>Jun</span></h3>
            <div className="stats">
              <div className="stat"><div className="k">Mittel-Temp.</div><div className="v" id="seaTmean">–</div></div>
              <div className="stat cool"><div className="k">Niederschlag</div><div className="v" id="seaPrecip">–</div></div>
              <div className="stat cool"><div className="k">Regentage</div><div className="v" id="seaRain">–</div></div>
              <div className="stat hot"><div className="k">UV-Index</div><div className="v" id="seaUv">–</div></div>
              <div className="stat hot"><div className="k">Sonnenstunden</div><div className="v" id="seaSun">–</div></div>
            </div>
            <div className="note"><b>Trend-Einordnung:</b> Beim <b>Niederschlag</b> gibt es in München keinen klaren Jahrestrend (Jahressumme ~930–950 mm, hohe Schwankung); dokumentiert sind eher saisonale Verschiebungen — etwas feuchterer Herbst (v. a. Oktober), tendenziell trockenere Aprilmonate, intensivere Sommergewitter. Der <b>UV-Index</b> folgt primär Sonnenstand, Ozon und Bewölkung, nicht der Lufttemperatur; er zeigt keinen erwärmungsgetriebenen Trend. Beide werden daher als Jahresgang, nicht als gefittete Jahresreihe gezeigt.</div>
          </div>
          <div className="card" style={{marginTop:"18px"}}>
            <h3 style={{fontSize:"15px",marginBottom:"8px"}}>Temperatur-Jahresverlauf · <span className="mono" style={{color:"var(--warm)"}}>{MONTHS[month-1]}</span> (1982–2025 + Prognose)</h3>
            <div id="monthtrend" className="chart"></div>
            <div className="stats">
              <div className="stat hot"><div className="k">Trend</div><div className="v" id="mtSlope">–</div></div>
              <div className="stat"><div className="k">Fitgüte</div><div className="v" id="mtR2">–</div></div>
              <div className="stat"><div className="k">Mittel 2021–25</div><div className="v" id="mtMean">–</div></div>
              <div className="stat hot"><div className="k">Prognose {extrapYear}</div><div className="v" id="mtProj">–</div></div>
            </div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">07</span><h2>Saisonale Projektion {extrapYear} — Sommer im Fokus</h2></div>
          <p className="lead">Projizierter Jahresgang für das Zieljahr: mittlere Tagesmax. (Tmax) · Tagesmittel (Tmittel) · mittlere Tagesmin. (Tmin) pro Monat. Dunkles Band = aktuelle Referenz 2021–2025; farbiges Band = Projektionswert. Orange = Sommermonate (Jun–Sep). Der grüne Deltawert zeigt die Erwärmung ggü. heute. <b>Methodik:</b> OLS-Trend aus LMU-Monatsmitteln 1982–2025, Tmax/Tmin aus DWD-Tagesschwankung (konstant).</p>
          <div className="card">
            <div id="projection" className="chart"></div>
            <div className="stats">
              <div className="stat hot"><div className="k">JJA-Mittel (Jun–Aug)</div><div className="v" id="pJJA">–</div></div>
              <div className="stat hot"><div className="k">Sommer Tmax ⌀ (Jun–Aug)</div><div className="v" id="pTmax">–</div></div>
              <div className="stat cool"><div className="k">Winter Tmittel (Dez–Feb)</div><div className="v" id="pWinter">–</div></div>
              <div className="stat grn"><div className="k">Erwärmung JJA ggü. 2021–25</div><div className="v" id="pDelta">–</div></div>
            </div>
            <div className="cap">Hovern/Tippen auf einen Monat zeigt alle drei Projektivwerte. Δ-Werte (grün) zeigen Erwärmung gegenüber dem Mittel 2021–2025. Hohe Unsicherheit bei langen Prognosen — lineare Fortschreibung ist eine Untergrenze ohne Rückkopplungseffekte.</div>
          </div>
        </section>

        <section>
          <div className="sec-h"><span className="sec-n">06</span><h2>Datenquellen-Protokoll</h2></div>
          <p className="lead">Was gemessen, was abgeleitet, was extrapoliert ist — transparent aufgeschlüsselt.</p>
          <div className="card">
            <table className="src"><tbody>
              <tr><th>Größe</th><th>Quelle</th><th>Zeitraum / Station</th><th>Art</th></tr>
              <tr><td>Monatsmittel-Temperatur 1982–2019</td><td className="mono">P. James, LMU München — Klimatabellen München-Maxvorstadt</td><td className="mono">1982–2019 · Maxvorstadt</td><td>Messung</td></tr>
              <tr><td>Monatsmittel-Temperatur 2020–2025</td><td className="mono">LMU München „quicklooks" (gleiche Station, laufende Reihe)</td><td className="mono">2020–2025 · Maxvorstadt</td><td>Messung</td></tr>
              <tr><td>30-jährige Referenzmittel (Horizontlinien)</td><td className="mono">DWD via Stat. Amt München — Station München-Stadt</td><td className="mono">1961–90 … 1991–2020</td><td>Norm</td></tr>
              <tr><td>Niederschlag, Regentage, Sonne, T-Klimatologie</td><td className="mono">DWD via wetterdienst.de — Station München-Stadt</td><td className="mono">06/2021–05/2026</td><td>Messung</td></tr>
              <tr><td>UV-Index (Jahresgang)</td><td className="mono">Niveau nach BfS/UV-Messnetz (STAR), Raum München ~48° N</td><td className="mono">typ. Klarhimmel-Höchstwerte</td><td>Referenz</td></tr>
              <tr><td>Jahresmittel & lineare Trends</td><td className="mono">eigene Berechnung (OLS) aus den Monatsmitteln</td><td className="mono">gewähltes Fenster</td><td>Ableitung</td></tr>
              <tr><td>Thermische Vegetationsperiode</td><td className="mono">eigener Proxy: Schwellen-Interpolation der Monatsmittel</td><td className="mono">1982–2025</td><td>Ableitung</td></tr>
              <tr><td>Jahres-Extreme: heißester Tag / kälteste Nacht / Hitzetage ≥30 °C</td><td className="mono">DWD Open Data — Station München-Stadt 03379 (Tageswerte TXK / TNK, eigene Jahresauswertung)</td><td className="mono">1982–2025 · München-Stadt</td><td>Messung → Extrapolation</td></tr>
              <tr><td>Phänologie: Spitz-Ahorn Blüte, Stiel-Eiche Blattentf./Herbstfärb., Sommer-Linde Blüte</td><td className="mono">DWD CDC Jahresmelder — 45 Stationen ≤30 km um München (Obj 131/132/130, Ph 5/4/31/5)</td><td className="mono">1982–2025 · München-Raum</td><td>Messung</td></tr>
              <tr><td>Extrapolation bis {extrapYear} (gestrichelt)</td><td className="mono">lineare Fortschreibung des Fits</td><td className="mono">2026–{extrapYear}</td><td>Extrapolation</td></tr>
              <tr><td>Modellkorridor</td><td className="mono">Spanne aktueller Projektionen (DWD/IPCC AR6, ~SSP2-4.5): +0,25…+0,40 °C/Dek.</td><td className="mono">2026–{extrapYear}</td><td>Projektion</td></tr>
            </tbody></table>
            <div className="note"><b>Methodik & Grenzen:</b> Trends sind einfache Kleinste-Quadrate-Geraden; die Extrapolation ist eine <i>statistische</i> Fortschreibung, kein dynamisch gerechnetes Klimamodell — reale Pfade hängen vom Emissionsszenario ab (Korridor zur Einordnung). Die Temperaturreihe ist eine Stadtstation (urbaner Wärmeinsel-Effekt enthalten); der Übergang 2019→2020 wechselt die Aufbereitung derselben Station und kann minimale Inhomogenität verursachen. Niederschlag/UV stammen aus kürzeren bzw. typisierten Reihen und sind als Jahresgang zu lesen.</div>
            <div style={{marginTop:"14px"}}>
              <span className="pill">Temperatur: Messreihe 1982–2025</span>
              <span className="pill">44 vollständige Jahre</span>
              <span className="pill">Basis 1982–2010</span>
              <span className="pill">Extrapolation {extrapYear}</span>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="wrap">München-Klimatrend · interaktiv (React, self-contained) · Stand 18.06.2026 (MESZ) · Daten © DWD / LMU München / BfS · Auswertung &amp; Visualisierung eigen. Ohne Gewähr.</div></footer>
    </div>
  );
}
