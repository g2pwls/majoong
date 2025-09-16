package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "oauth_member")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OauthMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oauth_id", nullable = false)
    private String oauthId;

    @Column(name = "oauth_provider", nullable = false)
    private String oauthProvider;

    @Column(name = "member_uuid", nullable = false, length = 36)
    private String memberUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    public void updateRole(Role role) {
        this.role = role;
    }
}