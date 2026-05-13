# Repository Structure

```
├── app
│   ├── admin
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   └── login
│   │       └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   ├── auth
│   │   │   │   ├── login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout
│   │   │   │   │   └── route.ts
│   │   │   │   └── me
│   │   │   │       └── route.ts
│   │   │   ├── onboarding-links
│   │   │   │   └── route.ts
│   │   │   └── students
│   │   │       └── route.ts
│   │   ├── alumni
│   │   │   └── batchmates
│   │   │       └── route.ts
│   │   ├── auth
│   │   │   ├── complete-profile
│   │   │   │   └── route.ts
│   │   │   ├── login
│   │   │   │   ├── verify
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   ├── me
│   │   │   │   └── route.ts
│   │   │   └── signup
│   │   │       └── route.ts
│   │   ├── messages
│   │   │   └── create
│   │   │       └── route.ts
│   │   └── users
│   │       ├── [userId]
│   │       │   └── route.ts
│   │       └── search
│   │           └── route.ts
│   ├── dashboard
│   │   └── page.tsx
│   ├── login
│   │   └── page.tsx
│   ├── profile
│   │   └── [userId]
│   │       └── page.tsx
│   ├── search
│   │   └── page.tsx
│   ├── signup
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button-group.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── post-card.tsx
│   ├── post-form.tsx
│   └── theme-provider.tsx
├── hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib
│   ├── admin-auth.ts
│   ├── auth-provider.tsx
│   ├── auth.ts
│   ├── email.ts
│   ├── otp.ts
│   ├── prisma.ts
│   ├── protected-route.tsx
│   └── utils.ts
├── prisma
│   └── schema.prisma
├── public
│   ├── icon.png
│   ├── placeholder-user.jpg
│   └── placeholder.svg
├── store
│   ├── admin.store.ts
│   └── auth.store.ts
├── styles
│   └── globals.css
├── .gitignore
├── bun.lock
├── components.json
├── db.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── prisma.config.ts
├── README.md
└── tsconfig.json
```