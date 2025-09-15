import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            마중
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            카카오톡으로 간편하게 시작하세요
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            로그인하기
          </Link>
          
          <p className="text-sm text-gray-500">
            서비스 이용을 위해 로그인이 필요합니다
          </p>
        </div>
      </div>
    </div>
  );
}
