// Mock data for admin dashboard statistics and user info

export const mockRootProps = {
  user: {
    id: "admin-user-1",
    email: "admin@cresol.com.br",
    user_metadata: {
      full_name: "Administrador Cresol"
    }
  },
  stats: {
    totalUsers: 3,
    pendingRequests: 0,
    totalSectors: 2,
    totalSubsectors: 2
  }
};