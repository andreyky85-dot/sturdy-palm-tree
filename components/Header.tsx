import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          TextFlow
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/generator">
                <Button variant="ghost" size="sm">
                  Генератор
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Кабинет
                </Button>
              </Link>
              <Link href="/api/auth/signout">
                <Button variant="secondary" size="sm">
                  Выйти
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/generator">
                <Button variant="ghost" size="sm">
                  Генератор
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Войти через Google
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
