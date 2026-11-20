import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATqPTmm9_jYnAWjLqTNkAOhcwPU2Y6fz8",
  authDomain: "biswa-eae5f.firebaseapp.com",
  databaseURL: "https://biswa-eae5f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "biswa-eae5f",
  storageBucket: "biswa-eae5f.firebasestorage.app",
  messagingSenderId: "415186624972",
  appId: "1:415186624972:web:7337ce77686f25b161fd69",
  measurementId: "G-6XJX93WT6T"
};

const ADMIN_UID = "PGqf01S0DzVEOEuEC0fzJikIFSJ3";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = (id) => document.getElementById(id);
let currentUser = null;
let isAdmin = false;
let allFiles = [];
let activeFilter = "all";

$("year").textContent = new Date().getFullYear();
const toast = (message) => {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2800);
};
const safeText = (value = "") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl = (value = "") => {
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
};

$("adminToggle").addEventListener("click", () => {
  $("adminPanel").classList.toggle("hidden");
  $("adminPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("loginMessage").textContent = "লগইন হচ্ছে...";
  try {
    const credential = await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
    if (credential.user.uid !== ADMIN_UID) {
      await signOut(auth);
      $("loginMessage").textContent = "এই অ্যাকাউন্টটি Admin হিসেবে অনুমোদিত নয়।";
      return;
    }
    $("loginMessage").textContent = "";
  } catch (error) {
    $("loginMessage").textContent = "লগইন হয়নি। Email ও password পরীক্ষা করুন।";
  }
});
$("logoutBtn").addEventListener("click", () => signOut(auth));
onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = !!user && user.uid === ADMIN_UID;
  if (user && !isAdmin) signOut(auth);
  $("loginBox").classList.toggle("hidden", isAdmin);
  $("uploadBox").classList.toggle("hidden", !isAdmin);
  $("logoutBtn").classList.toggle("hidden", !isAdmin);
  $("adminToggle").textContent = isAdmin ? "Admin Dashboard" : "Admin Login";
  renderFiles();
});

function renderFiles() {
  const term = $("searchInput").value.trim().toLowerCase();
  const files = allFiles.filter(f => (activeFilter === "all" || f.category === activeFilter) &&
    (`${f.title || ""} ${f.description || ""} ${f.category || ""}`).toLowerCase().includes(term));
  if (!files.length) {
    $("fileGrid").innerHTML = `<div class="empty-state">এখনো কোনো লিংক যোগ করা হয়নি। পরে আবার দেখুন।</div>`;
    return;
  }
  $("fileGrid").innerHTML = files.map(f => {
    const link = safeUrl(f.link);
    const thumb = safeUrl(f.thumbnail || "");
    const media = thumb ? `<img class="thumb" src="${safeText(thumb)}" alt="${safeText(f.title)}" loading="lazy">` : `<div class="file-icon">${f.category === "video" ? "▶" : "▣"}</div>`;
    const action = f.category === "video" ? "▶ Watch Video" : "↓ Download APK";
    return `<article class="file-card">${media}<h3>${safeText(f.title)}</h3><p>${safeText(f.description || (f.category === "video" ? "ভিডিও" : "Android অ্যাপ"))}</p><div class="meta"><span>${f.category === "video" ? "VIDEO" : "APK APP"}</span></div><div class="card-actions"><a class="download-btn" href="${safeText(link)}" target="_blank" rel="noopener noreferrer">${action}</a>${isAdmin ? `<button class="delete-btn" data-delete="${safeText(f.id)}" type="button">Delete</button>` : ""}</div></article>`;
  }).join("");
  document.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => removeFile(btn.dataset.delete)));
}
async function loadFiles() {
  try {
    const snap = await getDocs(query(collection(db, "downloads"), orderBy("createdAt", "desc")));
    allFiles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFiles();
  } catch (error) {
    $("fileGrid").innerHTML = `<div class="empty-state">তালিকা লোড হয়নি। Firestore চালু আছে কি না এবং Rules পরীক্ষা করুন।</div>`;
  }
}
$("searchInput").addEventListener("input", renderFiles);
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  activeFilter = btn.dataset.filter;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
  renderFiles();
}));

$("uploadForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!isAdmin || !currentUser) return toast("আগে Admin Login করুন।");
  const title = $("fileTitle").value.trim();
  const category = $("fileCategory").value;
  const link = safeUrl($("fileLink").value.trim());
  const thumbnail = $("fileThumbnail").value.trim() ? safeUrl($("fileThumbnail").value.trim()) : "";
  const description = $("fileDescription").value.trim();
  if (!title || !link) return toast("শিরোনাম ও সঠিক HTTPS লিংক দিন।");
  if (!link.startsWith("https://")) return toast("নিরাপত্তার জন্য HTTPS লিংক ব্যবহার করুন।");
  if (category === "video" && !/(youtube\.com|youtu\.be)/i.test(new URL(link).hostname)) return toast("ভিডিওর জন্য YouTube লিংক দিন।");
  if (category === "apk" && !/(github\.com|githubusercontent\.com)/i.test(new URL(link).hostname)) return toast("APK-এর জন্য GitHub Releases লিংক দিন।");
  if ($("fileThumbnail").value.trim() && !thumbnail) return toast("Thumbnail-এর সঠিক HTTPS URL দিন।");
  $("uploadMessage").textContent = "লিংক সংরক্ষণ হচ্ছে...";
  try {
    await addDoc(collection(db, "downloads"), {
      title, category, link, thumbnail, description,
      createdAt: serverTimestamp(), uploadedBy: currentUser.uid
    });
    $("uploadForm").reset();
    $("uploadMessage").textContent = "সফলভাবে লিংক যোগ হয়েছে।";
    toast("লিংক যোগ হয়েছে!");
    await loadFiles();
  } catch (error) {
    $("uploadMessage").textContent = "লিংক যোগ হয়নি। Firestore Rules Publish হয়েছে কি না দেখুন।";
  }
});
async function removeFile(id) {
  if (!isAdmin || !confirm("এই লিংকটি মুছে ফেলবেন?")) return;
  try {
    await deleteDoc(doc(db, "downloads", id));
    toast("লিংক মুছে ফেলা হয়েছে।");
    await loadFiles();
  } catch (error) { toast("মুছতে সমস্যা হয়েছে। Firestore Rules পরীক্ষা করুন।"); }
}
loadFiles();
