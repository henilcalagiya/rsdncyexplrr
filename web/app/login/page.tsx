export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-bold">Residency Explorer — Local Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the password to continue.
        </p>

        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          className="mt-5 w-full rounded border border-gray-300 px-3 py-2"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">Wrong password, try again.</p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
