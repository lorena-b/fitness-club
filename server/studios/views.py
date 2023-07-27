from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.utils import json
from rest_framework.views import APIView
from studios.models import Studio, Amenity, Class, ClassTime, GeoUser
from accounts.models import User
from studios.serializers import StudioSerializer, StudioSerializerWithDirection, ClassSerializer, \
    ClassTimeSerializer, GeoUserSerializer

# import 404 error response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from django.contrib.auth import authenticate, login, logout

import datetime


@api_view(['GET'])
def test_studios(request):
    return Response("Hello from studios")


# Paginate in batches of 5
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 10

class GeoUserView(RetrieveAPIView):
    serializer_class = GeoUserSerializer

    def get_object(self):
        return get_object_or_404(GeoUser, address__iexact=self.kwargs['address'])

class StudioView(APIView):
    """
    View for returning the information of a single studio
    Also provides the link for directions from the users location

    Example: GET http://localhost:8000/studios/1/info

    If sending user location via POST
    POST http://localhost:8000/studios/1/info/
    Payload: {"user_location": "123 St George"}
    """

    def get_object(self):
        return get_object_or_404(Studio, id=self.kwargs['studio_id'])

    def get(self, request, *args, **kwargs):
        studio = self.get_object()
        serializer = StudioSerializerWithDirection(studio, context={'request': request})
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        studio = self.get_object()
        serializer = StudioSerializerWithDirection(studio, context={'request': request})
        return Response(serializer.data)


class StudiosView(ListAPIView):
    """
    View for returning all studios - Supports search and filtering

    Example: GET http://localhost:8000/studios/all?amenity_type=Pool

    If sending user location via POST
    POST http://localhost:8000/studios/all/?amenity_type=Pool
    Payload: {"user_location": "123 St George"}
    """
    serializer_class = StudioSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        queryset = Studio.objects.all()

        studio_name = self.request.query_params.get('studio_name')
        if studio_name is not None and studio_name != '':
            queryset = queryset.filter(name__iexact=studio_name)

        amenity_type = self.request.query_params.get('amenity_type')
        if amenity_type is not None and amenity_type != '':
            amenities = Amenity.objects.filter(type__iexact=amenity_type)
            studios = [amenity.get_studio() for amenity in amenities]
            studio_ids = [studio.id for studio in studios]
            queryset = queryset.filter(id__in=studio_ids)

        class_type = self.request.query_params.get('class_type')
        if class_type is not None and class_type != '':
            classes = Class.objects.filter(name__iexact=class_type)
            studios = [c.get_studio() for c in classes]
            studio_ids = [studio.id for studio in studios]
            queryset = queryset.filter(id__in=studio_ids)

        coach_name = self.request.query_params.get('coach')
        if coach_name is not None and coach_name != '':
            classes = Class.objects.filter(coach__iexact=coach_name)
            studios = [c.get_studio() for c in classes]
            studio_ids = [studio.id for studio in studios]
            queryset = queryset.filter(id__in=studio_ids)

        # sort by distance and paginate
        serializer = StudioSerializer(queryset, many=True, context={'request': request})
        serializer_data = serializer.data
        if self.request.body and (json.loads(self.request.body).get('user_location') or json.loads(self.request.body).get('coords')):
            serializer_data = sorted(serializer.data, key=lambda k: k['distance'])
        page = self.paginate_queryset(serializer_data)
        return self.get_paginated_response(page)

    def post(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class ClassesView(ListAPIView):
    """
    View for returning all classes of a specified studio - Supports search and filtering

    Example: GET http://localhost:8000/studios/1/classes/all?class_type=pilates
    """
    serializer_class = ClassSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # check if studio exists
        studio_id = self.kwargs['studio_id']
        if not Studio.objects.filter(id=studio_id).exists():
            raise NotFound(detail="Studio does not exist")

        # get all classes of a studio
        queryset = Class.objects.filter(studio=studio_id)

        class_type = self.request.query_params.get('class_type')
        if class_type is not None:
            queryset = queryset.filter(name__iexact=class_type)

        coach_name = self.request.query_params.get('coach')
        if coach_name is not None:
            queryset = queryset.filter(coach__iexact=coach_name)

        # FORMAT YYYY-MM-DD
        date = self.request.query_params.get('date')
        if date is not None and date != '':
            date = datetime.datetime.strptime(date, '%Y-%m-%d')
            class_ids = [c.id for c in queryset]
            class_times = ClassTime.objects.filter(class_id__in=class_ids)
            class_times_filtered = class_times.filter(start_time__date=date)
            queryset = [time.get_class() for time in class_times_filtered]

        # FORMAT HH:MM, HH:MM
        time_range = self.request.query_params.get('time_range')
        if time_range is not None:
            time_range = time_range.split(',')
            start_range = datetime.datetime.strptime(time_range[0], '%H:%M')
            end_range = datetime.datetime.strptime(time_range[1], '%H:%M')
            class_ids = [c.id for c in queryset]
            class_times = ClassTime.objects.filter(class_id__in=class_ids)
            time_in_range = set()
            for class_time in class_times:
                if start_range.hour <= class_time.start_time.hour <= end_range.hour \
                        and start_range.hour <= class_time.end_time.hour <= end_range.hour:
                    time_in_range.add(class_time.get_class())
            queryset = list(time_in_range)

        return queryset


class ClassView(RetrieveAPIView):
    """
    View for returning the information of a single class

    Example: GET http://localhost:8000/studios/1/classes/1
    """
    serializer_class = ClassSerializer

    # GET retrieves the class with the specified id.
    # No POST required as we will not be creating classes from the frontend

    def get_object(self):
        # we want to return the class with the id specified in the url
        return get_object_or_404(Class, id=self.kwargs['class_id'])


class ClassTimesView(ListAPIView):
    """
    View for returning all class times for a class

    Example: GET http://localhost:8000/studios/1/classes/1/times
    """
    serializer_class = ClassTimeSerializer
    pagination_class = StandardResultsSetPagination
    pagination_class.page_size = 1000
    pagination_class.max_page_size = 1000
    permission_classes = [AllowAny]

    # GET retrieves all class times for the class with the specified id.
    # No POST required as we will not be creating class times from the frontend

    def get_queryset(self):
        class_id = self.kwargs['class_id']
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_obj = Class.objects.get(id=class_id)
        return class_obj.list_times(None)

    def get(self, request, *args, **kwargs):
        # get the username from the request. If the user is not authenticated, set it to None
        username = User.objects.get(
            username=request.user) if request.user.is_authenticated else None
        class_id = self.kwargs['class_id']
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_obj = Class.objects.get(id=class_id)
        class_times = class_obj.list_times(username)
        page = self.paginate_queryset(class_times)
        return Response(page)


class SingleEnrolView(APIView):
    """
    View for enrolling a user in a single class time

    Example: POST http://localhost:8000/studios/1/classes/1/times/1/enrol
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        class_time_id = self.kwargs['class_time_id']
        class_id = self.kwargs['class_id']
        studio_id = self.kwargs['studio_id']
        if not ClassTime.objects.filter(id=class_time_id).exists():
            return Response({'message': 'Class time does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Studio.objects.filter(id=studio_id).exists():
            return Response({'message': 'Studio does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_time_obj = ClassTime.objects.get(id=class_time_id)
        a = class_time_obj.enroll(request.user.username)
        if a == False:
            return Response("Enrolment failed")
        elif a == "E: Sub":
            return Response("Enrolment failed: Not subscribed")
        slots_left = class_time_obj.slots_left()
        booked = class_time_obj.is_enrolled(request.user.username)
        return Response({'slots_left': slots_left, 'booked': booked})


class SingleDropView(APIView):
    """
    View for dropping a user from a single class time

    Example: POST http://localhost:8000/studios/1/classes/1/times/1/unenrol
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        class_time_id = self.kwargs['class_time_id']
        class_id = self.kwargs['class_id']
        studio_id = self.kwargs['studio_id']
        if not ClassTime.objects.filter(id=class_time_id).exists():
            return Response({'message': 'Class time does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Studio.objects.filter(id=studio_id).exists():
            return Response({'message': 'Studio does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_time_obj = ClassTime.objects.get(id=class_time_id)
        if class_time_obj.unenroll(request.user.username) == False:
            return Response("Unable to unenroll from class time")
        slots_left = class_time_obj.slots_left()
        booked = class_time_obj.is_enrolled(request.user.username)
        return Response({'slots_left': slots_left, 'booked': booked})



class AllEnrolView(APIView):
    """
    View for enrolling a user in all class times for a class

    Example: POST http://localhost:8000/studios/1/classes/1/enrol
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        class_id = self.kwargs['class_id']
        studio_id = self.kwargs['studio_id']
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Studio.objects.filter(id=studio_id).exists():
            return Response({'message': 'Studio does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_obj = Class.objects.get(id=class_id)
        class_times = ClassTime.objects.filter(class_id=class_id)
        for class_time in class_times:
            if class_time.enroll(request.user.username) == "E: Sub":
                return Response("Enrolment failed: Not subscribed")
        return Response("Enrolled in valid class times")


class AllDropView(APIView):
    """
    View for dropping a user from all class times for a class

    Example: POST http://localhost:8000/studios/1/classes/1/unenrol
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        class_id = self.kwargs['class_id']
        studio_id = self.kwargs['studio_id']
        if not Class.objects.filter(id=class_id).exists():
            return Response({'message': 'Class does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if not Studio.objects.filter(id=studio_id).exists():
            return Response({'message': 'Studio does not exist'}, status=status.HTTP_404_NOT_FOUND)
        class_obj = Class.objects.get(id=class_id)
        class_times = ClassTime.objects.filter(class_id=class_id)
        for class_time in class_times:
            class_time.unenroll(request.user.username)
        return Response("Dropped from all valid class times")
