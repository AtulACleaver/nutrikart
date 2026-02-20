export default function ErrorMessage({ message, onRetry }) {
    return (
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6
                        text-center">
          <div className="text-3xl mb-3">😕</div>
          <h3 className="font-semibold text-red-800 mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-700 hover:text-red-900
                         underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }