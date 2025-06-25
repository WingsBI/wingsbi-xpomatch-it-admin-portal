import { baseApi } from './baseApi';

// Types for Common API
export interface ThemeSelection {
  id: number;
  label: string;
  color: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
}

export interface FontStyle {
  id: number;
  label: string;
  fontFamily: string;
  className: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy: number | null;
  modifiedDate: string | null;
}

export interface ThemeSelectionsResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: ThemeSelection[];
}

export interface FontStylesResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: FontStyle[];
}

// Common API endpoints
export const commonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all theme selections
    getAllThemeSelections: builder.query<ThemeSelectionsResponse, void>({
      query: () => '/api/Common/getAllThemeSelections',
    }),

    // GET - Fetch all font styles
    getAllFontsStyles: builder.query<FontStylesResponse, void>({
      query: () => '/api/Common/getAllFontsStyles',
    }),
  }),
});

export const {
  useGetAllThemeSelectionsQuery,
  useGetAllFontsStylesQuery,
  useLazyGetAllThemeSelectionsQuery,
  useLazyGetAllFontsStylesQuery,
} = commonApi; 