# Visual AI App - Specification Document

## 1. Project Overview

**Project Name:** Visual AI App  
**Project Type:** Web Application (AI-Powered Visual Generator)  
**Core Functionality:** A dynamic AI-powered web application where an LLM can generate visual outputs (HTML, CSS, JavaScript, UI components) dynamically - not just text responses.  
**Target Users:** Developers, designers, and users who want AI to generate visual UIs, charts, and interactive components.

---

## 2. UI/UX Specification

### Layout Structure

**Page Sections:**
- **Header:** Minimal header with app logo and title
- **Left Panel (Input):** 320px width, contains prompt input, model selection, and settings
- **Center Panel (Visual Renderer):** Flexible width, displays generated UI components
- **Top Right:** Chatbot icon (floating action button)

**Grid/Flex Layout:**
- Main layout: CSS Grid with `grid-template-columns: 320px 1fr`
- Left panel: Fixed 320px
- Center: `1fr` (fills remaining space)

**Responsive Breakpoints:**
- Desktop: >= 1024px (full layout)
- Tablet: 768px - 1023px (collapsible left panel)
- Mobile: < 768px (stacked layout, hamburger menu for input)

### Visual Design

**Color Palette:**
- Background Primary: `#0a0a0f` (deep dark)
- Background Secondary: `#12121a` (card backgrounds)
- Background Tertiary: `#1a1a24` (input fields)
- Accent Primary: `#8b5cf6` (violet - main accent)
- Accent Secondary: `#06b6d4` (cyan - highlights)
- Accent Gradient: `linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)`
- Text Primary: `#f8fafc`
- Text Secondary: `#94a3b8`
- Text Muted: `#64748b`
- Success: `#10b981`
- Error: `#ef4444`
- Warning: `#f59e0b`
- Border: `rgba(255, 255, 255, 0.08)`

**Typography:**
- Font Family: `"JetBrains Mono", "Fira Code", monospace` for code/technical feel
- Headings: `"Space Grotesk", sans-serif` - wait, avoid this per rules
- Actually use: `"Outfit", system-ui, sans-serif` for headings
- Body: `"IBM Plex Sans", system-ui, sans-serif`
- Code: `"JetBrains Mono", monospace`
- Font Sizes:
  - H1: 28px / 700
  - H2: 22px / 600
  - H3: 18px / 600
  - Body: 14px / 400
  - Small: 12px / 400
  - Code: 13px / 400

**Spacing System:**
- Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Visual Effects:**
- Card shadows: `0 4px 24px rgba(0, 0, 0, 0.4)`
- Glow effect on accent elements: `0 0 20px rgba(139, 92, 246, 0.3)`
- Glass morphism: `backdrop-filter: blur(12px); background: rgba(18, 18, 26, 0.8)`
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)
- Transitions: 200ms ease-out

### Components

**Input Panel:**
- Prompt textarea with placeholder "Describe what you want to build..."
- Model selector dropdown (OpenAI, Claude, Gemini, Local)
- Generate button with loading state
- History sidebar (collapsible)

**Visual Renderer:**
- Sandboxed iframe for rendering
- Loading skeleton animation
- Error state display
- Clear button

**Chat System (Secondary):**
- Floating chatbot icon (FAB) - 56px, top-right
- Chat dialog: 400px width, 500px height
- Message bubbles (user vs AI)
- Close button

**Tool Buttons (in rendered UI):**
- createUI - Generate UI components
- renderHTML - Render generated HTML
- createChart - Render charts (line, bar, pie)
- createTimeline - Render journey timeline
- createCard - Render data cards

**Component States:**
- Buttons: default, hover (scale 1.02), active (scale 0.98), disabled (opacity 0.5)
- Inputs: default, focus (border accent), error (border red)
- Loading: shimmer animation

---

## 3. Functionality Specification

### Core Features

**1. AI Prompt Input**
- Textarea for describing desired UI
- Model selection (OpenAI GPT-4, Claude 3, Gemini Pro, Local)
- Generate button with loading state
- Keyboard shortcut: Cmd/Ctrl + Enter to submit

**2. Visual Rendering Engine**
- Receive generated HTML from LLM
- Sanitize HTML using DOMPurify
- Inject into sandboxed iframe
- Support CSS and JavaScript within generated content

**3. Browser Tools (LLM-exposed)**
- `createUI(componentType, props)` - Generate React components
- `renderHTML(htmlString)` - Render raw HTML
- `createChart(chartType, data)` - Render charts (Chart.js)
- `createTimeline(events)` - Render timeline component
- `createCard(data)` - Render data cards

**4. Chart Support**
- Line charts
- Bar charts
- Pie/Donut charts
- Area charts

**5. Timeline Component**
- Vertical timeline with icons
- Date labels
- Description text
- Animated entrance

**6. Data Cards**
- Image cards
- Stats cards
- Profile cards
- Grid layout support

**7. Chat System**
- Bot icon on top-right
- Click to open chat dialog
- Simple text conversation with AI
- Close on outside click or X button

### User Interactions and Flows

1. User enters prompt in textarea
2. Selects AI model from dropdown
3. Clicks "Generate" or presses Cmd+Enter
4. Loading state shows while LLM processes
5. Generated UI renders in center panel
6. User can interact with rendered components
7. User can clear and try again

### Data Handling

- No persistent backend storage (demo mode)
- Prompt history stored in React state (session only)
- Generated code stored in iframe

### Edge Cases

- Empty prompt: Show validation message
- LLM error: Display error state with retry option
- Invalid HTML: Sanitize and show safe fallback
- Large generated content: Truncate with "Show more"

---

## 4. Technical Architecture

### Frontend Stack
- React 18 with TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- Vite for build tooling

### Security
- DOMPurify for HTML sanitization
- iframe sandbox for code execution
- No eval() - use sandboxed rendering
- Content Security Policy headers

### File Structure
```
visual-ai-app/
├── src/
│   ├── components/
│   │   ├── InputPanel.tsx
│   │   ├── VisualRenderer.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── ToolButton.tsx
│   │   └── ui/ (shared UI components)
│   ├── hooks/
│   │   ├── useLLM.ts
│   │   └── useSandbox.ts
│   ├── lib/
│   │   ├── sanitizer.ts
│   │   └── ai-providers.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── index.html (for iframe)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── index.html
```

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Left panel shows with prompt input and model selector
- [ ] Center panel displays rendered content
- [ ] Chat icon visible in top-right corner
- [ ] Dark theme with violet/cyan accents applied
- [ ] Animations smooth on interactions
- [ ] Responsive layout works on different screen sizes

### Functional Checkpoints
- [ ] Prompt can be entered and submitted
- [ ] Model selection works (dropdown)
- [ ] Loading state shows during generation
- [ ] Generated HTML renders in sandboxed iframe
- [ ] Charts render correctly (line, bar, pie)
- [ ] Timeline component displays events
- [ ] Data cards display properly
- [ ] Chat widget opens/closes
- [ ] Chat messages can be sent/received

### Security Checkpoints
- [ ] HTML is sanitized before rendering
- [ ] iframe has sandbox attribute
- [ ] No XSS vulnerabilities in generated content
