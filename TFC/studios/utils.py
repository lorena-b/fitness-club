import geopy.geocoders
from geopy.exc import GeocoderServiceError
from geopy.geocoders import Nominatim
from geopy.distance import geodesic as geodesic_distance
import logging
import ssl
import certifi
import urllib.parse

from rest_framework.response import Response
from django.utils.encoding import force_str
from rest_framework.exceptions import APIException
from rest_framework import status

logger = logging.getLogger(__name__)

ctx = ssl.create_default_context(cafile=certifi.where())
geopy.geocoders.options.default_ssl_context = ctx


class CustomException(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'A server error occurred.'

    def __init__(self, detail, field, status_code):
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = {field: force_str(detail)}
        else:
            self.detail = {'detail': force_str(self.default_detail)}


class MapsAPI:
    """
    Methods for getting geodata
    """
    geocoder = Nominatim(user_agent='toronto_fitness_club')

    def __init__(self):
        pass

    @classmethod
    def get_distance(cls, studio, user = None, coords = None) -> int:
        """
        Distance from user to studio in km
        """
        if coords:
            user_location = (coords.get('lat'), coords.get('lng'))
        if user:
            user_location = (user.get('latitude'), user.get('longitude'))
        studio_location = (studio.geocode.get('latitude'), studio.geocode.get('longitude'))
        return geodesic_distance(user_location, studio_location).km

    @classmethod
    def get_directions(cls, studio, user = None, coords = None) -> str:
        """
        Directions as a google maps URL
        """
        # geopy and google get a different location from an address
        # - need to keep it consistent with geopy
        if coords:
            user_location = urllib.parse.quote(f"{coords.get('lat')}, {coords.get('lng')}")
        if user:
            user_location = urllib.parse.quote(f"{user.get('latitude')}, {user.get('longitude')}")
        studio_location = urllib.parse.quote(
            f"{studio.geocode.get('latitude')}, {studio.geocode.get('longitude')}")
        return f"https://www.google.com/maps/dir/?api=1&origin=" \
               f"{user_location}&destination={studio_location}"

    @classmethod
    def get_geocode(cls, address):
        """
        Turn address to geocode
        """
        logger.debug("Getting geocode...")
        # error handling if geocoder is bad
        try:
            location = cls.geocoder.geocode(address, timeout=30)
            return (location.latitude, location.longitude)
        except Exception as e:
            raise CustomException('Bad address: Please enter an existing address', 'message',
                                  status_code=status.HTTP_400_BAD_REQUEST)
