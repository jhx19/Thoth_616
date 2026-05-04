import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import AsyncSessionLocal
from app.repositories.sme_repository import SMERepository
from app.repositories.knowledge_repository import KnowledgeRepository
from app.repositories.interview_repository import InterviewRepository


async def seed():
    async with AsyncSessionLocal() as db:
        sme_repo = SMERepository(db)
        interview_repo = InterviewRepository(db)
        knowledge_repo = KnowledgeRepository(db)

        print("Seeding SMEs...")

        sme1 = await sme_repo.create(
            name="Dr. Elara Voss",
            specialization="MEZ Trade Compliance",
            sub_areas=["Restricted commodity transfers", "Compliance certifications", "Export controls"],
            contact_email="e.voss@mez-compliance.org",
            role="Senior Compliance Officer",
            department="Legal & Compliance",
        )
        print(f"  Created: {sme1.sme_id} — {sme1.name}")

        sme2 = await sme_repo.create(
            name="Marcus Tanaka",
            specialization="MEZ Digital Asset Protections",
            sub_areas=["Registered algorithms", "Digital rights", "Encryption standards"],
            contact_email="m.tanaka@mez-digital.org",
            role="Digital Assets Lead",
            department="Technology",
        )
        print(f"  Created: {sme2.sme_id} — {sme2.name}")

        sme3 = await sme_repo.create(
            name="Dr. Nadia Okafor",
            specialization="MEZ Dispute Resolution & Arbitration",
            sub_areas=["Tribunal filing procedures", "Arbitration clauses", "Mediation protocols"],
            contact_email="n.okafor@mez-arbitration.org",
            role="Dispute Resolution Specialist",
            department="Legal",
        )
        print(f"  Created: {sme3.sme_id} — {sme3.name}")

        print("\nSeeding interviews...")

        interview1 = await interview_repo.create(
            sme_id=sme1.sme_id,
            topic="Restricted Transfer Violations under MCC Article 14",
        )
        await interview_repo.add_turn(
            interview_id=interview1.interview_id,
            sme_response="MCC Article 14 defines a restricted transfer violation as requiring four elements: intent, a restricted commodity, a prohibited destination, and absence of a valid exemption.",
            agent_follow_up="Could you walk me through each of those four elements in detail?",
        )
        await interview_repo.add_turn(
            interview_id=interview1.interview_id,
            sme_response="Intent means the transferor knew or should have known the destination was restricted. The commodity must appear on the MEZ Restricted Goods Schedule. The destination must be on the Prohibited Jurisdiction List. And no exemption certificate must have been issued.",
            agent_follow_up=None,
        )
        await interview_repo.mark_completed(interview1.interview_id)
        print(f"  Created interview: {interview1.interview_id}")

        print("\nSeeding knowledge entries...")

        ke1 = await knowledge_repo.create_draft(
            sme_id=sme1.sme_id,
            topic="Restricted Transfer Violations — MCC Article 14",
            content="""## Restricted Transfer Violations under MCC Article 14

A restricted transfer violation requires four elements to be established:

1. **Intent** — The transferor knew or reasonably should have known that the destination was restricted.
2. **Restricted Commodity** — The item must appear on the MEZ Restricted Goods Schedule.
3. **Prohibited Destination** — The receiving jurisdiction must be listed on the Prohibited Jurisdiction List (PJL).
4. **No Valid Exemption** — No exemption certificate was issued prior to the transfer.

All four elements must be present for a violation to be charged under Article 14.

*Source: Interview with Dr. Elara Voss, MEZ Trade Compliance*""",
            sources={"interviews": [interview1.interview_id], "materials": []},
        )
        await knowledge_repo.transition_status(ke1.entry_id, "sme_approved")
        ke1_approved = await knowledge_repo.transition_status(ke1.entry_id, "approved")
        print(f"  Created + approved: {ke1.entry_id}")

        ke2 = await knowledge_repo.create_draft(
            sme_id=sme2.sme_id,
            topic="Registered Algorithm Protections — Articles 33-35",
            content="""## Digital Algorithm Protections under MEZ Articles 33-35

Registered algorithms are protected intellectual assets under MEZ Articles 33-35:

- **Article 33** — Defines a registerable algorithm as any deterministic computation sequence with a unique output signature.
- **Article 34** — Registration grants exclusive licensing rights for 15 years.
- **Article 35** — Unauthorized replication or reverse-engineering constitutes a Category A digital asset violation.

Encryption hardware containing a registered algorithm is subject to both trade compliance rules (Article 14) and digital asset protections (Article 35).

*Source: Marcus Tanaka, MEZ Digital Asset Protections*""",
            sources={"interviews": [], "materials": []},
        )
        await knowledge_repo.transition_status(ke2.entry_id, "sme_approved")
        await knowledge_repo.transition_status(ke2.entry_id, "approved")
        print(f"  Created + approved: {ke2.entry_id}")

        ke3 = await knowledge_repo.create_draft(
            sme_id=sme1.sme_id,
            topic="Draft — Compliance Certification Process",
            content="Draft content pending SME review.",
            sources={"interviews": [], "materials": []},
        )
        print(f"  Created draft: {ke3.entry_id}")

        print("\nSeed complete.")
        print(f"\nSME IDs for testing:")
        print(f"  sme1: {sme1.sme_id}")
        print(f"  sme2: {sme2.sme_id}")
        print(f"  sme3: {sme3.sme_id}")


if __name__ == "__main__":
    asyncio.run(seed())