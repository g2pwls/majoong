package com.e105.majoong.kakaoPay.dto.out;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApproveResponse {

    String aid;
    String tid;
    String cid;
    String partner_order_id;
    String partner_user_id;
    String payment_method_type;
    String item_name;
    String item_code;
    int quantity;
    String created_at;
    String approved_at;
    String payload;
}