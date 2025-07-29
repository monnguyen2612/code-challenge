# Currency Swap App with Vite

## 🚀 Quick Start

This project uses **Vite** for fast development and optimized builds.

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/problem2/
├── index.html          # Main HTML file
├── main.js             # JavaScript entry point (Vite module)
├── style.css           # Styles (imported in main.js)
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── README.md           # Main documentation
└── VITE_README.md      # This file
```

## 🛠️ Vite Benefits

### Development Experience
- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Fast Startup**: Lightning-fast dev server startup
- **ES Modules**: Native ES module support
- **TypeScript Support**: Built-in TypeScript support (if needed)

### Build Optimization
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Automatic chunk splitting
- **Asset Optimization**: Automatic asset optimization
- **Source Maps**: Development-friendly source maps

### Features Used
- **CSS Import**: `import './style.css'` in main.js
- **Module Scripts**: `<script type="module">` in HTML
- **Development Server**: Auto-reload and HMR
- **Build Optimization**: Production-ready builds

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production (creates `dist/` folder) |
| `npm run preview` | Preview production build locally |
| `npm run serve` | Alias for preview command |

## 🔧 Vite Configuration

The `vite.config.js` file includes:

- **Development Server**: Port 3000 with auto-open
- **Build Output**: Optimized for production
- **Source Maps**: Enabled for debugging
- **Asset Handling**: Proper asset file naming

## 🌐 Development URLs

- **Development**: http://localhost:3000
- **Preview**: http://localhost:4173 (after build)

## 📦 Build Output

After running `npm run build`, the `dist/` folder contains:

```
dist/
├── assets/
│   ├── main-[hash].js
│   └── style-[hash].css
└── index.html
```

## 🚀 Deployment

The built application can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Deploy from the `dist/` folder
- **AWS S3**: Upload the `dist/` contents

## 🔍 Development Tips

1. **Hot Reload**: Changes to CSS and JS files trigger instant updates
2. **Console Logs**: Check browser console for build information
3. **Network Tab**: Monitor API calls to the price endpoint
4. **Performance**: Use browser dev tools to analyze performance

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Module not found:**
   - Ensure all imports use correct paths
   - Check that files exist in the expected locations

3. **Build errors:**
   - Check console for specific error messages
   - Ensure all dependencies are installed

### Performance Optimization

- **Development**: Fast refresh and HMR
- **Production**: Optimized bundles and assets
- **Caching**: Proper cache headers for static assets

## 🎉 Bonus Features

This Vite setup provides:

- ✅ **Modern Development**: Latest ES modules and features
- ✅ **Fast Builds**: Optimized for speed and efficiency
- ✅ **Production Ready**: Optimized output for deployment
- ✅ **Developer Experience**: Excellent tooling and debugging
- ✅ **Future Proof**: Easy to add TypeScript, React, Vue, etc.

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Configuration](https://vitejs.dev/config/)
- [Vite Plugins](https://vitejs.dev/plugins/)

---

**Note**: This setup demonstrates modern frontend development practices with Vite, providing an excellent foundation for scalable applications. 