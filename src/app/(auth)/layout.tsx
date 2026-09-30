export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 px-4">
      <div className="mb-8 text-center">
        <span className="text-4xl">🌱</span>
        <h1 className="mt-2 text-2xl font-bold text-emerald-800">AiCansei</h1>
        <p className="text-sm text-emerald-600">
          Doe o que nao precisa, receba o que precisa
        </p>
      </div>
      {children}
    </div>
  )
}
