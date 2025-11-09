import type { RoleName } from "../types/auth";

export const getErrorMessage = (err: unknown): string => {
  if (!err) return "Something went wrong";

  const anyErr = err as any;

  if (anyErr?.response?.data?.errors) {
    const errors = anyErr.response.data.errors;

    if (typeof errors === "object" && !Array.isArray(errors)) {
      const errorMessages = Object.entries(errors)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(", ")}`;
          }
          return `${field}: ${messages}`;
        })
        .join("; ");

      if (errorMessages) return errorMessages;
    }

    if (Array.isArray(errors)) {
      const errorMessages = errors.join("; ");
      if (errorMessages) return errorMessages;
    }
  }

  if (
    anyErr?.response?.data?.Password &&
    Array.isArray(anyErr.response.data.Password)
  ) {
    return `Password: ${anyErr.response.data.Password.join(", ")}`;
  }

  if (anyErr?.response?.data?.message) {
    return anyErr.response.data.message;
  }

  if (anyErr?.message) {
    return anyErr.message;
  }

  return "Something went wrong";
};

export const roleRedirectMap: Record<RoleName, string> = {
  Admin: "/admin/dashboard",
  Instructor: "/instructor/dashboard",
  Student: "/student/dashboard",
};
