import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "../components/Status";
import { api } from "../lib/api";

export function ReservationsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["reservations", page],
    queryFn: () => api.listReservations(page, pageSize)
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteReservation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] })
  });

  if (listQuery.isLoading) return <LoadingState text="Loading reservations..." />;
  if (listQuery.isError) return <ErrorState message={(listQuery.error as Error).message} />;

  const data = listQuery.data;
  if (!data?.items.length) return <EmptyState text="No reservations yet." />;

  return (
    <section>
      <h2>Reservas</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Space</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.clientEmail}</td>
              <td>{reservation.space?.name ?? reservation.spaceId}</td>
              <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
              <td>
                {reservation.startTime} - {reservation.endTime}
              </td>
              <td>
                <button
                  onClick={() => {
                    const confirmed = window.confirm("Delete this reservation?");
                    if (confirmed) deleteMutation.mutate(reservation.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deleteMutation.isError && <ErrorState message={(deleteMutation.error as Error).message} />}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
          Previous
        </button>
        <span>
          Page {data.page} / {data.totalPages}
        </span>
        <button
          disabled={page >= data.totalPages}
          onClick={() => setPage((value) => Math.min(value + 1, data.totalPages))}
        >
          Next
        </button>
      </div>
    </section>
  );
}
