// Initialize Firebase before using Firestore.
const firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Firebase configuration is missing. Check firebase-config.js.");
}
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

const ADMIN_CODE = "2627";
const CLOUD_NAME = "r4qeis1r";
const UPLOAD_PRESET = "aneigyz6";

const $ = (id) => document.getElementById(id);

async function makeKey(name, birthDate) {
  const value = `${name.trim().toLowerCase()}|${birthDate}`;
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function showStatus(form, message, success = false) {
  const box = form.querySelector(".status");
  box.style.display = "block";
  box.className = "status " + (success ? "success" : "error");
  box.textContent = message;
}

function escapeReceipt(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}

function downloadReceipt(html, filename, form, label) {
  const url = URL.createObjectURL(new Blob([html], {type:"text/html;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.textContent = label;
  link.style.display = "inline-block";
  link.style.marginTop = "10px";
  link.style.color = "#20d9c4";
  form.querySelector(".status").appendChild(document.createElement("br"));
  form.querySelector(".status").appendChild(link);
}

function addMemberReceiptDownload(form, data) {
  const e = escapeReceipt;
  const rawDate = data.registrationDate || data.approvedAt || data.createdAt;
  let registrationDate = "—";
  try {
    const date = rawDate && typeof rawDate.toDate === "function" ? rawDate.toDate() : new Date(rawDate);
    if (!Number.isNaN(date.getTime())) registrationDate = [date.getDate(), date.getMonth()+1, date.getFullYear()].map(n=>String(n).padStart(2,"0")).join("-");
  } catch (_) {}
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Friends Squad 2.0 - Membership Registration Receipt</title>
<style>
*{box-sizing:border-box}
@page{size:A4;margin:8mm}
body{margin:0;padding:14px;background:#fff;color:#101a35;font-family:Georgia,"Times New Roman",serif}
.paper{position:relative;width:100%;max-width:820px;min-height:275mm;margin:0 auto;padding:34px 28px 24px;border:2px solid #4b9fe0;border-radius:14px;background:#fff;overflow:hidden}
.corner{position:absolute;width:95px;height:95px;pointer-events:none}
.corner:before,.corner:after{content:"";position:absolute;background:#62b4ee}
.corner:before{width:100%;height:15px;top:0;left:0;transform:skewY(-42deg);transform-origin:left top}
.corner:after{height:100%;width:15px;top:0;left:0;transform:skewX(-42deg);transform-origin:left top}
.tl{top:0;left:0}.tr{top:0;right:0;transform:scaleX(-1)}
.bl{bottom:0;left:0;transform:scaleY(-1)}.br{bottom:0;right:0;transform:scale(-1)}
.heading{text-align:center;padding:4px 0 20px;border-bottom:2px solid #1b4e9b}
.heading h1{font-size:clamp(28px,6vw,48px);line-height:1.05;margin:0 0 10px;font-weight:700;color:#101b3e}
.heading h2{display:inline-block;margin:0;padding:5px 24px;border-radius:40px;background:#cfe5ff;color:#101b3e;font-size:clamp(19px,4vw,30px);font-weight:700}
.main-table,.info-table{width:100%;border-collapse:collapse;font-size:clamp(15px,2.7vw,22px);color:#101827}
.main-table{margin-top:18px}
.main-table td,.info-table td{border:1.5px solid #6483a4;padding:7px 12px;vertical-align:middle}
.main-table td:first-child{width:32%}
.lower{display:grid;grid-template-columns:30% 1fr;gap:20px;margin-top:18px;align-items:stretch}
.photo{height:100%;min-height:220px;padding:6px;border:2px solid #1b4e9b;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#64748b;font:13px Arial,sans-serif}
.photo img{width:100%;height:100%;max-height:280px;object-fit:cover}
.info-table td:first-child{width:48%}
.approved{display:inline-block;padding:3px 17px;border-radius:30px;background:#c9f3b8;color:#103d19;font-weight:700;white-space:nowrap}
.registration-badge{display:inline-block;padding:2px 10px;border-radius:24px;background:#c9f3b8;color:#103d19;font-weight:700;white-space:nowrap}
.success{margin-top:18px;padding:8px 12px;text-align:center;border:1.5px solid #21b94a;border-radius:18px;background:#eaffeb;color:#10531e}
.success strong{display:block;font-size:clamp(21px,3.7vw,32px)}
.success span{display:block;font-size:clamp(14px,2.5vw,21px);color:#111}
.bottom{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-top:18px;padding:13px 8px 0;border-top:2px solid #1b4e9b}
.issued{font-size:17px;line-height:1.4}.issued strong{display:block;font-size:19px}
.signature{width:245px;max-width:45%;text-align:center;color:#101b3e}
.signature-name{font-family:"Brush Script MT","Segoe Script",cursive;font-style:italic;font-size:35px;line-height:1.1;color:#111}
.signature-line{border-bottom:2px solid #1b4e9b;margin-bottom:6px}
.signature-label{font-size:15px}
button{display:block;margin:16px auto 0;padding:10px 18px;border:1px solid #315b91;border-radius:5px;background:#fff;color:#14264b;font-weight:700}
@media(max-width:560px){body{padding:5px}.paper{padding:22px 10px 16px;min-height:0}.lower{grid-template-columns:29% 1fr;gap:8px}.photo{min-height:150px}.main-table td,.info-table td{padding:6px 5px}.approved{padding:2px 8px}.bottom{gap:8px}.issued{font-size:13px}.issued strong{font-size:14px}.signature-name{font-size:27px}.signature-label{font-size:11px}}
@media print{body{padding:0}.paper{max-width:none;min-height:0;border-radius:0;padding:9mm 7mm 6mm;break-inside:avoid}button{display:none}}
</style></head><body><main class="paper">
<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
<header class="heading"><h1>Friends Squad 2.0</h1><h2>Membership Registration Receipt</h2></header>
<table class="main-table">
<tr><td>Name</td><td>${e(data.name)}</td></tr>
<tr><td>Age</td><td>${e(data.age)}</td></tr>
<tr><td>Class</td><td>${e(data.className)}</td></tr>
<tr><td>Birth Date</td><td>${e(data.birthDate)}</td></tr>
<tr><td>Address</td><td>${e(data.address)}</td></tr>
</table>
<section class="lower"><div class="photo">${data.imageUrl ? `<img src="${e(data.imageUrl)}" alt="Member photo">` : "Member photo"}</div>
<table class="info-table">
<tr><td>Team Name</td><td>${e(data.teamName)}</td></tr>
<tr><td>Phone</td><td>${e(data.phone)}</td></tr>
<tr><td>Status</td><td><span class="approved">Approved</span></td></tr>
<tr><td>Registration Date</td><td>${e(registrationDate)}</td></tr>
<tr><td>Registration Number</td><td><span class="registration-badge">${e(data.reference)}</span></td></tr>
</table></section>
<section class="success"><strong>Registration Successful!</strong><span>You are now a verified member of Friends Squad 2.0.</span></section>
<footer class="bottom"><div class="issued">Issued By:<strong>Friends Squad 2.0 Team</strong></div>
<div class="signature"><div class="signature-name">Athar Rasin</div><div class="signature-line"></div><div class="signature-label">Authorized Signature</div></div></footer>
</main><button onclick="window.print()">Print / Save as PDF</button></body></html>`;
  downloadReceipt(html, "friends-squad-member-receipt.html", form, "সদস্য রসিদ ডাউনলোড করুন");
}

function addTenderReceiptDownload(form, data) {
  const e = escapeReceipt;
  const html = `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tender Registration Receipt</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:22px;background:#fff;color:#111;font-family:Arial,"Noto Sans Bengali",sans-serif}
.paper{max-width:760px;margin:0 auto;padding:28px;border:1px solid #999;background:#fff}
.heading{text-align:center;border-bottom:1px solid #222;padding-bottom:14px}
.heading h1{font-size:21px;margin:0 0 5px;font-weight:700;letter-spacing:.3px}
.heading p{font-size:14px;margin:0}.heading h2{font-size:18px;margin:12px 0 0;font-weight:600}
.intro{font-size:13px;margin:16px 0;text-align:center}
.details{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:18px;align-items:start}
table{width:100%;border-collapse:collapse;font-size:14px}
td{border:1px solid #777;padding:9px 10px;vertical-align:top;overflow-wrap:anywhere}
td:first-child{width:40%;font-weight:600}
.photo{width:130px;height:155px;border:1px solid #777;display:flex;align-items:center;justify-content:center;color:#555;font-size:12px;text-align:center;overflow:hidden}
.photo img{width:100%;height:100%;object-fit:cover}
.reference{margin-top:16px;font-size:13px;padding:11px;border:1px solid #777}
.reference strong{font-family:monospace;overflow-wrap:anywhere}
.note{font-size:12px;margin-top:16px;line-height:1.5}
.sign{display:flex;justify-content:space-between;gap:20px;margin-top:34px;font-size:12px}
.sign div{width:42%;border-top:1px solid #777;padding-top:8px;text-align:center}
.footer{border-top:1px solid #777;margin-top:20px;padding-top:9px;text-align:center;font-size:11px}
button{display:block;margin:18px auto 0;padding:10px 18px;border:1px solid #333;background:#fff;color:#111;font-weight:600}
@media(max-width:520px){body{padding:8px}.paper{padding:12px}.details{grid-template-columns:minmax(0,1fr) 95px;gap:8px}.photo{width:95px;height:120px}td{padding:7px 6px;font-size:12px}.heading h1{font-size:18px}}
@media print{body{padding:0}.paper{max-width:none;border:0;padding:12mm}button{display:none}}
</style></head><body><main class="paper">
<header class="heading"><h1>FRIENDS SQUAD 2.0</h1><p>THE PRO BOYS CYCLING GANG</p><h2>দরপত্র রেজিস্ট্রেশন রসিদ</h2></header>
<p class="intro">দরপত্র রেজিস্ট্রেশনের জন্য আপনার জমা দেওয়া তথ্যসমূহ নিচে উল্লেখ করা হলো।</p>
<section class="details"><table>
<tr><td>দরপত্রের ক্রমিক নং</td><td>${e(data.serial)}</td></tr>
<tr><td>গ্রাহকের নাম</td><td>${e(data.name)}</td></tr>
<tr><td>ঠিকানা</td><td>${e(data.address)}</td></tr>
<tr><td>পত্র সংগ্রহের তারিখ</td><td>${e(data.collectionDate)}</td></tr>
<tr><td>পত্র জমার তারিখ</td><td>${e(data.submissionDate)}</td></tr>
<tr><td>আমি কোন স্থানটি নিতে ইচ্ছুক</td><td>${e(data.place)}</td></tr>
<tr><td>দরপত্রের নাম</td><td>${e(data.tenderName)}</td></tr>
<tr><td>মোবাইল</td><td>${e(data.phone)}</td></tr>
<tr><td>তারিখ</td><td>${e(data.date)}</td></tr>
</table><div class="photo">${data.imageUrl ? `<img src="${e(data.imageUrl)}" alt="আবেদনকারীর ছবি">` : "আবেদনকারীর ছবি"}</div></section>
<div class="reference">রসিদ / রেফারেন্স নম্বর: <strong>${e(data.reference)}</strong></div>
<p class="note">আপনার দরপত্র রেজিস্ট্রেশন তথ্য গ্রহণ করা হয়েছে। রসিদটি ভবিষ্যতের প্রয়োজনে সংরক্ষণ করুন।</p>
<div class="sign"><div>আবেদনকারীর স্বাক্ষর</div><div>গ্রহণকারীর স্বাক্ষর</div></div>
<footer class="footer">Friends Squad 2.0 · Tender Registration</footer>
</main><button onclick="window.print()">প্রিন্ট / PDF হিসেবে সংরক্ষণ</button></body></html>`;
  downloadReceipt(html, "friends-squad-tender-receipt.html", form, "দরপত্রের রসিদ ডাউনলোড করুন");
}

async function uploadImage(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("একটি সঠিক ছবি নির্বাচন করুন।");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ছবির সাইজ ৫ MB-এর কম হতে হবে।");
  }
  const endpoints = [
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
  ];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const response = await fetch(endpoint, {method:"POST",body:data,cache:"no-store"});
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.secure_url) return result.secure_url;
      lastError = new Error(result.error?.message || "Cloudinary upload failed");
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error("ছবি আপলোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
}

// Standalone member registration; this is separate from the personal Profile account.
$("memberEntry").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const values = new FormData(form);
    if (String(values.get("code") || "").trim() !== ADMIN_CODE) throw new Error("কোডটি সঠিক নয়। আবার চেষ্টা করুন।");
    const data = {
      name: String(values.get("name") || "").trim(),
      age: Number(values.get("age") || 0),
      className: String(values.get("className") || "").trim(),
      birthDate: String(values.get("birthDate") || ""),
      address: String(values.get("address") || "").trim(),
      teamName: String(values.get("teamName") || "").trim(),
      phone: String(values.get("phone") || "").trim()
    };
    if (Object.values(data).some(value => !value)) throw new Error("সব তথ্য পূরণ করুন।");
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 5 || age > 100) throw new Error("বয়স ৫ থেকে ১০০-এর মধ্যে লিখুন।");
    const setting = await db.collection("registrationSettings").doc("main").get();
    if (setting.exists && setting.data().memberLocked === true) throw new Error("সদস্য রেজিস্ট্রেশন বর্তমানে বন্ধ।");
    const key = await makeKey(data.name, data.birthDate);
    const ref = db.collection("memberApplications").doc(key);
    const imageFile = values.get("image");
    data.imageUrl = imageFile && imageFile.size ? await uploadImage(imageFile) : "";
    const accessToken = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b=>b.toString(16).padStart(2,"0")).join("");
    data.accessToken = accessToken;
    data.status = "pending";
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.set(ref, data);
    batch.set(db.collection("memberRegistrationStatus").doc(accessToken), {
      status:"pending",
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    showStatus(form, "সদস্য রেজিস্ট্রেশন জমা হয়েছে। Admin অনুমোদনের অপেক্ষায় থাকুন।\nআপনার Tracking Code: "+accessToken+"\nএই কোডটি সংরক্ষণ করুন; অনুমোদনের পর এটি দিয়ে রসিদ ডাউনলোড করতে পারবেন।", true);
    form.reset();
  } catch (error) {
    const code = error && error.code ? String(error.code) : "";
    const message = code === "permission-denied"
      ? "Firebase অনুমতি দেয়নি। একই নাম ও জন্মতারিখ দিয়ে আগে আবেদন জমা হয়ে থাকলে Admin-কে আগের আবেদনটি Remove করতে হবে। অন্যথায় Firebase Firestore Rules প্রকাশিত আছে কি না যাচাই করতে হবে।"
      : (error.message || "রেজিস্ট্রেশন সম্পন্ন হয়নি।");
    showStatus(form, message);
  } finally {
    submit.disabled = false;
  }
});


const statusForm=$("memberStatusEntry");
if(statusForm){
 statusForm.addEventListener("submit",async event=>{
  event.preventDefault();
  const form=event.currentTarget,btn=form.querySelector('[type="submit"]');
  const box=form.querySelector(".status");btn.disabled=true;box.style.display="block";box.className="status";box.textContent="স্ট্যাটাস যাচাই করা হচ্ছে…";
  try{
   const token=String(new FormData(form).get("accessToken")||"").trim().toLowerCase();
   if(!/^[a-f0-9]{32}$/.test(token))throw new Error("সঠিক Tracking Code লিখুন।");
   const snap=await db.collection("memberRegistrationStatus").doc(token).get();
   if(!snap.exists)throw new Error("এই Tracking Code পাওয়া যায়নি। আবার যাচাই করুন।");
   const record=snap.data()||{};
   if(record.status!=="approved"){
    box.className="status success";box.textContent="আপনার আবেদন এখনো অনুমোদনের অপেক্ষায় আছে।";
    return;
   }
   if(!record.receiptData||!record.registrationNo)throw new Error("রসিদের তথ্য পাওয়া যায়নি। Admin-এর সঙ্গে যোগাযোগ করুন।");
   box.className="status success";box.textContent="আপনার রেজিস্ট্রেশন অনুমোদিত হয়েছে। নিচের লিংক থেকে রসিদ ডাউনলোড করুন।";
   addMemberReceiptDownload(form,{...record.receiptData,reference:record.registrationNo});
  }catch(error){box.className="status error";box.textContent=error.message||"স্ট্যাটাস যাচাই করা যায়নি।"}
  finally{btn.disabled=false}
 });
}

// Tender registration
$("tenderEntry").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;

  try {
    const values = new FormData(form);

    if (String(values.get("code")) !== ADMIN_CODE) {
      throw new Error("Error! Please Correct Code.");
    }

    const setting = await db
      .collection("registrationSettings").doc("main").get();

    if (setting.exists && setting.data().tenderLocked === true) {
      throw new Error("দরপত্র রেজিস্ট্রেশন বর্তমানে বন্ধ।");
    }

    const imageUrl = await uploadImage(values.get("image"));

    const tenderRef = db.collection("tenderApplications").doc();
    await tenderRef.set({
      serial: values.get("serial"),
      name: values.get("name"),
      address: values.get("address"),
      collectionDate: values.get("collectionDate"),
      submissionDate: values.get("submissionDate"),
      place: values.get("place"),
      tenderName: values.get("tenderName"),
      phone: values.get("phone"),
            date: values.get("date"),
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showStatus(form, "দরপত্রের রেজিস্ট্রেশন জমা হয়েছে।", true);
    addTenderReceiptDownload(form, {
      serial: values.get("serial"),
      name: values.get("name"),
      address: values.get("address"),
      tenderName: values.get("tenderName"),
      place: values.get("place"),
      collectionDate: values.get("collectionDate"),
      submissionDate: values.get("submissionDate"),
      phone: values.get("phone"),
      date: values.get("date"),
      imageUrl,
      reference: tenderRef.id
    });
    form.reset();
  } catch (error) {
    showStatus(form, error.message || "রেজিস্ট্রেশন সম্পন্ন হয়নি।");
  } finally {
    submit.disabled = false;
  }
});


// Registration type buttons: open immediately, then sync lock state from Firestore.
(function setupRegistrationChoices() {
  const choices = document.querySelectorAll(".choice[data-form]");
  const memberForm = document.getElementById("memberForm");
  const tenderForm = document.getElementById("tenderForm");
  const memberHint = document.getElementById("memberLockHint");
  const tenderHint = document.getElementById("tenderLockHint");
  const memberButton = document.querySelector('.choice[data-form="member"]');
  const tenderButton = document.querySelector('.choice[data-form="tender"]');

  async function readRegistrationSettings() {
    try {
      const snap = await db.collection("registrationSettings").doc("main").get();
      const settings = snap.exists ? snap.data() : {};
      const memberLocked = settings.memberLocked === true;
      const tenderLocked = settings.tenderLocked === true;
      if (memberHint) memberHint.textContent = memberLocked ? "সদস্য রেজিস্ট্রেশন বর্তমানে বন্ধ।" : "সদস্য রেজিস্ট্রেশন চালু আছে।";
      if (tenderHint) tenderHint.textContent = tenderLocked ? "দরপত্র রেজিস্ট্রেশন বর্তমানে বন্ধ।" : "দরপত্র রেজিস্ট্রেশন চালু আছে।";
      if (memberButton) memberButton.textContent = memberLocked ? "🔒 সদস্য রেজিস্ট্রেশন (বন্ধ)" : "সদস্য রেজিস্ট্রেশন";
      if (tenderButton) tenderButton.textContent = tenderLocked ? "🔒 দরপত্র রেজিস্ট্রেশন (বন্ধ)" : "দরপত্র রেজিস্ট্রেশন";
      return { memberLocked, tenderLocked };
    } catch (error) {
      if (memberHint) memberHint.textContent = "রেজিস্ট্রেশনের অবস্থা লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে Refresh করুন।";
      if (tenderHint) tenderHint.textContent = "রেজিস্ট্রেশনের অবস্থা লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে Refresh করুন।";
      return null;
    }
  }

  choices.forEach(button => {
    button.addEventListener("click", async () => {
      const selected = button.dataset.form;
      choices.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      memberForm.classList.remove("active");
      tenderForm.classList.remove("active");

      // Show the requested form immediately instead of waiting for Firestore.
      const target = selected === "member" ? memberForm : tenderForm;
      target.classList.add("active");
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      const settings = await readRegistrationSettings();
      if (!settings) return;
      const locked = selected === "member" ? settings.memberLocked : settings.tenderLocked;
      if (locked) {
        target.classList.remove("active");
        const hint = selected === "member" ? memberHint : tenderHint;
        if (hint) hint.textContent = selected === "member"
          ? "সদস্য রেজিস্ট্রেশন বর্তমানে বন্ধ। Admin চালু করলে আবার চেষ্টা করুন।"
          : "দরপত্র রেজিস্ট্রেশন বর্তমানে বন্ধ। Admin চালু করলে আবার চেষ্টা করুন।";
      }
    });
  });

  // Refresh labels/icons on page load; the forms remain hidden until selected.
  readRegistrationSettings();
})();
