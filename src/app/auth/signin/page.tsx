import { redirect } from "next/navigation";

export default async function AuthSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/book";
  redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
