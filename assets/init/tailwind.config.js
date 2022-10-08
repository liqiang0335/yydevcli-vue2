/**
  在 css文件中导入:
  @tailwind base; 
  @tailwind components;
  @tailwind utilities;
*/

module.exports = {
  content:
    process.env.NODE_ENV == "production"
      ? ["./main/**/*.{html,js}", "./pages/**/*.{html,js}"] //
      : [],
  theme: {
    extend: {},
  },
  plugins: [],
};
