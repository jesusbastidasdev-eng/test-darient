import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ErrorState, LoadingState } from "../components/Status";
import { api } from "../lib/api";

type FormValues = {
  spaceId: string;
  clientEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
};

const initialState: FormValues = {
  spaceId: "",
  clientEmail: "",
  reservationDate: "",
  startTime: "",
  endTime: ""
};

export function CreateReservationPage(): JSX.Element {
  const [values, setValues] = useState<FormValues>(initialState);
  const [formError, setFormError] = useState<string | null>(null);
  const spacesQuery = useQuery({ queryKey: ["spaces"], queryFn: api.getSpaces });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createReservation({
        ...values
      }),
    onSuccess: () => {
      setValues(initialState);
      setFormError(null);
    },
    onError: (error) => setFormError((error as Error).message)
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.spaceId || !values.clientEmail || !values.reservationDate || !values.startTime || !values.endTime) {
      setFormError("All fields are required.");
      return;
    }
    if (values.endTime <= values.startTime) {
      setFormError("End time must be greater than start time.");
      return;
    }
    setFormError(null);
    createMutation.mutate();
  };

  return (
    <section>
      <h2>Crear Reserva</h2>
      {spacesQuery.isLoading && <LoadingState text="Loading spaces..." />}
      {spacesQuery.isError && <ErrorState message={(spacesQuery.error as Error).message} />}
      <form onSubmit={onSubmit} className="form">
        <label>
          Space
          <select
            value={values.spaceId}
            onChange={(event) => setValues((state) => ({ ...state, spaceId: event.target.value }))}
          >
            <option value="">Select a space</option>
            {spacesQuery.data?.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Client Email
          <input
            type="email"
            value={values.clientEmail}
            onChange={(event) => setValues((state) => ({ ...state, clientEmail: event.target.value }))}
          />
        </label>
        <label>
          Reservation Date
          <input
            type="date"
            value={values.reservationDate}
            onChange={(event) => setValues((state) => ({ ...state, reservationDate: event.target.value }))}
          />
        </label>
        <label>
          Start Time
          <input
            type="time"
            value={values.startTime}
            onChange={(event) => setValues((state) => ({ ...state, startTime: event.target.value }))}
          />
        </label>
        <label>
          End Time
          <input
            type="time"
            value={values.endTime}
            onChange={(event) => setValues((state) => ({ ...state, endTime: event.target.value }))}
          />
        </label>
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : "Create Reservation"}
        </button>
      </form>
      {formError && <ErrorState message={formError} />}
      {createMutation.isSuccess && <p className="status success">Reservation created successfully.</p>}
    </section>
  );
}
