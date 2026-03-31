import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium text-zinc-500">Checkout canceled</p>
        <h1 className="mt-1 text-2xl font-semibold">No worries</h1>
        <p className="mt-3 text-zinc-700">
          Your payment was not completed. You can return to your free report and
          unlock the full audit any time.
        </p>

        <Link
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
          href="/"
        >
          Back to audit
        </Link>
      </div>
    </main>
  );
}
