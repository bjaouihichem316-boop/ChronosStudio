# Chronos Studio

**AI-Assisted Documentary Production Workspace**

🌐 **Repository:** https://github.com/bjaouihichem316-boop/ChronosStudio

Chronos Studio is a professional web application for creating historical documentaries with AI assistance. It provides a structured workflow from historical research through script writing to production planning, with intelligent tools to help filmmakers craft compelling historical narratives.

## 🎬 Overview

Chronos Studio bridges the gap between historical research and documentary production. It helps filmmakers:

- Organize historical research with AI-assisted note-taking and source management
- Build documentary scripts with acts, scenes, and shot breakdowns
- Plan production with characters, locations, storyboards, and asset management
- Maintain factual accuracy by linking claims to sources
- Track visual continuity across scenes for consistent AI-generated content

## 🏗️ Architecture

Chronos Studio follows a clean, domain-driven architecture with three independent domains that communicate through well-defined TypeScript interfaces:

```
Research Domain          Script Domain          Production Domain
┌──────────────┐        ┌──────────────┐       ┌──────────────────┐
│ ResearchNote │        │ Chapter      │       │ Character        │
│ Claim        │◄───────│ Scene        │◄──────│ Location         │
│ Source       │claimId │ linkedClaimId│       │ ProductionScene  │
└──────────────┘        └──────────────┘       │ Shot             │
                                               │ Asset            │
                                               └──────────────────┘
```

### Key Principles

- **Domain Independence**: Each domain (Research, Script, Production) maintains its own state
- **Reference-Based Links**: Domains reference each other by ID, never duplicating data
- **Read-Only Cross-Domain Access**: Production reads Script/Research but never mutates them
- **Type Safety**: Full TypeScript coverage with strict mode
- **Single Source of Truth**: Each domain owns its data completely

### Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop
- **Lucide React** for icons
- **localStorage** for persistence

## 📦 Implemented Stages

### Stage 1 — Foundation ✅

Core application structure with professional dark UI:

- Left sidebar for project management
- Top navigation with project selector
- Main workspace with section navigation
- Project dashboard with progress tracking
- Responsive layout for all screen sizes
- New project creation with modal

### Stage 2 — Research Workspace ✅

Comprehensive research management system:

- **Research Notes**: Create, edit, delete notes with tags and search
- **Historical Claims**: Track claims with status (verified/disputed/unverified/debunked)
- **Sources**: Manage primary, secondary, and tertiary sources with reliability ratings
- **Source-Claim Association**: Link multiple sources to support claims
- **Unsupported Claim Detection**: Automatic warnings for claims without sources
- **Research Progress Indicator**: Visual progress tracking on dashboard
- **Search & Filtering**: Full-text search and status filtering across all data types

### Stage 3 — Script Studio ✅

Professional script writing and planning:

- **Script Structure**: Acts (chapters) containing scenes with full metadata
- **Two View Modes**: Outline (hierarchical) and Preview (continuous script)
- **Drag-and-Drop**: Reorder acts and scenes using @dnd-kit
- **Scene Status**: Draft / Review / Approved workflow
- **Research Integration**: Link scenes to historical claims, show supporting sources
- **Unsupported Claims Warning**: Banner + per-scene indicators for claims without sources
- **Search & Filter**: Full-text search + status filtering
- **Autosave**: localStorage persistence with timestamp display
- **Duration Calculation**: Automatic total documentary duration
- **Preview Mode**: Professional continuous script view

### Stage 4 — Production Studio Foundation ✅

Production planning and visual pre-production:

- **Production Overview**: Dashboard with stats, progress bars, and readiness metrics
- **Character Library**: 6 historical characters with full metadata (appearance, clothing, personality, voice notes, continuity notes)
- **Location Library**: 6 Constantinople locations with historical context and visual descriptions
- **Production Scenes**: Linked to Script scenes with shot breakdown
- **Shot Management**: 15 shots with full metadata (shotType, cameraAngle, cameraMovement, framing, subject, action, environment, lighting, mood, visualDescription, duration)
- **Shot Reordering**: Move shots up/down within scenes
- **Storyboard View**: Visual shot cards organized by scene
- **Asset Library**: Asset management with type filtering and scene/character/location linking
- **Continuity System**: Metadata for visual consistency across shots
- **Script Integration**: Production reads Script data without duplication

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chronos-studio

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript compiler
npm run type-check
```

## 📁 Project Structure

```
chronos-studio/
├── src/
│   ├── App.tsx                          # Main application with state management
│   ├── main.tsx                         # Application entry point
│   ├── index.css                        # Global styles
│   ├── types/                           # TypeScript type definitions
│   │   ├── index.ts                     # Core types (Project, ProjectSection)
│   │   ├── research.ts                  # Research domain types
│   │   ├── script.ts                    # Script domain types
│   │   └── production.ts                # Production domain types
│   ├── data/                            # Sample data
│   │   ├── sampleProject.ts             # Sample project data
│   │   ├── researchData.ts              # Research sample data
│   │   ├── scriptData.ts                # Script sample data
│   │   └── productionData.ts            # Production sample data
│   └── components/
│       ├── layout/                      # Layout components
│       │   ├── Sidebar.tsx              # Left sidebar with project list
│       │   └── TopNav.tsx               # Top navigation bar
│       ├── modals/                      # Modal components
│       │   └── NewProjectModal.tsx      # New project creation modal
│       └── workspace/                   # Workspace components
│           ├── EmptyState.tsx           # Empty project state
│           ├── ProjectOverview.tsx      # Main workspace with section routing
│           ├── research/                # Research workspace components
│           │   ├── ResearchWorkspace.tsx
│           │   ├── ResearchNotesPanel.tsx
│           │   ├── ClaimsPanel.tsx
│           │   ├── SourcesPanel.tsx
│           │   ├── ClaimDetailView.tsx
│           │   └── ResearchProgressIndicator.tsx
│           ├── script/                  # Script workspace components
│           │   ├── ScriptWorkspace.tsx
│           │   ├── ScriptOutline.tsx
│           │   ├── ScriptPreview.tsx
│           │   ├── SceneEditor.tsx
│           │   └── ChapterEditor.tsx
│           └── production/              # Production workspace components
│               ├── ProductionWorkspace.tsx
│               ├── ProductionOverview.tsx
│               ├── CharacterLibrary.tsx
│               ├── LocationLibrary.tsx
│               ├── ProductionScenes.tsx
│               ├── StoryboardView.tsx
│               └── AssetLibrary.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── .gitignore
```

## 🎯 Sample Project

The application includes a complete sample project: **"The Fall of Constantinople — 1453"**

This sample demonstrates all features with realistic historical data:

- **Research**: 5 research notes, 6 historical claims, 7 sources
- **Script**: 5 acts, 15 scenes with shot breakdowns
- **Production**: 6 characters, 6 locations, 5 production scenes, 15 shots, 6 assets

## ⚠️ Current Limitations

### What's Implemented
- ✅ Complete UI for Research, Script, and Production
- ✅ Full CRUD operations for all entities
- ✅ Search and filtering
- ✅ Drag-and-drop reordering
- ✅ State persistence via localStorage
- ✅ Project isolation
- ✅ Responsive design
- ✅ Accessibility features

### What's NOT Implemented (Future Stages)
- ❌ AI generation pipeline (ComfyUI, Wan, LTX, MiniMax, ElevenLabs)
- ❌ Image generation for characters and locations
- ❌ Video generation for shots
- ❌ Voice generation for narration
- ❌ Actual file upload for assets
- ❌ Timeline editing
- ❌ Final video assembly
- ❌ Export and rendering
- ❌ Cloud storage
- ❌ Collaboration features
- ❌ Authentication
- ❌ Backend API

## 🗺️ Planned Next Stages

### Stage 5 — AI Generation Pipeline (Planned)
- Integration with AI generation services
- Image generation for character references
- Location visualization generation
- Asset generation workflow

### Stage 6 — Video Generation (Planned)
- Shot-by-shot video generation
- Video assembly and editing
- Timeline integration
- Preview and playback

### Stage 7 — Audio & Voice (Planned)
- Voice generation for narration
- Music and sound effects
- Audio mixing
- Lip-sync integration

### Stage 8 — Export & Delivery (Planned)
- Final video rendering
- Multiple format export
- Quality settings
- Delivery pipeline

### Stage 9 — Collaboration (Planned)
- User authentication
- Team collaboration
- Comment and review system
- Version history

## 📝 Development Notes

### State Management

State is managed at the App level and passed down via props:

```typescript
// App.tsx
const [researchDataMap, setResearchDataMap] = useState<Record<string, ResearchData>>({...});
const [scriptDataMap, setScriptDataMap] = useState<Record<string, ScriptData>>({...});
const [productionDataMap, setProductionDataMap] = useState<Record<string, ProductionData>>({...});
```

Each domain's data is isolated per project using project IDs as keys.

### Persistence

All data is persisted to localStorage automatically:

```typescript
// Automatic save on every state update
useEffect(() => {
  localStorage.setItem('chronos-studio-data', JSON.stringify({
    researchDataMap,
    scriptDataMap,
    productionDataMap,
  }));
}, [researchDataMap, scriptDataMap, productionDataMap]);
```

### Cross-Domain References

Domains reference each other by ID only:

```typescript
// Script Scene references Research Claims
interface Scene {
  id: string;
  linkedClaimIds: string[];  // References Research.claims
}

// Production Scene references Script Scene
interface ProductionScene {
  id: string;
  scriptSceneId: string;  // References Script.scenes
  characterIds: string[]; // References Production.characters
  locationId: string;     // References Production.locations
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create new project
- [ ] Switch between projects
- [ ] Research: Create/edit/delete notes, claims, sources
- [ ] Research: Link sources to claims
- [ ] Research: Search and filter
- [ ] Script: Create/edit/delete acts and scenes
- [ ] Script: Drag-and-drop reordering
- [ ] Script: Link scenes to claims
- [ ] Script: Preview mode
- [ ] Production: Create/edit/delete characters
- [ ] Production: Create/edit/delete locations
- [ ] Production: Create production scenes
- [ ] Production: Add shots to scenes
- [ ] Production: Reorder shots
- [ ] Production: View storyboard
- [ ] Production: Manage assets
- [ ] Persistence: Reload page and verify data persists
- [ ] Responsive: Test on mobile, tablet, desktop

## 📄 License

This project is proprietary software.

## 🤝 Contributing

This is an internal project. Contact the maintainers for contribution guidelines.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with React, TypeScript, Vite, and Tailwind CSS**

**Current Version: Stage 4 — Production Studio Foundation**
