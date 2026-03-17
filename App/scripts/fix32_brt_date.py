"""
Fix #32 - Timezone BRT: Complete Habit usa CURRENT_DATE (UTC) em vez de data BRT
==============================================================================
Problema: CURRENT_DATE no PostgreSQL retorna data UTC. Às 21:00 BRT (=00:00 UTC)
o hábito é inserido com a data do dia seguinte (UTC), causando bug de reset antecipado.

Fix: substituir CURRENT_DATE por (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
nas duas ocorrências do node Complete Habit.

Mantém:
  - Toda a lógica de streak (yesterday = data BRT - 1 dia)
  - Dedup de completion no mesmo dia
  - Estrutura do INSERT/UPDATE
"""

import requests
import sys

N8N_BASE = "https://n8n-evo-n8n.harxon.easypanel.host/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308"
WORKFLOW_ID = "agr9lH57zHvusH73"
TARGET_NODE_NAME = "Complete Habit"

HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json",
}

OLD_DATE = "CURRENT_DATE"
NEW_DATE = "(NOW() AT TIME ZONE 'America/Sao_Paulo')::date"


def get_workflow():
    r = requests.get(f"{N8N_BASE}/workflows/{WORKFLOW_ID}", headers=HEADERS)
    r.raise_for_status()
    return r.json()


def update_workflow(wf, nodes):
    payload = {
        "name": wf["name"],
        "nodes": nodes,
        "connections": wf["connections"],
        "settings": wf.get("settings", {}),
        "staticData": wf.get("staticData"),
    }
    r = requests.put(f"{N8N_BASE}/workflows/{WORKFLOW_ID}", headers=HEADERS, json=payload)
    if r.status_code != 200:
        print(f"  [ERROR] Status: {r.status_code}")
        print(f"  Response: {r.text[:1000]}")
    r.raise_for_status()
    return r.json()


def apply_fix(query):
    count = query.count(OLD_DATE)
    new_query = query.replace(OLD_DATE, NEW_DATE)
    return new_query, count


def verify(nodes):
    for node in nodes:
        if node.get("name") == TARGET_NODE_NAME:
            query = node.get("parameters", {}).get("query", "")
            checks = {
                "CURRENT_DATE removed": OLD_DATE not in query,
                "BRT date present": NEW_DATE in query,
                "INSERT still present": "INSERT INTO habit_completions" in query or "habit_completions" in query,
            }
            print("\n=== VERIFICATION ===")
            all_pass = True
            for label, result in checks.items():
                status = "PASS" if result else "FAIL"
                print(f"  [{status}] {label}")
                if not result:
                    all_pass = False
            return all_pass
    print("[FAIL] Target node not found!")
    return False


def main():
    print("=" * 60)
    print("Fix #32 - Complete Habit: CURRENT_DATE -> BRT date")
    print("=" * 60)

    print("\n[1/5] Getting workflow...")
    wf = get_workflow()
    nodes = wf["nodes"]
    print(f"  Got {len(nodes)} nodes, versionId: {wf['versionId']}")

    print(f"\n[2/5] Locating node '{TARGET_NODE_NAME}'...")
    found = False
    for node in nodes:
        if node.get("name") == TARGET_NODE_NAME:
            query = node.get("parameters", {}).get("query", "")
            print(f"  Found. Query length: {len(query)} chars")
            occurrences = query.count(OLD_DATE)
            print(f"  CURRENT_DATE occurrences: {occurrences}")

            if occurrences == 0:
                print("  [WARN] CURRENT_DATE not found — may already be fixed")
                sys.exit(0)

            new_query, count = apply_fix(query)
            print(f"  Replaced {count} occurrence(s)")
            print(f"  New query length: {len(new_query)} chars")
            node["parameters"]["query"] = new_query
            found = True
            break

    if not found:
        print(f"  [ERROR] Node '{TARGET_NODE_NAME}' not found!")
        sys.exit(1)

    print("\n[3/5] Pre-verifying locally...")
    if not verify(nodes):
        print("  [ERROR] Local verification failed! Aborting.")
        sys.exit(1)
    print("  Local verification passed!")

    print("\n[4/5] Deploying workflow...")
    result = update_workflow(wf, nodes)
    print(f"  Deployed! New versionId: {result.get('versionId', 'unknown')}")

    print("\n[5/5] Verifying deployed workflow...")
    deployed = get_workflow()
    if verify(deployed["nodes"]):
        print("\n" + "=" * 60)
        print("SUCCESS: Complete Habit agora usa data BRT!")
        print("Habitos completados apos 21h BRT serao registrados na data correta.")
        print("=" * 60)
    else:
        print("\n[ERROR] Post-deploy verification failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
