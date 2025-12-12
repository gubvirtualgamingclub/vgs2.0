<div align="center">

  <img src="public/logos/club-logo.png" alt="VGS Logo" width="120" height="auto" />

# Varsity Gaming Society (VGS) 2.0

**The Ultimate Community Platform for Gamers, by Gamers.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](https://vgs.green.edu.bd)

[Features](#-features) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 🚀 Overview

**VGS 2.0** is a state-of-the-art web platform engineered for modern university gaming societies. It bridges the gap between casual gaming and competitive esports management. Built with a focus on performance, aesthetics, and ease of use, VGS 2.0 empowers administrators to manage tournaments, members, and events while providing players with a stunning, immersive interface.

> "More than just a website; it's the digital headquarters of our gaming community."

---

## ✨ Features

### 🎮 For Gamers & Members

- **Immersive Battle Arena**: A dynamic tournament hub showcasing active, upcoming, and past esports events.
- **Live Registration**: Seamless team registration with real-time slot tracking and status updates.
- **Hall of Fame**: Detailed profiles for committee members and top players, including role history and social links.
- **Event Calendar**: Interactive timeline of workshops, seminars, and gaming sessions.
- **Sponsor Showcase**: Premium visibility for partners with tiered displays (Platinum, Gold, Silver).

### 🛠️ For Administrators

- **Powerful Admin Panel**: A secure, mobile-responsive dashboard to manage every aspect of the platform.
- **Drag & Drop Management**: Intuitive reordering for committee members and sponsors.
- **Email Command Center**: Built-in system to send personalized bulk emails to hundreds of participants in seconds.
- **Dynamic Form Builder**: Create custom registration forms for any game title without writing a single line of code.
- **Content Control**: Real-time publish/unpublish toggles for updates, events, and games.

---

## 🛠️ Tech Stack

Built on a foundation of modern, scalable technologies:

| Layer         | Technology                                                                                |
| ------------- | ----------------------------------------------------------------------------------------- |
| **Frontend**  | [Next.js 14 (App Router)](https://nextjs.org/), [React 18](https://react.dev/)            |
| **Language**  | [TypeScript](https://www.typescriptlang.org/) (Strict Mode)                               |
| **Styling**   | [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend**   | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)                           |
| **Utilities** | `@dnd-kit` (Drag & Drop), `react-hook-form` (Forms), `lucide-react` (Icons)               |

---

## ⚡ Getting Started

Run the VGS 2.0 platform locally in minutes.

### Prerequisites

- Node.js 18.17+
- npm or pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-org/vgs-2.0.git
    cd vgs-2.0
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Initialize Database**
    Run the SQL scripts located in the `database/` folder in your Supabase SQL Editor:

    - `database/01_schema.sql` (Creates tables)
    - `database/02_seeds.sql` (Populates initial data)

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📚 Documentation

Comprehensive guides are available in the `docs/` directory:

- 📖 **[User & Admin Manual](docs/01_USER_MANUAL.md)**

  - _Best for: Administrators, Moderators, Content Creators_
  - How to manage tournaments, send emails, and update content.

- 💻 **[Developer Reference](docs/02_DEVELOPER_MANUAL.md)**
  - _Best for: Developers, DevOps, System Architects_
  - Database schema, API architecture, and deployment instructions.

---

## 📸 Screenshots

<details>
<summary><b>Click to view Dashboard Preview</b></summary>

> _Place a screenshot of your Admin Dashboard here_

</details>

<details>
<summary><b>Click to view Tournament Page Preview</b></summary>

> _Place a screenshot of your Tournament Page here_

</details>

---

## 🤝 Contributing

We welcome contributions! Please see our [Developer Manual](docs/02_DEVELOPER_MANUAL.md) for architectural guidelines.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>To learn more about the <b>Varsity Gaming Society</b>, visit our <a href="https://vgs.green.edu.bd">official website</a>.</p>
  
  <p>
    <sub>Built with ❤️ by the VGS Development Team</sub>
  </p>
</div>
