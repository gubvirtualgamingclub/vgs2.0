# Logos Folder

Place all logo files here:

## Required Files:
- `vgs-logo.png` - Main VGS logo (for header on light background)
- `vgs-logo-white.png` - White VGS logo (for footer on dark background)
- `university-logo.png` - University logo

## Registration Form Logos:
You can also place registration form logos here and reference them using:
```
/logos/club-logo.png
/logos/tournament-logo.png
/logos/game-logo.png
```

## File Specifications:
- Format: PNG (transparent) or SVG
- Size: 100x100px to 200x200px (registration logos)
- Max file size: 50KB

## Usage:

### In components:
```tsx
<Image src="/logos/vgs-logo.png" alt="Logo" width={40} height={40} />
```

### In Registration Forms (Admin Panel):
Enter either:
- **Public path**: `/logos/my-logo.png`
- **External URL**: `https://example.com/logo.png`

Both are stored in the database and work the same way.
