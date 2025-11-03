# VocabArena 🎮

A competitive vocabulary learning platform designed for 18-year-olds with team-based games, real-time competition, and engaging gamification features.

## 🌟 Features

### Core Functionality
- **18 Game Modes**: Solo practice and 2-player competitive games
- **1-Player Games**: Flashcards, Learn, Spell, Test, Speed Challenge, Falling Words, Word Ladder, Mystery Word, Sentence Builder, Survival, Hangman, Gravity, Memory Match
- **2-Player Games**: Match, Memory Match, Othello Vocab Challenge, Urban Life Hex, Five-in-a-Row Tic-Tac-Toe
- **Team Competition**: Join games with unique codes and compete in real-time
- **Gamification**: XP system, streaks, badges, and achievements
- **Modern Design**: Dark mode by default with bold, high-contrast neon aesthetics
- **Smooth Animations**: Framer Motion powered micro-interactions and celebrations
- **Audio Integration**: Background music and sound effects (ready for implementation)
- **Accessibility**: Keyboard navigation, ARIA labels, and screen reader support

### Game Modes

#### 1-Player Games (13)
- **Flashcards**: Classic flip-and-learn with 3D card animations
- **Learn**: Interactive learning mode with feedback
- **Spell**: Practice spelling vocabulary words
- **Test**: Test your knowledge with a quiz
- **Speed Challenge**: 60 seconds to answer as many as possible
- **Falling Words**: Catch falling words before they hit the ground
- **Word Ladder**: Climb the ladder with correct answers
- **Mystery Word**: Guess the word letter by letter
- **Sentence Builder**: Complete sentences with the right words
- **Survival Mode**: Answer quickly or lose a life
- **Hangman**: Guess letters to reveal the hidden word
- **Gravity**: Type answers before words fall
- **Memory Match (Solo)**: Match pairs of vocabulary cards

#### 2-Player Games (5)
- **Match**: Compete to match terms and definitions
- **Memory Match**: Competitive memory card matching
- **Othello Vocab Challenge**: Translate words to place pieces in Othello
- **Urban Life Hex**: Connect your sides with correct translations
- **Five-in-a-Row**: 10×10 vocab tic-tac-toe - get 5 in a row

### For Teachers
- **Quick Game Creation**: Generate game codes instantly
- **Session Management**: Monitor active games and player progress
- **Vocabulary Sets**: Pre-loaded mental health vocabulary (40 terms)
- **Dashboard**: Overview of sessions, stats, and quick actions

### For Students
- **Easy Join**: Enter game code and choose avatar
- **Waiting Lobby**: See other players joining in real-time
- **Live Feedback**: Instant results with visual and audio cues
- **Progress Tracking**: View scores, streaks, and achievements

## 🎨 Design System

### Colors (Dark Mode)
- **Background**: Deep dark blue-gray (#1a2332)
- **Primary**: Electric blue (#60A5FA)
- **Secondary**: Neon green (#34D399)
- **Accent**: Purple (#C084FC)
- **Destructive**: Vibrant red (#F87171)

### Typography
- **Headings**: Space Grotesk (bold, modern)
- **Body**: Inter (readable, clean)

### Animations
- Micro-interactions: 150-250ms
- Card flips: 400ms spring animation
- Confetti celebrations on achievements
- Smooth page transitions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and data persistence)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quizzy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.local.example .env.local

# Add your Supabase credentials to .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
```

4. Configure Supabase email templates:
   - See [EMAIL_CONFIRMATION_SETUP.md](./EMAIL_CONFIRMATION_SETUP.md) for detailed instructions
   - This is required for email confirmation to work correctly

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Important: Email Confirmation Setup

After setting up Supabase, you **must** configure the email confirmation template to avoid "unknown page" errors when users sign up. Follow the step-by-step guide in [EMAIL_CONFIRMATION_SETUP.md](./EMAIL_CONFIRMATION_SETUP.md).

**Quick Summary:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Update the "Confirm signup" template to use:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/teacher">Confirm your email</a>
   ```
3. Configure your Site URL in Authentication → URL Configuration
4. Add redirect URLs to the allow list

See the full guide for troubleshooting and additional details.

## 📁 Project Structure

```
quizzy/
├── app/                          # Next.js app directory
│   ├── game/[code]/             # Game modes
│   │   └── flashcards/          # Flashcards game
│   ├── join/                    # Student join page
│   ├── lobby/[code]/            # Waiting lobby
│   ├── teacher/                 # Teacher dashboard
│   ├── globals.css              # Global styles & theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── data/                    # Vocabulary data
│   ├── store/                   # Zustand state management
│   └── utils/                   # Utility functions
├── types/                       # TypeScript definitions
│   ├── audio.ts                 # Audio types
│   └── game.ts                  # Game types
└── public/                      # Static assets
```

## 🎯 Vocabulary Set

The app includes a pre-loaded mental health vocabulary set with 40 English-Danish term pairs:

- Anxiety → Angst
- Depression → Depression
- Therapy → Terapi
- Recovery → Helbredelse
- And 36 more terms...

## 🎮 How to Play

### As a Teacher:
1. Go to Teacher Dashboard
2. Click "Create New Game"
3. Share the generated game code with students
4. Wait for students to join in the lobby
5. Click "Start Game" when ready
6. Monitor progress in real-time

### As a Student:
1. Click "Join Game" on homepage
2. Enter the game code from your teacher
3. Choose your display name and avatar
4. Wait in the lobby for the game to start
5. Play and compete!

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Confetti**: canvas-confetti
- **Icons**: Lucide React

## 🔮 Upcoming Features

### Phase 2 (In Development)
- [ ] Supabase integration for persistence
- [ ] Real-time multiplayer with Supabase Realtime
- [ ] Audio system with background music and SFX
- [ ] Match game mode
- [ ] Gravity game mode

### Phase 3 (Planned)
- [ ] Learn/Write mode
- [ ] Spell mode
- [ ] Test/Quiz mode
- [ ] Live Team Race mode
- [ ] Teacher analytics dashboard
- [ ] Custom vocabulary set creation
- [ ] CSV import/export
- [ ] Badge system expansion
- [ ] Audio credits modal

## 🎵 Audio Integration (Ready for Implementation)

The app is designed to support:
- **Background Music**: Lo-fi, synthwave, upbeat electronic tracks
- **Sound Effects**: Correct/wrong answers, streaks, celebrations
- **Audio Controls**: Volume sliders, mute toggle, focus mode
- **Credits System**: Auto-generated attribution for free audio sources

Audio files should be placed in:
- `/public/audio/music/` - Background tracks
- `/public/audio/sfx/` - Sound effects

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

The app will be accessible at: `your-project.vercel.app`

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## 📝 License

This project is built for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or support, please open an issue in the repository.

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui
