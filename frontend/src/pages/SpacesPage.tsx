import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "../components/Status";
import { api } from "../lib/api";

export function SpacesPage(): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const spacesQuery = useQuery({ queryKey: ["spaces"], queryFn: api.getSpaces });
  const selectedQuery = useQuery({
    queryKey: ["space", selectedId],
    queryFn: () => api.getSpaceById(selectedId as string),
    enabled: Boolean(selectedId)
  });

  if (spacesQuery.isLoading) return <LoadingState text="Loading spaces..." />;
  if (spacesQuery.isError) return <ErrorState message={(spacesQuery.error as Error).message} />;
  if (!spacesQuery.data?.length) return <EmptyState text="No spaces found." />;

  return (
    <section>
      <h2>Espacios Disponibles</h2>
      <div className="grid">
        <div>
          <ul>
            {spacesQuery.data.map((space) => (
              <li key={space.id}>
                <button onClick={() => setSelectedId(space.id)}>{space.name}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          {!selectedId && <p>Select a space to see details.</p>}
          {selectedQuery.isLoading && <LoadingState text="Loading details..." />}
          {selectedQuery.isError && <ErrorState message={(selectedQuery.error as Error).message} />}
          {selectedQuery.data && (
            <>
              <h3>{selectedQuery.data.name}</h3>
              <p>
                <strong>Capacity:</strong> {selectedQuery.data.capacity}
              </p>
              <p>
                <strong>Reference:</strong> {selectedQuery.data.reference ?? "-"}
              </p>
              <p>
                <strong>Description:</strong> {selectedQuery.data.description ?? "-"}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
