export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 30px 80px rgba(56, 189, 248, 0.12)',
      },
      backgroundImage: {
        'soft-grad': 'radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.14), transparent 25%)',
      },
    },
  },
  plugins: [],
};
