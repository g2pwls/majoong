package com.e105.majoong.common.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum BaseResponseStatus {

    /**
     * 200: 요청 성공
     **/
    SUCCESS(HttpStatus.OK, true, 200, "요청에 성공하였습니다."),

    /**
     * 400 : security 에러
     */
    WRONG_JWT_TOKEN(HttpStatus.UNAUTHORIZED, false, 401, "다시 로그인 해주세요"),
    NO_SIGN_IN(HttpStatus.UNAUTHORIZED, false, 402, "로그인을 먼저 진행해주세요"),
    NO_ACCESS_AUTHORITY(HttpStatus.FORBIDDEN, false, 403, "접근 권한이 없습니다"),
    DISABLED_USER(HttpStatus.FORBIDDEN, false, 404, "비활성화된 계정입니다. 계정을 복구하시겠습니까?"),
    FAILED_TO_RESTORE(HttpStatus.INTERNAL_SERVER_ERROR, false, 405, "계정 복구에 실패했습니다. 관리자에게 문의해주세요."),

    /**
     * 900: 기타 에러
     */
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 900, "Internal server error"),
    SSE_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, false, 901, "알림 전송에 실패하였습니다."),

    /**
     * 2000: users service error
     */
    // token
    TOKEN_NOT_VALID(HttpStatus.UNAUTHORIZED, false, 2001, "토큰이 유효하지 않습니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, false, 2002, "리프레시 토큰이 유효하지 않습니다."),

    // Users
    DUPLICATED_USER(HttpStatus.CONFLICT, false, 2101, "이미 가입된 멤버입니다."),
    FAILED_TO_LOGIN(HttpStatus.UNAUTHORIZED, false, 2102, "아이디 또는 패스워드를 다시 확인하세요."),
    DUPLICATED_SOCIAL_USER(HttpStatus.CONFLICT, false, 2103, "이미 소셜 연동된 계정입니다."),
    DUPLICATED_SOCIAL_PROVIDER_USER(HttpStatus.CONFLICT, false, 2104, "계정에 동일한 플랫폼이 이미 연동되어있습니다"),
    NO_EXIST_USER(HttpStatus.NOT_FOUND, false, 2105, "존재하지 않는 멤버 정보입니다."),
    PASSWORD_SAME_FAILED(HttpStatus.BAD_REQUEST, false, 2106, "현재 사용중인 비밀번호 입니다."),
    PASSWORD_CONTAIN_NUM_FAILED(HttpStatus.BAD_REQUEST, false, 2107, "휴대폰 번호를 포함한 비밀번호 입니다."),
    PASSWORD_MATCH_FAILED(HttpStatus.BAD_REQUEST, false, 2108, "패스워드를 다시 확인해주세요."),
    INVALID_EMAIL_ADDRESS(HttpStatus.BAD_REQUEST, false, 2012, "이메일을 다시 확인해주세요."),
    FAILED_TO_SIGN_UP(HttpStatus.INTERNAL_SERVER_ERROR, false, 2013, "회원가입에 실패했습니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, false, 2015, "올바르지 않은 입력값입니다."),

     // Farm
    NO_EXIST_FARM(HttpStatus.NOT_FOUND, false, 2401, "존재하지 않는 농장입니다."),
    NO_EXIST_HORSE(HttpStatus.NOT_FOUND, false, 2402, "존재하지 않는 말입니다."),
    FARM_STATE_UPLOAD_ERROR(HttpStatus.BAD_REQUEST, false, 2403, "말 상태 업로드 중 오류가 발생했습니다"),
    NO_EXIST_FARM_VAULT(HttpStatus.NOT_FOUND, false, 2402, "존재하지 않는 금고입니다."),
    NO_EXIST_DONATOR(HttpStatus.NOT_FOUND, false, 2403, "존재하지 않는 기부자입니다."),
    DUPLICATED_BOOKMARK(HttpStatus.CONFLICT, false, 2404, "이미 등록된 농장입니다."),
    NO_EXIST_MY_FARM(HttpStatus.NOT_FOUND, false, 2405, "내 농장을 조회할 수 없습니다."),
    NO_EXIST_HORSE_STATE(HttpStatus.NOT_FOUND, false, 2406, "농장 상태를 조회할 수 없습니다."),
    IS_DELETED_HORSE(HttpStatus.NOT_FOUND, false, 2407, "이미 삭제된 말입니다"),

    //s3
    S3_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 4003, "S3 업로드 중 오류 발생"),

    //Settlement
    SETTLEMENT_ALREADY_PROCESSED(HttpStatus.CONFLICT, false, 2601, "이미 처리된 증빙입니다."),
    EVIDENCE_INVALID(HttpStatus.BAD_REQUEST, false, 2602, "증빙 검증에 실패했습니다."),
    SETTLEMENT_RELEASE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, false, 2603, "정산(출금) 처리에 실패했습니다."),
    INVALID_FARM_UUID(HttpStatus.BAD_REQUEST, false, 2604, "유효하지 않은 농장 식별자입니다."),
    INVALID_WALLET_ADDRESS(HttpStatus.BAD_REQUEST, false, 2605, "유효하지 않은 지갑 주소입니다."),
    INVALID_AMOUNT(HttpStatus.BAD_REQUEST, false, 2606, "유효하지 않은 금액입니다."),
    NO_ACTIVE_FARM_VAULT(HttpStatus.NOT_FOUND, false, 2607, "활성화된 목장 금고가 없습니다."),

    /**
     * 5000: notification service error
     */

    // Notification
    NO_EXIST_NOTIFICATION_SETTING(HttpStatus.NOT_FOUND, false, 5001, "유저의 알림 설정이 존재하지 않습니다."),
    EXIST_NOTIFICATION_SETTING(HttpStatus.BAD_REQUEST, false, 5002, "유저의 알림 설정이 이미 존재합니다."),
    NO_EXIST_NOTIFICATION(HttpStatus.NOT_FOUND, false, 5003, "존재하지 않는 알림입니다."),
    CANNOT_SHARE(HttpStatus.BAD_REQUEST, false, 5004, "공유할 수 없는 유저입니다."),

    /**
     * 6000: gpt-api error
     */
    // Gpt
    GPT_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, false, 6001, "GPT API 호출에 실패했습니다."),

    //report
    NO_EXIST_MONTHLY_REPORT(HttpStatus.NOT_FOUND, false, 7001, "월간 보고서가 존재하지 않습니다."),
    //score
    NO_EXIST_MY_SCORE(HttpStatus.NOT_FOUND, false, 7301, "내 신뢰도를 찾을 수 없습니다."),

    //batch
    NO_EXIST_JOB_PARAMETER(HttpStatus.NOT_FOUND, false, 8001, "파라미터가 존재하지 않습니다"),
    ;
  private final HttpStatusCode httpStatusCode;
    private final boolean isSuccess;
    private final int code;
    private final String message;

}