from django.urls import path
from . import views

urlpatterns = [
    path('test/studios/', views.test_studios),
    path('all/', views.StudiosView.as_view()),
    path('geocode/<str:address>', views.GeoUserView.as_view()), 
    path('<int:studio_id>/info/', views.StudioView.as_view()),
    path('<int:studio_id>/classes/all/', views.ClassesView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/', views.ClassView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/times/', views.ClassTimesView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/times/enrol/', views.AllEnrolView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/times/unenrol/', views.AllDropView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/times/<int:class_time_id>/enrol/', views.SingleEnrolView.as_view()),
    path('<int:studio_id>/classes/<int:class_id>/times/<int:class_time_id>/unenrol/', views.SingleDropView.as_view()),
]
