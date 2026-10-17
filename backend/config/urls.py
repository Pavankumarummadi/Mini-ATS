from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

urlpatterns = [
    path("", lambda r: JsonResponse({"service": "Mini ATS API", "docs": "/api/"})),
    path("admin/", admin.site.urls),
    path("api/", include("candidates.urls")),
]
