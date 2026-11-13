(function(){
  const ENABLED_KEY = "fs20_browser_notifications_enabled";
  async function enable(){
    if(!("Notification" in window) || !("serviceWorker" in navigator)) {
      throw new Error("এই ব্রাউজারে নোটিফিকেশন সমর্থিত নয়।");
    }
    const permission = await Notification.requestPermission();
    if(permission !== "granted") throw new Error("নোটিফিকেশনের অনুমতি দেওয়া হয়নি।");
    await navigator.serviceWorker.register("./firebase-messaging-sw.js");
    localStorage.setItem(ENABLED_KEY,"yes");
    return true;
  }
  async function show(title,body){
    if(!("Notification" in window) || Notification.permission!=="granted" || localStorage.getItem(ENABLED_KEY)!=="yes")return;
    try{
      const registration=await navigator.serviceWorker.ready;
      await registration.showNotification(String(title||"Friends Squad 2.0"),{
        body:String(body||"নতুন আপডেট এসেছে।"),
        icon:"./Screenshot_20260924_112659_Facebook.jpg",
        badge:"./Screenshot_20260924_112659_Facebook.jpg",
        data:{url:"./index.html"}
      });
    }catch(error){console.warn("Browser notification:",error);}
  }
  function disable(){localStorage.removeItem(ENABLED_KEY);return true;}
  window.FS20Notifications = {enable,disable,show,isEnabled:()=>localStorage.getItem(ENABLED_KEY)==="yes"};
})();