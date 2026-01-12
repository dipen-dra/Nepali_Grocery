# Nepali Grocery Store 🛒
A full-stack e-commerce application for grocery shopping, featuring a robust and secure backend. Built with the **MERN stack** (MongoDB, Express, React, Node.js).

---

## 🛠️ Tech Stack
*   **Frontend:** React (Vite), TailwindCSS, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Payment:** eSewa Integration
*   **Security:** Rate-Limit, BCrypt, JWT (HttpOnly), GeoIP-Lite, XSS (Sanitization), Helmet

---

## 🛡️ Security Architecture: The "HttpOnly" Advantage
We have engineered the authentication system to be resilient against modern web attacks. We prioritized security by moving away from `localStorage` to **HttpOnly Cookies**.

### 1. LocalStorage vs. HttpOnly Cookie 🥊
| Feature | LocalStorage (The "Unsafe" Way) | HttpOnly Cookie (The "Secure" Way) |
| :--- | :--- | :--- |
| **Accessibility** | Accessible by ANY JavaScript code running on the page. | **NOT Accessible** by JavaScript. Only the browser reads it. |
| **Attack Scenario** | Hacker script runs `localStorage.getItem('token')` -> **Stolen!** | Hacker script runs `document.cookie` -> **Empty!** (Token is hidden). |
| **Transport** | Must completely manually attach to headers (`Authorization: Bearer...`). | **Browser automatically** attaches it to requests. |

### 🔍 Code Implementation (`userController.js`)
```javascript
// Setting the Secure Cookie
res.cookie('token', token, {
    httpOnly: true,  // 🔒 JS cannot read this
    secure: process.env.NODE_ENV === 'production', // true in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
});
```

### 2. Deep Dive: How It Works (Q&A) 🧐
1.  **Is the cookie set in the backend?** YES. Use `res.cookie('token', token, { httpOnly: true })`. This instructs the browser to save the token specially.
2.  **Can the frontend read the cookie?** **NO.** This is the key feature.
    *   The Browser manages the cookie in a secure "Cookie Jar".
    *   **JavaScript** (react code, console, or malicious scripts) **CANNOT** read it. `document.cookie` returns an empty string.
    *   The browser automatically attaches the cookie to every request to the backend, so the server knows who you are, but the frontend code doesn't need to know.
3.  **Does this prevent Session Hijacking?** **YES.**
    *   **The Attack:** A hacker injects a script to steal your `localStorage` or `document.cookie`.
    *   **The Defense:** Since the cookie is **HttpOnly**, the hacker's script sees nothing. They cannot steal the token. They cannot impersonate the user on their own machine.

---

## 🦠 Understanding XSS Types: The Three Attack Vectors
Since we defend against XSS, it is important to understand all three types:

| Type | Stored XSS | Reflected XSS | DOM XSS |
| :--- | :--- | :--- | :--- |
| **Where it lives** | **Database**. Hacker posts a bad comment. | **URL/Request**. Hacker sends a link like `site.com?q=<script>...` | **Browser Memory**. Frontend code unsafely manipulates the DOM. |
| **Mechanism** | Server saves the script and serves it to every visitor. | Server echoes the malicious input back in the response (e.g., search results page). | Frontend takes input and puts it into `innerHTML` without sanitization. |
| **Persistence** | Permanent. Stays in DB until removed. | Temporary. Only affects users who click the malicious link. | Temporary. Happens purely client-side. |
| **Danger Level** | **High**. Can infect thousands. | Medium. Requires social engineering. | Medium. Requires vulnerable frontend code. |
| **Example** | Comment: `<script>steal()</script>` saved to DB. | URL: `site.com/search?q=<script>alert('XSS')</script>` | Code: `div.innerHTML = userInput` (without escaping). |
| **Our Defense** | **Backend Sanitization (`xss`)** + React escaping. | Input validation + React escaping. | React's architecture + **HttpOnly Cookies**. |

### 🧼 Backend Data Sanitization (Layer 3 Defense)
To ensure **Stored XSS** never happens, we implemented a global sanitization middleware using the `xss` library.

*   **Intercepts:** Every request (`req.body`, `req.query`, `req.params`) is checked.
*   **Actively Cleans:** It strips out dangerous tags (e.g., `<script>`, `<onload>`, `<iframe>`).
*   **Result:** Even if a malicious user tries to send `<b><script>alert(1)</script></b>`, the Backend converts it to `<b>alert(1)</b>` before it ever touches the database.

**Actual Code (`middleware/cleanInput.js`):**
```javascript
export const cleanInput = (req, res, next) => {
    try {
        if (req.body) req.body = sanitizeObject(req.body);
        if (req.query) {
            const cleanedQuery = sanitizeObject(req.query);
            for (const key in cleanedQuery) req.query[key] = cleanedQuery[key];
        }
        next();
    } catch (error) { ... }
};
const sanitizeObject = (data) => {
    if (typeof data === 'string') return xss(data); // The core magic happens here 🧼
    if (typeof data === 'object' && data !== null) {
        for (const key in data) data[key] = sanitizeObject(data[key]);
    }
    return data;
};
```

### 🧼 Frontend Sanitization (Layer 4 Defense)
We use **DOMPurify** in React components where we must render HTML dynamically (e.g., Chatbot responses).
*   **Why?** React's `dangerouslySetInnerHTML` is, well, dangerous.
*   **Solution:** We wrap any HTML content in `DOMPurify.sanitize()` before passing it to React. This ensures that even if the backend missed something, the browser will refuse to execute scripts inside that specific block.

**Actual Code (`Chatbot.jsx`):**
```javascript
<p className="text-sm whitespace-pre-wrap" 
   dangerouslySetInnerHTML={{ 
       __html: DOMPurify.sanitize(msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) 
   }}>
</p>
```

---

## 🔐 Advanced Security Implementations

### 1. Authentication & Access Control
*   **Dual-Token System:** Supports both HttpOnly cookies (browser) and Bearer tokens (mobile/API).
*   **Rate Limiting:** IP Blocked after **10 failed attempts** in 10 mins. Returns `429 Too Many Requests`.
*   **Captcha Verification:** Server-side Google ReCAPTCHA checks to stop bot logins.
*   **Secure Email:** Prevents enumeration attacks during email updates.
*   **Smart Password Policies (NEW):**
    *   **Name Ban:** Passwords cannot contain your name (e.g., "Dipendra" cannot use "Dipendra123").
    *   **Anti-Reuse History:** You cannot reuse any of your last **5 passwords**.
    *   **Expiration Warning:** If your password is >30 days old, the system warns you to update it.

**Actual Code (`userController.js`):**
```javascript
// 1. Name Check: Password cannot contain user's name
const nameParts = user.fullName.toLowerCase().split(' ');
const isNameInPassword = nameParts.some(part => part.length > 2 && password.toLowerCase().includes(part));
if (isNameInPassword) throw new Error("Password cannot contain your name.");

// 2. History Check: Cannot reuse last 5 passwords
for (const oldHash of user.passwordHistory) {
    if (await bcrypt.compare(password, oldHash)) {
        throw new Error("You cannot reuse a recent password.");
    }
}
```

### 2. Logging & Monitoring (Winston) 🪵
We replaced standard `console.log` with **Winston** for production-grade logging.
*   **Persistence:** Logs are saved to files in `server/logs/`, unlike console logs which vanish on restart.
*   **Daily Rotation:** We use `winston-daily-rotate-file` to generate a fresh log file every day (e.g., `2026-01-09-audit.log`).
*   **Three-Layer Categorization:**
    *   `*-error.log`: **Critical Crashes** (Status 500). Needs immediate dev attention.
    *   **`*-audit.log`**: **Security Alerts** (Status 401, 403, 429). Warns about Brute Force or unauthorized access.
    *   `*-access.log`: **General Traffic** (Status 200). Used for analytics and debugging paths.
*   **Security:**
    *   **Sanitization:** The logger automatically redacts sensitive fields like `password` or `token` from the logs.
    *   **GitIgnore:** The `logs/` folder is excluded from GitHub to prevent data leakage.

**Actual Code (`utils/logger.js`):**
```javascript
new winston.transports.DailyRotateFile({
    filename: 'logs/%DATE%-audit.log',
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxFiles: '90d' // Keep logs for 90 days
})
```

### 3. Helmet (Secure Headers) ⛑️
We use **Helmet** to secure our HTTP headers. It is a collection of 14 small middleware functions that set security standards.
*   **Hides Tech Stack:** Removes the `X-Powered-By: Express` header so hackers don't know what backend we are using.
*   **Anti-Clickjacking:** Sets `X-Frame-Options: SAMEORIGIN` to prevent your site from being embedded in a malicious iframe.
*   **Anti-Sniffing:** Sets `X-Content-Type-Options: nosniff` to stop browsers from trying to guess ("sniff") the MIME type, which usually leads to XSS.
*   **Strict Transport Security (HSTS):** Forces browsers to use HTTPS (if configured).

**Actual Code (`server.js`):**
```javascript
import helmet from "helmet";
app.use(helmet()); 
```

### 4. Google OAuth Security
*   **Account Takeover Prevention:** We strictly check `email_verified: true` from the Google ID Token. We ignore client-side claims.
*   **Role Escalation:** New Google users are hardcoded to `role: 'normal'`. The controller ignores any `role` parameter in the request body.
*   **Secure Merging:** Allows Google Sign-In to link with existing email accounts only because we trust Google's verification.

**Actual Code (`userController.js` logic):**
```javascript
const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
if (!ticket.getPayload().email_verified) throw new Error("Email not verified");
```

### 5. Admin Security (RBAC)
*   **Middleware Protection:** All `/api/admin/*` routes are guarded by `isAdmin`. Non-admins get `403 Forbidden`.
*   **Audit Logging:** Critical actions (Delete User, Update Role) are logged to MongoDB with: Admin ID, Action Type, Target User, IP Address & Timestamp.
*   **Frontend Redirects:** `ProtectedRoutes` component redirects non-admins away from admin pages immediately.

**Actual Code (`middleware/authorizedUser.js`):**
```javascript
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Admin privileges are required." });
    }
};
```

### 6. Data Integrity & Payment
*   **Server-Side Price Calculation:** The server ignores prices sent by the frontend. It fetches the Product ID from the DB and calculates `Price * Quantity` itself.
*   **Point System Security:** Users cannot inject `groceryPoints: 1000000`. Points are read strictly from the DB.
*   **eSewa Security:** We do not trust the "Success" screen. The backend independently verifies every transaction with eSewa's API before marking an order as paid.

**Actual Code (`orderController.js` logic):**
```javascript
// Server calculates price
const product = await Product.findById(item.product);
const total = product.price * item.quantity;
```

### 7. File Upload Security
*   **Strict Whitelisting:** Only `.jpg`, `.jpeg`, `.png`.
*   **MIME Check:** Must match `image/jpeg` or `image/png`.
*   **Anti-Payload:** rejected names like `hack.php%00.jpg` (Null Byte) or `script.php.png` (Double Extension) to prevent RCE.

**Actual Code (`middleware/multerUpload.js`):**
```javascript
const fileFilter = (req, file, cb) => {
    // 1. Prevent Null Byte Injection
    if (file.originalname.indexOf('\0') !== -1) return cb(new Error('Malicious filename'), false);
    // 2. Double Extension Prevention
    if (/\.(php|exe|sh|bat|js)\./i.test(file.originalname)) return cb(new Error('Double extension detected'), false);
    // 3. Allowed Extensions
    if (mimetype && extname) return cb(null, true);
};
```

### 8. Two-Factor Authentication (2FA)
*   **Mechanism:** 6-digit Email OTP (10 min expiry).
*   **Anti-Spam:** Max 3 OTP requests per hour.
*   **Real-time Feedback:** Frontend shows exact "Time Remaining" for IP blocks.

**Actual Code (`userController.js`):**
```javascript
const otp = crypto.randomInt(100000, 999999).toString();
user.otp = await bcrypt.hash(otp, 10);
user.otpExpires = Date.now() + 10 * 60 * 1000;
await sendOtpEmail(user.email, otp);
```

### 9. Session Management
*   **Auto-Logout:** Frontend listens for `401 Unauthorized` and auto-clears session state.
*   **Duration:** 7 Days (via Cookie maxAge) for better UX.

**Actual Code (`api.js`):**
```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## Installation
```bash
# Backend
cd nep_grocery_api/server
npm install
npm run dev

# Frontend
cd nep_grocery_frontend
npm install
npm run dev
```

### Environment Variables (.env)
```
PORT=8081
MONGO_URL=your_mongo_url
SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```
};
```

### 🧼 Frontend Sanitization (Layer 4 Defense)
We use **DOMPurify** in React components where we must render HTML dynamically (e.g., Chatbot responses).
*   **Why?** React's `dangerouslySetInnerHTML` is, well, dangerous.
*   **Solution:** We wrap any HTML content in `DOMPurify.sanitize()` before passing it to React. This ensures that even if the backend missed something, the browser will refuse to execute scripts inside that specific block.

**Actual Code (`Chatbot.jsx`):**
```javascript
<p className="text-sm whitespace-pre-wrap" 
   dangerouslySetInnerHTML={{ 
       __html: DOMPurify.sanitize(msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) 
   }}>
</p>
```

---

## 🔐 Advanced Security Implementations

### 1. Authentication & Access Control
*   **Dual-Token System:** Supports both HttpOnly cookies (browser) and Bearer tokens (mobile/API).
*   **Rate Limiting:** IP Blocked after **10 failed attempts** in 10 mins. Returns `429 Too Many Requests`.
*   **Captcha Verification:** Server-side Google ReCAPTCHA checks to stop bot logins.
*   **Secure Email:** Prevents enumeration attacks during email updates.
*   **Smart Password Policies (NEW):**
    *   **Name Ban:** Passwords cannot contain your name (e.g., "Dipendra" cannot use "Dipendra123").
    *   **Anti-Reuse History:** You cannot reuse any of your last **5 passwords**.
    *   **Expiration Warning:** If your password is >30 days old, the system warns you to update it.

**Actual Code (`userController.js`):**
```javascript
// 1. Name Check: Password cannot contain user's name
const nameParts = user.fullName.toLowerCase().split(' ');
const isNameInPassword = nameParts.some(part => part.length > 2 && password.toLowerCase().includes(part));
if (isNameInPassword) throw new Error("Password cannot contain your name.");

// 2. History Check: Cannot reuse last 5 passwords
for (const oldHash of user.passwordHistory) {
    if (await bcrypt.compare(password, oldHash)) {
        throw new Error("You cannot reuse a recent password.");
    }
}
```

### 2. Logging & Monitoring (Winston) 🪵
We replaced standard `console.log` with **Winston** for production-grade logging.
*   **Persistence:** Logs are saved to files in `server/logs/`, unlike console logs which vanish on restart.
*   **Daily Rotation:** We use `winston-daily-rotate-file` to generate a fresh log file every day (e.g., `2026-01-09-audit.log`).
*   **Three-Layer Categorization:**
    *   `*-error.log`: **Critical Crashes** (Status 500). Needs immediate dev attention.
    *   **`*-audit.log`**: **Security Alerts** (Status 401, 403, 429). Warns about Brute Force or unauthorized access.
    *   `*-access.log`: **General Traffic** (Status 200). Used for analytics and debugging paths.
*   **Security:**
    *   **Sanitization:** The logger automatically redacts sensitive fields like `password` or `token` from the logs.
    *   **GitIgnore:** The `logs/` folder is excluded from GitHub to prevent data leakage.

**Actual Code (`utils/logger.js`):**
```javascript
new winston.transports.DailyRotateFile({
    filename: 'logs/%DATE%-audit.log',
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxFiles: '90d' // Keep logs for 90 days
})
```

### 3. Helmet (Secure Headers) ⛑️
We use **Helmet** to secure our HTTP headers. It is a collection of 14 small middleware functions that set security standards.
*   **Hides Tech Stack:** Removes the `X-Powered-By: Express` header so hackers don't know what backend we are using.
*   **Anti-Clickjacking:** Sets `X-Frame-Options: SAMEORIGIN` to prevent your site from being embedded in a malicious iframe.
*   **Anti-Sniffing:** Sets `X-Content-Type-Options: nosniff` to stop browsers from trying to guess ("sniff") the MIME type, which usually leads to XSS.
*   **Strict Transport Security (HSTS):** Forces browsers to use HTTPS (if configured).

**Actual Code (`server.js`):**
```javascript
import helmet from "helmet";
app.use(helmet()); 
```

### 4. Google OAuth Security
*   **Account Takeover Prevention:** We strictly check `email_verified: true` from the Google ID Token. We ignore client-side claims.
*   **Role Escalation:** New Google users are hardcoded to `role: 'normal'`. The controller ignores any `role` parameter in the request body.
*   **Secure Merging:** Allows Google Sign-In to link with existing email accounts only because we trust Google's verification.

**Actual Code (`userController.js` logic):**
```javascript
const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
if (!ticket.getPayload().email_verified) throw new Error("Email not verified");
```

### 5. Admin Security (RBAC)
*   **Middleware Protection:** All `/api/admin/*` routes are guarded by `isAdmin`. Non-admins get `403 Forbidden`.
*   **Audit Logging:** Critical actions (Delete User, Update Role) are logged to MongoDB with: Admin ID, Action Type, Target User, IP Address & Timestamp.
*   **Frontend Redirects:** `ProtectedRoutes` component redirects non-admins away from admin pages immediately.

**Actual Code (`middleware/authorizedUser.js`):**
```javascript
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Admin privileges are required." });
    }
};
```

### 6. Data Integrity & Payment
*   **Server-Side Price Calculation:** The server ignores prices sent by the frontend. It fetches the Product ID from the DB and calculates `Price * Quantity` itself.
*   **Point System Security:** Users cannot inject `groceryPoints: 1000000`. Points are read strictly from the DB.
*   **eSewa Security:** We do not trust the "Success" screen. The backend independently verifies every transaction with eSewa's API before marking an order as paid.

**Actual Code (`orderController.js` logic):**
```javascript
// Server calculates price
const product = await Product.findById(item.product);
const total = product.price * item.quantity;
```

### 7. File Upload Security
*   **Strict Whitelisting:** Only `.jpg`, `.jpeg`, `.png`.
*   **MIME Check:** Must match `image/jpeg` or `image/png`.
*   **Anti-Payload:** rejected names like `hack.php%00.jpg` (Null Byte) or `script.php.png` (Double Extension) to prevent RCE.

**Actual Code (`middleware/multerUpload.js`):**
```javascript
const fileFilter = (req, file, cb) => {
    // 1. Prevent Null Byte Injection
    if (file.originalname.indexOf('\0') !== -1) {
        const error = new Error('Malicious filename detected');
        error.statusCode = 400;
        return cb(error, false);
    }
    // 2. Double Extension Prevention
    if (/\.(php|exe|sh|bat|js)\./i.test(file.originalname)) {
        const error = new Error('Double extension detected');
        error.statusCode = 400;
        return cb(error, false);
    }
    // 3. Allowed Extensions
    if (mimetype && extname) return cb(null, true);
};
```

### 8. Two-Factor Authentication (2FA)
*   **Mechanism:** 6-digit Email OTP (10 min expiry).
*   **Anti-Spam:** Max 3 OTP requests per hour.
*   **Real-time Feedback:** Frontend shows exact "Time Remaining" for IP blocks.

**Actual Code (`userController.js`):**
```javascript
const otp = crypto.randomInt(100000, 999999).toString();
user.otp = await bcrypt.hash(otp, 10);
user.otpExpires = Date.now() + 10 * 60 * 1000;
await sendOtpEmail(user.email, otp);
```

### 9. Session Management
*   **Auto-Logout:** Frontend listens for `401 Unauthorized` and auto-clears session state.
*   **Duration:** 7 Days (via Cookie maxAge) for better UX.

**Actual Code (`api.js`):**
```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## 🚀 Getting Started

### Installation
```bash
# Backend
cd nep_grocery_api/server
npm install
npm run dev

# Frontend
cd nep_grocery_frontend
npm install
npm run dev
```

### Environment Variables (.env)
```
PORT=8081
MONGO_URL=your_mongo_url
SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

## CSRF Protection
Effective protection against Cross-Site Request Forgery (CSRF) is implemented through a combination of strict Cross-Origin Resource Sharing (CORS) policies and a JSON-only API architecture.
- **Strict CORS Policy**: The server explicitly validates the Origin header of incoming requests, allowing access only from trusted domains (the frontend application and local network). Requests from unauthorized origins are blocked immediately.
- **JSON-Only API**: The application accepts only pplication/json payloads. Since standard HTML forms cannot send JSON, and browser security policies require a preflight (OPTIONS) request for cross-origin JSON calls (which the CORS policy blocks), malicious sites cannot execute commands on behalf of the user.
- **SameSite Cookie Attribute**: Session cookies are configured with `SameSite=Lax` (or `None` in production with Secure flag), providing an additional layer of defense against cross-site request forgery.

## UUID Implementation
In the payment system, we have replaced standard timestamp-based IDs with **UUID v4 (Universally Unique Identifier)** to ensure cryptographic uniqueness for transaction records.
- **Library Used**: `uuid` (Version 4)
- **Why**: Using `Date.now()` allows for potential collisions in high-traffic scenarios and makes order IDs guessable. UUID v4 generates a random 128-bit value, making transaction IDs unique and secure against enumeration attacks.
- **Implementation**: `import { v4 as uuidv4 } from 'uuid'; const transaction_uuid = 'hg-' + uuidv4();`

## End-to-End HTTPS Encryption
The NepGrocery system enforces **End-to-End Encryption (E2EE)** using **SSL/TLS protocols** across the entire application stack. Both the React frontend and the Node.js backend are configured to serve content exclusively over **HTTPS**, utilizing custom-generated **X.509 certificates** (Organization: NepGrocery). This architecture establishes a secure, encrypted tunnel for all network traffic, strictly preventing **Man-in-the-Middle (MitM) attacks** and ensuring that sensitive payloadsâ€”such as user credentials, session tokens, and payment dataâ€”remain confidential and tamper-proof during transit.


