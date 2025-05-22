# panphoto/urls.py

from django.urls import path

from .views import HomePageView, AboutPageView, panorama_view, test_panorama_view2, SubscribeView, index, index_new
from . import api

urlpatterns = [
    path('panorama/<int:panorama_id>/', panorama_view, name='panorama-view'),
    path('api/panoramas/<int:pk>/', api.panorama_detail, name='panorama-api'),
    path('', index_new, name='index'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
]

