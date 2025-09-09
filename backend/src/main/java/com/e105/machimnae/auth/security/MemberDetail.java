//package com.e105.machimnae.auth.security;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.userdetails.UserDetails;
//
//@RequiredArgsConstructor
//public class MemberDetails implements UserDetails {
//
//    private final Member member;
//
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
//    }
//
//    @Override
//    public String getPassword() {
//        return null; // 비밀번호를 사용하지 않아 null 반환
//    }
//
//    @Override
//    public String getUsername() {
//        return member.getMemberUuid(); // 예시로 uuid를 username으로 반환
//    }
//
//    @Override
//    public boolean isAccountNonExpired() {
//        return true; // 비활성화 로직이 필요하다면 수정 가능
//    }
//
//    @Override
//    public boolean isAccountNonLocked() {
//        return true; // 비활성화 로직이 필요하다면 수정 가능
//    }
//
//    @Override
//    public boolean isCredentialsNonExpired() {
//        return true; // 비활성화 로직이 필요하다면 수정 가능
//    }
//
//    @Override
//    public boolean isEnabled() {
//        return true; // 비활성화 로직이 필요하다면 수정 가능
//    }
//}