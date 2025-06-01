# API

[GET] `/api/genre`
response: {
    "data": [{
        "id": int64,
        "name": string
    }]
}

[GET] `/api/genre/{year}/{month}/revenue`
response: {
    "data": [{
        "genre_id": int64,
        "count_apps": int64,
        "count_download": int64,
        "paid_download": int64,
        "organic_download": int64,
        "revenue": int64
    }]
}

[GET] `/api/genre/{year}/{month}/user`
response: {
    "data": [{
        "genre_id": int64,
        "active_users": float,
        "install_base": float,
    }]
}

[GET] `/api/genre/{year}/{month}/rating`
response: {
    "data": [{
        "genre_id": int64,
        "rating": float
    }]
}

[GET] `/api/genre/{year}/{month}/version`
response: {
    "data": [{
        "genre_id": int64,
        "big_version": float,
        "small_version": float
    }]
}

[GET] `/api/genre/{year}/{month}/count`
response: {
    "data": [{
        "genre_id": int64,
        "new_entrant": int,
        "new_exit": int
    }]
}

[GET] `/api/genre/{year}/{month}/hhi`
response: {
    "data": [{
        "genre_id": int64,
        "hhi": float
    }]
}

[GET] `/api/genre/{year}/{month}/stability`
response: {
    "data": [{
        "genre_id": int64,
        "stability": float,
        "stability_5": float,
        "stability_10": float,
        "stability_20": float
    }]
}

[GET] `/api/genre/{year}/{month}/country_rank`
response: {
    "data": [{
        "rank": int,
        "country_code": string,
        "count_download": int64
    }]
}
