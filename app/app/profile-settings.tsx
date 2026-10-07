"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, Eye, EyeOff, ImagePlus, LockKeyhole, Mail, RefreshCw, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { StudyButton, StudyHeading } from "./academy-views";

type Profile = { name:string; email:string; avatarUrl:string|null; canEditCredentials:boolean };
type Status = { error:string; notice:string };
const cleanStatus = ():Status => ({error:"",notice:""});

function PasswordField({ id,label,value,onChange,autoComplete="current-password",disabled=false }: { id:string; label:string; value:string; onChange:(value:string)=>void; autoComplete?:string; disabled?:boolean }) {
  const [visible,setVisible]=useState(false);
  return <label className="ac-profile-field" htmlFor={id}><span>{label}</span><div className="ac-password-control"><input id={id} type={visible?"text":"password"} value={value} onChange={event=>onChange(event.target.value)} autoComplete={autoComplete} required maxLength={256} disabled={disabled}/><button type="button" className="ac-icon-button" aria-label={(visible?"Ocultar ":"Mostrar ")+label.toLowerCase()} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>;
}
function Feedback({status}:{status:Status}){return <>{status.error&&<p className="ac-alert error" role="alert">{status.error}</p>}{status.notice&&<p className="ac-alert" role="status"><CheckCircle2 size={17}/>{status.notice}</p>}</>;}

async function preparePhoto(file:File):Promise<{blob:Blob;preview:string}> {
  if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Escolha uma foto JPG, PNG ou WebP.");
  if(file.size>8_000_000)throw new Error("Escolha uma foto de até 8 MB.");
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.src=url;await image.decode();
    if(!image.naturalWidth||!image.naturalHeight)throw new Error("Não foi possível ler a imagem.");
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;
    const context=canvas.getContext("2d");if(!context)throw new Error("Seu navegador não conseguiu preparar a foto.");
    const size=Math.min(image.naturalWidth,image.naturalHeight);
    context.fillStyle="#ffffff";context.fillRect(0,0,512,512);
    context.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,512,512);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Não foi possível preparar a foto.")),"image/jpeg",.88));
    if(blob.size>350_000)throw new Error("A foto ficou muito grande. Escolha outra imagem.");
    return {blob,preview:URL.createObjectURL(blob)};
  }catch(error){throw error instanceof Error?error:new Error("Não foi possível abrir a foto. Escolha outra imagem.");}
  finally{URL.revokeObjectURL(url);}
}

export default function ProfileSettings({onProfileChanged}:{onProfileChanged:()=>Promise<void>}) {
  const [profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
  const [nextEmail,setNextEmail]=useState(""),[emailPassword,setEmailPassword]=useState(""),[currentPassword,setCurrentPassword]=useState(""),[newPassword,setNewPassword]=useState(""),[confirmation,setConfirmation]=useState("");
  const [photo,setPhoto]=useState<{blob:Blob;preview:string}|null>(null),[busy,setBusy]=useState<"photo"|"email"|"password"|"logout"|null>(null),[preparing,setPreparing]=useState(false);
  const [photoStatus,setPhotoStatus]=useState(cleanStatus),[emailStatus,setEmailStatus]=useState(cleanStatus),[passwordStatus,setPasswordStatus]=useState(cleanStatus),[logoutError,setLogoutError]=useState("");
  const fileRef=useRef<HTMLInputElement>(null),photoSequence=useRef(0),requestRef=useRef<AbortController|null>(null);
  const load=useCallback(async()=>{
    requestRef.current?.abort();const controller=new AbortController();requestRef.current=controller;setLoading(true);setLoadError("");
    try{
      const response=await fetch("/api/profile",{cache:"no-store",signal:controller.signal});
      const data=await response.json() as {profile?:Profile;error?:string};
      if(!response.ok||!data.profile)throw new Error(data.error||"Não foi possível carregar seu perfil.");
      if(!controller.signal.aborted){setProfile(data.profile);setNextEmail(data.profile.email);}
    }catch(error){if(!controller.signal.aborted)setLoadError(error instanceof Error?error.message:"Falha de conexão. Tente novamente.");}
    finally{if(!controller.signal.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{const timer=window.setTimeout(()=>{void load()},0);return()=>{window.clearTimeout(timer);requestRef.current?.abort();photoSequence.current++;};},[load]);
  useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo.preview)},[photo]);

  async function selectPhoto(file:File|undefined){
    if(!file)return;const sequence=++photoSequence.current;setPreparing(true);setPhotoStatus(cleanStatus());
    try{const prepared=await preparePhoto(file);if(sequence!==photoSequence.current){URL.revokeObjectURL(prepared.preview);return;}setPhoto(prepared);}
    catch(error){if(sequence===photoSequence.current)setPhotoStatus({error:error instanceof Error?error.message:"Não foi possível preparar a foto.",notice:""});}
    finally{if(sequence===photoSequence.current)setPreparing(false);if(fileRef.current)fileRef.current.value="";}
  }
  async function savePhoto(remove=false){
    if(busy||preparing||!profile||!remove&&!photo)return;setBusy("photo");setPhotoStatus(cleanStatus());
    try{
      const response=await fetch("/api/profile/photo",remove?{method:"DELETE"}:{method:"POST",headers:{"content-type":"image/jpeg"},body:photo!.blob});
      const data=await response.json() as {avatarUrl?:string|null;error?:string};
      if(!response.ok)throw new Error(data.error||"Não foi possível salvar sua foto.");
      setProfile(value=>value?{...value,avatarUrl:data.avatarUrl||null}:value);setPhoto(null);
      setPhotoStatus({error:"",notice:remove?"Foto removida da sua conta.":"Foto de perfil atualizada."});await onProfileChanged();
    }catch(error){setPhotoStatus({error:error instanceof Error?error.message:"Falha de conexão. Tente novamente.",notice:""});}
    finally{setBusy(null);}
  }
  async function changeCredentials(event:FormEvent<HTMLFormElement>,action:"email"|"password"){
    event.preventDefault();if(busy||!profile?.canEditCredentials)return;const status=action==="email"?setEmailStatus:setPasswordStatus;status(cleanStatus());
    if(action==="password"&&(newPassword.length<12||newPassword.length>256||newPassword!==confirmation||newPassword===currentPassword)){status({error:"Use uma nova senha com pelo menos 12 caracteres, diferente da atual, e confirme a mesma senha.",notice:""});return;}
    setBusy(action);
    try{
      const response=await fetch("/api/profile",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(action==="email"?{action,email:nextEmail,currentPassword:emailPassword}:{action,currentPassword,newPassword,confirmation})});
      const data=await response.json() as {email?:string;error?:string};if(!response.ok)throw new Error(data.error||"Não foi possível salvar a alteração.");
      if(action==="email"){setEmailPassword("");setProfile(value=>value?{...value,email:data.email||value.email}:value);setNextEmail(data.email||nextEmail);}
      else{setCurrentPassword("");setNewPassword("");setConfirmation("");}
      status({error:"",notice:action==="email"?"E-mail de login atualizado. Use o novo endereço no próximo acesso.":"Senha atualizada. Use a nova senha no próximo acesso."});await onProfileChanged();
    }catch(error){status({error:error instanceof Error?error.message:"Falha de conexão. Tente novamente.",notice:""});}
    finally{setBusy(null);}
  }
  async function signOut(){if(busy)return;setBusy("logout");setLogoutError("");try{const response=await fetch("/api/auth/logout",{method:"POST"});if(!response.ok)throw new Error("Não foi possível sair. Tente novamente.");window.location.href="/login";}catch(error){setLogoutError(error instanceof Error?error.message:"Falha de conexão.");setBusy(null);}}
  if(loading&&!profile)return <section className="ac-empty" role="status"><UserRound size={34}/><h1>Carregando seu perfil…</h1></section>;
  if(!profile)return <section className="ac-empty"><UserRound size={34}/><h1>Seu perfil</h1><p role="alert">{loadError}</p><StudyButton onClick={()=>{void load()}}><RefreshCw size={17}/> Tentar novamente</StudyButton></section>;
  const avatar=photo?.preview||profile.avatarUrl,disabled=!!busy||!profile.canEditCredentials;
  return <div className="ac-profile-page"><StudyHeading label="MEU PERFIL" title="Sua conta. Do seu jeito.">Atualize sua foto e os dados usados para entrar no Synky Leaders.</StudyHeading>{loadError&&<p className="ac-alert error" role="alert">{loadError}</p>}
    <div className="ac-profile-layout"><aside className="ac-profile-summary"><span className="ac-eyebrow light">SEU ESPAÇO DE APRENDIZAGEM</span><div className="ac-profile-large-avatar">{avatar?<img src={avatar} alt={"Foto de "+profile.name}/>:<UserRound size={54}/>}</div><h2>{profile.name}</h2><p>{profile.email}</p><div className="ac-profile-summary-note"><ShieldCheck size={23}/><p>Seu perfil acompanha sua conta. Alterar o e-mail mantém seus cursos, notas e histórico vinculados à mesma pessoa.</p></div><button className="ac-profile-signout" disabled={!!busy} onClick={()=>{void signOut()}}>{busy==="logout"?"Saindo…":"Sair da conta"}</button>{logoutError&&<p role="alert">{logoutError}</p>}</aside>
      <div className="ac-profile-forms"><section className="ac-profile-card" aria-labelledby="profile-photo-title"><header><span className="ac-icon"><Camera size={23}/></span><div><span className="ac-eyebrow">SUA IDENTIDADE</span><h2 id="profile-photo-title">Foto de perfil</h2></div></header><p>Escolha uma foto JPG, PNG ou WebP de até 8 MB. Confira a prévia antes de salvar; a imagem será centralizada em formato quadrado.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="ac-sr-only" aria-label="Escolher foto de perfil" disabled={!!busy||preparing} onChange={event=>{void selectPhoto(event.target.files?.[0])}}/><div className="ac-photo-controls"><div className="ac-profile-photo-preview">{avatar?<img src={avatar} alt="Prévia da foto de perfil"/>:<UserRound size={34}/>}</div><div><div className="ac-actions"><StudyButton secondary disabled={!!busy||preparing} onClick={()=>fileRef.current?.click()}><ImagePlus size={17}/>{preparing?"Preparando foto…":"Escolher foto"}</StudyButton>{photo&&<StudyButton disabled={!!busy||preparing} onClick={()=>{void savePhoto()}}>{busy==="photo"?"Salvando…":"Salvar foto"}</StudyButton>}{profile.avatarUrl&&!photo&&<button className="ac-text-button" disabled={!!busy||preparing} onClick={()=>{void savePhoto(true)}}><Trash2 size={16}/> Remover foto</button>}{photo&&<button className="ac-text-button" disabled={!!busy||preparing} onClick={()=>{photoSequence.current++;setPhoto(null);setPhotoStatus(cleanStatus())}}>Cancelar</button>}</div><small>{photo?"Prévia pronta. Salve para atualizar sua conta.":"Sua foto aparece também no menu superior."}</small></div></div><Feedback status={photoStatus}/></section>
        {!profile.canEditCredentials&&<div className="ac-alert" role="status"><LockKeyhole size={20}/><p>Seu acesso é gerenciado por um provedor de login. A foto pode ser alterada aqui; para trocar e-mail e senha, use as configurações desse provedor.</p></div>}
        <section className="ac-profile-card" aria-labelledby="profile-email-title"><header><span className="ac-icon"><Mail size={23}/></span><div><span className="ac-eyebrow">DADOS DE ACESSO</span><h2 id="profile-email-title">E-mail de login</h2></div></header><p>O novo endereço passa a ser usado no próximo login. Confirme sua senha atual para salvar a alteração.</p><form onSubmit={event=>{void changeCredentials(event,"email")}}><label className="ac-profile-field" htmlFor="profile-email"><span>Novo e-mail</span><input id="profile-email" type="email" autoComplete="email" value={nextEmail} maxLength={254} required disabled={disabled} onChange={event=>setNextEmail(event.target.value)}/></label><PasswordField id="profile-email-password" label="Senha atual para confirmar" value={emailPassword} onChange={setEmailPassword} disabled={disabled}/><Feedback status={emailStatus}/><button type="submit" className="ac-button" disabled={disabled||!emailPassword||nextEmail.trim().toLowerCase()===profile.email}>{busy==="email"?"Salvando e-mail…":"Salvar novo e-mail"}</button></form></section>
        <section className="ac-profile-card" aria-labelledby="profile-password-title"><header><span className="ac-icon"><LockKeyhole size={23}/></span><div><span className="ac-eyebrow">SEGURANÇA DA CONTA</span><h2 id="profile-password-title">Alterar senha</h2></div></header><p>Use uma senha nova com pelo menos 12 caracteres. Após salvar, as outras sessões da sua conta serão encerradas.</p><form onSubmit={event=>{void changeCredentials(event,"password")}}><PasswordField id="profile-current-password" label="Senha atual" value={currentPassword} onChange={setCurrentPassword} disabled={disabled}/><div className="ac-profile-password-grid"><PasswordField id="profile-new-password" label="Nova senha" value={newPassword} onChange={setNewPassword} autoComplete="new-password" disabled={disabled}/><PasswordField id="profile-confirm-password" label="Confirmar nova senha" value={confirmation} onChange={setConfirmation} autoComplete="new-password" disabled={disabled}/></div><Feedback status={passwordStatus}/><button type="submit" className="ac-button" disabled={disabled||!currentPassword||!newPassword||!confirmation}>{busy==="password"?"Salvando senha…":"Salvar nova senha"}</button></form></section>
      </div></div></div>;
}
