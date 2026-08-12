# Guff Design System & Architecture Steering Document

This steering document establishes the mandatory visual design, UI component structure, and code conventions for **Guff** (Real-time Messenger & Social Discovery App).

---

## 1. Visual Design Principles & Aesthetics (2026 Apple Liquid Glass)

- **Mobile-First Responsive Architecture**:
  - Flexbox layouts for mobile dynamic height (`100dvh`).
  - CSS Grid (`desktop-app-grid`) for desktop (3 columns: Left Navigation Rail, Center Feed Area max 700px, Right Panel).
- **Glassmorphism Everywhere**:
  - Surface backgrounds: `rgba(28, 28, 30, 0.65)` to `rgba(255, 255, 255, 0.08)`.
  - Backdrop Filter: `blur(30px)` to `blur(40px)`.
  - Borders: Subtle `rgba(255, 255, 255, 0.12)`.
  - Soft Box Shadows: `0 12px 40px rgba(0, 0, 0, 0.35)`.
- **Apple Liquid Glass Navigation Bar**:
  - Mobile: Bottom floating pill (`height: 72px`, `radius: 36px`, `18px from bottom`, `92% width` centered).
  - Selected tab: Filled icon with Apple Blue (`#0A84FF`) glow.
  - Inactive tabs: Soft Gray (`var(--text-secondary-dark)`).
- **Primary Color Palette**:
  - Apple Blue: `#0A84FF`
  - Apple Green: `#30D158`
  - Apple Purple: `#BF5AF2`
  - Apple Orange: `#FF9F0A`
  - Apple Pink: `#FF375F`
  - Apple Cyan: `#64D2FF`

---

## 2. User Profiles & Direct Messaging Standards (For Every User)

1. **User Profile Modal Inspection (`UserProfileModal.jsx`)**:
   - Any member (guest or logged-in) can click on ANY user's avatar or display name across the app (Feed, Chat, Search, Right Panel, Admin Dashboard) to view their profile.
   - Profile card displays Cover Photo, Avatar, Full Name, Role Badge, Bio, and Stats (Posts, Followers, Following).
2. **Direct Private Messaging (1-on-1 DMs)**:
   - Includes a direct **Message (💬)** action button on every user profile card and admin directory table row.
   - Clicking **Message** generates a private 1-on-1 chat channel (`dm_user1_user2`) and opens the Live Messages thread instantly.
3. **Real Follow / Unfollow System**:
   - Real-time `toggleFollow(targetUserId, targetUserName)` state handler.
   - Updates following list with live button state ("Follow" vs "Following ✓") and toast feedback.

---

## 3. Component & Admin Table Standards

1. **Scrollable Admin Data Tables**:
   - All data tables (such as `AdminDashboard.jsx`) must be wrapped in a horizontally scrollable container (`overflowX: "auto"`) with a minimum width (`minWidth: "850px"`).
   - Ensures all columns (User Profile, Email, Role, Status, Action Buttons: View Profile 👁️, Message 💬, Edit ✏️, Delete 🗑️) remain fully visible without getting clipped or hidden.
2. **Touch Targets**: All interactive buttons, inputs, and tab triggers must have a minimum tap target of `44px x 44px`.
3. **Buttons (`.apple-btn`)**:
   - `apple-btn-primary`: Linear gradient `#0A84FF` to `#64D2FF`, white text, glow shadow.
   - `apple-btn-glass`: Glass surface `rgba(255, 255, 255, 0.08)`, backdrop blur `20px`.
4. **Form Inputs (`.form-input`)**:
   - Glass pill inputs (`height: 46px-52px`, `border-radius: var(--radius-pill)` or `var(--radius-md)`).
   - Border focus transition with `#0A84FF` highlight.
5. **Icons**:
   - Use `lucide-react` icons (sized `18px` to `24px`).
   - Icon buttons must be flex-centered (`display: flex`, `align-items: center`, `justify-content: center`).

---

## 4. Data Flow & Zero LocalStorage Rule

- **Zero LocalStorage Usage**: State is maintained in pure React memory and synced directly with **Firebase Cloud Firestore (`db`) and Firebase Auth (`auth`)**.
- **Automatic Payload Compression**: High-resolution screenshots and photos are automatically compressed via HTML5 Canvas (`compressImage`) to keep Base64 payloads under ~40KB before sending to Cloud Firestore.
