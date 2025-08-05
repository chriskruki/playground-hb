import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_LINKS } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Minigolf Control Hub</h1>

      <div className="w-full max-w-md flex flex-col gap-4">
        {DASHBOARD_LINKS.map((link, index) => {
          const isExternal = link.url.startsWith("http");

          return (
            <Card key={index} className="bg-slate-300">
              <CardContent className="p-4">
                <Link href={link.url}>
                  <Button variant="secondary" className="w-full cursor-pointer">
                    {link.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
