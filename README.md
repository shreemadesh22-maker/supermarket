# FreshMart — Phase 1: Frontend

This folder contains the frontend only. It is a static HTML/CSS/JavaScript preview.

## Folder structure

```text
supermart-phase1-frontend/
├── index.html
├── login.html
├── register.html
├── home.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Run the website

### Option 1: Open directly
Double-click `index.html` to open it in your browser.

### Option 2: VS Code Live Server
1. Open this folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

The site will open at an address similar to `http://127.0.0.1:5500`.

## Pages
- `index.html` — landing page
- `login.html` — login form
- `register.html` — registration form
- `home.html` — static dummy supermarket homepage

## Important: current phase scope
This is only Phase 1. The login and registration forms do not authenticate users or save credentials yet. Their frontend validation and messages are placeholders. In Phase 2, we will build the Node.js/Express backend. In Phase 3, we will connect the backend to SQLite. Passwords must be hashed before storage; never store plain-text passwords.

No product search, categories, cart, or checkout features are included.
