import "./globals.css";

export const metadata = {
  title: "Sakshi & Mrunank",
  description: "Our forever begins here",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
