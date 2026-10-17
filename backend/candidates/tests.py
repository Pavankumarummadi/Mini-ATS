from rest_framework.test import APITestCase


class ATSTests(APITestCase):
    def make(self, **kw):
        data = {"name": "Asha", "email": "asha@x.com", "role": "Backend Engineer", "skills": "python,django"}
        data.update(kw)
        return self.client.post("/api/candidates/", data, format="json")

    def test_create_and_history(self):
        r = self.make()
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data["stage"], "applied")
        self.assertEqual(len(r.data["history"]), 1)

    def test_duplicate_email_rejected(self):
        self.make()
        self.assertEqual(self.make().status_code, 400)

    def test_edit_keeps_own_email(self):
        cid = self.make().data["id"]
        r = self.client.patch(f"/api/candidates/{cid}/", {"email": "asha@x.com", "name": "Asha K"}, format="json")
        self.assertEqual(r.status_code, 200)

    def test_stage_change_logged(self):
        cid = self.make().data["id"]
        r = self.client.patch(f"/api/candidates/{cid}/", {"stage": "interview"}, format="json")
        self.assertEqual(r.data["stage"], "interview")
        self.assertEqual(len(r.data["history"]), 2)

    def test_search_and_filter(self):
        self.make()
        self.make(name="Ravi", email="ravi@x.com", role="Designer", skills="figma")
        self.assertEqual(self.client.get("/api/candidates/?search=django").data["count"], 1)
        self.assertEqual(self.client.get("/api/candidates/?stage=applied").data["count"], 2)
        self.assertEqual(self.client.get("/api/candidates/?role=designer").data["count"], 1)

    def test_dashboard(self):
        cid = self.make().data["id"]
        self.client.patch(f"/api/candidates/{cid}/", {"stage": "hired"}, format="json")
        d = self.client.get("/api/dashboard/").data
        self.assertEqual(d["total"], 1)
        self.assertEqual(d["hire_rate"], 100.0)
        self.assertEqual(d["by_stage"]["hired"], 1)
