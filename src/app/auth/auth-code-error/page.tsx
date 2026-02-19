import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <CardTitle className="text-2xl font-bold mt-4">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Something went wrong during authentication. The link may have expired or been invalid.
          </p>
          <Link href="/auth/login">
            <Button>Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
