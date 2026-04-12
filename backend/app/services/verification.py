"""
Verification workflow service for NutriKart Upgrade 2.
Validates candidate nutrition records against biochemical logic, completeness contracts,
and evidence trails before granting verified status.
"""

from typing import Dict, Any, Tuple
from datetime import datetime, timezone

REQUIRED_NUTRIENTS = [
    "calories",
    "protein",
    "fat",
    "saturated_fat",
    "sugar",
    "fiber",
    "sodium",
]

ALLOWED_BASIS = {"per_100g", "per_100ml", "per_serving"}


class NutritionVerificationWorkflow:
    def __init__(self, reviewer_id: str = "auditor:gemini-pro"):
        self.reviewer_id = reviewer_id

    def verify_candidate(self, record: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Validates candidate record.
        Returns: (is_verified, reason, audit_metadata)
        """
        now = datetime.now(timezone.utc).isoformat()
        audit_meta = {
            "reviewer_id": self.reviewer_id,
            "reviewed_at": now,
            "rule_version": 2,
        }

        # 1. Check Basis Validity
        basis = record.get("measurement_basis")
        if not basis or basis not in ALLOWED_BASIS:
            audit_meta["decision"] = "rejected"
            audit_meta["rejection_reason"] = f"Invalid or missing measurement basis: {basis}"
            return False, audit_meta["rejection_reason"], audit_meta

        # 2. Check Completeness of Required Nutrients
        missing_fields = []
        for nutrient in REQUIRED_NUTRIENTS:
            val = record.get(nutrient)
            if val is None:
                missing_fields.append(nutrient)

        if missing_fields:
            audit_meta["decision"] = "unverified_unknown"
            audit_meta["rejection_reason"] = f"Missing required nutrient fields: {', '.join(missing_fields)}"
            return False, audit_meta["rejection_reason"], audit_meta

        # 3. Check Numerical Boundaries & Non-negativity
        for nutrient in REQUIRED_NUTRIENTS:
            val = float(record[nutrient])
            if val < 0.0:
                audit_meta["decision"] = "rejected"
                audit_meta["rejection_reason"] = f"Nutrient {nutrient} cannot be negative ({val})"
                return False, audit_meta["rejection_reason"], audit_meta

        # 4. Biochemical Consistency Checks
        fat = float(record["fat"])
        sat_fat = float(record["saturated_fat"])
        if sat_fat > fat + 0.01:  # slight epsilon for rounding
            audit_meta["decision"] = "rejected"
            audit_meta["rejection_reason"] = f"Saturated fat ({sat_fat}g) cannot exceed total fat ({fat}g)"
            return False, audit_meta["rejection_reason"], audit_meta

        # 5. Check Evidence Source
        source_type = record.get("source_type")
        source_ref = record.get("source_ref")
        if not source_type or not source_ref:
            audit_meta["decision"] = "pending_review"
            audit_meta["rejection_reason"] = "Record lacks auditable source reference or source type"
            return False, audit_meta["rejection_reason"], audit_meta

        # Passed all verification criteria
        audit_meta["decision"] = "verified"
        audit_meta["rejection_reason"] = None
        return True, "Verification checks passed", audit_meta
