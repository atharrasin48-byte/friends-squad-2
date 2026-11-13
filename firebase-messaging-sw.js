importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:"AIzaSyBgIrn_GQsED6-5XBGSU4x6TfiKkDiSjXs",
  authDomain:"friends-squad-2-0.firebaseapp.com",
  projectId:"friends-squad-2-0",
  storageBucket:"friends-squad-2-0.firebasestorage.app",
  messagingSenderId:"109737306240",
  appId:"1:109737306240:web:b4d324f8265253bb57de65",
  measurementId:"G-YM1KJKWS19"
});

const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{
  const data=payload.notification||payload.data||{};
  const title=data.title||"Friends Squad 2.0";
  const options={
    body:data.body||"তোমার জন্য নতুন আপডেট এসেছে।",
    icon:"./Screenshot_20260924_112659_Facebook.jpg",
    badge:"./Screenshot_20260924_112659_Facebook.jpg",
    data:{url:data.url||"./index.html"}
  };
  self.registration.showNotification(title,options);
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=event.notification.data&&event.notification.data.url||"./index.html";
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){if("focus" in client)return client.focus();}
    if(clients.openWindow)return clients.openWindow(target);
  }));
});