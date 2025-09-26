package com.e105.majoong.common.model.collection;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionCardRepository extends JpaRepository<CollectionCard, Long> {
    List<CollectionCard> findByMemberUuid(String memberUuid);
}
