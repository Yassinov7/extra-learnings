# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 📚 نظام إدارة الدورات التعليمية (LMS)

تطبيق ويب لبناء دورات، مشاركة المحتوى، إجراء اختبارات، وتتبع تقدم الطلاب.

## 🧰 التقنيات المستخدمة

- 🟧 React + Vite
- 🧪 Supabase (قاعدة البيانات + المصادقة)
- 💨 TailwindCSS
- 📦 React Hook Form

## 🚀 بدء التشغيل محليًا

```bash
git clone https://github.com/Yassinov7/extra-learning.git
cd REPO_NAME
npm install
cp .env.example .env
# ثم ضع بيانات Supabase الخاصة بك داخل .env
npm run dev
