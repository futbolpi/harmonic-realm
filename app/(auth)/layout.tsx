import AuthRouteGuard from "./_components/auth-route-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRouteGuard>
      <main className="flex-1">{children}</main>
    </AuthRouteGuard>
  );
}
