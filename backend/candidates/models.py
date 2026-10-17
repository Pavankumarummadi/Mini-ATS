from django.db import models


class Candidate(models.Model):
    class Stage(models.TextChoices):
        APPLIED = "applied", "Applied"
        SCREENING = "screening", "Screening"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        HIRED = "hired", "Hired"
        REJECTED = "rejected", "Rejected"

    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=120)
    skills = models.CharField(max_length=300, blank=True, help_text="Comma separated")
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    resume_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.APPLIED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class StageChange(models.Model):
    """History of stage transitions, shown on the candidate timeline."""
    candidate = models.ForeignKey(Candidate, related_name="history", on_delete=models.CASCADE)
    from_stage = models.CharField(max_length=20, blank=True)
    to_stage = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at", "-id"]
