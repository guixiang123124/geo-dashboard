export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages render without sidebar/header - just the form
  return <>{children}</>;
}
