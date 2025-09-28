-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 43.203.235.108    Database: machimnae_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `farm`
--

DROP TABLE IF EXISTS `farm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farm` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `area` double DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `farm_name` varchar(50) NOT NULL,
  `farm_uuid` varchar(12) NOT NULL,
  `horse_count` int DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `member_uuid` varchar(36) NOT NULL,
  `opening_date` date NOT NULL,
  `owner_name` varchar(25) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `total_donation` bigint DEFAULT NULL,
  `total_score` double DEFAULT NULL,
  `used_amount` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqkqrejh78iyakjnu22sn36q65` (`member_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farm`
--

LOCK TABLES `farm` WRITE;
/*!40000 ALTER TABLE `farm` DISABLE KEYS */;
INSERT INTO `farm` VALUES (1,'2025-01-16 17:19:31.057046','2025-09-29 00:49:04.148392','부산광역시 강서구 녹산산업중로 333',300.1,'농협중앙회안성목장(농협안성팜랜드승마센터) - 안성팜랜드 승마센터','안성팜랜드','FARM-B74F1B',7,35.095556,128.855846,'26292d72-1bdc-4f2b-9384-8c22abf93dc2','2025-09-26','이희산','031-8053-7979','https://e105.s3.ap-northeast-2.amazonaws.com/farm/scenic-autumn-landscape-red-barn-in-a-mountain-valley-with-golden-aspen-trees-and-wooden-fence-free-photo.jpeg',12100600,72.2,11607000),(2,'2025-09-26 17:20:18.385260','2025-09-29 00:49:04.167071','강원특별자치도 평창군 대관령면 차항길 192-96',1435.9,'강원도 평창군 소재지로 대관령ic와 가장근접하며, 해발900고지에 위치한 천혜자연환경의 승마장입니다.','경연 목장','FARM-69DD85',5,37.7087725599868,128.694918207836,'e35fba60-ebc4-4aae-a13d-827dcf6e9536','2025-09-26','박경연','010-9679-1332','https://e105.s3.ap-northeast-2.amazonaws.com/farm/1c5bb413-6452-4033-b818-85dd7b441d26_farm2_%281%29.jpg',1881800,45.2,163800),(3,'2025-09-27 12:23:18.823246','2025-09-29 00:49:04.167071','강원특별자치도 평창군 대관령면 차항동녘길 109',1000,'해발1050m 의 청정고원지대에 위치한 대관령 사파리목장 승마장은 자연그대로의 환경속에서 자연방목위주로 마필관리에 최선을 다하고 있으며 평창군 관내 유소년들과 강릉영동대 학생들의 사람과 자연과 말과의 교감을 통해 유소년의,정서적,인지석 영역과,말과 진정한 교감을 나누고 원활하게 소통할수 있도록 이끌어주는 지도자 의 역활,다양한 진로선택,동물애호와 배려심,리더십 함양등 과 같이 정서적,사회적 측면의 발달에 관한교육방법을 제시하고자 최선을 다합니다.','대관령사파리목장','FARM-B5C370',5,37.7208040575195,128.691351576729,'6b04f9d6-aaa6-4b5d-a00e-48cf379f2c92','2025-09-27','대관령','010-5369-5676','https://e105.s3.ap-northeast-2.amazonaws.com/farm/2543b886-d395-45c2-bd87-75c14295f60e_clint-eastwood-carmel-ranch-1.webp',1085000,43.2,0),(4,'2025-09-27 12:59:27.595649','2025-09-29 00:49:04.167071','강원특별자치도 철원군 갈말읍 태봉로 871',2350,'저희 목장은 2014년 전문승용마생산지정농가로 시작한 농어촌형 목장으로 하노버혈통의 순수혈통마를 생산, 순치조련하여 선수분들께 판매 및 대회지원을 하고 있습니다. 또한 많은 학생체험 및 일반체험을 하고있으며, 유소년 승마단도 운영하여 활발히 대회도 참가하고 있습니다. 초보자분들이 안전하고 즐겁게 타실수있는 실내승마장과 점핑 및 마장마술등을 연습할수있는 큰 야외마장을 보유하고있습니다.','대암홀스랜드','FARM-C4B1BE',4,38.1824351603112,127.384387725945,'92b0343e-f19a-47de-ab90-e2362a676b63','2025-09-27','한대암','010-3448-8222','https://e105.s3.ap-northeast-2.amazonaws.com/farm/9d23568f-7470-4a9e-8caf-68b84e027008_Exploring_the_Largest_Ranches_in_Montana-jpg_%281%29.webp',922000,43.2,0),(5,'2025-09-27 13:40:08.474574','2025-09-29 00:49:04.167071','광주광역시 광산구 고봉로185번길 50 (산정동)',1234,'도심속 자연과 함께 하는 장 도심 어디라도 5분~ 25분 거리내 있는 목장','광주어등산목장','FARM-591367',4,35.1794788916967,126.790706418646,'464ce7f8-2ef7-4b89-ab78-4d09a837eaa4','2025-09-27','어등','010-1234-1234','https://e105.s3.ap-northeast-2.amazonaws.com/farm/fe79792f-2a1f-4a4f-be7a-47697b5662ca_62474-504238972_tiny.jpg',1027000,43.2,0),(6,'2025-09-27 13:41:43.222067','2025-09-29 00:49:04.167071','부산 기장군 정관읍 병산1길 102-19',99.18,'바모스 승마클럽은 보다 많은 분들이 승마에 대한 좋은 점을 직접 느끼고 직접 체험을 해보실 수 있도록 승마체험 및 레슨을 도와드리고 있습니다.','바모스승마목장','FARM-0EFA74',4,35.3420843622876,129.195620726667,'c8775331-ee2f-4f6b-a53e-871b982fecef','2025-09-27','고건숙 ','051-7275-3011','https://e105.s3.ap-northeast-2.amazonaws.com/farm/b7d0fdce-93fe-4b3b-b081-8f7672d15857_%EB%B0%94%EB%AA%A8%EC%8A%A4%EC%8A%B9%EB%A7%88%EB%AA%A9%EC%9E%A5.jpg',1120000,43.2,0),(7,'2025-09-27 14:58:34.256036','2025-09-29 00:49:04.167071','전라남도 보성군 율어면 선암길 661',1231,'저희 마림승마목장은 18만평규모의 외승코스 및 숙박시설등 유소년들 놀이공간이 마련되어 있으며 청결과 안전을 최우선으로 생각하며\r\n코치진들도 친절을 바탕으로 최선을 다하는 승마장입니다.','마림승마목장','FARM-3199A9',5,34.8431048142682,127.217005282472,'59593f07-960b-4391-b33c-d3943df658b6','2025-09-27','조강훈','010-4623-8246','https://e105.s3.ap-northeast-2.amazonaws.com/farm/aaf2b769-0314-4a97-b5af-e22ee74c5ef9_farm5.jpeg',361000,37.2,0),(8,'2025-09-27 15:03:02.034697','2025-09-29 00:49:04.167071','부산광역시 기장군 장안읍 기장대로 1647-149',415.6,'•화 - 일 9am-6pm (Break time 12pm-2pm)\r\n•Tel 051.727.6988\r\n•Addr 부산광역시 기장군 장안읍 기장대로 1647-149\r\n','부산기장승마목장','FARM-62BEDF',4,35.3388470662334,129.240878484055,'53a53b0b-0f40-4a87-bd56-d96be94122b3','2025-09-27','육증호','051-7276-9882','https://e105.s3.ap-northeast-2.amazonaws.com/farm/16487e0c-00f3-4142-abb9-f46c43de34ae_%EB%B6%80%EC%82%B0_%EA%B8%B0%EC%9E%A5_%EC%8A%B9%EB%A7%88%EC%9E%A5_%ED%94%84%EB%A1%9C%ED%95%84.jpg',1105000,43.2,0),(9,'2025-09-27 15:27:47.436500','2025-09-29 00:49:04.167071','제주특별자치도 제주시 조천읍 비자림로 485-15',1000,'삼다수목장은 은퇴마들이 안전하고 편안하게 지낼 수 있는 자연 친화적 목장입니다.\r\n저희 목장은 말 한 마리, 한 마리의 건강과 행복을 최우선으로 생각하며,\r\n깨끗한 마구간과 넓은 초지에서 말들이 자유롭게 생활할 수 있도록 최선을 다하고 있습니다.','삼다수목장','FARM-58BAC3',5,33.4298248108397,126.658731449543,'35c195d6-fc21-4ae3-a5a9-189c74bb6fd3','2025-09-27','김진행','010-6784-1441','https://e105.s3.ap-northeast-2.amazonaws.com/farm/99f4bdba-07f4-4c7c-9e6c-53f15551261d_farm8.jpg',1236000,36.2,0),(10,'2025-09-27 15:28:07.810699','2025-09-29 00:49:04.167071','전라남도 고흥군 점암면 능가사로 269-44',500.5,'승마체험  승마강습  엘리트승마  재활승마  유소년승마  ','(주)팔영산승마공원','FARM-DEA356',4,34.6454484567107,127.414007600833,'1db8e98d-9601-4d65-9229-67cb34e1bc4c','2025-09-27','최진열','061-8330-3332','https://e105.s3.ap-northeast-2.amazonaws.com/farm/%EB%A7%90+%EB%AA%A9%EC%9E%A5.jpg',4716000,45.2,460000),(11,'2025-09-27 16:12:07.661062','2025-09-29 00:49:04.167071','경상남도 거제시 연초면 소오비2길 78 1층',3500,'무지개승마목장은 은퇴마들이 평화롭고 안전하게 지낼 수 있는 공간입니다.\r\n말 한 마리, 한 마리의 건강과 행복을 최우선으로 생각하며,\r\n넓은 초지와 쾌적한 마구간에서 자유롭고 안정적인 생활을 제공합니다.','무지개승마목장','FARM-A508AC',4,34.9060690037631,128.634360772946,'772c0c0d-6f0a-41a4-a812-b10c91ebd1e3','2025-09-27','정구일','010-5633-0077','https://e105.s3.ap-northeast-2.amazonaws.com/farm/66867019-048f-4a9f-9f43-846c15a3e799_horses-running-mountain-range-jackson-hole-wyoming-conde-nast-traveller-16sept14-iStock_.webp',1089000,37.2,0),(12,'2025-09-27 17:01:52.343204','2025-09-29 00:49:04.167071','경상북도 영천시 삼밭골길 107',2000,'저희 목장은 푸른 산 속 맑은 공기와 별빛 가득한 하늘 아래에서 말들과 함께 살아가고 있습니다. 승마 체험과 산악 승마, 별자리 관찰 프로그램으로 많은 분들이 찾아주시지만, 저희에게 가장 소중한 존재는 함께하는 말들입니다.\r\n특히 오랜 시간 사람 곁에서 힘껏 달려온 퇴역마들에게는 편안하고 따뜻한 쉼터가 필요합니다. 삼밭골승마목장은 이 아이들이 마지막까지 존중받으며 지낼 수 있도록 정성껏 보살피고 있습니다.','삼밭골 승마목장','FARM-0C8E05',4,35.989313152623,128.93964436249,'0f53e765-5fdf-4959-914d-dd17f2967a9d','2025-09-27','최성달','010-4331-5583','https://e105.s3.ap-northeast-2.amazonaws.com/farm/dd72dd74-1f26-49da-9b7d-c3eb360af7a2_photo-1697390207235-cc1e46d6008b.jpg',1110000,43.2,0),(13,'2025-09-27 17:42:44.928262','2025-09-29 01:43:25.463704','부산 강서구 녹산산업중로 333',5000,'자연이 숨쉬는 목장, 건강한 동물 친구들이 뛰노는 곳\r\n하늘목장에서는 자연, 동물, 사람 모두의 힐링 공간 입니다.','하늘목장','FARM-904330',4,35.0961029679051,128.857751633716,'e7aeccea-af06-4c63-8397-f0f08c05ee56','2025-09-27','유황찬','010-3332-8061','https://e105.s3.ap-northeast-2.amazonaws.com/farm/c5ffd4c9-00c3-408a-9c39-de09b86adcd1_Eaton-Ranch-488884395_1070183051797188_3109579324001241461_n-4.5.25.avif',1499800,49.2,1078400);
/*!40000 ALTER TABLE `farm` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29  2:43:15
