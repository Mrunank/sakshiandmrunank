import "./globals.css";

export const metadata = {
  title: "Sakshi & Mrunank",
  description: "Our forever begins here",
  icons: {
    icon: "/logov2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}