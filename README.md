# Synchro 🔒

**Privacy-preserving calendar matching powered by cryptography**

Synchro allows two people to discover mutual events from their Lu.ma calendars without revealing their full schedules. Built with Zero-Knowledge Private Set Intersection (PSI) and a 100% database-less architecture.

🔗 **Live Testing Link:** [https://synchro-git-testing-rusgarians-projects.vercel.app](https://synchro-git-testing-rusgarians-projects.vercel.app)

## Features

- 🔐 **Privacy-First**: Only mutual events are revealed using ECDH-based PSI
- 🔑 **Google Sign-In**: Securely link your Google account to verify ownership
- 📅 **Lu.ma Ownership Verification**: Automatically verifies you own the Luma feed you import
- 🔒 **End-to-End Encrypted Notes**: Add private notes to matched events (stored only in your calendar)
- ⚡ **Zero-Database**: No sensitive data is stored on any server. Everything is client-side or in-memory.
- 🎨 **Modern UI**: High-end landing page with advanced glassmorphism design

## How It Works

### The PSI Protocol

Synchro uses an **ECDH-based Private Set Intersection** protocol:

1. **Alice** blinds her event UIDs: `{aH(x₁), aH(x₂), ...}`
2. **Bob** double-blinds Alice's set and sends his own: `{abH(x₁), ...}` and `{bH(y₁), ...}`
3. **Alice** double-blinds Bob's set: `{abH(y₁), ...}`
4. Both parties compare `abH(xᵢ) = abH(yⱼ)` to find matches

**Security**: Based on the hardness of the Discrete Log Problem on secp256k1 (same curve as Bitcoin/Ethereum)

### Zero-Database Architecture

- ✅ **No Database**: We do not use PostgreSQL, MongoDB, or Prisma.
- ✅ **Ownership Verification**: We verify Luma feed ownership by checking guest emails in Luma ticket pages against your signed-in Google email.
- ✅ **Local History**: Your matching history is optionally stored in your own Google Calendar metadata or browser storage.
- ✅ **Ephemeral Signaling**: Temporary sessions use in-memory signaling and are wiped automatically after 2 hours.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth 2.0
- **Cryptography**: @noble/curves (secp256k1), @noble/hashes
- **Calendar**: ical.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Client ID (see DEPLOYMENT.md)

### Installation

```bash
# Clone the repository
git clone https://github.com/rusgariana/synchro.git
cd synchro

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Usage

1. **Sign In**: Click "Sign In" to connect your Google account.
2. **Load Calendar**: 
   - Go to Lu.ma → Settings → Calendar Syncing → Add iCal Subscription
   - Copy the ICS URL and paste it into Synchro.
3. **Verification**: Synchro will verify that the feed belongs to your email.
4. **Create/Join Session**:
   - **User A**: Click "Start Session" and share the Session ID.
   - **User B**: Enter the Session ID and click "Join."
5. **View Matches**: The app automatically finds mutual events using cryptography.

## Project Structure

```
synchro/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── events/        # Luma fetch & ownership verification
│   │   │   └── signal/        # In-memory signaling for PSI handshake
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Main landing page
│   ├── components/
│   │   ├── MatchingSession.tsx # PSI protocol & matching logic
│   │   └── GoogleSignIn.tsx   # OAuth integration
│   └── lib/
│       ├── calendar.ts        # ICS parsing utilities
│       ├── crypto.ts          # PSI & encryption functions
│       └── googleAuth.tsx     # Auth context & logic
├── public/                    # Static assets
└── package.json
```

## Security Considerations

- ✅ Client-side PSI prevents revealing non-matching events.
- ✅ Ownership verification prevents "feed hijacking."
- ✅ Zero server-side persistence of PII or calendar data.

## License

MIT License

## Contact

GitHub: [@rusgariana](https://github.com/rusgariana)