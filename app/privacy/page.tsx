import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Политика конфиденциальности TextFlow.",
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
            TextFlow обрабатывает ваши данные для работы сервиса: генерации идей контента из текста или по ссылке на YouTube (транскрипт).
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Data we collect</h2>
          <p>
            При входе через Google мы получаем email, имя и фото профиля. Храним учёт использования (число генераций за месяц). При включённой оплате — идентификаторы клиента Stripe; пока платежи отключены, эти поля не используются. Видеофайлы не храним; текст/транскрипт передаётся провайдеру ИИ для генерации ответа и не сохраняется нами как архив.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">How we use it</h2>
          <p>
            Данные используются для входа, соблюдения лимитов тарифов и (при включённом биллинге) обработки платежей. Мы не продаём персональные данные третьим лицам.
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">Third parties</h2>
          <p>
            Используются сервисы Google (вход), OpenAI (генерация текста), при необходимости Stripe (платежи) и провайдер базы данных. На их сторону распространяются отдельные политики конфиденциальности.
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
