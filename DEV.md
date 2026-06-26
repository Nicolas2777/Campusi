# განვითარების რეჟიმი (პირდაპირი source ფაილები)

## სწრაფი დაწყება

ტერმინალში გაუშვი ერთხელ:

```bash
cd static-site
npm install
npm run dev
```

ვებგვერდი თანამედროვე ბრაუზერში პირდაპირ კითხულობს source ფაილებს (`js/app.js`, `js/views/login.js`, ...), ამიტომ `login.js`-ში ტექსტის შეცვლის შემდეგ საკმარისია browser refresh.

შემდეგ ბრაუზერში მხოლოდ **Ctrl+R** (refresh) დააჭირე.

## Bundle მხოლოდ ძველი ბრაუზერებისთვის

```bash
npm run build
```

ეს აახლებს fallback bundle-ს (`js/app.bundle.js`) ძველი ბრაუზერებისთვის. ყოველდღიური რედაქტირებისთვის აუცილებელი აღარ არის.

## ლოკალური სერვერი

`npm run dev` უშვებს HTTP სერვერს `http://localhost:5173`-ზე cache-ის გარეშე.

## Cache პრობლემა

თუ refresh-ის შემდეგაც ძველი ვერსია ჩანს — ბრაუზერმა ფაილები დააქეშა. გამოსავალი:
- **Ctrl+Shift+R** (hard refresh), ან
- `index.html`-ში `?v=...` ნომრის შეცვლა
