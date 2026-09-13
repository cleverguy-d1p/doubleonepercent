"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import type {Session} from "@supabase/supabase-js";
import {getClient} from "@/lib/supabase";
import {sections,visible,cleanAnswers,type Answers,type Field} from "@/lib/questions";

export default function Wizard(){
 const [session,setSession]=useState<Session|null>(null);
 const [ready,setReady]=useState(false),[loading,setLoading]=useState(true);
 const [email,setEmail]=useState(""),[code,setCode]=useState(""),[sent,setSent]=useState(false);
 const [answers,setAnswers]=useState<Answers>({}),[step,setStep]=useState(0);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[status,setStatus]=useState("");
 const [submitted,setSubmitted]=useState(false),[consent,setConsent]=useState(false);
 const queue=useRef<Promise<void>>(Promise.resolve());
 const heading=useRef<HTMLHeadingElement>(null);
 const dirty=useRef(false);
 const revision=useRef(0);
 const loadedUser=useRef<string|null>(null);
 const [uploadCount,setUploadCount]=useState(0);
 useEffect(()=>{
  let live=true;
  try{
   const client=getClient();
   async function init(value:Session|null){
    if(!live)return;
    if(value && loadedUser.current===value.user.id)return;
    loadedUser.current=value?.user.id||null;setSession(value);
    if(value){
     const {data,error}=await client.from("intakes").select("*").eq("user_id",value.user.id).maybeSingle();
     if(!live)return;
     if(error){setError("We couldn’t load your intake. Please refresh and try again.");setLoading(false);return;}
     if(data){setAnswers(data.answers as Answers);setStep(data.current_step);setSubmitted(data.status!=="draft");}
     setReady(true);
    }else{setReady(false);setAnswers({});setStep(0);setSubmitted(false);}
    setLoading(false);
   }
   client.auth.getSession().then(({data})=>init(data.session));
   const {data:{subscription}}=client.auth.onAuthStateChange((event,value)=>{if(event==="SIGNED_IN"||event==="SIGNED_OUT")void init(value);});
   return()=>{live=false;subscription.unsubscribe();};
  }catch(e){queueMicrotask(()=>{setError((e as Error).message);setLoading(false);});}
 },[]);
 function save(a:Answers,s:number){
  const savingRevision=revision.current;setStatus("Saving…");dirty.current=true;
  const next=queue.current.catch(()=>{}).then(async()=>{
   const {error}=await getClient().rpc("save_intake",{payload:cleanAnswers(a),step_index:s});
   if(error)throw new Error("Your answers haven’t saved. Check your connection and try again.");
  });
  queue.current=next;
  next.then(()=>{if(queue.current===next && revision.current===savingRevision){setStatus("Saved securely");dirty.current=false;}}).catch(e=>{setStatus("Not saved");setError(e.message);});
  return next;
 }
 useEffect(()=>{
  if(!ready||submitted)return;
  const timer=setTimeout(()=>{void save(answers,step).catch(()=>{});},900);
  return()=>clearTimeout(timer);
 },[answers,step,ready,submitted]);
 useEffect(()=>{
  const before=(e:BeforeUnloadEvent)=>{if(dirty.current){e.preventDefault();e.returnValue="";}};
  window.addEventListener("beforeunload",before);return()=>window.removeEventListener("beforeunload",before);
 },[]);
 async function login(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{const {error}=await getClient().auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+"/onboarding"}});if(error)throw error;setSent(true);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function verify(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{const {error}=await getClient().auth.verifyOtp({email,token:code,type:"email"});if(error)throw error;}
  catch{setError("That code is invalid or expired. Please request a new sign-in email.");}finally{setBusy(false);}
 }
 async function move(s:number){
  setBusy(true);setError("");
  try{await save(answers,s);setStep(s);window.scrollTo({top:0,behavior:"instant"});setTimeout(()=>heading.current?.focus(),0);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function exit(){
  setBusy(true);try{await save(answers,step);await getClient().auth.signOut();}catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function submit(){
  if(!consent)return;setBusy(true);setError("");
  try{
   await save(answers,14);
   const {error}=await getClient().rpc("submit_intake",{notice_version:"2026-09-13"});
   if(error)throw error;
   dirty.current=false;setSubmitted(true);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 function update(id:string,value:string){revision.current++;dirty.current=true;setAnswers(a=>({...a,[id]:value}));setStatus("Unsaved changes");}
 const section=sections[step];
 return <><header className="header"><Link className="brand" href="/">D1P<span>DOUBLE ONE PERCENT</span></Link>{session?<button className="secondary" disabled={busy||uploadCount>0} onClick={()=>submitted?getClient().auth.signOut():exit()}>{submitted?"Sign out":"Save & finish later"}</button>:<Link className="text-link" href="/">Back to home ↗</Link>}</header>
 {loading?<main className="auth"><p role="status">Loading your intake…</p></main>:!session?<main className="auth"><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>Let’s get to know you.</h1><p>Sign in with your email to start your intake or pick up where you left off.</p>{error?<p className="error" role="alert">{error}</p>:null}
 {!sent?<form onSubmit={login}><label className="field"><span>Email address</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="button" disabled={busy||uploadCount>0}>Send sign-in email ↗</button></form>:<><p className="notice">Check {email} for your sign-in link. If your email contains a code, enter it below.</p><form onSubmit={verify}><label className="field"><span>Email verification code</span><input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value)} /></label><button className="button" disabled={busy||uploadCount>0}>Continue ↗</button></form><p><button className="secondary" onClick={()=>{setSent(false);setCode("");}}>Use another email or resend</button></p></>}<p className="small">Your intake is private. <Link href="/privacy"><u>Read how your information is used.</u></Link></p></main>
 :submitted?<main className="auth"><p className="eyebrow">INTAKE COMPLETE</p><h1>You’ve taken the first step.</h1><p>Your intake has been received. Your coach will review your answers and contact you to arrange your launch call, approximately three days from now.</p><Link className="button" href="/">Back to home ↗</Link></main>
 :!ready?<main className="auth"><p role="alert" className="error">{error}</p></main>
 :<main className="wizard"><aside className="sidebar"><p className="eyebrow">YOUR ONBOARDING</p><ol>{sections.map((s,i)=><li key={s.id}><button disabled={busy||uploadCount>0} className={i===step?"active":""} onClick={()=>move(i)}><span>{String(i+1).padStart(2,"0")}</span>{s.title}</button></li>)}<li><button className={step===14?"active":""} disabled={busy||uploadCount>0} onClick={()=>move(14)}><span>↗</span>Review & submit</button></li></ol><p className="small">Details help us build a better plan. Unknown measurements and sensitive disclosures can be skipped.</p></aside>
 <section className="form"><p className="eyebrow">{step<14?`SECTION ${step+1} OF 14`:"READY WHEN YOU ARE"}</p><div className="progress" role="progressbar" aria-label="Onboarding progress" aria-valuenow={step} aria-valuemin={0} aria-valuemax={14}><div style={{width:`${step/14*100}%`}}/></div><h1 ref={heading} tabIndex={-1}>{section?.title||"Review your intake"}</h1><p className="save-status" role="status">{status}</p>{error?<p role="alert" className="error">{error} <button className="secondary" disabled={busy||uploadCount>0} onClick={()=>{setError("");void save(answers,step).catch(()=>{});}}>Retry save</button></p>:null}
 {step<14?<form onSubmit={e=>{e.preventDefault();void move(step+1);}}><p className="intro">Share what you can. You can come back to any section before submitting.{step===0?" Include units with measurements (for example, 180 lb or 82 kg).":""}</p>
 <fieldset disabled={busy||uploadCount>0} style={{border:0,padding:0,margin:0}}>{section.fields.filter(f=>visible(f,answers)).map(f=><Question key={f.id} field={f} value={answers[f.id]||""} userId={session.user.id} onChange={v=>update(f.id,v)} onError={setError} onUploading={v=>setUploadCount(n=>n+(v?1:-1))}/>)}</fieldset>
 <div className="actions"><button type="button" className="secondary" disabled={busy||uploadCount>0||step===0} onClick={()=>move(step-1)}>← Back</button><button className="button" disabled={busy||uploadCount>0}>{step===13?"Review intake":"Save & continue"} ↗</button></div></form>
 :<div className="review"><p className="intro">Check your answers below. Use Edit to return to a section. Blank fields will be recorded as not provided.</p>{sections.map((s,i)=><details key={s.id}><summary>{s.title}</summary><dl>{s.fields.filter(f=>f.type!=="note"&&visible(f,answers)).map(f=><div key={f.id}><dt>{f.label}</dt><dd>{f.type==="photo"?(answers[f.id]?"Photo uploaded":"Not provided"):answers[f.id]||"Not provided"}</dd></div>)}</dl><button className="secondary" onClick={()=>move(i)}>Edit section</button></details>)}
 <label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I have reviewed my answers and agree to my information being used for coaching as described in the <Link href="/privacy"><u>privacy notice</u></Link>.</span></label><div className="actions"><button className="secondary" disabled={busy||uploadCount>0} onClick={()=>move(13)}>← Back</button><button className="button" disabled={!consent||busy||uploadCount>0||!answers.q719?.trim()} onClick={submit}>Submit my intake ↗</button></div>{!answers.q719?.trim()?<p className="note">Please add your full name in Basic Information before submitting.</p>:null}</div>}
 </section></main>}</>;
}
function Question({field:f,value,onChange,userId,onError,onUploading}:{field:Field;value:string;onChange:(v:string)=>void;userId:string;onError:(v:string)=>void;onUploading:(v:boolean)=>void}){
 const [uploading,setUploading]=useState(false);
 async function upload(file:File|undefined){
  if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10*1024*1024){onError("Choose a JPEG, PNG or WebP photo under 10 MB.");return;}
  setUploading(true);onUploading(true);
  try{
   // Decode and re-encode to validate the image and discard embedded metadata.
   const bitmap=await createImageBitmap(file);
   const canvas=document.createElement("canvas");const ratio=Math.min(1,2000/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Image conversion failed")),"image/jpeg",.86));
   const path=`${userId}/${f.id}.jpg`;
   const {error}=await getClient().storage.from("baseline-photos").upload(path,blob,{upsert:true,contentType:"image/jpeg"});
   if(error)throw error;onChange(path);
  }catch{onError("The photo couldn’t be uploaded. Please try again.");}finally{setUploading(false);onUploading(false);}
 }
 if(f.type==="note")return <p className="note">{f.label}</p>;
 if(f.type==="photo")return <label className="field"><span>{f.label.replace("- ","")}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>void upload(e.target.files?.[0])}/><span className="note" role="status">{uploading?"Uploading…":value?"Photo saved privately. Choose another file to replace it.":"JPEG, PNG or WebP · up to 10 MB"}</span></label>;
 const options=f.type==="scale"?Array.from({length:10},(_,i)=>String(i+1)):f.options;
 return <label className="field"><span>{f.label}</span>{options?<select value={value} onChange={e=>onChange(e.target.value)}><option value="">Select an answer</option>{options.map(o=><option key={o}>{o}</option>)}</select>:f.type==="textarea"?<textarea maxLength={5000} rows={3} value={value} onChange={e=>onChange(e.target.value)}/>:<input type={f.type==="date"?"date":"text"} max={f.type==="date"?new Date().toISOString().slice(0,10):undefined} required={f.id==="q719"} maxLength={500} autoComplete={f.id==="q719"?"name":"off"} value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
}
