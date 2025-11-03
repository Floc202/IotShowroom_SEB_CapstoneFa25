export const getErrorMessage = (err: unknown): string => {
  if (!err) return "Something went wrong";
  
  const anyErr = err as any;

  return (
    anyErr?.response?.data?.message || anyErr?.message || "Something went wrong"
  );
};
