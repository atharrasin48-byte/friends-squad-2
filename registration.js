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

function addReceiptDownload(form, title, name, reference) {
  const safe = value => String(value || "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  const html = `<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Registration Receipt</title><style>body{font-family:Arial,sans-serif;background:#f3f5fa;padding:24px;color:#172033}.receipt{max-width:620px;margin:30px auto;background:white;border:2px solid #20a995;border-radius:18px;padding:28px;text-align:center}.ref{font-family:monospace;background:#eef2f7;padding:10px;border-radius:8px;overflow-wrap:anywhere}.muted{color:#657087}button{padding:10px 18px;background:#20a995;color:white;border:0;border-radius:8px}</style><section class="receipt"><h1>Friends Squad 2.0</h1><h2>${safe(title)}</h2><p>রেজিস্ট্রেশন সফলভাবে জমা হয়েছে।</p><p><b>নাম:</b> ${safe(name)}</p><p><b>রেফারেন্স নম্বর:</b></p><p class="ref">${safe(reference)}</p><p class="muted">এই রসিদটি জমা দেওয়ার প্রমাণ হিসেবে সংরক্ষণ করুন।</p><button onclick="window.print()">Print / Save as PDF</button></section></html>`;
  const url = URL.createObjectURL(new Blob([html], {type:"text/html;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = "friends-squad-registration-receipt.html";
  link.textContent = "রসিদ ডাউনলোড করুন";
  link.style.display = "inline-block";
  link.style.marginTop = "10px";
  link.style.color = "#20d9c4";
  form.querySelector(".status").appendChild(document.createElement("br"));
  form.querySelector(".status").appendChild(link);
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
    addReceiptDownload(form, "সদস্য রেজিস্ট্রেশন রসিদ", name, key);
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
    addReceiptDownload(form, "দরপত্র রেজিস্ট্রেশন রসিদ", String(values.get("name")), tenderRef.id);
    form.reset();
  } catch (error) {
    showStatus(form, error.message || "রেজিস্ট্রেশন সম্পন্ন হয়নি।");
  } finally {
    submit.disabled = false;
  }
});
