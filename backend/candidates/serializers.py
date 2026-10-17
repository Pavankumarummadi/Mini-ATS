from rest_framework import serializers
from .models import Candidate, StageChange


class StageChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageChange
        fields = ["from_stage", "to_stage", "changed_at"]


class CandidateSerializer(serializers.ModelSerializer):
    history = StageChangeSerializer(many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = ["id", "name", "email", "phone", "role", "skills", "experience_years",
                  "resume_url", "notes", "stage", "created_at", "updated_at", "history"]
        read_only_fields = ["created_at", "updated_at"]

    def validate_email(self, value):
        value = value.lower()
        qs = Candidate.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A candidate with this email already exists.")
        return value

    def validate_experience_years(self, value):
        if value < 0 or value > 60:
            raise serializers.ValidationError("Enter a value between 0 and 60.")
        return value

    def create(self, validated_data):
        candidate = super().create(validated_data)
        StageChange.objects.create(candidate=candidate, from_stage="", to_stage=candidate.stage)
        return candidate

    def update(self, instance, validated_data):
        old = instance.stage
        candidate = super().update(instance, validated_data)
        if candidate.stage != old:
            StageChange.objects.create(candidate=candidate, from_stage=old, to_stage=candidate.stage)
        return candidate
