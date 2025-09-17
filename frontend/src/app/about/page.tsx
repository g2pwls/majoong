export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            마중 소개
          </h1> 
          <p className="text-lg text-gray-600">
            말과 목장을 위한 투명한 후원 플랫폼
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            마중이란?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            마중은 말과 목장을 위한 투명한 후원 플랫폼입니다. 
            후원자와 목장을 연결하여 말들의 건강한 삶을 지원하고, 
            목장의 지속가능한 운영을 돕습니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            블록체인 기술을 활용하여 모든 후원 내역을 투명하게 기록하고, 
            후원자들이 자신의 기부가 어떻게 사용되는지 실시간으로 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              투명한 후원
            </h3>
            <p className="text-gray-700">
              블록체인을 통해 모든 후원 내역이 투명하게 기록되고 공개됩니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              실시간 모니터링
            </h3>
            <p className="text-gray-700">
              후원한 말들의 상태와 목장의 운영 현황을 실시간으로 확인할 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              직접 후원
            </h3>
            <p className="text-gray-700">
              원하는 말이나 목장을 선택하여 직접 후원할 수 있습니다.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              지속가능한 목장 운영
            </h3>
            <p className="text-gray-700">
              목장의 안정적인 운영을 지원하여 말들의 건강한 삶을 보장합니다.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            지금 시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
