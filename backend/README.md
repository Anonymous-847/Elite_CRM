# Elite Digital Hub CRM — Backend (Express + Mongoose/MongoDB)

Yeh backend aapki CRM app ka data ab **localStorage ki bajaye MongoDB database** mein store karta hai.

## 1. Install

```bash
cd backend
npm install
```

## 2. MongoDB connection

`.env.example` ko copy karke `.env` banayein:

```bash
cp .env.example .env
```

Phir `.env` mein `MONGODB_URI` set karein:

- **Local MongoDB** (agar aapke system pe MongoDB install hai):
  ```
  MONGODB_URI=mongodb://127.0.0.1:27017/elite_digital_hub
  ```
- **MongoDB Atlas** (free cloud database, agar local install nahi hai):
  1. https://www.mongodb.com/cloud/atlas par free cluster banayein
  2. "Connect" → "Drivers" se connection string copy karein
  3. `.env` mein paste karein:
     ```
     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/elite_digital_hub
     ```

## 3. Run

```bash
npm start
```

Agar sab sahi hai to terminal mein yeh dikhega:

```
✅ MongoDB connected: elite_digital_hub
🚀 EDH CRM API running on http://localhost:5000
```

## 4. Frontend

Ab `server.js` khud hi `frontend/` folder ko serve karta hai (same app, same port) —
matlab jab aap backend chalate hain (`npm start`), poori CRM (frontend + API) usi
ek URL par mil jaati hai, e.g. `http://localhost:5000`.

Agar kabhi frontend ko kisi **alag domain/port** par host karna ho (backend se alag),
tab hi `index.html` mein `script.js` se pehle yeh line add karein:

```html
<script>window.EDH_API_BASE = "https://api.yourdomain.com";</script>
<script src="script.js"></script>
```

Warna kuch add karne ki zaroorat nahi — default khud-ba-khud sahi URL istemal karta hai.

## API endpoints

Har collection (`items`, `orders`, `expenses`, `history`, `invoices`, `users`, `tasks`, `stockmoves`) ke liye:

| Method | URL                      | Kaam                                   |
|--------|--------------------------|-----------------------------------------|
| GET    | `/api/<resource>`        | Puri list laayein                       |
| PUT    | `/api/<resource>`        | Poori list replace karein (bulk save)   |
| POST   | `/api/<resource>`        | Ek naya document add karein             |
| PUT    | `/api/<resource>/:id`    | Ek document update karein (id se)       |
| DELETE | `/api/<resource>/:id`    | Ek document delete karein               |
| DELETE | `/api/<resource>`        | Poori collection khali kar dein         |

Example: `GET http://localhost:5000/api/items`

## Kaise kaam karta hai (important)

Frontend ka poora business logic (items add/edit/delete, orders, invoices, stock, users, tasks) **bilkul waisa hi hai jaisa pehle tha** — sirf storage layer badla hai:

- Pehle: `localStorage.setItem('edh_items', JSON.stringify(items))`
- Ab: `PUT /api/items` — poori `items` array database mein save ho jaati hai

Isliye app start hote hi sab collections database se fetch hoti hain (`loadAllData()`), aur har change ke baad wapis save ho jaati hain — bilkul localStorage jaisa flow, bas ab data browser ki jagah MongoDB mein permanently store hota hai, aur kisi bhi device/browser se access ho sakta hai (agar backend deploy ho).

---

## 5. cPanel par live karna (step-by-step)

Zyadatar modern cPanel hosting mein **"Setup Node.js App"** tool hota hai (Software section mein) — isi se ye poori app (frontend + backend, ek hi Node app ke zariye) live hogi. MongoDB shared cPanel hosting par nahi milta, is liye free **MongoDB Atlas** (cloud) use karein — koi install nahi karna, sirf ek connection string chahiye.

### Step 1 — MongoDB Atlas free database banayein
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par free account banayein
2. Free (M0) cluster create karein
3. **Database Access** → naya user banayein (username/password yaad rakhein)
4. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`) add karein — warna cPanel server connect nahi kar payega
5. **Connect** → **Drivers** → connection string copy karein, kuch is tarah:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/elite_digital_hub
   ```

### Step 2 — Files taiyar karein
- `backend/node_modules` folder **zip mein shamil na karein** (bara hota hai, server pe khud install hoga)
- Baaki poora `crm` folder (frontend + backend) zip kar lein

### Step 3 — cPanel mein Node.js App banayein
1. cPanel → **Software** → **Setup Node.js App** → **Create Application**
2. **Node.js version**: 18 ya usse upar select karein
3. **Application mode**: Production
4. **Application root**: e.g. `crm_app` (ye `public_html` ke **bahar** rakhein — security ke liye)
5. **Application URL**: apna domain ya subdomain select karein
6. **Application startup file**: `backend/server.js`
7. **Create** dabayein

### Step 4 — Files upload karein
1. cPanel → **File Manager** → jo application root banaya (e.g. `crm_app`) usme jayein
2. Apni zip upload karein, **Extract** karein — is se `crm/frontend` aur `crm/backend` folders andar aa jayenge
3. Agar structure `crm_app/crm/backend/...` ban raha ho, to sab kuch ek level upar move kar dein taake `crm_app/backend/server.js` aur `crm_app/frontend/index.html` seedhe bane

### Step 5 — Environment variables set karein
Setup Node.js App wapis kholein, apni app pe click karein, **Environment Variables** mein add karein:
- `MONGODB_URI` = Step 1 wali Atlas connection string
- `CORS_ORIGIN` = `*` (ya apna domain)

(`.env` file upload karne ki zaroorat nahi — cPanel ki environment variables hi kaafi hain)

### Step 6 — Install aur start karein
1. Usi page par **Run NPM Install** dabayein — ye `backend/package.json` se sab dependencies install karega
2. **Restart** ya **Start App** dabayein
3. Apna domain browser mein kholein — CRM ka login screen dikhna chahiye

### Agar error aaye
- **App start nahi ho rahi**: cPanel ke Node app page par **Errors** log dekhein
- **"Cannot find module"**: Run NPM Install dobara chalayein
- **MongoDB connect nahi ho raha**: Atlas ka Network Access `0.0.0.0/0` check karein, aur connection string mein password mein special characters (`@`, `#` etc.) ho to URL-encode karein
- **Blank/white page**: confirm karein ke `frontend` folder `backend` ke bilkul saath (sibling) hai, `../frontend` path automatically usay dhoondta hai

---

## MongoDB rakhein ya SQL mein badlein?

**MongoDB hi rakhein** — SQL mein migrate karna is app ke liye faida mand nahi:
- Saare 11 models (Items, Orders, Invoices, Users, Tasks, wagera) already MongoDB/Mongoose ke liye likhe hain — SQL mein badalna matlab har model, har route dobara likhna
- cPanel khud MongoDB host nahi karta, lekin **MongoDB Atlas free tier** cloud mein chalta hai — cPanel sirf uske sath connect hota hai, koi install nahi karna
- Data halka/flexible hai (JSON jaisa), jo is CRM ki current design se match karta hai
- SQL migrate karne ka koi cost/performance faida nahi is scale (chhota business CRM) par

Agar kabhi bohat bara scale ho jaye (lakhon records, complex reporting/joins), tab SQL sochna reasonable ho sakta hai — abhi ke liye MongoDB Atlas sab se aasan aur efficient raasta hai.
