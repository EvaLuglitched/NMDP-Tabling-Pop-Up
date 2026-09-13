# NMDP Tabling Pop-Up Campaign & Interactive Portal
### UC Berkeley MDes × NMDP Blood & Pediatric Cancer Awareness Drive (Sept 21, 2026)

An interactive, multi-channel campaign experience featuring a responsive visual invitation poster, dynamic QR code tracking system, campus pledge registration portal, and real-time analytics dashboard.

---

## 🚀 1-Click Deploy to Vercel via GitHub

This project is pre-configured with `vercel.json` and a Serverless Function entry point in `/api/index.ts` for zero-configuration deployment on Vercel.

### Steps:
1. **Push this repository to GitHub**:
   - In AI Studio, click the top-right Settings menu -> **Export to GitHub** (or push using git CLI).
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **Add New...** -> **Project**.
   - Select this GitHub repository.
3. **Deployment Configuration** (Auto-detected):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Click Deploy**:
   - Within 1–2 minutes, Vercel will provide your live production URL (e.g., `https://your-campaign.vercel.app`).
   - Anyone on campus can scan the QR codes or open the link directly **without requiring any Google login**!

---

## 📱 Features & Architecture

### 1. Ethereal Device Showcase & Invitation Studio
- **Reference Aesthetic**: Translucent frosted glass layers, misty twilight cerulean gradients, and the cellular blossom life emblem.
- **Dynamic QR Generation**: QR codes automatically encode your current domain (e.g. `your-domain.vercel.app`) with location-specific UTM parameters:
  - Outside Amazon Hub Locker (`amazon_hub_flyer`)
  - Sproul Plaza Posters (`campus_poster_sproul`)
  - Moffitt Library Study Hall Tables (`moffitt_library_table`)
  - Digital Social / MDes Slack (`mdes_slack`)
- **Print Mode**: High-resolution print styling for physical flyers and campus handouts.

### 2. Event Landing & Registration Portal
- Event details: **Monday, September 21, 2026 (10:00 AM – 12:00 PM PT)** outside Amazon Hub Locker (2495 Bancroft Way, Berkeley).
- **Interactive Myth-Buster**: 10-second quiz explaining Peripheral Blood Stem Cell (PBSC) donation.
- **Pledge Form**: Students register their name, affiliation, and time preference to stop by and get swabbed. Pledges are saved to the backend database and confirmation cards are issued with 1-click Google Calendar integration.

### 3. Real-Time Analytics & Assignment Reflection
- Live tracking of page visits, device types (Mobile vs. Desktop), QR scan conversions, and pledge submissions.
- **100% Real Data Mode**: Reset to 0 with 1 click to collect clean, real-time student interaction metrics.
- **AI Summary Generator**: 1-click generation of the 3–6 sentence reflection write-up for your Google Slide deck and course assignment.
- **Raw JSON Export**: Download raw event logs anytime.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local full-stack dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

---

## 🛡️ Campus Ethics & Privacy
Designed by UC Berkeley Master of Design (MDes) students in full compliance with the UC Berkeley Student Code of Conduct. Student contact info is masked for privacy.
