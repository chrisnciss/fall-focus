import "./styles.css";

export const metadata = {
  title: "Fall Focus",
  description: "A calm, seasonal task tracker for getting meaningful work done."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
