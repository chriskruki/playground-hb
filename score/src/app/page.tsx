import { holes } from "@/lib/holes";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return <AppShell holesData={holes} />;
}
