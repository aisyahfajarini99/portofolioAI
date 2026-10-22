const DB_NAME = "PortofolioSiswaAI";
const DB_VERSION = 1;
let db;
const objectUrls = new Map();
const $ = id => document.getElementById(id);

const samples = [
 {id:"sample-mp3",title:"Podcast: Mengenal Artificial Intelligence",description:"Contoh karya audio tentang AI dan penggunaannya sehari-hari.",type:"MP3",filename:"contoh-podcast-ai.mp3",sample:true},
 {id:"sample-pdf",title:"Laporan Riset AI untuk Pendidikan",description:"Contoh dokumen PDF berisi rangkuman riset dan kesimpulan course.",type:"PDF",filename:"contoh-laporan-ai.pdf",sample:true},
 {id:"sample-html",title:"Mini Website: AI Learning Hub",description:"Contoh website HTML sederhana untuk merangkum materi AI.",type:"HTML",filename:"contoh-website.html",sample:true},
 {id:"sample-mp4",title:"Video Edukasi: Cara Kerja Prompt AI",description:"Contoh video tentang cara menulis prompt yang efektif.",type:"MP4",filename:"contoh-video.mp4",sample:true},
 {id:"sample-png",title:"Infografik: Siklus Machine Learning",description:"Contoh visual tahapan data, pelatihan model, dan evaluasi.",type:"PNG",filename:"contoh-infografik.png",sample:true}
];

function openDB(){return new Promise((resolve,reject)=>{
 const request=indexedDB.open(DB_NAME,DB_VERSION);
 request.onupgradeneeded=()=>{
  const database=request.result;
  if(!database.objectStoreNames.contains("projects"))database.createObjectStore("projects",{keyPath:"id"});
  if(!database.objectStoreNames.contains("settings"))database.createObjectStore("settings",{keyPath:"key"});
 };
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error);
});}
function requestStore(name,mode,action){return new Promise((resolve,reject)=>{
 const tx=db.transaction(name,mode),request=action(tx.objectStore(name));
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});}
const getProjects=()=>requestStore("projects","readonly",s=>s.getAll());
const putProject=p=>requestStore("projects","readwrite",s=>s.put(p));
const removeProject=id=>requestStore("projects","readwrite",s=>s.delete(id));
const getSetting=key=>requestStore("settings","readonly",s=>s.get(key));
const putSetting=(key,value)=>requestStore("settings","readwrite",s=>s.put({key,value}));
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function detect(file){const ext=file.name.split(".").pop().toLowerCase();return({mp3:"MP3",pdf:"PDF",html:"HTML",htm:"HTML",mp4:"MP4",png:"PNG",jpg:"IMAGE",jpeg:"IMAGE",webp:"IMAGE",gif:"IMAGE"})[ext]||"OTHER";}
function icon(type){return({MP3:"🎧",PDF:"📄",HTML:"💻",MP4:"🎬",PNG:"🖼️",IMAGE:"🖼️"})[type]||"📎";}
function fileURL(p){if(!p.fileBlob)return null;if(!objectUrls.has(p.id))objectUrls.set(p.id,URL.createObjectURL(p.fileBlob));return objectUrls.get(p.id);}
function revoke(id){if(objectUrls.has(id)){URL.revokeObjectURL(objectUrls.get(id));objectUrls.delete(id);}}
function dateLabel(timestamp){return new Date(timestamp).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});}
function preview(p){
 if(p.sample)return `<div class="file-row"><div class="file-icon">${icon(p.type)}</div><div class="file-details"><strong>${esc(p.filename)}</strong><span>Contoh kartu · belum ada file asli</span></div></div><small>Tambahkan file asli untuk melihat pratinjau.</small>`;
 const url=fileURL(p),name=esc(p.filename);
 if(p.type==="MP3")return `<audio controls preload="metadata" src="${url}"></audio><div class="file-details"><strong>${name}</strong><span>Audio MP3</span></div>`;
 if(p.type==="MP4")return `<video controls preload="metadata" src="${url}"></video><div class="file-details"><strong>${name}</strong><span>Video MP4</span></div>`;
 if(p.type==="PNG"||p.type==="IMAGE")return `<img src="${url}" alt="${esc(p.title)}"><div class="file-details"><strong>${name}</strong><span>Gambar</span></div>`;
 if(p.type==="PDF")return `<iframe title="Pratinjau ${name}" src="${url}"></iframe><div class="file-details"><strong>${name}</strong><span>PDF · gunakan Buka file jika pratinjau tidak muncul</span></div>`;
 return `<div class="file-row"><div class="file-icon">${icon(p.type)}</div><div class="file-details"><strong>${name}</strong><span>${p.type==="HTML"?"HTML · buka file untuk menjalankan website":"File project tersimpan di browser"}</span></div></div>`;
}
async function render(){
 const saved=(await getProjects()).sort((a,b)=>b.createdAt-a.createdAt);
 $("projectCount").textContent=`${saved.length} project tersimpan · ${samples.length} contoh`;
 $("projectList").innerHTML=[...saved,...samples].map(p=>{
  const url=p.sample?null:fileURL(p);
  return `<article class="project-card"><div class="card-header"><div><h3>${esc(p.title)}</h3><p class="desc">${esc(p.description||"Belum ada deskripsi.")}</p></div><span class="pill">${esc(p.type)}</span></div>
  <div class="preview">${preview(p)}</div><div class="card-footer"><span class="meta">${p.sample?"Contoh kartu":"Ditambahkan "+dateLabel(p.createdAt)} · ${esc(p.filename)}</span><div class="card-actions">${url?`<a class="file-link" href="${url}" target="_blank" rel="noopener">Buka file ↗</a>`:""}${p.sample?"":`<button class="delete" data-delete="${esc(p.id)}">Hapus kartu</button>`}</div></div></article>`;
 }).join("")||'<div class="empty">Belum ada project. Tambahkan karya pertamamu di atas.</div>';
 $("projectList").querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",async()=>{
  if(!confirm("Hapus project ini?"))return;
  await removeProject(btn.dataset.delete);revoke(btn.dataset.delete);await render();status("Project dihapus.");
 }));
}
function status(message,error=false){$("status").textContent=message;$("status").style.color=error?"#a52f3b":"#4d42bd";}
function displayProfile(p){const name=p.name||"Nama Siswa";$("displayName").textContent=name;$("displayBio").textContent=p.bio||"Siswa AI Creator";$("avatar").textContent=name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"NS";}
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();const p={name:$("studentName").value.trim(),bio:$("studentBio").value.trim()};try{await putSetting("profile",p);displayProfile(p);status("Profil tersimpan di browser ini.");}catch(err){status("Gagal menyimpan profil: "+err.message,true);}});
$("projectForm").addEventListener("submit",async e=>{
 e.preventDefault();const file=$("projectFile").files[0];if(!file)return;
 const btn=$("submitProject");btn.disabled=true;btn.textContent="Menyimpan...";
 try{
  const selected=$("projectType").value;
  const p={id:crypto.randomUUID?crypto.randomUUID():"p-"+Date.now()+"-"+Math.random(),title:$("projectTitle").value.trim(),description:$("projectDescription").value.trim(),type:selected==="auto"?detect(file):selected,filename:file.name,mimeType:file.type,size:file.size,fileBlob:file,createdAt:Date.now()};
  await putProject(p);$("projectForm").reset();await render();status("Project dan file berhasil disimpan. Data tetap ada saat halaman dibuka kembali di browser/perangkat ini.");
 }catch(err){status("Gagal menyimpan. Kapasitas browser mungkin tidak cukup. Coba file lebih kecil. "+err.message,true);}
 finally{btn.disabled=false;btn.textContent="＋ Tambahkan project";}
});
$("hideSamples").addEventListener("click",()=>{
 document.querySelectorAll(".project-card").forEach(card=>{if(card.querySelector(".meta")?.textContent.startsWith("Contoh kartu"))card.remove();});
 $("hideSamples").disabled=true;$("hideSamples").textContent="Contoh disembunyikan";status("Contoh disembunyikan untuk sesi ini; akan muncul lagi saat halaman dimuat ulang.");
});
async function init(){try{
 db=await openDB();
 const saved=await getSetting("profile");
 const p=saved?.value||{name:"Nama Siswa",bio:"AI Creator · Angkatan 2026"};
 $("studentName").value=p.name;$("studentBio").value=p.bio;displayProfile(p);
 await render();
}catch(err){$("projectList").innerHTML='<div class="empty">Database browser tidak bisa dibuka. Gunakan browser modern dan coba jalankan dengan Live Server.</div>';status("Penyimpanan tidak tersedia: "+err.message,true);}}
init();
