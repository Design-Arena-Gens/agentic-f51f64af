export const metadata = {
  title: 'Room 213 ? Horror Video Generator',
  description:
    'Generate a 9:16 animated horror short with first-person narration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#0a0a0a',
          color: '#e7e7e7',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji',
        }}
      >
        {children}
      </body>
    </html>
  );
}

