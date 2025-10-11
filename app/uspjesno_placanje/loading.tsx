export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Učitavam uspješno plaćanje...</p>
      </div>
    </div>
  );
}
