import { siteContent } from "@/features/landing/data/site-content";

export function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {siteContent.hero.company}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
            {siteContent.hero.name}
          </h1>
          <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-200">{siteContent.hero.title}</p>
          <p className="mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
            {siteContent.hero.description}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Template Includes</p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Functional authentication with Prisma + RBAC</li>
            <li>Admin dashboard and user management starter</li>
            <li>Reusable layout, nav, modal, and page slices</li>
          </ul>
        </div>
      </section>

      <section id="about" className="mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">About</h2>
        <p className="mt-4 max-w-3xl text-neutral-600 dark:text-neutral-400">
          This starter is designed as a reusable baseline so you can launch
          portfolio websites, company profile CMS projects, and mini e-commerce
          apps without rebuilding authentication, authorization, and admin
          scaffolding each time.
        </p>
      </section>

      <section id="services" className="mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">What You Can Build</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {siteContent.services.map((service) => (
            <article
              key={service.title}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-white">{service.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="mt-20 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-8 text-white dark:from-black dark:to-neutral-900">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="mt-4 text-sm text-neutral-300">{siteContent.contact.email}</p>
        <p className="mt-1 text-sm text-neutral-300">{siteContent.contact.phone}</p>
        <p className="mt-1 text-sm text-neutral-300">{siteContent.contact.location}</p>
      </section>
    </div>
  );
}
