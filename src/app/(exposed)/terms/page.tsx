import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">이용약관</h1>
        <p className="text-gray-600">
          그리다, 폼 서비스 이용약관입니다.
        </p>
      </div>

      <div className="prose max-w-none">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              이 약관은 히즈트리(이하 &ldquo;회사&rdquo;)이 제공하는 설문 및 폼 제작 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. &ldquo;서비스&rdquo;란 회사가 제공하는 설문 및 폼 제작, 배포, 응답 수집 및 분석 서비스를 의미합니다.</p>
              <p>2. &ldquo;이용자&rdquo;란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
              <p>3. &ldquo;회원&rdquo;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</p>
              <p>4. &ldquo;설문&rdquo; 또는 &ldquo;폼&rdquo;이란 회원이 서비스를 통해 생성한 설문지 또는 양식을 의미합니다.</p>
              <p>5. &ldquo;응답자&rdquo;란 설문 또는 폼에 응답을 제출한 자를 의미합니다.</p>
              <p>6. &ldquo;응답 데이터&rdquo;란 응답자가 설문 또는 폼에 입력한 모든 정보를 의미합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
              <p>2. 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관을 변경하는 경우 적용일자 및 변경사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회원가입은 이용고객이 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
              <p>2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                <li>14세 미만 아동이 법정대리인의 동의를 얻지 아니한 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제5조 (개인정보보호)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.</p>
              <p>2. 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.</p>
              <p>3. 회사는 회원의 동의 없이 회원의 개인정보를 제3자에게 제공하지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제6조 (서비스 이용)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.</p>
              <p>2. 회사는 정기점검이나 긴급한 서버 점검 등의 사유로 서비스를 일시 중단할 수 있습니다.</p>
              <p>3. 회원은 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제7조 (금지행위)</h2>
            <div className="space-y-3 text-gray-700">
              <p>회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>신청 또는 변경시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 금지한 정보(컴퓨터 프로그램 등)의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>스팸, 광고성 정보 전송</li>
                <li>다른 회원에 대한 개인정보를 그 동의 없이 수집, 저장, 공개하는 행위</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제8조 (설문 및 응답 데이터 관리)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 서비스 품질 향상 및 부적절한 사용 방지를 위해 설문 및 응답 데이터를 모니터링할 수 있습니다.</p>
              <p>2. 회사는 다음 각 호에 해당하는 설문 또는 응답 데이터에 대해 사전 통지 없이 삭제하거나 이용을 제한할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>본 약관에 위배되는 내용</li>
                <li>법령에 위배되는 내용</li>
                <li>공서양속에 위배되는 내용</li>
                <li>다른 회원 또는 제3자에게 피해를 주는 내용</li>
                <li>영리를 목적으로 하는 광고성 내용</li>
                <li>개인정보보호법 등 관련 법령을 위반하는 내용</li>
              </ul>
              <p>3. 회원이 생성한 설문 및 응답 데이터는 서비스 개선 및 부적절한 사용 방지를 위해 일정 기간 보관될 수 있으며, 회원 탈퇴 시에도 법령에 따라 일정 기간 보관될 수 있습니다.</p>
              <p>4. 회원은 자신이 생성한 설문의 응답 데이터에 대한 책임을 지며, 응답자의 개인정보를 적법하게 처리해야 합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제9조 (책임제한)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              <p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
              <p>3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제10조 (준거법 및 관할법원)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 이 약관과 관련된 법적 분쟁에 대해서는 대한민국 법을 적용합니다.</p>
              <p>2. 회사와 회원간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>시행일:</strong> 2025년 8월 29일<br />
              <strong>문의:</strong> vanadate.kr@gmail.com
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link 
          href="/terms/privacy" 
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          개인정보처리방침 보기
        </Link>
      </div>
    </div>
  );
}