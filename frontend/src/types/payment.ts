// 카카오페이 결제 관련 타입 정의

// 카카오페이 결제 시작 요청
export interface KakaoPayReadyRequest {
  totalPrice: string; // 총 금액 (문자열로 전송)
  farmUuid: string;   // 농장 UUID
}

// 카카오페이 결제 시작 응답
export interface KakaoPayReadyResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    tid: string;                    // 결제 고유 번호
    next_redirect_pc_url: string;  // PC용 결제 페이지 URL
  };
}

// 카카오페이 결제 승인 응답 (백엔드에서 자동 처리)
export interface KakaoPayApproveResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    tid: string;                    // 결제 고유 번호
    amount: {
      total: number;               // 총 결제 금액
    };
    partner_order_id: string;      // 농장 UUID (farmUuid)
    partner_user_id: string;       // 사용자 UUID
  };
}

// 기부하기 API는 백엔드에서 카카오페이 승인과 함께 자동 처리되므로
// 프론트엔드에서 별도의 기부 API 타입은 불필요함
