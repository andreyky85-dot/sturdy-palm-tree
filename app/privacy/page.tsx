import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Content Multiplier privacy policy.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <p>
            Content Multiplier processes your data to provide the service: generating social media content from video URLs.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Data we collect</h2>
          <p>
            When you sign in with Google, we receive your email, name, and profile image. We store your usage (number of generations per month) and, if you subscribe to Pro, your Stripe customer and subscription IDs. We do not store video files or full transcripts; transcripts are sent to OpenAI only to produce the generated content and are not retained by us.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">How we use it</h2>
          <p>
            We use your data to authenticate you, enforce plan limits (Free vs Pro), and process payments. We do not sell your data to third parties.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Third parties</h2>
          <p>
            We use Google (sign-in), OpenAI (content generation), Stripe (payments), and our database provider. Their privacy policies apply to their processing.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Contact</h2>
          <p>
            For privacy-related questions, contact us at the support email listed on the site.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
