import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-center text-slate-600">
          Use your Google account to access Content Multiplier and save your usage.
        </p>
        <a href="/api/auth/signin/google" className="mt-8">
          <Button size="lg">Sign in with Google</Button>
        </a>
      </main>
    </>
  );
}
