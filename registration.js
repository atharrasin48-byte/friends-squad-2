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
  const html = `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Member Registration Receipt</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:22px;background:#fff;color:#111;font-family:Arial,"Noto Sans Bengali",sans-serif}
.paper{max-width:760px;margin:0 auto;padding:28px;border:1px solid #999;background:#fff}
.heading{text-align:center;border-bottom:1px solid #222;padding-bottom:14px}
.heading h1{font-size:21px;margin:0 0 5px;font-weight:700;letter-spacing:.3px}
.heading p{font-size:14px;margin:0}
.heading h2{font-size:18px;margin:12px 0 0;font-weight:600}
.intro{font-size:13px;margin:16px 0}
.details{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:18px;align-items:start}
table{width:100%;border-collapse:collapse;font-size:14px}
td{border:1px solid #777;padding:9px 10px;vertical-align:top;overflow-wrap:anywhere}
td:first-child{width:38%;font-weight:600}
.photo{width:130px;height:155px;border:1px solid #777;display:flex;align-items:center;justify-content:center;color:#555;font-size:12px;text-align:center;overflow:hidden}
.photo img{width:100%;height:100%;object-fit:cover}
.reference{margin-top:16px;font-size:13px}
.reference strong{font-family:monospace;overflow-wrap:anywhere}
.note{font-size:12px;margin-top:16px;line-height:1.5}
.footer{border-top:1px solid #777;margin-top:20px;padding-top:9px;text-align:center;font-size:11px}
button{display:block;margin:18px auto 0;padding:10px 18px;border:1px solid #333;background:#fff;color:#111;font-weight:600}
@media(max-width:520px){body{padding:8px}.paper{padding:12px}.details{grid-template-columns:minmax(0,1fr) 95px;gap:8px}.photo{width:95px;height:120px}td{padding:7px 6px;font-size:12px}.heading h1{font-size:18px}}
@media print{body{padding:0}.paper{max-width:none;border:0;padding:12mm}button{display:none}}
</style></head><body><main class="paper">
<header class="heading"><h1>FRIENDS SQUAD 2.0</h1><p>THE PRO BOYS CYCLING GANG</p><h2>সদস্য রেজিস্ট্রেশন রসিদ</h2></header>
<p class="intro">সদস্য রেজিস্ট্রেশনের জন্য আপনার জমা দেওয়া তথ্যসমূহ নিচে উল্লেখ করা হলো।</p>
<section class="details"><table>
<tr><td>আবেদনকারীর নাম</td><td>${e(data.name)}</td></tr>
<tr><td>বয়স</td><td>${e(data.age)}</td></tr>
<tr><td>শ্রেণি</td><td>${e(data.className)}</td></tr>
<tr><td>জন্মতারিখ</td><td>${e(data.birthDate)}</td></tr>
<tr><td>ঠিকানা</td><td>${e(data.address)}</td></tr>
<tr><td>দলের নাম</td><td>${e(data.teamName)}</td></tr>
<tr><td>মোবাইল নম্বর</td><td>${e(data.phone)}</td></tr>
</table><div class="photo">${data.imageUrl ? `<img src="${e(data.imageUrl)}" alt="আবেদনকারীর ছবি">` : "আবেদনকারীর ছবি"}</div></section>
<div class="reference">রেজিস্ট্রেশন রেফারেন্স নম্বর: <strong>${e(data.reference)}</strong></div>
<p class="note">আবেদনের অবস্থা: Admin-এর অনুমোদনের অপেক্ষায়। এই রসিদটি সংরক্ষণ করুন। অনুমোদন না পাওয়া পর্যন্ত সদস্যপদ চূড়ান্ত বলে গণ্য হবে না।</p>
<footer class="footer">Friends Squad 2.0 · Member Registration</footer>
</main><button onclick="window.print()">প্রিন্ট / PDF হিসেবে সংরক্ষণ</button></body></html>`;
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
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("একটি সঠিক ছবি নির্বাচন করুন।");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ছবির সাইজ ৫ MB-এর কম হতে হবে।");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: data }
  );

  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error("ছবি আপলোড হয়নি। আবার চেষ্টা করুন।");
  }
  return result.secure_url;
}

// Standalone member registration; this is separate from the personal Profile account.
$("memberEntry").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const values = new FormData(form);
    const data = {
      name: String(values.get("name") || "").trim(),
      age: String(values.get("age") || "").trim(),
      className: String(values.get("className") || "").trim(),
      birthDate: String(values.get("birthDate") || ""),
      address: String(values.get("address") || "").trim(),
      teamName: String(values.get("teamName") || "").trim(),
      phone: String(values.get("phone") || "").trim()
    };
    if (Object.values(data).some(value => !value)) throw new Error("সব তথ্য পূরণ করুন।");
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 13 || age > 99) throw new Error("বয়স ১৩ থেকে ৯৯-এর মধ্যে লিখুন।");
    const setting = await db.collection("registrationSettings").doc("main").get();
    if (setting.exists && setting.data().memberLocked === true) throw new Error("সদস্য রেজিস্ট্রেশন বর্তমানে বন্ধ।");
    const key = await makeKey(data.name, data.birthDate);
    const ref = db.collection("memberApplications").doc(key);
    const [existing, approved] = await Promise.all([
      ref.get(), db.collection("approvedMemberKeys").doc(key).get()
    ]);
    if (existing.exists) throw new Error("এই নাম ও জন্মতারিখ দিয়ে আগে আবেদন জমা হয়েছে।");
    if (approved.exists) throw new Error("এই সদস্যের আবেদন ইতিমধ্যে অনুমোদিত হয়েছে।");
    const imageFile = values.get("image");
    data.imageUrl = imageFile && imageFile.size ? await uploadImage(imageFile) : "";
    data.status = "pending";
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(data);
    showStatus(form, "সদস্য রেজিস্ট্রেশন জমা হয়েছে। Admin অনুমোদনের অপেক্ষায় থাকুন।", true);
    addMemberReceiptDownload(form, {...data, reference:key});
    form.reset();
  } catch (error) {
    showStatus(form, error.message || "রেজিস্ট্রেশন সম্পন্ন হয়নি।");
  } finally {
    submit.disabled = false;
  }
});

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
