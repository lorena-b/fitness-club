from django.db import models
import datetime
from studios.utils import MapsAPI
from django.db.models import CASCADE, CharField
from subscriptions.models import Subscription
from django.contrib.auth.models import User
import json


class Studio(models.Model):
    """
    Model representing studio - relationship with amenities, classes, images
    """
    name = models.CharField(max_length=100, blank=False)
    address = models.CharField(max_length=100, blank=False)
    postal_code = models.CharField(max_length=100, blank=False)
    phone_number = models.CharField(max_length=100, blank=False)
    geocode = models.JSONField(blank=True, editable=False)

    def save(self, *args, **kwargs):
        """
        Save geocode of studio as a field computed from API
        """
        geocode = MapsAPI.get_geocode(self.address)
        self.geocode = {
            'latitude': geocode[0],
            'longitude': geocode[1]
        }
        super(Studio, self).save(*args, **kwargs)

    def __str__(self) -> CharField:
        return f'ID: {self.id}  - {self.name}'

    def get_distance(self, geo_user = None, coords = None) -> int:
        """
        Return distance from the user's location to the current studio
        """
        if coords:
            return MapsAPI.get_distance(coords=coords, studio=self)

        return MapsAPI.get_distance(user=geo_user.geocode, studio=self)

    def get_direction_link(self, geo_user = None, coords = None) -> int:
        """
        Return directions from the user's location to the current studio
        """
        if coords:
            return MapsAPI.get_directions(coords=coords, studio=self)

        return MapsAPI.get_directions(user=geo_user.geocode, studio=self)

    def get_classes(self):
        """
        Return all classes of the current studio in order of start time
        """
        objs = Class.objects.filter(studio=self)
        curr = datetime.datetime.now()
        lst = {}
        for obj in objs:
            # go through obj.times and check if the key is in the future
            for time in obj.times:
                # convert time to datetime
                time = datetime.datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
                if time > curr:
                    lst[time] = obj
                    break

        return [lst[key] for key in sorted(lst.keys())]


class Amenity(models.Model):
    type = models.CharField(max_length=100)
    quantity = models.IntegerField()
    studio = models.ForeignKey(to=Studio, related_name='amenities', on_delete=CASCADE)

    def __str__(self) -> str:
        return f'{self.studio} - ' + f'{self.type}'

    def get_studio(self) -> Studio:
        """
        Get the studio that contains the amenity
        """
        return self.studio


class Image(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(null=True)
    studio = models.ForeignKey(to=Studio, related_name='images', on_delete=CASCADE)

    def __str__(self) -> str:
        return f'{self.studio} - ' + f'{self.name}'


class GeoUser(models.Model):
    """
    Store geocode of user addresses to avoid excessive API calls
    """
    address = models.CharField(max_length=100)
    geocode = models.JSONField(blank=True, editable=False)

    def save(self, *args, **kwargs):
        """
        Save geocode of studio as a field computed from API
        """
        geocode = MapsAPI.get_geocode(self.address)
        self.geocode = {
            'latitude': geocode[0],
            'longitude': geocode[1]
        }
        super(GeoUser, self).save(*args, **kwargs)

    def __str__(self) -> CharField:
        return self.address


class Class(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    coach = models.CharField(max_length=100)
    keywords = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    studio = models.ForeignKey(to=Studio, related_name='classes', on_delete=CASCADE)
    cancelled = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f'Studio: {self.studio} ||| Class ID: {self.id} ||| Class Name: {self.name}'

    def get_studio(self):
        return self.studio

    def list_times(self, username):
        """
        Return all times of the current class
        """
        time_objs = ClassTime.objects.filter(class_id=self.id)
        # create an offset aware datetime object
        curr = datetime.datetime.now(datetime.timezone.utc)
        lst = []
        for time_obj in time_objs:
            if time_obj.start_time > curr and not time_obj.cancelled and not self.cancelled:
                if username:
                    lst.append(
                        {
                            'id': time_obj.id,
                            'start': time_obj.start_time,
                            'end': time_obj.end_time,
                            'booked': time_obj.is_enrolled(username),
                            'slots_left': time_obj.slots_left()
                        }
                        )
                else:
                    lst.append(
                        {
                            'id': time_obj.id,
                            'start': time_obj.start_time,
                            'end': time_obj.end_time,
                            'booked': time_obj.is_enrolled(username),
                            'slots_left': time_obj.slots_left()
                        }
                        )
        return lst


class ClassTime(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    enrolled = models.PositiveIntegerField()
    users = models.JSONField(default=list, blank=True)
    class_id = models.ForeignKey(to=Class, related_name='times', on_delete=CASCADE)
    cancelled = models.BooleanField(default=False)

    recurring = models.BooleanField(default=False)
    recurring_id = models.IntegerField(null=True, blank=True, default=None)

    def __str__(self) -> str:
        return f'{self.class_id} ||| Class Time ID: {self.id}'

    def enroll(self, username):
        """
        Add user to the class
        """
        user = User.objects.get(username=username)
        if not Subscription.objects.filter(user=user).exclude(recurring_date=None).exists():
            return "E: Sub"
        if self.is_enrolled(
                username) or self.slots_left() == 0 or self.start_time < datetime.datetime.now(
                datetime.timezone.utc) or self.cancelled or self.class_id.cancelled:
            return False
        self.users.append(username)
        self.enrolled += 1
        self.save()
        sub = Subscription.objects.get(user=user)
        sub.enrolled_classes.append(self.id)
        sub.save()

    def unenroll(self, username):
        """
        Remove user from the class
        """
        if not self.is_enrolled(username) or datetime.datetime.now(
                datetime.timezone.utc) > self.end_time or self.slots_left() == self.class_id.capacity or self.cancelled or self.class_id.cancelled:
            print('Failed to unenroll time' + str(self))
            return False
        self.users.remove(str(username))
        self.enrolled -= 1
        self.save()

    def is_enrolled(self, username):
        """
        Check if user is enrolled in the class
        """
        # self.users is a json, so we need to convert it to a list
        return str(username) in self.users

    def slots_left(self):
        """
        Return the number of slots left in the class
        """
        return self.class_id.capacity - self.enrolled

    def get_class(self):
        return self.class_id


class RecurringClassTime(models.Model):
    """
    Store recurring class times
    """
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    class_id = models.ForeignKey(to=Class, related_name='recurring_times', on_delete=CASCADE)

    def __str__(self) -> str:
        return f'{self.class_id} ||| Recurring Class Time ID: {self.id}'

    # upon save, create a new ClassTime object for each recurring class time
    def save(self, *args, **kwargs):
        """
        Create a new ClassTime object for each recurring class time
        """
        super(RecurringClassTime, self).save(*args, **kwargs)
        # get all dates in the range
        dates = [self.start_date + datetime.timedelta(days=x) for x in range(0,
            (self.end_date - self.start_date).days + 1, 7)]
        for date in dates:
            # do not create a new classtime if the date is in the past
            if date < datetime.date.today():
                continue
            # create a new ClassTime object for each date
            ClassTime.objects.create(start_time=datetime.datetime.combine(date, self.start_time),
                                     end_time=datetime.datetime.combine(date, self.end_time),
                                     enrolled=0,
                                     users=[],
                                     class_id=self.class_id, recurring=True, recurring_id=self.id)

    def delete(self, *args, **kwargs):
        """
        Delete all ClassTime objects associated with this recurring class time
        """
        # get all ClassTime objects associated with this recurring class time
        times = ClassTime.objects.filter(class_id=self.class_id)
        for time in times:
            if time.recurring and time.recurring_id == self.id:
                time.delete()
        super(RecurringClassTime, self).delete(*args, **kwargs)




