import { baseApi } from './baseApi';

// Types for Admin API
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateAdminRequest {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  roleId: string;
  password: string;
}

export interface UpdateAdminRequest extends Partial<Omit<CreateAdminRequest, 'password'>> {
  id: string;
  isActive?: boolean;
}

export interface AdminUsersResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: AdminUser[];
}

export interface AdminUserResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: AdminUser;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface RolesResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: Role[];
}

// Admin API endpoints
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all admin users
    getAdminUsers: builder.query<AdminUsersResponse, void>({
      query: () => '/api/Admin/users',
      providesTags: ['Admin'],
    }),

    // GET - Fetch single admin user by ID
    getAdminUserById: builder.query<AdminUserResponse, string>({
      query: (id) => `/api/Admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    // POST - Create new admin user
    createAdminUser: builder.mutation<AdminUserResponse, CreateAdminRequest>({
      query: (newAdmin) => ({
        url: '/api/Admin/users',
        method: 'POST',
        body: newAdmin,
      }),
      invalidatesTags: ['Admin'],
    }),

    // PUT - Update existing admin user
    updateAdminUser: builder.mutation<AdminUserResponse, UpdateAdminRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/Admin/users/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admin', id }, 'Admin'],
    }),

    // DELETE - Delete admin user
    deleteAdminUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/Admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Admin', id }, 'Admin'],
    }),

    // PUT - Toggle admin user active status
    toggleAdminUserStatus: builder.mutation<AdminUserResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/Admin/users/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admin', id }, 'Admin'],
    }),

    // GET - Fetch all roles
    getRoles: builder.query<RolesResponse, void>({
      query: () => '/api/Admin/roles',
      providesTags: ['Role'],
    }),

    // GET - Dashboard statistics
    getDashboardStats: builder.query<any, void>({
      query: () => '/api/Admin/dashboard/stats',
      providesTags: ['Admin'],
    }),

    // POST - Reset admin password
    resetAdminPassword: builder.mutation<{ success: boolean }, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/api/Admin/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useToggleAdminUserStatusMutation,
  useGetRolesQuery,
  useGetDashboardStatsQuery,
  useResetAdminPasswordMutation,
} = adminApi; 