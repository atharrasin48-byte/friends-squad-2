(function(){
"use strict";
const CLOUD_NAME="r4qeis1r",UPLOAD_PRESET="aneigyz6";
const cfg=window.FIREBASE_CONFIG;
if(!cfg||!cfg.apiKey||!cfg.projectId){document.body.innerHTML="<p style='color:white;padding:25px'>Firebase configuration is missing.</p>";return;}
if(!firebase.apps.length)firebase.initializeApp(cfg);
const auth=firebase.auth(),db=firebase.firestore();
const $=id=>document.getElementById(id);
const panels={auth:$("authPanel"),verify:$("verifyPanel"),profile:$("profilePanel")};
let currentProfile=null;
function status(id,msg,good=false){const el=$(id);el.textContent=msg;el.className="status show "+(good?"good":"bad");}
function clearStatus(id){const el=$(id);el.textContent="";el.className="status";}
function showPanel(which){Object.entries(panels).forEach(([k,v])=>v.classList.toggle("hidden",k!==which));}
function friendly(err){
 const code=err&&err.code||"";
 const map={"auth/email-already-in-use":"এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।","auth/invalid-email":"সঠিক ইমেইল ঠিকানা লিখো।","auth/weak-password":"পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।","auth/user-not-found":"এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।","auth/wrong-password":"পাসওয়ার্ড সঠিক নয়।","auth/invalid-credential":"ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।","auth/too-many-requests":"অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করো।","auth/network-request-failed":"ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো।"};
 return map[code]||err.message||"কাজটি সম্পন্ন করা যায়নি।";
}
function cleanUsername(v){return v.trim().toLowerCase();}
async function uploadPhoto(file){
 if(!file)return "";
 if(!file.type.startsWith("image/")||file.size>5*1024*1024)throw new Error("ছবি ৫ MB-এর মধ্যে হতে হবে।");
 const data=new FormData();data.append("file",file);data.append("upload_preset",UPLOAD_PRESET);data.append("folder","friends-squad-profiles");
 const response=await fetch("https://api.cloudinary.com/v1_1/"+CLOUD_NAME+"/image/upload",{method:"POST",body:data});
 const result=await response.json();if(!response.ok||!result.secure_url)throw new Error("প্রোফাইল ছবি আপলোড হয়নি। আবার চেষ্টা করো।");
 return result.secure_url;
}
function switchTab(signup){
 $("signupForm").classList.toggle("hidden",!signup);$("loginForm").classList.toggle("hidden",signup);
 $("showSignup").classList.toggle("active",signup);$("showLogin").classList.toggle("active",!signup);clearStatus("authStatus");
}
$("showSignup").onclick=()=>switchTab(true);$("showLogin").onclick=()=>switchTab(false);
$("signupForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;clearStatus("authStatus");
 let createdUser=null;
 try{
  const name=$("signupName").value.trim(),username=cleanUsername($("signupUsername").value),age=Number($("signupAge").value),email=$("signupEmail").value.trim().toLowerCase(),password=$("signupPassword").value,confirm=$("signupConfirm").value,file=$("signupPhoto").files[0];
  if(!/^[a-z0-9._]{3,20}$/.test(username))throw new Error("Username ৩–২০ অক্ষরের হতে হবে।");
  if(password!==confirm)throw new Error("দুটি পাসওয়ার্ড মিলছে না।");
  if(!name||!Number.isInteger(age)||age<13||age>99)throw new Error("নাম ও সঠিক বয়স লিখো।");
  const photoURL=await uploadPhoto(file);
  const credential=await auth.createUserWithEmailAndPassword(email,password);createdUser=credential.user;
  await db.runTransaction(async tx=>{
   const usernameRef=db.collection("usernames").doc(username),profileRef=db.collection("userProfiles").doc(createdUser.uid);
   const taken=await tx.get(usernameRef);if(taken.exists)throw new Error("এই Username আগে থেকেই ব্যবহৃত হচ্ছে। অন্য Username দাও।");
   tx.set(usernameRef,{uid:createdUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
   tx.set(profileRef,{uid:createdUser.uid,name,username,age,email,photoURL,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  });
  await createdUser.sendEmailVerification();
  status("authStatus","অ্যাকাউন্ট তৈরি হয়েছে! Gmail-এ verification email পাঠানো হয়েছে। ইমেইল যাচাই না করা পর্যন্ত প্রোফাইল ব্যবহার করা যাবে না।",true);
  showPanel("verify");
 }catch(err){
  if(createdUser){try{await createdUser.delete();}catch(_){}}
  status("authStatus",friendly(err));
 }finally{button.disabled=false;}
});
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;clearStatus("authStatus");
 try{await auth.signInWithEmailAndPassword($("loginEmail").value.trim().toLowerCase(),$("loginPassword").value);}
 catch(err){status("authStatus",friendly(err));}finally{button.disabled=false;}
});
$("forgotPassword").onclick=async()=>{
 const email=$("loginEmail").value.trim();if(!email){status("authStatus","আগে Email Address লিখো।");return;}
 try{await auth.sendPasswordResetEmail(email);status("authStatus","Password reset email পাঠানো হয়েছে।",true);}catch(err){status("authStatus",friendly(err));}
};
async function loadProfile(user){
 if(!user.emailVerified){showPanel("verify");return;}
 try{
  const snap=await db.collection("userProfiles").doc(user.uid).get();if(!snap.exists)throw new Error("প্রোফাইল ডেটা পাওয়া যায়নি।");
  currentProfile=snap.data();$("profileAvatar").src=currentProfile.photoURL||"https://ui-avatars.com/api/?name="+encodeURIComponent(currentProfile.name||"User")+"&background=17254a&color=ffffff";
  $("profileName").textContent=currentProfile.name||"";$("profileUsername").textContent="@"+(currentProfile.username||"");
  $("editName").value=currentProfile.name||"";$("editAge").value=currentProfile.age||"";$("editEmail").value=currentProfile.email||user.email||"";
  showPanel("profile");
 }catch(err){showPanel("auth");status("authStatus",friendly(err));}
}
auth.onAuthStateChanged(async user=>{
 if(!user){currentProfile=null;showPanel("auth");switchTab(true);return;}
 await user.reload();
 if(!user.emailVerified){showPanel("verify");return;}
 await loadProfile(user);
});
$("resendVerification").onclick=async()=>{try{if(auth.currentUser){await auth.currentUser.sendEmailVerification();status("verifyStatus","Verification email আবার পাঠানো হয়েছে।",true);}}catch(err){status("verifyStatus",friendly(err));}};
$("checkVerification").onclick=async()=>{try{await auth.currentUser.reload();if(auth.currentUser.emailVerified){await loadProfile(auth.currentUser);}else status("verifyStatus","এখনো ইমেইল যাচাই হয়নি। Gmail-এর inbox ও spam folder দেখো।");}catch(err){status("verifyStatus",friendly(err));}};
$("verifyLogout").onclick=()=>auth.signOut();
$("editProfileForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;clearStatus("profileStatus");
 try{
  const name=$("editName").value.trim(),age=Number($("editAge").value),file=$("editPhoto").files[0];
  if(!name||!Number.isInteger(age)||age<13||age>99)throw new Error("নাম ও সঠিক বয়স লিখো।");
  const photoURL=file?await uploadPhoto(file):(currentProfile.photoURL||"");
  await db.collection("userProfiles").doc(auth.currentUser.uid).update({name,age,photoURL,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  status("profileStatus","প্রোফাইল সফলভাবে আপডেট হয়েছে।",true);await loadProfile(auth.currentUser);
 }catch(err){status("profileStatus",friendly(err));}finally{button.disabled=false;}
});
$("logout").onclick=()=>auth.signOut();$("refreshProfile").onclick=()=>auth.currentUser&&loadProfile(auth.currentUser);
})();