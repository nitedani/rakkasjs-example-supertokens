import { Button } from "@mantine/core";
import { LayoutProps, Link } from "rakkasjs";
import { useAuth } from "src/lib/auth";

export default function MainLayout({ children }: LayoutProps) {
  const { session, signOut } = useAuth();

  return (
    <div>
      Session: {JSON.stringify(session)}
      {session.valid && <Button onClick={signOut}>Sign Out</Button>}
      <div>
        <Link href="/">Index</Link>
        <Link href="/protected">Protected</Link>
      </div>
      {children}
    </div>
  );
}
