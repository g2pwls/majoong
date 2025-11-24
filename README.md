<div align="center"> 
  <img width="50%" src="profile/image/logo.png" />
</div>

## 🐎 마중
블록체인 기반 스마트 컨트랙트를 활용한 퇴역마 목장 후원 및 관리 모니터링 플랫폼

**참여인원**: 5명<br>
**프로젝트 기간**: 2025. 08. 25 - 2025. 10. 02 (6주)

<br>

## 🚀 프로젝트 소개

- **목적**: 퇴역마 복지를 위한 투명한 후원 및 관리 플랫폼 제공 

- **특징/차별점**
  - 블록체인 기반 스마트 컨트랙트 활용
  - 후원 내역 투명성 보장
  - 보고서 및 신뢰도 기반 운영 관리

- **핵심 대상**
  - 기부자: 퇴역마 보호에 관심 있는 일반인·단체
  - 목장주: 퇴역마를 실제로 보호·관리하는 농가/목장 운영자

- **사용 사례**
  - 기부자가 목장을 선택하여 기부 및 관리 모니터링
  - 목장주는 운영보고 및 영수증 증빙 업로드

<br>

## 👨‍👩‍👧‍👦 팀원 소개

<div align="center">

| 팀원 | 역할 | 담당 업무 |
|:---:|:---:|:---|
| [<img src="profile/image/박지현.png" width="100px;" style="border-radius:50%"><br>박지현](https://github.com/gorjheous) | **Frontend<br>design** | - 소셜 로그인 및 회원가입 (기부자, 목장주)<br>- 카카오페이 연동<br>- 마이페이지 (회원정보, 즐겨찾기, 목장 정보, 거래내역, 계좌내역)<br>- 목장 등록<br>- 말 컬렉션<br>- 기부/바로기부<br>- 메인 페이지 |
| [<img src="profile/image/윤혜진.png" width="100px;" style="border-radius:50%"><br>윤혜진](https://github.com/g2pwls) | **Frontend<br>design** | - 마중 소개<br>- 기부자 랜딩 페이지, 목장주 대시보드<br>- 기부/바로기부 화면 구현<br>- 전체 목장 및 말 조회<br>- 목장 상세: 홈, 말 목록, 월간 소식지, 기부금 사용 내역, 신뢰도 내역<br>- 영수증 OCR 및 AI 분석<br>- 말 관리 메타데이터 비교<br>- 목장 정보 수정<br>- 말 등록 공공데이터 연동 |
| [<img src="profile/image/정지용.png" width="100px;" style="border-radius:50%"><br>정지용](https://github.com/jung980514) | **Backend<br>Blockchain** | - 스마트 컨트랙트 설계/배포 (MaronToken, FarmVault, FarmVaultFactory)<br>- 기부/정산 처리: Mint, Release, Burn 로직 구현<br>- 지갑 연동 및 권한 관리<br>- 온체인 트랜잭션 처리 (Hardhat, Web3j)<br>- 백엔드 Spring Boot API 연동 |
| [<img src="profile/image/이희산.png" width="100px;" style="border-radius:50%"><br>이희산](https://github.com/Lee-heesan) | **Backend<br>security** | - 사업자 등록 진위 확인<br>- SSAFY 금융 API 계좌 생성/입출금 조회<br>- 전체 목장/말/월간 보고서/신뢰도/기부금 사용 내역 조회<br>- 마이페이지 회원 정보 조회<br>- QR/NFC 자동 로그인, 바로 기부<br>- 월간 보고서 글·이미지 AI 생성<br>- 기부하기 카카오페이 결제 연결 |
| [<img src="profile/image/김나경.jpg" width="100px;" style="border-radius:50%"><br>김나경](https://github.com/iqveou6) | **Backend<br> Infra** | - CI/CD 파이프라인 구축<br>- Jenkins와 Mattermost 알림 연동<br>- 목장주 영수증 증빙, 목장 상태 관리<br>- 주간 보고서 (OpenAI)<br>- 목장주/기부자 마이페이지<br>- 기부자 COLLECTION, 바로 기부 알고리즘<br>- 신뢰도 점수, 목장/말 등록 |

</div>


<br>

## 🛠 기술 스택

### Backend
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=Java&logoColor=white)
![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=SpringSecurity&logoColor=white)
![Spring Batch](https://img.shields.io/badge/Spring%20Batch-6DB33F?style=for-the-badge&logo=Spring&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=Redis&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=OpenAI&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=white)
![Kakao Pay](https://img.shields.io/badge/Kakao%20Pay-FFCD00?style=for-the-badge&logo=Kakao&logoColor=white)

### Blockchain
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=Solidity&logoColor=white)
![Web3.js](https://img.shields.io/badge/Web3.js-F16822?style=for-the-badge&logo=web3dotjs&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF04D?style=for-the-badge&logo=Hardhat&logoColor=white)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4E5EE4?style=for-the-badge&logo=OpenZeppelin&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=Zustand&logoColor=white)
![Swiper](https://img.shields.io/badge/Swiper-6332F6?style=for-the-badge&logo=Swiper&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=Axios&logoColor=white)

### DevOps / Infra
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white)
![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=for-the-badge&logo=GitLab&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=AmazonS3&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=Nginx&logoColor=white)

### Tools
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ%20IDEA-000000?style=for-the-badge&logo=IntelliJIDEA&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-3EAAF2?style=for-the-badge&logo=VisualStudioCode&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=Figma&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-F3F3F3?style=for-the-badge&logo=Notion&logoColor=black)

<br>

## 📌 주요 기능

<div align="center"> 
  <table border="1" cellspacing="0" cellpadding="5" 
         style="border-collapse: collapse; width: 100%; text-align: center; vertical-align: middle;">
    <thead> 
      <tr> 
        <th>메인페이지</th> 
        <th>소개페이지</th> 
      </tr>
    </thead>
    <tbody>
      <tr> 
        <td><img width="100%" src="profile/gif/비회원 메인.gif"/></td> 
        <td><img width="100%" src="profile/gif/마중 소개.gif"/></td> 
      </tr>
      <tr> 
        <th>목장 목록</th> 
        <th>목장 상세</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/목장, 말 목록.gif"/></td> 
        <td><img width="100%" src="profile/gif/목장 홈.gif"/></td> 
      </tr>
      <tr> 
        <th>신뢰도 내역</th> 
        <th>월간 보고서</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/신뢰도 내역.gif"/></td> 
        <td><img width="100%" src="profile/gif/월간보고서.gif"/></td> 
      </tr>
      <tr> 
        <th>주간 보고서</th> 
        <th>기부하기(기부자)</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/말 상태(주간보고서).gif"/></td> 
        <td><img width="100%" src="profile/gif/기부자 기부하기 .gif"/></td> 
      </tr>
      <tr> 
        <th>바로 기부하기(기부자)</th> 
        <th>마이페이지(목장주)</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/바로 기부하기.gif"/></td> 
        <td><img width="100%" src="profile/gif/기부자 마이페이지.gif"/></td> 
      </tr>
      <tr> 
        <th>운영보고(목장주)</th> 
        <th>영수증 증빙(목장주)</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/운영보고 등록.gif"/></td> 
        <td><img width="100%" src="profile/gif/영수증 증빙 등록.gif"/></td> 
      </tr>
      <tr> 
        <th>컬렉션</th> 
        <th>NFC</th> 
      </tr>
      <tr> 
        <td><img width="100%" src="profile/gif/컬렉션.gif"/></td> 
        <td><img width="100%" src="profile/gif/NFC.gif"/></td> 
      </tr>
    </tbody>
  </table>
</div>

<br>

## 📂 프로젝트 구조

<details>
<summary>💻 FRONTEND</summary>

```📦 src
 ┣ 📂 app
 ┃ ┣ 📂 about
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 farm
 ┃ ┃ ┗ 📂 register
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 godonate
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 intro
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 kakao-pay
 ┃ ┃ ┣ 📂 approve
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┣ 📂 cancel
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┗ 📂 fail
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 login
 ┃ ┃ ┣ 📂 callback
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 mypage
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 qr-login
 ┃ ┃ ┣ 📄 QrLoginInner.tsx
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 receipt
 ┃ ┃ ┣ 📂 ocr
 ┃ ┃ ┃ ┗ 📄 route.ts
 ┃ ┃ ┣ 📂 verify-location
 ┃ ┃ ┃ ┗ 📄 route.ts
 ┃ ┃ ┗ 📂 verify-receipt
 ┃ ┃ ┃ ┗ 📄 route.ts
 ┃ ┣ 📂 shortcut
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 signup
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 support
 ┃ ┃ ┣ 📂 [farm_uuid]
 ┃ ┃ ┃ ┣ 📂 [horseNo]
 ┃ ┃ ┃ ┃ ┣ 📂 [wreportId]
 ┃ ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┣ 📂 donate
 ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┣ 📂 edit
 ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┣ 📂 report
 ┃ ┃ ┃ ┃ ┣ 📂 [reportId]
 ┃ ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┃ ┣ 📄 FarmDetailClient.tsx
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📂 wallet
 ┃ ┃ ┗ 📂 create
 ┃ ┃ ┃ ┗ 📄 page.tsx
 ┃ ┣ 📄 favicon.ico
 ┃ ┣ 📄 globals.css
 ┃ ┣ 📄 layout.tsx
 ┃ ┗ 📄 page.tsx
 ┣ 📂 components
 ┃ ┣ 📂 common
 ┃ ┃ ┗ 📄 Breadcrumb.tsx
 ┃ ┣ 📂 donation
 ┃ ┃ ┣ 📄 DonationAmountSelector.tsx
 ┃ ┃ ┣ 📄 DonationConfirmationModal.tsx
 ┃ ┃ ┣ 📄 DonationForm.tsx
 ┃ ┃ ┗ 📄 PaymentMethodSelector.tsx
 ┃ ┣ 📂 farm
 ┃ ┃ ┣ 📂 edit
 ┃ ┃ ┃ ┣ 📂 _parts
 ┃ ┃ ┃ ┃ ┗ 📄 LabeledInput.tsx
 ┃ ┃ ┃ ┣ 📄 FarmBasicInfoPanel.tsx
 ┃ ┃ ┃ ┣ 📄 HorseInfoPanel.tsx
 ┃ ┃ ┃ ┗ 📄 HorseRegistrySection.tsx
 ┃ ┃ ┣ 📂 panels
 ┃ ┃ ┃ ┣ 📄 DonationPanel.tsx
 ┃ ┃ ┃ ┣ 📄 DonationProgressChart.tsx
 ┃ ┃ ┃ ┣ 📄 DonationUsageChart.tsx
 ┃ ┃ ┃ ┣ 📄 HorsesPanel.tsx
 ┃ ┃ ┃ ┣ 📄 IntroPanel.tsx
 ┃ ┃ ┃ ┣ 📄 NewsletterPanel.tsx
 ┃ ┃ ┃ ┣ 📄 ReceiptSubmissionProgress.tsx
 ┃ ┃ ┃ ┣ 📄 TrustPanel.tsx
 ┃ ┃ ┃ ┗ 📄 TrustScoreChart.tsx
 ┃ ┃ ┣ 📂 report
 ┃ ┃ ┃ ┣ 📄 DonationProofUpload.tsx
 ┃ ┃ ┃ ┗ 📄 HorseImageUpload.tsx
 ┃ ┃ ┣ 📄 FarmCard.tsx
 ┃ ┃ ┣ 📄 FarmCarousel3D.tsx
 ┃ ┃ ┣ 📄 FarmInfo.tsx
 ┃ ┃ ┗ 📄 FarmTabs.tsx
 ┃ ┣ 📂 mypage
 ┃ ┃ ┣ 📄 AccountHistoryModal.tsx
 ┃ ┃ ┣ 📄 AdminProfile.tsx
 ┃ ┃ ┣ 📄 AdminReportHistory.tsx
 ┃ ┃ ┣ 📄 DonationDetailModal.tsx
 ┃ ┃ ┣ 📄 DonorFavoriteFarms.tsx
 ┃ ┃ ┣ 📄 DonorProfile.tsx
 ┃ ┃ ┣ 📄 DonorSupportHistory.tsx
 ┃ ┃ ┣ 📄 FarmerDonationDetailModal.tsx
 ┃ ┃ ┣ 📄 FarmerMyFarm.tsx
 ┃ ┃ ┣ 📄 FarmerProfile.tsx
 ┃ ┃ ┣ 📄 FarmerSupportHistory.tsx
 ┃ ┃ ┗ 📄 ReceiptDetailModal.tsx
 ┃ ┣ 📂 signup
 ┃ ┃ ┣ 📄 TermsAgreement.tsx
 ┃ ┃ ┗ 📄 TermsModal.tsx
 ┃ ┣ 📂 ui
 ┃ ┃ ┣ 📄 badge.tsx
 ┃ ┃ ┣ 📄 button.tsx
 ┃ ┃ ┣ 📄 card.tsx
 ┃ ┃ ┣ 📄 input.tsx
 ┃ ┃ ┗ 📄 tabs.tsx
 ┃ ┗ 📄 Navbar.tsx
 ┣ 📂 lib
 ┃ ┣ 📄 gpsUtils.ts
 ┃ ┗ 📄 utils.ts
 ┣ 📂 services
 ┃ ┣ 📄 apiService.ts
 ┃ ┣ 📄 authService.ts
 ┃ ┣ 📄 farmService.ts
 ┃ ┣ 📄 paymentService.ts
 ┃ ┗ 📄 userService.ts
 ┗ 📂 types
 ┃ ┣ 📄 auth.ts
 ┃ ┣ 📄 farm.ts
 ┃ ┣ 📄 payment.ts
 ┃ ┗ 📄 user.ts
```
</details>
<br>
<details>
<summary>🖥 BACKEND</summary>

```📦 java/com/e105/majoong
┣ 📂 ai
┣ 📂 auth
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┣ 📂security
┃ ┗ 📂service
┣ 📂batch
┃ ┣ 📂report
┃ ┣ 📂score
┃ ┃ ┣ 📂horseState
┃ ┃ ┃ ┣ 📂config
┃ ┃ ┃ ┣ 📂dto
┃ ┃ ┃ ┣ 📂snapshot
┃ ┃ ┃ ┗ 📂tasklet
┃ ┃ ┣ 📂receipt
┃ ┃ ┃ ┣ 📂config
┃ ┃ ┃ ┣ 📂dto
┃ ┃ ┃ ┣ 📂snapshot
┃ ┃ ┃ ┗ 📂tasklet
┃ ┗ 📂scheduler
┣ 📂blockchain
┃ ┣ 📂config
┃ ┣ 📂props
┃ ┣ 📂service
┃ ┗ 📂util
┣ 📂common
┃ ┣ 📂config
┃ ┣ 📂crypto
┃ ┣ 📂entity
┃ ┣ 📂exception
┃ ┣ 📂jwt
┃ ┣ 📂model
┃ ┃ ┣ 📂bookmark
┃ ┃ ┣ 📂coin
┃ ┃ ┣ 📂donationHistory
┃ ┃ ┣ 📂donator
┃ ┃ ┣ 📂farm
┃ ┃ ┣ 📂farmer
┃ ┃ ┣ 📂farmVault
┃ ┃ ┣ 📂horse
┃ ┃ ┣ 📂horseState
┃ ┃ ┣ 📂monthlyReport
┃ ┃ ┣ 📂myScore
┃ ┃ ┣ 📂oAuthMember
┃ ┃ ┣ 📂receiptCategory
┃ ┃ ┣ 📂receiptDetailHistory
┃ ┃ ┣ 📂receiptHistory
┃ ┃ ┣ 📂scoreCategory
┃ ┃ ┗ 📂settlementHistory
┃ ┣ 📂redis
┃ ┗ 📂utils
┣ 📂donation
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂farm
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┗ 📂out
┃ ┣ 📂service
┃ ┗ 📂util
┣ 📂finance
┃ ┣ 📂dto
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂kakaoPay
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂util
┣ 📂manageFarm
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂member
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂mypage
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂receipt
┃ ┣ 📂controller
┃ ┣ 📂dto
┃ ┃ ┣ 📂in
┃ ┃ ┗ 📂out
┃ ┗ 📂service
┣ 📂report
┃ ┣ 📂dto
┃ ┃ ┗ 📂out
┃ ┣ 📂repository
┃ ┗ 📂service
┣ 📂score
┃ ┣ 📂dto
┃ ┃ ┗ 📂in
┃ ┗ 📂service
┗ 📄 MajoongApplication.java
```

</details>
<br>
<details>
<summary>⛓ BLOCKCHAIN</summary>

```
📦 blockchain
 ┣ 📂 contracts
 ┃ ┣ 📄 FarmVault.sol
 ┃ ┣ 📄 FarmVaultFactory.sol
 ┃ ┣ 📄 MaronToken.sol
 ┃ ┗ 📄 VaultLens.sol
 ┣ 📂 docs
 ┃ ┗ 📂 uml
 ┃ ┃ ┗ 📄 classDiagram.svg
 ┣ 📂 scripts
 ┃ ┣ 📄 check-key.js
 ┃ ┗ 📄 deploy.js
 ┣ 📂 test
 ┃ ┣ 📄 e2e.sepolia.test.js
 ┃ ┗ 📄 token.vault.test.js
 ┣ 📄 .gitignore
 ┣ 📄 hardhat.config.js
 ┣ 📄 package.json
 ┗ 📄 package-lock.json
```
</details>

<br>


## 📁 프로젝트 산출물



### [시스템 아키텍처](profile/image/시스템아키텍처.png)
[<img src="profile/image/시스템아키텍처.png" width="700"/>](profile/image/시스템아키텍처.png)  


### [ERD (Entity Relationship Diagram)](profile/image/erd.png)
[<img src="profile/image/erd.png" width="700"/>](profile/image/erd.png)  




### [SWAGGER](profile/image/swagger.png)
[<img src="profile/image/swagger.png" width="700"/>](profile/image/swagger.png)  




### [JIRA](profile/image/지라.png)
[<img src="profile/image/지라.png" width="700"/>](profile/image/지라.png)  




### [API 명세서](https://www.notion.so/27a95ccced8c80b5bff2f982d39a7d35?v=27a95ccced8c801f8a40000c6907425b)


### [기능 명세서](https://www.notion.so/26395ccced8c80088496fad727acd529?v=26395ccced8c81a28bfa000c0f735b55)


### [와이어프레임 / 프로토타입](https://www.figma.com/design/xollHqa5QyqFVgkuf1ydnU/E105?node-id=0-1&p=f&t=4ZpcYPdK7obCASNw-0)


### [요구사항 정의서](https://www.notion.so/26395ccced8c80e28d6cf50545df0e11?v=26395ccced8c8039b54d000c18df90a2)
