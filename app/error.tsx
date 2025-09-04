'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">Error</h1>
        <p className="text-xl text-gray-600 mt-4">Something went wrong</p>
        <p className="text-gray-500 mt-2">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-4"
        >
          Try again
        </button>
        <a href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go back home
        </a>
      </div>
    </div>
  )
}