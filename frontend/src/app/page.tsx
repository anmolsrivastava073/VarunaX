import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetching data from the deployed backend API
  const res = await fetch("https://oilspill-backend.vercel.app/api/v1/incidents", {
    cache: "no-store",
  });
  
  let incidents = [];
  if (res.ok) {
    const data = await res.json();
    incidents = data.data || [];
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8 min-h-screen">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-start py-16 px-8 bg-white dark:bg-[#0a0a0a] sm:items-start rounded-2xl shadow-sm border border-black/[.08] dark:border-white/[.145]">
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Ocean Sentinel <span className="text-zinc-400 font-normal">| Live Incidents</span>
            </h1>
          </div>
          
          <p className="max-w-md text-base leading-8 text-zinc-600 dark:text-zinc-400">
            Connected to SIH 2026 Backend Pipeline
          </p>

          <div className="w-full mt-8 flex flex-col gap-4">
            {incidents.length === 0 ? (
              <p className="text-zinc-500">No active incidents found.</p>
            ) : (
              incidents.map((incident: any) => (
                <div 
                  key={incident.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-medium text-black dark:text-zinc-200">
                      {incident.id}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                      Status: <strong className="font-medium text-black dark:text-zinc-300">{incident.status.replace(/_/g, ' ')}</strong>
                    </span>
                  </div>
                  
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a
                      className="flex h-10 flex-1 sm:flex-none items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                      href={`https://oilspill-backend.vercel.app/api/v1/incidents/${incident.id}/geojson`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Export Map (GeoJSON)
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
