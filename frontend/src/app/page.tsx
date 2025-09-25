import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            마중
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            목장 후원과 기부를 통해 따뜻한 마음을 나누는 플랫폼입니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              목장 후원하기
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              서비스 소개
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              마중의 특징
            </h2>
            <p className="text-lg text-gray-600">
              투명하고 안전한 목장 후원 플랫폼
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">안전한 후원</h3>
              <p className="text-gray-600">블록체인 기술로 투명하고 안전한 후원 시스템</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">직접 후원</h3>
              <p className="text-gray-600">목장과 직접 연결되어 의미있는 후원</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">간편한 이용</h3>
              <p className="text-gray-600">카카오톡으로 간편하게 시작하는 후원</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            마음을 나누는 따뜻한 후원에 참여하세요
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
          >
            카카오톡으로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
