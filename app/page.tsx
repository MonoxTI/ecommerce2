import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Navbar />
      <h1 className="text-4xl font-bold mb-4">Welcome to My Next.js App!</h1>
    </div>
  );
}
