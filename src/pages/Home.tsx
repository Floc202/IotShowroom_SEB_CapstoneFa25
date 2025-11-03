import { useAuth } from "../providers/AuthProvider";

export default function Home() {
  const { user} = useAuth();
  console.log("user: ", user)

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Welcome to IoT Showroom</h1>
      <p className="text-gray-600">
        This is the landing page for guests, students, and instructors.
      </p>
    </div>
  );
}
