from django.contrib import admin
from django.contrib.auth.models import Group
from studios.models import Amenity, Image, Studio, Class, ClassTime, GeoUser, RecurringClassTime


class AmenityInLine(admin.TabularInline):
    model = Amenity


class ImageInLine(admin.TabularInline):
    model = Image


class ClassInLine(admin.TabularInline):
    model = Class


class ClassTimeInLine(admin.TabularInline):
    model = ClassTime


class StudioAdmin(admin.ModelAdmin):
    inlines = [AmenityInLine, ImageInLine, ClassInLine]


class RecurringClassTimeInLine(admin.TabularInline):
    model = RecurringClassTime


class ClassAdmin(admin.ModelAdmin):
    inlines = [RecurringClassTimeInLine, ClassTimeInLine]


# Register your models here.
admin.site.register(Studio, StudioAdmin)
admin.site.register(Class, ClassAdmin)
admin.site.register(ClassTime)
admin.site.register(RecurringClassTime)
admin.site.register(Amenity)
admin.site.register(Image)
admin.site.register(GeoUser)
admin.site.unregister(Group)

admin.site.site_header = "TFC Admin Panel"
