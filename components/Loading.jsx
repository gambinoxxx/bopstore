import Container from "@/components/Container";
import { Card, CardContent } from "@/app/(public)/ui/card";
import { Skeleton } from "@/app/(public)/ui/skeleton";

const DealPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      {/* Breadcrumb Skeleton */}
      <Container className="pt-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-20" />
        </div>
      </Container>

      {/* Hero Section Skeleton */}
      <Container className="py-8 sm:py-12">
        <Card className="bg-slate-200 border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
                <div>
                  <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-full max-w-md mb-2 sm:mb-4" />
                  <Skeleton className="h-4 w-full max-w-2xl mb-2" />
                  <Skeleton className="h-4 w-3/4 max-w-xl" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((item, index) => (
                    <div
                      key={item}
                      className={`bg-slate-300/50 rounded-lg p-3 sm:p-4 ${
                        index === 2 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 sm:h-8 w-12" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:flex-shrink-0">
                <div className="bg-slate-300/50 rounded-xl p-4 sm:p-6 border border-slate-400/30">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="flex flex-col items-center bg-white rounded-lg p-2 sm:p-3 shadow-md border"
                        >
                          <Skeleton className="h-6 sm:h-8 w-8 mb-1" />
                          <Skeleton className="h-3 w-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>

      {/* Products Section Header Skeleton */}
      <Container className="py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Skeleton className="h-8 sm:h-10 w-48" />
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-2" />
          <Skeleton className="h-4 w-3/4 max-w-xl mx-auto" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, item) => (
            <Card key={item} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full h-48 sm:h-52" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, star) => (
                      <Skeleton key={star} className="w-4 h-4" />
                    ))}
                    <Skeleton className="h-3 w-8 ml-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default DealPageSkeleton;