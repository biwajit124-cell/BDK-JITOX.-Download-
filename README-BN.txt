BDK JITOX — Free link-based setup

এই সংস্করণে Firebase Storage ব্যবহার করা হয় না। Admin ভিডিওর YouTube URL অথবা APK-এর GitHub Releases URL যোগ করবেন। Firestore-এ শুধু শিরোনাম, বিবরণ, ক্যাটাগরি ও লিংক থাকবে।

ফাইলসমূহ:
- index.html: ওয়েবসাইট
- style.css: ডিজাইন
- app.js: Firebase Authentication ও Firestore
- firestore.rules: Firestore নিরাপত্তা

Firebase:
- Project ID: biswa-eae5f
- Web app nickname: BDK JITOX
- Authentication: Email/Password চালু থাকতে হবে
- Firestore Database: তৈরি থাকতে হবে
- Firestore Rules: এই ফাইলের কোড Publish করতে হবে
- Storage: এই সংস্করণে প্রয়োজন নেই; Blaze upgrade করবেন না

Admin UID ইতিমধ্যে app.js ও firestore.rules-এ বসানো আছে। Admin account-এর UID অবশ্যই এই UID-এর সঙ্গে মিলতে হবে।

Admin ব্যবহারের নিয়ম:
1. ওয়েবসাইটে Admin Login চাপুন।
2. Firebase Authentication-এ তৈরি Admin email/password দিয়ে লগইন করুন।
3. Video হলে YouTube HTTPS URL দিন।
4. APK হলে GitHub Releases থেকে নির্দিষ্ট APK asset-এর HTTPS download URL দিন।
5. চাইলে public HTTPS thumbnail URL দিন।
6. লিংক যোগ করুন।

প্রকাশ:
Firebase Hosting Spark plan-এ ব্যবহার করা যায়। Hosting চালু করে deploy করতে Firebase CLI/টার্মিনাল দরকার। শুধু Android ফোনে deploy করা কঠিন হতে পারে; GitHub repository এবং সমর্থিত hosting workflow ব্যবহার করা যেতে পারে।

নিরাপত্তা:
- Admin password কখনো app.js বা কোনো public ফাইলে লিখবেন না।
- Web API key public client config-এর অংশ; নিরাপত্তা Firestore Rules ও Authentication দিয়ে নিয়ন্ত্রণ করুন।
- শুধু নিজের বা বিতরণের অনুমতি থাকা ভিডিও/APK লিংক যোগ করুন।
- GitHub-এ APK public হলে যে কেউ সেটি ডাউনলোড করতে পারে।
