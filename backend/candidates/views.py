from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Candidate, StageChange
from .serializers import CandidateSerializer


class CandidateViewSet(viewsets.ModelViewSet):
    """
    GET /api/candidates/?search=&stage=&role=&ordering=
    Search matches name, email, role and skills.
    """
    serializer_class = CandidateSerializer

    def get_queryset(self):
        qs = Candidate.objects.prefetch_related("history")
        p = self.request.query_params
        search = p.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
                | Q(role__icontains=search) | Q(skills__icontains=search)
            )
        if p.get("stage"):
            qs = qs.filter(stage=p["stage"])
        if p.get("role"):
            qs = qs.filter(role__iexact=p["role"])
        ordering = p.get("ordering")
        allowed = {"name", "-name", "created_at", "-created_at", "experience_years", "-experience_years"}
        if ordering in allowed:
            qs = qs.order_by(ordering)
        return qs


@api_view(["GET"])
def dashboard(request):
    total = Candidate.objects.count()
    by_stage = {s: 0 for s, _ in Candidate.Stage.choices}
    for row in Candidate.objects.values("stage").annotate(n=Count("id")):
        by_stage[row["stage"]] = row["n"]

    week_ago = timezone.now() - timedelta(days=7)
    new_this_week = Candidate.objects.filter(created_at__gte=week_ago).count()
    decided = by_stage["hired"] + by_stage["rejected"]
    hire_rate = round(by_stage["hired"] / decided * 100, 1) if decided else 0
    roles = list(Candidate.objects.values("role").annotate(count=Count("id")).order_by("-count")[:6])

    funnel = []
    for s in ["applied", "screening", "interview", "offer", "hired"]:
        reached = StageChange.objects.filter(to_stage=s).values("candidate").distinct().count()
        funnel.append({"stage": s, "reached": reached})

    return Response({
        "total": total, "new_this_week": new_this_week, "in_progress": total - decided,
        "hire_rate": hire_rate, "by_stage": by_stage, "top_roles": roles, "funnel": funnel,
    })
