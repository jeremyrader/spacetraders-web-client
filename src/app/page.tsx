import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="font-bold text-2xl text-center">Space Traders</h1>
      <LoginForm></LoginForm>
    </main>
  );
}
