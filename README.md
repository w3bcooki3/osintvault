<p align="center">
  <img src="https://raw.githubusercontent.com/w3bcooki3/osintvault/main/favicon.png" alt="OSINTVault Logo" width="150"/>
</p>

<h1 align="center">
  <img src="https://raw.githubusercontent.com/w3bcooki3/osintvault/main/favicon.png" width="40" style="vertical-align: middle; margin-right: 10px;"/>
  OSINTVault: Your Private OSINT Workspace 🕵️‍♂️
</h1>

<p align="center">
  <i>"Navigate the digital shadows. Keep your intelligence secured. Analyze with precision."</i>
</p>

<p align="center">
  <a href="https://w3bcooki3.github.io/osintvault/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Launch%20App-%23007bff?style=for-the-badge&logo=appveyor&logoColor=white" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge&logo=github&logoColor=white" alt="Status: Active">
  <img src="https://img.shields.io/badge/License-Evaluation%20Only-yellow.svg?style=for-the-badge&logo=opensource&logoColor=white" alt="License: Evaluation Only">
  <img src="https://img.shields.io/badge/Privacy-Local%20Storage%20Only-orange?style=for-the-badge&logo=keybase&logoColor=white" alt="Privacy: Local Storage Only">
</p>

---

## 🚀 About OSINTVault

OSINTVault is a powerful, client-side, single-page web application meticulously crafted with HTML, CSS, and JavaScript. Designed for cybersecurity analysts, threat intelligence professionals, investigators, and enthusiasts, it provides a secure and organized environment to manage every aspect of your Open Source Intelligence (OSINT) operations directly within your browser.

Forget fragmented notes and scattered tools. OSINTVault centralizes your efforts, offering robust features for data collection, analysis, and reporting, all while prioritizing your privacy by storing all data exclusively in your local browser storage.

---

### ⚠️ **Important Note: Demo Product & Future Plans**

Please be aware that this version of OSINTVault is a **demonstration product**. It showcases core functionalities and a conceptual design. While it is fully functional and can be used by anyone, it is currently in active development. Your feedback and comments are highly valued and will directly contribute to its evolution!

I am also actively working on a **browser extension** designed to seamlessly integrate with OSINTVault. This extension will make it easier to collect information directly from web pages, store it in a temporary "collection vault," which can then be easily exported and imported into your main OSINTVault application, automatically organizing data within your user-created custom investigation vaults.

---

## ✨ Key Features

OSINTVault packs a punch with a suite of integrated modules designed for efficiency and control:

### 🔒 **Privacy-First Data Management**
* **100% Client-Side:** All your sensitive investigation data (entries, notes, dorks, custom vaults, audit logs) is stored **only in your browser's local storage**. It never leaves your device.
* **No Backend, No Cloud:** Absolute control over your data, ensuring maximum privacy and preventing third-party access.

### 💾 **Robust Import & Export**
* **Comprehensive Data Backup:** Easily **export all your app data** as a single JSON, HTML, or plain text file. Essential for backups, data migration, or sharing.
* **Seamless Import:** Effortlessly **import data** back into your workspace, whether it's a full backup or specific categories (tools, notes, dorks, case studies).

### 🗃️ **Intelligence Vault & Multi-Vaults**
* **Categorized Tool Arsenal:** Manage your favorite OSINT tools, categorized into specialized intelligence areas (e.g., Email Investigations, DarkWeb, Threat Intel, Network Analysis). Pre-populated with industry-standard tools for a quick start.
* **Custom Investigation Vaults:** Create **personalized vaults** for each investigation with custom names, icons, and color-coding.
* **Diverse Entry Types:** Log findings across a comprehensive range of intelligence types:
    * `Tools`, `Emails`, `Phone Numbers`, `Crypto Transactions`
    * `Locations`, `General Links`, `Media (Images/Videos/Audio)`, `Passwords`, `Keywords`, `Social Media Profiles`, `Domains/IPs/URLs`, `Usernames/Handles`.
    * `Threat Intelligence (Threats, Vulnerabilities, Malware, Breaches, Credentials)`, `Forums`, `Vendors`, `Telegram Channels`, `Paste Sites`, `Documents`, `Network Analysis`, `Metadata`, `Archives`.
    * `Messaging Apps`, `Dating Profiles`, `Facial Recognition`, `Personas/Identities`, `VPNs/Anonymity Tools`, `Honeypot Data`, `Exploits`, `Public Records`.
* **Cross-Linking:** Assign entries to multiple custom vaults for flexible organization.
* **Smart Organization:** Add custom tags and detailed notes to any entry.
* **Quick Prioritization:** Star and pin critical entries for immediate access.

### 🔍 **Advanced Search & Filtering**
* **Global Search:** Find anything across current tabs, specific vaults, or your entire dataset.
* **Dynamic Filters:** Filter by category, pinned/starred status.
* **Flexible Sorting:** Arrange your data by name, recently added, or most used.

### 🧠 **Dork Assistant**
* **Interactive Query Playground:** Craft powerful search queries with a live preview and intuitive operator buttons.
* **Multi-Engine Support:** Generate dorks for `Google`, `Bing`, `DuckDuckGo`, `Yandex`, and specialized platforms like `Shodan` and `Censys`.
* **Syntax Conversion:** Automatically convert queries between general search engine syntax and specialized Shodan/Censys formats.
* **Curated Templates:** Utilize a library of pre-built dork templates categorized for common OSINT scenarios (e.g., Exposed Documents, Admin Login Pages, IoT Devices, Social Media, SQL Errors, CVE PoCs, Shodan/Censys specific queries).
* **Saved Queries:** Store and reuse your custom-built dorks.
* **Warnings:** Get alerts for potential query format mismatches with selected engines.

### 📈 **Analytics Dashboard**
* **Activity Overview:** Get a snapshot of your workspace with total entries, active vaults, and daily/weekly activity.
* **Visual Insights:** Interactive charts powered by Chart.js display:
    * Entries by Type (Pie Chart), Entry Activity Trend (Line Chart), Tools by Category (Bar Chart), Pinned & Starred Entries (Doughnut Chart), Entries in Custom Vaults (Bar Chart), and Tagging Distribution (Doughnut Chart).
* **Top Lists:** Discover your Most Used Entries, Never Used Entries, and Entries Added Per Week.
* **Detailed Breakdown:** Count of starred and pinned entries broken down by type (tools, emails, domains, etc.).

### 📒 **OSINT Handbook + My Notes**
* **Personalized Handbook:** An editable, structured knowledge base for OSINT techniques. Add, edit, and delete sections, include rich-text content, and embed copyable code blocks.
* **Integrated Notes:** Take detailed, rich-text notes during your investigations, complete with tags and pinning for quick retrieval. All notes are stored securely in your local browser storage.

### 📚 **Case Studies & Articles**
* **Resource Library:** Curate a collection of OSINT-related articles, reports, and case studies.
* **Auto-Grab Content:** Effortlessly fetch preview summaries from external links (uses a CORS proxy).
* **Preview & Read:** Quick modal previews with personal notes before redirecting to the full article.
* **Categorization:** Organize case studies by categories like Threat Intelligence, Breach Analysis, Malware Analysis, Financial OSINT, etc., with support for custom categories.
* **Search & Filter:** Find case studies by title, source, author, content, or tags.
* **Star & Pin:** Highlight important case studies.

### 📊 **Activity Audit Log (NEW!)**
* **Comprehensive Tracking:** A dedicated tab to view a detailed log of all key actions within the application (creation, updates, deletions, imports, exports, system events).
* **Actionable Insights:** Filter logs by date range, action type, and category, or search for specific activities.
* **Auditability:** Maintain a record of changes for personal accountability or reporting.

### 🌐 **Other Enhancements**
* **Adaptive & Responsive Design:** Optimized for various screen sizes, providing a seamless experience from mobile to desktop.
* **Dynamic Theming:** Instantly switch between a sleek Dark Mode and a crisp Light Mode.
* **Secure Sharing:** Generate temporary, **read-only URLs** to share specific tabs, custom vaults, or your entire collection without compromising your local data.
* **Visual Cues:** Automatic favicon fetching for external links and subtle design elements that enhance usability.

---

## 🐞 Known Issues

I am continuously working to improve OSINTVault! Here are some known areas currently under development or review:

1.  **Responsiveness Challenges:** Certain parts of the application may not be fully responsive across all device sizes or orientations.
2.  **Share Link Functionality:** The generated share links may not work consistently for all features or data subsets.
3.  **Audit Log Persistence:** Audit logs currently clear on browser refresh. A fix to ensure persistent storage is actively being worked on.
4.  **Global Filter Scope:** The "Quick Actions and Filters" (Pin/Star/Show All) currently apply only to the "Intelligence Vault" tab. Future updates will extend this functionality to all navigation tabs.
5.  **"My Notes" Saving Behavior:** Notes may be unintentionally saved when attempting to create a new note, even if the "Cancel" action is triggered.
6.  **Dork Assistant Notifications:** Certain actions within the "Dork Assistant" may trigger duplicate or multiple toast notifications for a single action.
7.  **Global Search:** Global Search does not work in OSINT Handbook and Docs Section.

---

## 🛣️ Content Roadmap / Future Enhancements

While the application provides robust core features, the current content is primarily for demonstration purposes. Future updates will focus on:

* **Expanding Default Content:** Adding a wider range of pre-populated tools, more detailed case studies, and extensive OSINT handbook documentation.
* **Refining Existing Features:** Continuous improvements to existing functionalities based on user feedback and best practices.
* **Browser Extension Integration:** Development of a browser extension to facilitate easier information collection directly from web pages into a temporary "collection vault," with export and organized import into your main OSINTVault application.

---

## 📄 License: Evaluation Use Only

This software is provided "as is" for **personal evaluation, testing, and feedback purposes only.**

* **Commercial Use is Strictly Prohibited:** You may not use this software, or any derivative works created from it, for any commercial purpose, including but not limited to selling, licensing, or incorporating it into a commercial product or service.
* **No Commercial Derivative Works:** You may not create or distribute derivative works of this software for commercial gain.
* **Feedback Encouraged:** Your feedback is highly valued and will directly contribute to the development of a future professional version.

For any inquiry, please contact me via the methods listed in the "Contact" section below.

---

## 🛠️ Tech Stack

* **HTML:** Structuring the core application.
* **CSS:** Modern styling, responsive design, and animations.
* **JavaScript (Vanilla):** All core logic, state management, and interactivity.
* **Chart.js:** For dynamic data visualizations on the dashboard.
* **Font Awesome:** A comprehensive icon library for visual cues.
* **LocalStorage:** The sole data persistence layer, emphasizing privacy.

---

## 🚀 Getting Started

To get your personal OSINT workspace up and running:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/w3bcooki3/osintvault.git](https://github.com/w3bcooki3/osintvault.git)
    ```
2.  **Navigate to the Directory:**
    ```bash
    cd osintvault
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser. No server setup is required!

Your OSINTVault will load, initialized with default tools and data, ready for your investigations.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to reach out on [LinkedIn](https://bit.ly/hirahul).

---

## 📧 Contact

**w3bcooki3** - [LinkedIn](https://bit.ly/hirahul)

Project Link: [https://github.com/w3bcooki3/osintvault](https://bit.ly/hirahul)

---

<p align="center">
  <br>
  <i>"Knowledge is Power. OSINTVault helps you wield it."</i>
</p>
