martfleet_firebase/
│
├── 📄 firebase.json
├── 📄 .firebaserc
├── 📄 firestore.rules
├── 📄 storage.rules
├── 📄 manifest.json
├── 📄 service-worker.js
├── 📄 sw.js
├── 📄 firebase-config.js
├── 📄 .gitignore
├── 📄 README.md
│
└── 📁 public/
    │
    ├── 📁 templates/
    │   ├── 📄 base.html
    │   ├── 📄 index.html
    │   ├── 📄 about.html
    │   ├── 📄 contact.html
    │   │
    │   ├── 📁 auth/
    │   │   ├── 📄 login.html
    │   │   ├── 📄 register.html
    │   │   ├── 📄 register_owner.html 
    │   │   ├── 📄 register_driver.html 
    │   │   ├── 📄 forgot_password.html 
    │   │   ├── 📄 reset_password.html 
    │   │   └── 📄 reset_success.html 
    │   │
    │   ├── 📁 owner/
    │   │   ├── 📄 dashboard.html 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 list.html 
    │   │   │   ├── 📄 add.html 
    │   │   │   └── 📄 detail.html 
    │   │   ├── 📁 drivers/
    │   │   │   ├── 📄 list.html 
    │   │   │   ├── 📄 approvals.html 
    │   │   │   └── 📄 detail.html 
    │   │   ├── 📁 finances/
    │   │   │   ├── 📄 deposits.html 
    │   │   │   └── 📄 reports.html 
    │   │   └── 📄 settings.html 
    │   │
    │   ├── 📁 driver/
    │   │   ├── 📄 dashboard.html 
    │   │   ├── 📁 checklist/
    │   │   │   ├── 📄 daily.html 
    │   │   │   └── 📄 history.html 
    │   │   ├── 📁 deposits/
    │   │   │   ├── 📄 make.html 
    │   │   │   └── 📄 history.html 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 available.html 
    │   │   │   └── 📄 current.html 
    │   │   └── 📄 profile.html 
    │   │
    │   └── 📁 partials/
    │       ├── 📄 header.html
    │       ├── 📄 sidebar_owner.html 
    │       ├── 📄 sidebar_driver.html 
    │       ├── 📄 footer.html
    │       ├── 📄 notifications.html
    │       ├── 📄 modals.html 
    │       └── 📄 vehicle_card.html 
    │
    ├── 📁 css/ (✅ ESTRUTURA COMPLETA MANTIDA)
    │   ├── 📄 main.css
    │   ├── 📄 utilities.css
    │   ├── 📄 responsive.css
    │   ├── 📄 about.css
    │   ├── 📄 contact.css
    │   │
    │   ├── 📁 auth/ (✅ TODOS OS ARQUIVOS MANTIDOS)
    │   │   ├── 📄 login.css
    │   │   ├── 📄 register.css
    │   │   ├── 📄 register_owner.css 
    │   │   ├── 📄 register_driver.css 
    │   │   └── 📄 password_reset.css
    │   │
    │   ├── 📁 owner/ (✅ ESTRUTURA COMPLETA)
    │   │   ├── 📄 dashboard.css 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 list.css 
    │   │   │   ├── 📄 add.css 
    │   │   │   └── 📄 detail.css 
    │   │   ├── 📁 drivers/
    │   │   │   ├── 📄 list.css 
    │   │   │   ├── 📄 approvals.css 
    │   │   │   └── 📄 detail.css 
    │   │   ├── 📁 finances/
    │   │   │   ├── 📄 deposits.css 
    │   │   │   └── 📄 reports.css 
    │   │   └── 📄 settings.css 
    │   │
    │   ├── 📁 driver/ (✅ ESTRUTURA COMPLETA)
    │   │   ├── 📄 dashboard.css 
    │   │   ├── 📁 checklist/
    │   │   │   ├── 📄 daily.css 
    │   │   │   └── 📄 history.css 
    │   │   ├── 📁 deposits/
    │   │   │   ├── 📄 make.css 
    │   │   │   └── 📄 history.css 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 available.css 
    │   │   │   └── 📄 current.css 
    │   │   └── 📄 profile.css 
    │   │
    │   └── 📁 components/
    │       ├── 📄 forms.css
    │       ├── 📄 tables.css
    │       ├── 📄 cards.css
    │       ├── 📄 buttons.css
    │       ├── 📄 modals.css
    │       └── 📄 notifications.css
    │
    ├── 📁 js/ (✅ ESTRUTURA COMPLETA MANTIDA)
    │   ├── 📄 main.js
    │   ├── 📄 utils.js
    │   ├── 📄 about.js
    │   ├── 📄 contact.js
    │   │
    │   ├── 📁 auth/ (✅ TODOS OS ARQUIVOS MANTIDOS)
    │   │   ├── 📄 login.js
    │   │   ├── 📄 register.js
    │   │   ├── 📄 register_owner.js 
    │   │   ├── 📄 register_driver.js 
    │   │   └── 📄 password_reset.js
    │   │
    │   ├── 📁 owner/ (✅ ESTRUTURA COMPLETA)
    │   │   ├── 📄 dashboard.js 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 list.js 
    │   │   │   ├── 📄 add.js 
    │   │   │   └── 📄 detail.js 
    │   │   ├── 📁 drivers/
    │   │   │   ├── 📄 list.js 
    │   │   │   ├── 📄 approvals.js 
    │   │   │   └── 📄 detail.js 
    │   │   ├── 📁 finances/
    │   │   │   ├── 📄 deposits.js 
    │   │   │   └── 📄 reports.js 
    │   │   └── 📄 settings.js 
    │   │
    │   ├── 📁 driver/ (✅ ESTRUTURA COMPLETA)
    │   │   ├── 📄 dashboard.js 
    │   │   ├── 📁 checklist/
    │   │   │   ├── 📄 daily.js 
    │   │   │   └── 📄 history.js 
    │   │   ├── 📁 deposits/
    │   │   │   ├── 📄 make.js 
    │   │   │   └── 📄 history.js 
    │   │   ├── 📁 vehicles/
    │   │   │   ├── 📄 available.js 
    │   │   │   └── 📄 current.js 
    │   │   └── 📄 profile.js 
    │   │
    │   ├── 📁 components/
    │   │   ├── 📄 charts.js
    │   │   ├── 📄 file_upload.js
    │   │   ├── 📄 notifications.js
    │   │   ├── 📄 modals.js
    │   │   └── 📄 forms.js
    │   │
    │   └── 📁 lib/
    │       ├── 📄 chart_loader.js
    │       └── 📄 image_processor.js
    │
    ├── 📁 assets/ (✅ ESTRUTURA COMPLETA + ÍCONES PWA)
    │   ├── 📁 img/
    │   │   ├── 📄 logo.png
    │   │   ├── 📄 favicon.ico
    │   │   ├── 📄 avatar_default.png
    │   │   ├── 📄 vehicle_placeholder.jpg
    │   │   ├── 📄 about_team.jpg
    │   │   └── 📄 contact_map.jpg
    │   └── 📁 icons/
    │       ├── 📄 success.svg
    │       ├── 📄 warning.svg
    │       ├── 📄 error.svg
    │       ├── 📄 icon-192x192.png (🆕 PWA)
    │       ├── 📄 icon-512x512.png (🆕 PWA)
    │       └── 📄 maskable-icon.png (🆕 PWA)
    │
    └── 📁 uploads/ (✅ ESTRUTURA MANTIDA PARA FIREBASE STORAGE)
        ├── 📁 vehicles/
        ├── 📁 checklists/
        ├── 📁 documents/
        └── 📁 profiles/