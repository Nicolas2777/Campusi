# Campus — Static Site (HTML/CSS/JS)

სუფთა HTML/CSS/JavaScript ვერსია — არანაირი build-ი არ სჭირდება.

## გაშვება ლოკალურად

უბრალოდ გაუშვი ნებისმიერი static server:

```bash
# Python
python3 -m http.server 8000

# ან Node-ით
npx serve .
```

შემდეგ გახსენი: http://localhost:8000

`index.html` პირდაპირაც იხსნება, მაგრამ Firebase/Auth-ისთვის და Live Server-ისთვის სჯობს static server გამოიყენო.

## Firebase კონფიგურაცია

1. გადადი https://console.firebase.google.com → შექმენი პროექტი
2. Authentication → Sign-in method → ჩართე **Email/Password**
3. Firestore Database → Create database → production mode
4. Project settings → Your apps → Web app → დააკოპირე config
5. გახსენი `js/firebase.js` და ჩაანაცვლე `firebaseConfig` ობიექტი
6. Firestore Rules (დროებითად):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

Firebase-ის გარეშეც მუშაობს — დემო რეჟიმში localStorage გამოიყენება.

## სტრუქტურა

```
index.html              # ერთადერთი HTML ფაილი (SPA)
css/styles.css          # ყველა სტილი + dark mode
js/
  app.js                # bootstrap, routing setup, theme, auth slot
  router.js             # hash-router
  firebase.js           # Firebase CDN imports + config
  auth.js               # login/register/logout
  state.js              # localStorage (theme, favorites, reviews, comments, exams)
  data.js               # demo უნივერსიტეტები/ფაკულტეტები/საგნები
  palette.js            # ⌘K command palette
  ui.js                 # helpers (toast, escape, stars)
  views/
    home.js
    catalog.js          # universities, university, faculty, subject + reviews + comments
    misc.js             # rankings, resources, favorites, calendar, auth, profile, admin
```

## ფუნქციები

- ✅ ძირითადი გვერდები (Home, Universities, Faculty, Subject, Rankings, Resources)
- ✅ Auth (login/register/logout) — Firebase ან demo
- ✅ Profile გვერდი + სტატისტიკა
- ✅ Reviews — 1-5 ვარსკვლავი + pros/cons + კომენტარი
- ✅ Q&A კომენტარები საგნებზე
- ✅ Dark mode toggle (header-ში 🌙/☀️)
- ✅ Favorites (♥ ნებისმიერ უნივ./საგანზე)
- ✅ ⌘K / Ctrl+K command palette
- ✅ Exam calendar — countdown + "Urgent" badge ≤3 დღე
- ✅ Admin panel (nika.gogokhiya27@gmail.com — demo)

## Routing

- `#/` — მთავარი
- `#/universities`
- `#/university/:id`
- `#/faculty/:id`
- `#/subject/:id`
- `#/rankings`, `#/resources`, `#/calendar`, `#/favorites`
- `#/auth`, `#/profile`, `#/admin`
