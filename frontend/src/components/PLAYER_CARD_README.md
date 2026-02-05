# NBA Player Card Component

A modern, interactive React component for displaying NBA player information with statistics and smooth hover effects.

## Features

✨ **Rich Player Information**
- Player name, team, and position
- Physical attributes (height, weight)
- Season statistics (PPG, APG, RPG)

🎨 **Beautiful Design**
- Smooth hover effects with scale and elevation
- Gradient backgrounds on hover
- Color-coded statistics
- Responsive layout

♿ **Accessible**
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support

## Usage

### Basic Example

```tsx
import { PlayerCard } from "@/components/player-card";

function MyComponent() {
  return (
    <PlayerCard
      id={1}
      name="LeBron James"
      team="Los Angeles Lakers"
      position="Forward"
    />
  );
}
```

### With Physical Attributes

```tsx
<PlayerCard
  id={2}
  name="Stephen Curry"
  team="Golden State Warriors"
  position="Guard"
  height="6-2"
  weight="185 lbs"
/>
```

### Complete with Statistics

```tsx
<PlayerCard
  id={3}
  name="Kevin Durant"
  team="Phoenix Suns"
  position="Forward"
  height="6-10"
  weight="240 lbs"
  stats={{
    pointsPerGame: 29.1,
    assistsPerGame: 5.0,
    reboundsPerGame: 6.7,
  }}
/>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {players.map((player) => (
    <PlayerCard key={player.id} {...player} />
  ))}
</div>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `number` | ✅ Yes | Unique player identifier |
| `name` | `string` | ✅ Yes | Player's full name |
| `team` | `string` | ✅ Yes | Player's team name |
| `position` | `string` | ✅ Yes | Player's position (Guard, Forward, Center) |
| `height` | `string` | ❌ No | Player's height (e.g., "6-9") |
| `weight` | `string` | ❌ No | Player's weight (e.g., "250 lbs") |
| `stats` | `PlayerStats` | ❌ No | Player's season statistics |
| `className` | `string` | ❌ No | Additional CSS classes |

### PlayerStats Interface

```typescript
interface PlayerStats {
  pointsPerGame?: number;    // Average points per game
  assistsPerGame?: number;   // Average assists per game
  reboundsPerGame?: number;  // Average rebounds per game
}
```

## Styling

The component uses Tailwind CSS and includes:

### Hover Effects
- **Scale**: Card grows to 105% on hover
- **Translation**: Moves up 8px (2rem)
- **Shadow**: Enhanced shadow for depth
- **Border**: Blue border highlight
- **Background**: Gradient from blue to white
- **Text Color**: Name text transitions to blue

### Color Scheme
- **Points (PPG)**: Blue (`text-blue-600`)
- **Assists (APG)**: Green (`text-green-600`)
- **Rebounds (RPG)**: Purple (`text-purple-600`)

### Customization

Override styles using the `className` prop:

```tsx
<PlayerCard
  {...playerData}
  className="max-w-sm shadow-2xl border-4 border-gold-500"
/>
```

## Dependencies

- `@/components/ui/card` - shadcn/ui Card components
- `@/components/ui/badge` - shadcn/ui Badge component
- `@/lib/utils` - cn utility for class merging
- Tailwind CSS - For styling

## Animation Details

- **Duration**: 300ms
- **Timing**: ease-in-out
- **Transform**: scale, translateY
- **Opacity**: Smooth transitions

## Accessibility

- Semantic HTML structure with proper heading hierarchy
- ARIA labels for statistics
- Keyboard navigable (inherits from Card component)
- Screen reader friendly

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- CSS Transitions
- CSS Transform

## Examples

See `player-card.examples.tsx` for more usage examples including:
- Basic player cards
- Cards with physical attributes
- Complete cards with statistics
- Grid layouts
- Custom styled cards
- Rookie players without stats

## Integration

This component is used in:
- `/players-info` page - Displays all NBA players
- Can be integrated into any page needing player information display

## Future Enhancements

Potential improvements:
- 🎯 Click handlers for player details
- 📊 Advanced statistics (shooting %, +/-, etc.)
- 🖼️ Player photos/avatars
- 🏆 Awards and achievements display
- 📈 Trend indicators (up/down arrows)
- 🎨 Team color themes
- ⚡ Performance optimizations with React.memo

## License

Part of the NBA Sports Application project.
