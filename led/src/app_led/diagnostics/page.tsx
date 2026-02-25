import Link from "next/link";
import { Button } from "../../components/ui/button";
import { ApiTestDemo } from "../../components/ApiTestDemo";

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Diagnostics</h1>
            <p className="text-gray-600 mt-2">Test API connectivity and system status</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        <ApiTestDemo />
      </div>
    </div>
  );
}
