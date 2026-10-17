from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CandidateViewSet, dashboard

router = DefaultRouter()
router.register("candidates", CandidateViewSet, basename="candidate")

urlpatterns = [
    path("dashboard/", dashboard),
    path("", include(router.urls)),
]
