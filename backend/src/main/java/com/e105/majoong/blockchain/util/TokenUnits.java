package com.e105.majoong.blockchain.util;

import java.math.BigInteger;

public final class TokenUnits {
  private static final BigInteger TEN18 = new BigInteger("1000000000000000000");

  private TokenUnits() {}

  /** 100원 단위 정책 검증: 최소 krwPerToken 이상, krwPerToken 배수 */
  public static void assertKrwIsValid(long krw, long krwPerToken) {
    if (krw < krwPerToken) {
      throw new IllegalArgumentException("최소 금액은 " + krwPerToken + "원입니다.");
    }
    if (krw % krwPerToken != 0) {
      throw new IllegalArgumentException(krwPerToken + "원 단위로만 가능합니다.");
    }
  }

  /** KRW → 정수 MARON 토큰 개수 (정책 검증 포함) */
  public static long krwToMaronTokensExact(long krw, long krwPerToken) {
    assertKrwIsValid(krw, krwPerToken);
    return krw / krwPerToken;  // ex) 5000원, 100원/토큰 → 50
  }

  /** 정수 MARON 토큰 개수 → 최소단위(wei) */
  public static BigInteger maronTokensToWei(long tokenCount) {
    return BigInteger.valueOf(tokenCount).multiply(TEN18); // ex) 5 → 5 * 1e18
  }

  /** KRW → 최소단위(wei) (정책 검증 포함) */
  public static BigInteger krwToMaronWeiExact(long krw, long krwPerToken) {
    return maronTokensToWei(krwToMaronTokensExact(krw, krwPerToken));
  }

  /** 최소단위(wei) → 정수 토큰 개수 (나누어떨어지지 않으면 예외) */
  public static long maronWeiToTokenCountExact(BigInteger maronWei) {
    BigInteger[] div = maronWei.divideAndRemainder(TEN18);
    if (!div[1].equals(BigInteger.ZERO)) {
      throw new IllegalArgumentException("최소단위 값이 정수 MARON으로 나누어떨어지지 않습니다.");
    }
    return div[0].longValueExact();
  }

  /** 정수 토큰 개수 표시용 문자열 */
  public static String maronTokensToString(long tokenCount) {
    return Long.toString(tokenCount);
  }
}
