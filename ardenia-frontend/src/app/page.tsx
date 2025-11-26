import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center from-indigo-50 via-white to-purple-50 font-sans ">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16   sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground dark:text-foreground">
            My Mind Matters
          </h1>
          <p className="max-w-md text-lg leading-8 text-gray-500">
            Getting things done,{" "}
            <span className="text-foreground font-bold">the fun way.</span>
          </p>
          <a href="/tasks" className="underline">
            Tasks
          </a>
          <a href="/gamify" className="underline">
            Gamify Doc
          </a>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
