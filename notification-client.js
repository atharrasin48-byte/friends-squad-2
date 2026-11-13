(function(){
  const VAPID_KEY = window.FS20_VAPID_KEY || "";
  const TOKEN_KEY = "fs20_fcm_token";
  const cfg = window.FIREBASE_CONFIG || {};
  function ready(){
    return !!(window.firebase && firebase.messaging && firebase.apps && firebase.apps.length && VAPID_KEY && !VAPID_KEY.includes("ADD_YOUR"));
  }
  async function enable(){
    if(!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("এই ব্রাউজারে ওয়েব নোটিফিকেশন সমর্থিত নয়।");
    if(!ready()) throw new Error("Firebase-এর Web Push VAPID key এখনো সেট করা হয়নি।");
    const permission = await Notification.requestPermission();
    if(permission !== "granted") throw new Error("নোটিফিকেশনের অনুমতি দেওয়া হয়নি।");
    const registration = await navigator.serviceWorker.register("./firebase-messaging-sw.js");
    const messaging = firebase.messaging();
    const token = await messaging.getToken({vapidKey:VAPID_KEY,serviceWorkerRegistration:registration});
    if(!token) throw new Error("এই ডিভাইসের নোটিফিকেশন টোকেন পাওয়া যায়নি।");
    const bytes = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest("SHA-256",bytes);
    const id = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
    const db = firebase.firestore();
    await db.collection("notificationSubscriptions").doc(id).set({
      token:token, enabled:true, platform:/Android/i.test(navigator.userAgent)?"Android":"Web",
      updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    localStorage.setItem(TOKEN_KEY,token);
    return token;
  }
  window.FS20Notifications = {
    enable,
    getToken:()=>localStorage.getItem(TOKEN_KEY)||"",
    isConfigured:ready
  };
})();