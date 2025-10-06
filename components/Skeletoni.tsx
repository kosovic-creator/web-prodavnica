export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm animate-pulse">
      {/* Slika skeleton */}
      <div className="mb-3 flex justify-center">
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-md"></div>
      </div>

      <div className="flex-1 space-y-2">
        {/* Naziv skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>

        {/* Opis skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Karakteristike skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        {/* Kategorija skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>

        {/* Cena i količina skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Dugmad skeleton */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function DodajProizvodSkeleton() {
    return (
        <div className="max-w-2xl mx-auto p-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <form className="flex flex-col gap-4">
                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        <div className="h-8 bg-gray-200 rounded w-20 mr-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="w-full h-10 bg-gray-200 rounded"></div>
                    </div>

                    <div className="mb-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="w-full h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="w-full h-24 bg-gray-200 rounded"></div>
                    </div>

                    <div className="mb-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="w-full h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="w-full h-10 bg-gray-200 rounded"></div>
                </div>

                <div className="mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="w-full h-24 bg-gray-200 rounded"></div>
                </div>
            </form>
        </div>
    );
}
