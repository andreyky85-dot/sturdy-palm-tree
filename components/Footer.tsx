import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Главная
            </Link>
            <Link href="/generator" className="hover:text-slate-900">
              Генератор
            </Link>
            <Link href="/privacy" className="hover:text-slate-900">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Условия
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} TextFlow. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
