import json
import math
import os
import urllib.parse
import urllib.request
from typing import Optional, Tuple

FREE_KM = 1.5
MAX_KM = 6.0
# (khoảng cách tối đa km, phí giao)
FEE_TABLE = [
    (2, 15000),
    (3, 20000),
    (4, 25000),
    (5, 30000),
    (6, 35000),
]
DEFAULT_CENTER = (106.66, 10.76)  # TP.HCM
GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json"
DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox/driving/{coords}"

_restaurant_cache: dict = {}


class ShippingError(Exception):
    pass


class ShippingNotConfigured(ShippingError):
    pass


def _token() -> str:
    token = os.getenv("MAPBOX_TOKEN")
    if not token:
        raise ShippingNotConfigured("Mapbox chưa được cấu hình trên máy chủ.")
    return token


def _get_json(url: str) -> dict:
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as error:
        raise ShippingError(f"Không gọi được Mapbox: {error}")


def geocode(address: str, proximity: Optional[Tuple[float, float]] = None, local: bool = False) -> Tuple[float, float]:
    params = {"access_token": _token(), "limit": 5, "country": "vn", "language": "vi"}
    if proximity:
        params["proximity"] = f"{proximity[0]},{proximity[1]}"
        if local:
            d = 0.3
            params["bbox"] = f"{proximity[0]-d},{proximity[1]-d},{proximity[0]+d},{proximity[1]+d}"
    url = GEOCODE_URL.format(query=urllib.parse.quote(address.strip())) + "?" + urllib.parse.urlencode(params)
    features = _get_json(url).get("features") or []
    if not features and local:
        return geocode(address, proximity)
    if not features:
        raise ShippingError("Không tìm thấy địa chỉ giao hàng.")
    if proximity:
        features.sort(key=lambda f: _haversine_km(proximity, tuple(f["center"])))
    lng, lat = features[0]["center"]
    return lng, lat


def restaurant_location(address: str) -> Tuple[float, float]:
    lat = os.getenv("RESTAURANT_LAT")
    lng = os.getenv("RESTAURANT_LNG")
    if lat and lng:
        return float(lng), float(lat)
    if address not in _restaurant_cache:
        _restaurant_cache[address] = geocode(address, proximity=DEFAULT_CENTER)
    return _restaurant_cache[address]


def _haversine_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lng1, lat1, lng2, lat2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def road_distance_km(origin: Tuple[float, float], dest: Tuple[float, float]) -> float:
    coords = f"{origin[0]},{origin[1]};{dest[0]},{dest[1]}"
    url = DIRECTIONS_URL.format(coords=coords) + "?" + urllib.parse.urlencode(
        {"access_token": _token(), "overview": "false"}
    )
    try:
        routes = _get_json(url).get("routes") or []
        if routes:
            return routes[0]["distance"] / 1000
    except ShippingError:
        pass
    return _haversine_km(origin, dest)


def fee_for_distance(km: float) -> int:
    if km <= FREE_KM:
        return 0
    for limit, fee in FEE_TABLE:
        if km <= limit:
            return fee
    raise ShippingError(f"Địa chỉ ngoài phạm vi giao hàng ({MAX_KM:g} km).")


def quote(customer_address: str, restaurant_address: str) -> dict:
    origin = restaurant_location(restaurant_address)
    dest = geocode(customer_address, proximity=origin, local=True)
    km = round(road_distance_km(origin, dest), 2)
    if km > MAX_KM:
        return {"distance_km": km, "fee": 0, "out_of_range": True}
    return {"distance_km": km, "fee": fee_for_distance(km), "out_of_range": False}
