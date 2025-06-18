import { baseApi } from './baseApi';

// Types for Events API
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
}

// New create event types based on API specification
export interface CreateNewEventRequest {
  eventDetails: {
    eventName: string;
    description: string;
    startDate: string;
    endDate: string;
  };
  location: {
    venueName: string;
    addressLine1: string;
    addressLine2: string;
    countryId: number;
    stateId: number;
    cityId: number;
    postalCode: number;
    latitude: number;
    longitude: number;
    googleMapLink: string;
  };
  marketingAbbreviation: string;
  themeSelectionId: number;
  fontFamilyId: number;
  eventUrl: string;
  logoUrl: string;
  payment: boolean;
  eventCatalogId: number;
  eventStatusId: number;
  paymentDetailsId: number;
  eventModeId: number;
  eventAdministrator: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateNewEventResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: any;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

export interface EventsResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: Event[];
}

export interface EventResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: Event;
}

// Events API endpoints
export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all events
    getEvents: builder.query<EventsResponse, void>({
      query: () => '/api/Events',
      providesTags: ['Event'],
    }),

    // GET - Fetch single event by ID
    getEventById: builder.query<EventResponse, string>({
      query: (id) => `/api/Events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    // POST - Create new event (old endpoint)
    createEvent: builder.mutation<EventResponse, CreateEventRequest>({
      query: (newEvent) => ({
        url: '/api/Events',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['Event'],
    }),

    // POST - Create new event (new endpoint with full structure)
    createNewEvent: builder.mutation<CreateNewEventResponse, CreateNewEventRequest>({
      query: (newEvent) => ({
        url: '/api/Event/createEvent',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['Event'],
    }),

    // PUT - Update existing event
    updateEvent: builder.mutation<EventResponse, UpdateEventRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/Events/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }, 'Event'],
    }),

    // DELETE - Delete event
    deleteEvent: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/Events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }, 'Event'],
    }),

    // GET - Search events
    searchEvents: builder.query<EventsResponse, { query?: string; status?: string }>({
      query: ({ query, status }) => {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (status) params.append('status', status);
        return `/api/Events/search?${params.toString()}`;
      },
      providesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useCreateNewEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useSearchEventsQuery,
} = eventsApi; 