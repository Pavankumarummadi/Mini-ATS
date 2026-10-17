import random
from django.core.management.base import BaseCommand
from candidates.models import Candidate, StageChange

PEOPLE = [
    ("Ananya Rao", "Full Stack Developer", "react,django,postgres", 2),
    ("Rohit Sharma", "Backend Engineer", "python,fastapi,redis", 3.5),
    ("Meera Nair", "Frontend Developer", "react,typescript,css", 1.5),
    ("Karthik Reddy", "Full Stack Developer", "react,node,mongodb", 0.5),
    ("Sneha Iyer", "Data Analyst", "sql,python,tableau", 2),
    ("Arjun Mehta", "DevOps Engineer", "aws,docker,terraform", 4),
    ("Divya Pillai", "UI/UX Designer", "figma,research", 3),
    ("Imran Khan", "Backend Engineer", "django,celery,postgres", 5),
    ("Lakshmi Prasad", "Frontend Developer", "vue,react,tailwind", 1),
    ("Vikram Singh", "Full Stack Developer", "python,react,aws", 2.5),
]
ORDER = ["applied", "screening", "interview", "offer", "hired"]


class Command(BaseCommand):
    help = "Load demo candidates"

    def handle(self, *args, **opts):
        random.seed(7)
        finals = ["hired", "interview", "screening", "applied", "offer", "rejected", "interview", "applied", "screening", "hired"]
        for (name, role, skills, exp), final in zip(PEOPLE, finals):
            email = name.split()[0].lower() + "@example.com"
            if Candidate.objects.filter(email=email).exists():
                continue
            c = Candidate.objects.create(name=name, email=email, role=role, skills=skills,
                                         experience_years=exp, phone="+91 90000 %05d" % random.randint(0, 99999))
            path = ORDER[: ORDER.index(final) + 1] if final in ORDER else ORDER[:2] + ["rejected"]
            prev = ""
            for s in path:
                StageChange.objects.create(candidate=c, from_stage=prev, to_stage=s)
                prev = s
            c.stage = path[-1]
            c.save()
        self.stdout.write(self.style.SUCCESS("Seeded demo candidates"))
