package com.e105.majoong.member.repository;

import com.e105.majoong.member.entity.OauthMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OauthMemberRepository extends JpaRepository<OauthMember, Long> {
    Optional<OauthMember> findByOauthIdAndOauthProvider(String oauthId, String oauthProvider);

    Optional<OauthMember> findByMemberUuid(String memberUuid);
}