import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
        <p className="text-gray-600">
          히즈트리 개인정보처리방침입니다.
        </p>
      </div>

      <div className="prose max-w-none">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 처리목적)</h2>
            <div className="space-y-3 text-gray-700">
              <p>히즈트리(이하 &ldquo;회사&rdquo;)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>회원 가입 및 관리</li>
                <li>설문 및 폼 제작 서비스 제공</li>
                <li>설문 응답 데이터 수집 및 제공</li>
                <li>설문 결과 분석 및 통계 서비스 제공</li>
                <li>고객 문의 및 민원 처리</li>
                <li>서비스 개선 및 개발</li>
                <li>부정 이용 방지 및 보안 강화</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제2조 (처리하는 개인정보의 항목)</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. 필수 정보</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>표시 이름 (선택사항)</li>
                  <li>가입일시</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. 소셜 로그인 시 추가 정보</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>소셜 계정 고유 ID</li>
                  <li>프로필 이미지 (선택사항)</li>
                  <li>소셜 계정에서 제공하는 기본 정보</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. 서비스 이용 과정에서 수집되는 정보</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>접속 기록, IP 주소, 쿠키</li>
                  <li>기기 정보 (OS, 브라우저 종류 등)</li>
                  <li>설문 응답 시 입력한 모든 정보 (설문 제작자가 요청한 항목에 따라 다름)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제3조 (설문 응답 데이터의 수집 및 처리)</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>설문 응답 데이터 저장 및 관리에 대한 중요 안내:</strong></p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ 회사는 서비스 제공 및 개선을 위해 설문 응답 데이터를 저장하고 처리합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">설문 응답 데이터 처리 목적:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>설문 제작자에게 응답 데이터 제공</li>
                  <li>설문 결과 분석 및 통계 서비스 제공</li>
                  <li>부적절한 내용 및 스팸 방지</li>
                  <li>신고 접수 시 사실 확인 및 조치</li>
                  <li>서비스 품질 개선 및 기능 개발</li>
                  <li>법적 분쟁 발생 시 증거 자료</li>
                  <li>관련 법령에 따른 수사기관 요청 시 협조</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">설문 응답 데이터 보관 기간:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>일반 응답 데이터: 설문 제작자가 삭제할 때까지 또는 회원 탈퇴 시까지</li>
                  <li>신고 접수된 내용: 처리 완료 후 3개월</li>
                  <li>법적 분쟁 관련 내용: 분쟁 해결까지</li>
                  <li>회원 탈퇴 시: 관련 법령에 따라 필요한 기간 동안 보관</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">설문 응답 데이터 보호 조치:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>암호화를 통한 안전한 저장</li>
                  <li>접근 권한 제한 및 로그 관리</li>
                  <li>정기적인 보안 점검</li>
                  <li>설문 제작자에 의한 데이터 삭제 기능 제공</li>
                  <li>보관 기간 만료 시 자동 삭제</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제4조 (개인정보의 처리 및 보유기간)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">구체적인 보유기간:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>회원 가입 정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 필요한 경우 일정 기간 보관)</li>
                  <li>설문 응답 데이터: 설문 제작자가 삭제할 때까지 또는 회원 탈퇴 시까지 (단, 신고 접수 시 처리 완료 후 3개월)</li>
                  <li>설문 폼 데이터: 설문 제작자가 삭제할 때까지 또는 회원 탈퇴 시까지</li>
                  <li>접속 기록: 3개월</li>
                  <li>부정 이용 기록: 1년</li>
                  <li>고객 문의 기록: 3년</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제5조 (개인정보의 제3자 제공)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
              <p>2. 다음의 경우에 개인정보를 제3자에게 제공할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>정보주체가 사전에 동의한 경우</li>
                <li>법률에 의하여 요구되는 경우</li>
                <li>수사목적으로 법정절차에 따라 요구받는 경우</li>
                <li>다른 법률에 특별한 규정이 있는 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제6조 (개인정보처리의 위탁)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2">수탁업체</th>
                      <th className="text-left py-2">위탁업무</th>
                      <th className="text-left py-2">보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">히즈트리(개인사업자)</td>
                      <td className="py-2">시스템 개발, 운영, 유지보수</td>
                      <td className="py-2">위탁계약 종료시까지</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Supabase Inc.</td>
                      <td className="py-2">데이터베이스 관리, 인증 서비스</td>
                      <td className="py-2">위탁계약 종료시까지</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제7조 (정보주체의 권리·의무 및 행사방법)</h2>
            <div className="space-y-3 text-gray-700">
              <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 처리현황 통지 요구</li>
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
              <p className="mt-3">권리 행사는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제8조 (개인정보의 안전성 확보조치)</h2>
            <div className="space-y-3 text-gray-700">
              <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>개인정보에 대한 접근 제한</li>
                <li>개인정보를 안전하게 저장·전송할 수 있는 암호화 기법 사용</li>
                <li>해킹 등에 대비한 기술적 대책</li>
                <li>개인정보처리시스템 등의 접근권한 관리</li>
                <li>접속기록의 보관 및 위변조 방지</li>
                <li>개인정보의 안전한 보관을 위한 보관시설 마련</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제9조 (개인정보보호책임자)</h2>
            <div className="space-y-3 text-gray-700">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                <p><strong>개인정보보호책임자</strong></p>
                <p>성명: 송지호</p>
                <p>직책: 개인정보보호책임자</p>
                <p>연락처: vanadate.kr@gmail.com</p>
                <p>처리시간: 평일 09:00 - 18:00</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">제10조 (개인정보 처리방침 변경)</h2>
            <div className="space-y-3 text-gray-700">
              <p>1. 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              <p>2. 중요한 변경사항이 있는 경우 30일 전에 공지하고, 개인정보 수집 및 이용, 제3자 제공 등에 관한 사항이 변경되는 경우에는 별도의 동의를 받을 수 있습니다.</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>시행일:</strong> 2025년 8월 29일<br />
              <strong>문의:</strong> vanadate.kr@gmail.com<br />
              <strong>개인정보보호 신고센터:</strong> privacy.go.kr<br />
              <strong>개인정보 분쟁조정위원회:</strong> kopico.go.kr
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/terms"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          이용약관 보기
        </Link>
      </div>
    </div>
  );
}