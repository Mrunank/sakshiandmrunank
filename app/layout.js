import "./globals.css";

export const metadata = {
  title: "Sakshi & Mrunank",
  description: "Engagement & Wedding Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}