import clickhouse_driver
from datetime import datetime, timedelta
from typing import List, Dict, Any
from model import (
    Genre, RevenueData, UserData, RatingData, VersionData,
    CountData, HHIData, StabilityData, CountryRankData
)

# Constants
countries = ['AU', 'BR', 'DE', 'FR', 'JP', 'KR', 'US', 'GB', 'IN', 'CN']

def get_date_range(year: int, month: int) -> tuple[str, str]:
    """Get start and end date for a given year and month."""
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

def get_previous_month_end(year: int, month: int) -> str:
    """Get the last day of the previous month."""
    if month == 1:
        return datetime(year - 1, 12, 31).strftime('%Y-%m-%d')
    return (datetime(year, month, 1) - timedelta(days=1)).strftime('%Y-%m-%d')

def get_genres(client: clickhouse_driver.Client) -> List[Genre]:
    """Get all genre definitions."""
    query = """
    SELECT
        TAG_KEY as id,
        TAG_NAME as name
    FROM app_iq_sub_genre_definition
    """
    result = client.execute(query)
    return [Genre(id=row[0], name=row[1]) for row in result]

def get_revenue(client: clickhouse_driver.Client, year: int, month: int) -> List[RevenueData]:
    """Get revenue data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    SELECT
        TAG_KEY as genre_id,
        toInt64(COUNT(*)) as count_apps,
        toInt64(ifNull(SUM(EST_DOWNLOAD), 0)) as count_download,
        toInt64(ifNull(SUM(EST_REVENUE), 0)) as revenue
    FROM app_iq_dw_rev_alltime_top10
    INNER JOIN app_iq_metadata ON app_iq_metadata.PRODUCT_KEY = app_iq_dw_rev_alltime_top10.PRODUCT_KEY
    WHERE DATE BETWEEN '{start_date}' AND '{end_date}'
        AND COUNTRY_CODE in {countries}
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [RevenueData(
        genre_id=row[0],
        count_apps=row[1],
        count_download=row[2],
        paid_download=0,  # This will be updated in the next query
        organic_download=0,  # This will be updated in the next query
        revenue=row[3]
    ) for row in result]

def get_user(client: clickhouse_driver.Client, year: int, month: int) -> List[UserData]:
    """Get user data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    SELECT
        TAG_KEY as genre_id,
        round(SUM(EST_ACTIVE_USERS), 6) as active_users,
        round(SUM(EST_INSTALL_BASE), 6) as install_base
    FROM app_iq_au_ib_alltime_top10
    INNER JOIN app_iq_metadata ON app_iq_metadata.PRODUCT_KEY = app_iq_au_ib_alltime_top10.PRODUCT_KEY
    WHERE DATE BETWEEN '{start_date}' AND '{end_date}'
        AND COUNTRY_CODE in {countries}
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [UserData(
        genre_id=row[0],
        active_users=row[1],
        install_base=row[2]
    ) for row in result]

def get_rating(client: clickhouse_driver.Client, year: int, month: int) -> List[RatingData]:
    """Get rating data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    WITH product_avg AS (
        SELECT
            r.PRODUCT_KEY,
            sum(r.RATING_VALUE * r.RATINGS_COUNT_CUMULATIVE) / sum(r.RATINGS_COUNT_CUMULATIVE) AS avg_rating
        FROM app_iq_app_performance_ratings as r
        WHERE r.DATE between '{start_date}' and '{end_date}'
            AND r.COUNTRY_CODE in {countries}
        GROUP BY r.PRODUCT_KEY
    )
    SELECT
        m.TAG_KEY as genre_id,
        round(avg(p.avg_rating), 6) as rating
    FROM product_avg p
    INNER JOIN app_iq_metadata m ON p.PRODUCT_KEY = m.PRODUCT_KEY
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [RatingData(
        genre_id=row[0],
        rating=row[1]
    ) for row in result]

def get_version(client: clickhouse_driver.Client, year: int, month: int) -> List[VersionData]:
    """Get version data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    WITH product_versions AS (
        SELECT
            vc.PRODUCT_KEY,
            sum(
                if(
                    toUInt32OrZero(splitByChar('.', vc.NEW_VALUE)[1]) > toUInt32OrZero(splitByChar('.', vc.OLD_VALUE)[1]),
                    1,
                    0
                )
            ) AS BIG_VERSION,
            sum(
                if(
                    toUInt32OrZero(splitByChar('.', vc.NEW_VALUE)[1]) = toUInt32OrZero(splitByChar('.', vc.OLD_VALUE)[1]),
                    1,
                    0
                )
            ) AS SMALL_VERSION
        FROM app_iq_app_alltime_top10_version_change AS vc
        WHERE DATE BETWEEN '{start_date}' AND '{end_date}'
        AND COUNTRY_CODE IN {countries}
        GROUP BY vc.PRODUCT_KEY
    )
    SELECT
        m.TAG_KEY as genre_id,
        round(avg(pv.BIG_VERSION), 6) as big_version,
        round(avg(pv.SMALL_VERSION), 6) as small_version
    FROM product_versions AS pv
    INNER JOIN app_iq_metadata AS m
        ON pv.PRODUCT_KEY = m.PRODUCT_KEY
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [VersionData(
        genre_id=row[0],
        big_version=row[1],
        small_version=row[2]
    ) for row in result]

def get_count(client: clickhouse_driver.Client, year: int, month: int) -> List[CountData]:
    """Get count data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    SELECT
        TAG_KEY as genre_id,
        COUNT(CASE
            WHEN PRODUCT_FIRST_RELEASE_DATE BETWEEN '{start_date}' AND '{end_date}' THEN 1
        END) AS NEW_ENTRANTS,
        COUNT(CASE
            WHEN STATUS_CODE = 'dead' AND PRODUCT_LAST_UPDATED_TIME BETWEEN '{start_date}' AND '{end_date}' THEN 1
        END) AS NEW_EXIT
    FROM app_iq_metadata
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [CountData(
        genre_id=row[0],
        new_entrant=row[1],
        new_exit=row[2]
    ) for row in result]

def get_hhi(client: clickhouse_driver.Client, year: int, month: int) -> List[HHIData]:
    """Get HHI data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    WITH
        revenue AS (
            SELECT
                meta.TAG_KEY as genre_id,
                rev.EST_REVENUE as revenue
            FROM app_iq_dw_rev_alltime_top10 AS rev
            LEFT JOIN app_iq_metadata AS meta ON rev.PRODUCT_KEY = meta.PRODUCT_KEY
            WHERE rev.DATE between '{start_date}' AND '{end_date}'
            AND rev.COUNTRY_CODE in {countries}
        ),
        total_revenue AS (
            SELECT
                TAG_KEY as genre_id,
                sum(EST_REVENUE) as total_revenue
            FROM revenue
            GROUP BY app_iq_metadata.TAG_KEY
        )
    SELECT
        r.TAG_KEY as genre_id,
        round(sum((r.EST_REVENUE / tr.TotalRevenue) * (r.EST_REVENUE / tr.TotalRevenue)) * 10000, 2) as hhi
    FROM revenue r
    INNER JOIN total_revenue tr ON r.TAG_KEY = tr.TAG_KEY
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [HHIData(
        genre_id=row[0],
        hhi=row[1]
    ) for row in result]

def get_stability(client: clickhouse_driver.Client, year: int, month: int) -> List[StabilityData]:
    """Get stability data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    previous_month_end = get_previous_month_end(year, month)
    query = f"""
    WITH
    base AS (
        SELECT
            m.TAG_KEY as genre_id,
            rev.PRODUCT_KEY,
            rev.DATE,
            sum(rev.EST_DOWNLOAD) as count_download
        FROM app_iq_dw_rev_alltime_top10 AS rev
        INNER JOIN app_iq_metadata AS m 
            ON rev.PRODUCT_KEY = m.PRODUCT_KEY
        WHERE rev.DATE BETWEEN '{previous_month_end}' AND '{end_date}'
          AND rev.COUNTRY_CODE in {countries}
        GROUP BY app_iq_metadata.TAG_KEY, rev.PRODUCT_KEY, rev.DATE
    ),
    ranked AS (
        SELECT
            TAG_KEY as genre_id,
            PRODUCT_KEY,
            DATE,
            count_download,
            rank() OVER (PARTITION BY app_iq_metadata.TAG_KEY, DATE ORDER BY count_download DESC) AS rn
        FROM base
    ),
    joined AS (
        SELECT
            r1.TAG_KEY as genre_id,
            r1.PRODUCT_KEY,
            r1.rn AS rank1,
            r2.rn AS rank2
        FROM ranked r1
        INNER JOIN ranked r2 
            ON r1.TAG_KEY = r2.TAG_KEY 
           AND r1.PRODUCT_KEY = r2.PRODUCT_KEY
        WHERE r1.DATE = '{previous_month_end}'
          AND r2.DATE = '{end_date}'
    )
    SELECT
        j1.TAG_KEY as genre_id,
        round(corr(CASE WHEN TRUE THEN j1.rank1 END, 
                  CASE WHEN TRUE THEN j1.rank2 END), 6) as stability_all,
        round(corr(CASE WHEN j1.rank1 <= 5 AND j1.rank2 <= 5 THEN j1.rank1 END,
                  CASE WHEN j1.rank1 <= 5 AND j1.rank2 <= 5 THEN j1.rank2 END), 6) as stability_5,
        round(corr(CASE WHEN j1.rank1 <= 10 AND j1.rank2 <= 10 THEN j1.rank1 END,
                  CASE WHEN j1.rank1 <= 10 AND j1.rank2 <= 10 THEN j1.rank2 END), 6) as stability_10,
        round(corr(CASE WHEN j1.rank1 <= 20 AND j1.rank2 <= 20 THEN j1.rank1 END,
                  CASE WHEN j1.rank1 <= 20 AND j1.rank2 <= 20 THEN j1.rank2 END), 6) as stability_20
    FROM joined j1
    GROUP BY app_iq_metadata.TAG_KEY
    """
    result = client.execute(query)
    return [StabilityData(
        genre_id=row[0],
        stability=row[1],
        stability_5=row[2],
        stability_10=row[3],
        stability_20=row[4]
    ) for row in result]

def get_country_rank(client: clickhouse_driver.Client, year: int, month: int) -> List[CountryRankData]:
    """Get country rank data for a specific month."""
    start_date, end_date = get_date_range(year, month)
    query = f"""
    WITH 
    tag_country AS (
        SELECT
            m.TAG_KEY as genre_id,
            rev.COUNTRY_CODE,
            sum(rev.EST_DOWNLOAD) as total_downloads
        FROM app_iq_dw_rev_alltime_top10 AS rev
        INNER JOIN app_iq_metadata AS m 
            ON rev.PRODUCT_KEY = m.PRODUCT_KEY
        WHERE rev.DATE BETWEEN '{start_date}' AND '{end_date}'
        AND rev.COUNTRY_CODE in {countries}
        GROUP BY m.TAG_KEY, rev.COUNTRY_CODE
    )
    SELECT
        TAG_KEY as genre_id,
        COUNTRY_CODE,
        total_downloads
    FROM tag_country
    ORDER BY TAG_KEY, total_downloads DESC
    """
    result = client.execute(query)
    return [CountryRankData(
        rank=idx + 1,
        country_code=row[1],
        count_download=row[2]
    ) for idx, row in enumerate(result)]