export default function SchwabCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Schwab OAuth Callback</h1>
        <p className="text-green-600 font-medium mb-2">✅ Ready</p>
        <p className="text-sm text-slate-500">OAuth callback endpoint active.</p>
      </div>
    </div>
  );
}
