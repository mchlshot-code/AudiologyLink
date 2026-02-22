type ClinicStatus = {
  clinicId: string;
  name: string;
  status: "open" | "closed";
  updatedAt: string;
};

async function getClinicStatus(): Promise<ClinicStatus> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/clinic-status`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

export default async function Home() {
  const status = await getClinicStatus();
  const updatedAt = new Date(status.updatedAt).toLocaleString();
  return (
    <div className="min-h-screen bg-white px-6 py-16 text-zinc-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-rbg.png"
              alt="AudiologyLink"
              className="h-10 w-auto"
            />
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              AudiologyLink
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Clinic Status
          </h1>
          <p className="text-base text-zinc-600">
            Live data served from the backend vertical slice.
          </p>
        </header>
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Clinic</p>
                <p className="text-lg font-semibold">{status.name}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                {status.status.toUpperCase()}
              </span>
            </div>
            <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Clinic ID
                </p>
                <p className="font-medium text-zinc-700">{status.clinicId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Last Updated
                </p>
                <p className="font-medium text-zinc-700">{updatedAt}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
