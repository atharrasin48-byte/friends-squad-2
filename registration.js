// Initialize Firebase before using Firestore.
const firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Firebase configuration is missing. Check firebase-config.js.");
}
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

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
*{box-sizing:border-box}body{margin:0;padding:28px;background:#edf3f5;color:#142c3a;font-family:Arial,sans-serif}
.sheet{max-width:720px;margin:20px auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 12px 36px #18384920}
.top{padding:30px;background:linear-gradient(135deg,#102b3b,#176b69);color:#fff;text-align:center}
.mark{width:66px;height:66px;margin:0 auto 12px;border:2px solid #9ce5d4;border-radius:50%;display:grid;place-items:center;font-size:25px;font-weight:bold}
.top h1{margin:0;font-size:25px;letter-spacing:.4px}.top p{margin:8px 0 0;color:#c9e9e2}
.body{padding:30px}.tag{display:inline-block;background:#e2f5ef;color:#176b58;padding:8px 14px;border-radius:30px;font-weight:bold;font-size:13px}
h2{margin:18px 0 6px;font-size:23px}.sub{color:#647783;margin:0 0 24px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{padding:14px;background:#f3f8f7;border:1px solid #e0eeea;border-radius:12px}
.label{display:block;color:#698079;font-size:12px;margin-bottom:6px}.value{font-weight:bold;font-size:16px;overflow-wrap:anywhere}
.reference{margin-top:18px;padding:16px;border:1px dashed #4b9e8c;border-radius:12px;text-align:center;background:#f6fbf9}
.reference strong{display:block;font-family:monospace;font-size:14px;overflow-wrap:anywhere;margin-top:8px}
.note{margin-top:22px;color:#526a70;font-size:14px;line-height:1.6}
.foot{padding:16px 30px;background:#f3f8f7;color:#668078;text-align:center;font-size:12px}
button{display:block;margin:22px auto 0;padding:12px 22px;border:0;border-radius:9px;background:#176b69;color:white;font-weight:bold}
@media(max-width:520px){body{padding:10px}.body{padding:20px}.grid{grid-template-columns:1fr 1fr}}
@media print{body{padding:0;background:white}.sheet{box-shadow:none;margin:0;max-width:none}button{display:none}}
</style></head><body><main class="sheet">
<header class="top"><div class="mark">FS</div><h1>FRIENDS SQUAD 2.0</h1><p>THE PRO BOYS CYCLING GANG</p></header>
<section class="body"><span class="tag">MEMBER APPLICATION RECEIPT</span>
<h2>সদস্য রেজিস্ট্রেশন রসিদ</h2><p class="sub">আপনার সদস্য হওয়ার আবেদনটি গ্রহণ করা হয়েছে।</p>
<div class="grid">
<div class="field"><span class="label">আবেদনকারীর নাম</span><span class="value">${e(data.name)}</span></div>
<div class="field"><span class="label">বয়স</span><span class="value">${e(data.age)}</span></div>
<div class="field"><span class="label">শ্রেণি</span><span class="value">${e(data.className)}</span></div>
<div class="field"><span class="label">দলের নাম</span><span class="value">${e(data.teamName)}</span></div>
</div>
<div class="reference"><span class="label">APPLICATION REFERENCE ID</span><strong>${e(data.reference)}</strong></div>
<p class="note"><b>আবেদনের অবস্থা:</b> Admin-এর অনুমোদনের অপেক্ষায়। এই রসিদটি সংরক্ষণ করুন। অনুমোদন না পাওয়া পর্যন্ত সদস্যপদ চূড়ান্ত বলে গণ্য হবে না।</p>
</section><footer class="foot">Friends Squad 2.0 · Member Registration</footer>
</main><button onclick="window.print()">Print / Save as PDF</button></body></html>`;
  downloadReceipt(html, "friends-squad-member-receipt.html", form, "সদস্য রসিদ ডাউনলোড করুন");
}

function addTenderReceiptDownload(form, data) {
  const e = escapeReceipt;
  const html = `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tender Submission Receipt</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:28px;background:#e9edf4;color:#1b2940;font-family:Arial,sans-serif}
.paper{max-width:760px;margin:20px auto;background:#fff;border:1px solid #cbd4e2;box-shadow:0 12px 34px #182b481c}
.head{padding:26px 30px;border-bottom:4px double #284d78;text-align:center}
.kicker{font-size:12px;letter-spacing:2px;color:#61748f;font-weight:bold}.head h1{margin:8px 0;color:#203d63;font-size:24px}.head p{margin:0;color:#687991}
.ribbon{margin:22px 30px 0;padding:11px 14px;background:#203d63;color:#fff;text-align:center;font-weight:bold;letter-spacing:1px}
.content{padding:24px 30px}.intro{text-align:center;color:#53657d;line-height:1.6;margin:0 0 22px}
table{width:100%;border-collapse:collapse}td{padding:12px 10px;border:1px solid #d7dfeb;vertical-align:top}td:first-child{width:38%;background:#f2f5fa;color:#526783;font-weight:bold}
.ref{margin-top:20px;padding:16px;border:1px solid #aebed3;background:#f6f8fb;text-align:center}
.ref span{display:block;color:#60728b;font-size:12px;letter-spacing:1px}.ref strong{display:block;margin-top:7px;color:#203d63;font-family:monospace;overflow-wrap:anywhere}
.notice{margin-top:20px;padding:13px 15px;border-left:4px solid #d19b42;background:#fff8e9;color:#65512c;font-size:13px;line-height:1.6}
.sign{display:flex;justify-content:space-between;gap:20px;margin-top:42px;color:#61728a;font-size:12px}.sign div{width:42%;border-top:1px solid #8c9bb0;padding-top:8px;text-align:center}
.footer{margin-top:25px;padding:15px;background:#f2f5fa;text-align:center;color:#6b7b91;font-size:12px}
button{display:block;margin:22px auto 0;padding:12px 22px;border:0;border-radius:4px;background:#203d63;color:#fff;font-weight:bold}
@media(max-width:520px){body{padding:10px}.head,.content{padding:20px}.ribbon{margin-left:20px;margin-right:20px}td{padding:9px 7px;font-size:13px}}
@media print{body{padding:0;background:white}.paper{margin:0;max-width:none;box-shadow:none}button{display:none}}
</style></head><body><main class="paper">
<header class="head"><div class="kicker">THE PRO BOYS CYCLING GANG</div><h1>FRIENDS SQUAD 2.0</h1><p>দরপত্র নিবন্ধন ও জমাদান সংক্রান্ত রসিদ</p></header>
<div class="ribbon">OFFICIAL TENDER REGISTRATION RECEIPT</div>
<section class="content"><p class="intro">আপনার দরপত্র সংক্রান্ত নিবন্ধন গ্রহণ করা হয়েছে। নিচে জমা দেওয়া তথ্যের সারসংক্ষেপ দেওয়া হলো।</p>
<table>
<tr><td>ক্রমিক নম্বর</td><td>${e(data.serial)}</td></tr>
<tr><td>আবেদনকারী / প্রতিষ্ঠানের নাম</td><td>${e(data.name)}</td></tr>
<tr><td>দরপত্রের নাম</td><td>${e(data.tenderName)}</td></tr>
<tr><td>নির্ধারিত স্থান</td><td>${e(data.place)}</td></tr>
<tr><td>দরপত্র সংগ্রহের তারিখ</td><td>${e(data.collectionDate)}</td></tr>
<tr><td>দরপত্র জমার তারিখ</td><td>${e(data.submissionDate)}</td></tr>
<tr><td>নিবন্ধনের তারিখ</td><td>${e(data.date)}</td></tr>
</table>
<div class="ref"><span>RECEIPT / TRACKING NUMBER</span><strong>${e(data.reference)}</strong></div>
<div class="notice">এই রসিদটি নিবন্ধন জমা দেওয়ার প্রমাণ হিসেবে সংরক্ষণ করুন। এটি দরপত্র গ্রহণ বা অনুমোদনের নিশ্চয়তা নয়।</div>
<div class="sign"><div>আবেদনকারীর স্বাক্ষর</div><div>গ্রহণকারীর স্বাক্ষর</div></div>
</section><footer class="footer">Friends Squad 2.0 · Tender Registration</footer>
</main><button onclick="window.print()">Print / Save as PDF</button></body></html>`;
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

// Registration type buttons
document.querySelectorAll(".choice").forEach(button => {
  button.addEventListener("click", async () => {
    const type = button.dataset.form;

    if (type === "tender") {
      try {
        const setting = await db
          .collection("registrationSettings")
          .doc("main").get();

        if (setting.exists && setting.data().tenderLocked === true) {
          alert("দরপত্র রেজিস্ট্রেশন বর্তমানে বন্ধ রয়েছে।");
          return;
        }
      } catch (error) {
        alert("রেজিস্ট্রেশনের অবস্থা যাচাই করা যায়নি।");
        return;
      }
    }

    document.querySelectorAll(".form").forEach(section =>
      section.classList.remove("active")
    );

    const selected = $(type + "Form");
    if (selected) selected.classList.add("active");

    document.querySelectorAll(".choice").forEach(item =>
      item.setAttribute("aria-pressed", String(item === button))
    );
  });
});

// Tender lock status
async function loadTenderStatus() {
  const hint = $("tenderLockHint");
  if (!hint) return;
  try {
    const setting = await db
      .collection("registrationSettings")
      .doc("main").get();

    const locked = setting.exists &&
      setting.data().tenderLocked === true;

    hint.textContent = locked
      ? "দরপত্র রেজিস্ট্রেশন বর্তমানে বন্ধ।"
      : "দরপত্র রেজিস্ট্রেশন চালু আছে।";

    const tenderButton = document.querySelector(
      '[data-form="tender"]'
    );
    if (tenderButton) {
      tenderButton.textContent = locked
        ? "🔒 দরপত্র রেজিস্ট্রেশন (বন্ধ)"
        : "🔓 দরপত্র রেজিস্ট্রেশন";
    }
  } catch (error) {
    hint.textContent = "অবস্থা যাচাই করা যায়নি।";
  }
}

loadTenderStatus();

// Member registration
$("memberEntry").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;

  try {
    const values = new FormData(form);
    const name = String(values.get("name")).trim();
    const birthDate = String(values.get("birthDate"));
    const code = String(values.get("code"));

    if (code !== ADMIN_CODE) {
      throw new Error("Error! Please Correct Code.");
    }

    // The document ID is a private hash of name + date of birth.
    // Firestore rules enforce create-only and block already-approved keys.
    const key = await makeKey(name, birthDate);

    const imageUrl = await uploadImage(values.get("image"));

    const application = {
      name,
      age: Number(values.get("age")),
      className: values.get("className"),
      birthDate,
      address: values.get("address"),
      teamName: values.get("teamName"),
      phone: values.get("phone"),
      imageUrl,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("memberApplications").doc(key).set(application);

    showStatus(form, "রেজিস্ট্রেশন জমা হয়েছে। Admin অনুমোদনের অপেক্ষায় থাকুন।", true);
    addMemberReceiptDownload(form, {
      name,
      age: values.get("age"),
      className: values.get("className"),
      teamName: values.get("teamName"),
      reference: key
    });
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
      tenderName: values.get("tenderName"),
      place: values.get("place"),
      collectionDate: values.get("collectionDate"),
      submissionDate: values.get("submissionDate"),
      date: values.get("date"),
      reference: tenderRef.id
    });
    form.reset();
  } catch (error) {
    showStatus(form, error.message || "রেজিস্ট্রেশন সম্পন্ন হয়নি।");
  } finally {
    submit.disabled = false;
  }
});
