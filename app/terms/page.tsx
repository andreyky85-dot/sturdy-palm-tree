import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Условия использования TextFlow.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <p>
            Используя TextFlow, вы соглашаетесь с этими условиями.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Use of the service</h2>
          <p>
            You may use the service for lawful purposes only. You must not abuse the API (e.g. excessive requests, automated scraping beyond normal use). We may suspend or terminate access if we detect abuse.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Plans and billing</h2>
          <p>
            The service currently operates without paid subscriptions: usage limits apply to the free tier as shown on the site.
            If paid plans are introduced later, terms will be updated and billing will only activate after explicit configuration by the operator
            (no charges without enabling billing in the deployment).
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Content and IP</h2>
          <p>
            You retain rights to the content you input. Generated content is provided for your use. We do not claim ownership of your content or the outputs.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Contact</h2>
          <p>
            For terms-related questions, contact us at the support email listed on the site.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
