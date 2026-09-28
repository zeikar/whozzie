import Link from "next/link";

// Requests the locale proxy never sees (e.g. a missing file) end up here,
// outside app/[locale], so this page brings its own <html>.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="grid place-items-center p-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Page not found</h1>
          <Link href="/" className="mt-4 inline-block underline underline-offset-4">
            Back to Whozzie
          </Link>
        </div>
      </body>
    </html>
  );
}
