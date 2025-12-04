export default function Suspended() {
    return (
      <div className="h-screen flex items-center justify-center bg-red-100">
        <div className="p-10 bg-white rounded-xl shadow text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Your Account is Suspended
          </h1>
          <p className="mt-4 text-gray-700">
            Please contact the administrator for assistance.
          </p>
        </div>
      </div>
    );
  }
  