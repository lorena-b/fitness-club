from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework.utils import json
from studios.models import Studio, Amenity, Image, Class, ClassTime, GeoUser


class GeoUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoUser
        fields = ['id', 'address', 'geocode']


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['type', 'quantity']


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['image', 'name']


class ClassSerializer(serializers.ModelSerializer):
    """
    Nested JSON representation of a Class
    """
    studio_id = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'studio_id', 'description', 'coach', 'keywords', 'cancelled']

    def get_studio_id(self, obj):
        return obj.studio.id


class ClassTimeSerializer(serializers.ModelSerializer):
    """
    Nested JSON representation of a ClassTime
    """
    class_id = ClassSerializer(read_only=True)

    class Meta:
        model = ClassTime
        fields = ['id', 'class_id', 'enrolled', 'start_time', 'end_time', 'users']


class StudioSerializer(serializers.ModelSerializer):
    """
    Nested JSON representation of a Studio
    """
    amenities = AmenitySerializer(many=True, read_only=True)
    classes = ClassSerializer(many=True, read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Studio
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'postal_code', 'phone_number',
                  'amenities', 'classes', 'images', 'distance']

    def get_latitude(self, obj):
        return obj.geocode.get('latitude')

    def get_longitude(self, obj):
        return obj.geocode.get('longitude')

    def get_distance(self, obj):
        if self.context['request'].body:
            user_location = json.loads(self.context['request'].body).get('user_location')
            if user_location:
                # store address and geolocation for calculations
                try:
                    geo_user = GeoUser.objects.get(address__iexact=user_location)
                except ObjectDoesNotExist:
                    geo_user = GeoUser.objects.create(address=user_location.lower())
                return obj.get_distance(geo_user=geo_user)
            
            coords = json.loads(self.context['request'].body).get('coords')
            if coords:
                return obj.get_distance(coords=coords)

            return None

        # user_location = None
        # if self.context['request'].body:
        #     user_location = json.loads(self.context['request'].body).get('user_location')
        # if not user_location:
        #     return None
        # store address and geolocation for calculations
        # try:
        #     geo_user = GeoUser.objects.get(address=user_location)
        # except ObjectDoesNotExist:
        #     geo_user = GeoUser.objects.create(address=user_location)
        # return obj.get_distance(geo_user=geo_user)


class StudioSerializerWithDirection(StudioSerializer):
    """
    Nested JSON representation of a Studio with an additional direction link
    """
    direction_link = serializers.SerializerMethodField()

    class Meta(StudioSerializer.Meta):
        fields = StudioSerializer.Meta.fields + ['direction_link']

    def get_direction_link(self, obj):
        """
        BODY: {'user_location': <Address>}
        """
        if self.context['request'].body:
            user_location = json.loads(self.context['request'].body).get('user_location')
            if user_location:
                # store address and geolocation for calculations
                try:
                    geo_user = GeoUser.objects.get(address__iexact=user_location)
                except ObjectDoesNotExist:
                    geo_user = GeoUser.objects.create(address=user_location.lower())
                return obj.get_direction_link(geo_user=geo_user)
            
            coords = json.loads(self.context['request'].body).get('coords')
            if coords:
                return obj.get_direction_link(coords=coords)

            return None

        # user_location = None
        # if self.context['request'].body:
        #     user_location = json.loads(self.context['request'].body).get('user_location')
        # if not user_location:
        #     return None

        # try:
        #     geo_user = GeoUser.objects.get(address=user_location)
        # except ObjectDoesNotExist:
        #     geo_user = GeoUser.objects.create(address=user_location)

        # return obj.get_direction_link(geo_user)
