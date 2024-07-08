import { defineConfig } from 'vite';
import path from 'path';
import visualizer from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    process.env.ANALYZE === 'true' &&
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean) as any,
  resolve: {
    alias: {
      '@extensions': path.resolve('./src'),
      'easy-email-core': path.resolve('../easy-email-core/lib'),
      'easy-email-editor': path.resolve('../easy-email-editor/lib'),
      'attribute-manager': path.resolve('../../attributeManager.ts'),
      'template-theme-manager': path.resolve('../../templateThemeManager.ts'),
      'conditional-mapping-manager': path.resolve('../../conditionalMappingManager.ts'),
      'custom-block-manager': path.resolve(__dirname, '../../customBlockManager.ts'),
      'image-upload-manager': path.resolve(__dirname, '../../imageUploadManager.ts'),
    },
  },
  define: {},
  build: {
    emptyOutDir: false,
    minify: true,
    manifest: false,
    sourcemap: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'easy-email-extension',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      plugins: [],
      external: [
        'react',
        'react-dom',
        'react-dom/server',
        'mjml-browser',
        'react-final-form',
        'easy-email-core',
        'easy-email-editor',
      ],
      output: {},
    },
    outDir: 'lib',
  },
  optimizeDeps: {},
  css: {
    modules: {
      localsConvention: 'dashes',
    },
    preprocessorOptions: {
      scss: {},
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
