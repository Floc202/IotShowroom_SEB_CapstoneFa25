export const STORAGE_KEYS = {
  ACCESS_TOKEN: "iot_access_token",
  REFRESH_TOKEN: "iot_refresh_token",
};

export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
} as const;

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN_DASHBOARD: "/admin",
  MANAGER_DASHBOARD: "/manager",
  INSTRUCTOR_DASHBOARD: "/instructor",
  STUDENT_DASHBOARD: "/student",
};
