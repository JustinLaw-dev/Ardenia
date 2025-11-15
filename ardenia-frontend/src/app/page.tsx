export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center from-indigo-50 via-white to-purple-50 font-sans ">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16   sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground dark:text-foreground">
            Ardenia
          </h1>
          <p className="max-w-md text-lg leading-8 text-foreground">
            A Productivity App, built with kindness
          </p>
          <a href="/gamify" className="underline">
            Gamify Doc
          </a>
        </div>
      </main>
    </div>
  );
}
