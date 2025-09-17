package com.e105.majoong.common.model.oAuthMember;

import com.e105.majoong.common.model.oAuthMember.OauthMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OauthMemberRepository extends JpaRepository<OauthMember, Long> {
    Optional<OauthMember> findByOauthIdAndOauthProvider(String oauthId, String oauthProvider);

    Optional<OauthMember> findByMemberUuid(String memberUuid);
}