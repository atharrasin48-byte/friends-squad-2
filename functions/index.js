const {onDocumentCreated,onDocumentUpdated}=require("firebase-functions/v2/firestore");
const {initializeApp}=require("firebase-admin/app");
const {getFirestore,FieldValue}=require("firebase-admin/firestore");
const {getMessaging}=require("firebase-admin/messaging");

initializeApp();
const db=getFirestore();
const messaging=getMessaging();

async function sendToToken(token,title,body){
  if(!token)return;
  try{
    await messaging.send({token,notification:{title,body},webpush:{notification:{icon:"https://atharrasin48-byte.github.io/friends-squad-2/Screenshot_20260924_112659_Facebook.jpg"},fcmOptions:{link:"https://atharrasin48-byte.github.io/friends-squad-2/"}}});
  }catch(error){
    const code=error.code||"";
    if(code.includes("registration-token-not-registered")||code.includes("invalid-registration-token")){
      const snap=await db.collection("notificationSubscriptions").where("token","==",token).get();
      const batch=db.batch();snap.docs.forEach(d=>batch.delete(d.ref));if(!snap.empty)await batch.commit();
    }
    console.error("FCM send failed:",code,error.message);
  }
}

exports.broadcastNotification=onDocumentCreated("notifications/{notificationId}",async event=>{
  const n=event.data.data()||{};
  const title=String(n.title||"Friends Squad 2.0").slice(0,120);
  const body=String(n.body||"নতুন আপডেট প্রকাশিত হয়েছে।").slice(0,1000);
  const snap=await db.collection("notificationSubscriptions").where("enabled","==",true).get();
  const tokens=snap.docs.map(d=>d.data().token).filter(Boolean);
  for(let i=0;i<tokens.length;i+=400){
    const part=tokens.slice(i,i+400);
    const response=await messaging.sendEachForMulticast({tokens:part,notification:{title,body},webpush:{notification:{icon:"https://atharrasin48-byte.github.io/friends-squad-2/Screenshot_20260924_112659_Facebook.jpg"},fcmOptions:{link:"https://atharrasin48-byte.github.io/friends-squad-2/"}}});
    const batch=db.batch();response.responses.forEach((r,index)=>{if(!r.success){const err=r.error&&r.error.code||"";if(err.includes("registration-token-not-registered")||err.includes("invalid-registration-token")){const doc=snap.docs.find(d=>d.data().token===part[index]);if(doc)batch.delete(doc.ref);}}});await batch.commit();
  }
});

exports.memberApprovedNotification=onDocumentCreated("approvedMemberKeys/{applicationId}",async event=>{
  const record=event.data.data()||{};
  const receipt=record.receiptData||{};
  if(!receipt.notificationToken)return;
  const name=String(receipt.name||"তোমার").slice(0,80);
  const number=String(record.registrationNo||"");
  await sendToToken(receipt.notificationToken,"সদস্য রেজিস্ট্রেশন অনুমোদিত",name+"-এর সদস্য রেজিস্ট্রেশন অনুমোদিত হয়েছে। রেজিস্ট্রেশন নম্বর: "+number);
});

exports.tenderApprovedNotification=onDocumentUpdated("tenderApplications/{applicationId}",async event=>{
  const before=event.data.before.data()||{},after=event.data.after.data()||{};
  if(before.approved===true||after.approved!==true||!after.notificationToken)return;
  await sendToToken(after.notificationToken,"দরপত্র রেজিস্ট্রেশন অনুমোদিত",String(after.name||"আপনার")+"-এর দরপত্র রেজিস্ট্রেশন অনুমোদিত হয়েছে।");
});