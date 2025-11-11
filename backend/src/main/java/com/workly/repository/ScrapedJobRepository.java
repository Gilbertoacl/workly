package com.workly.repository;

import com.workly.entity.ScrapedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScrapedJobRepository extends JpaRepository<ScrapedJob, Long> {

    @Query(value = """
        SELECT * FROM scraped_jobs sj
        WHERE sj.skills ~* ('(^|\\|)\\s*' || :query || '\\s*($|\\|)')
    """, nativeQuery = true)
    List<ScrapedJob> searchJobBySkill(@Param("query") String query);

    @Query(value = """
        SELECT * FROM scraped_jobs sj
        WHERE sj.title ILIKE %:query%
    """, nativeQuery = true)
    List<ScrapedJob> searchJobByKeyword(@Param("query") String query);

}
