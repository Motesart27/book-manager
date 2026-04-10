"""
MotesArt Book Manager — Backend API
Standalone Railway service
Connects to: MotesArt Book Manager Airtable base
Read endpoint available to OS dashboard
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

AIRTABLE_TOKEN = os.environ.get("BOOK_AIRTABLE_TOKEN", "")
AIRTABLE_BASE  = os.environ.get("BOOK_AIRTABLE_BASE_ID", "")
AT_BASE_URL    = f"https://api.airtable.com/v0/{AIRTABLE_BASE}"

AT_HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_TOKEN}",
    "Content-Type":  "application/json"
}

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def at_get(table, params=None):
    try:
        url = f"{AT_BASE_URL}/{requests.utils.quote(table)}"
        r = requests.get(url, headers=AT_HEADERS, params=params, timeout=10)
        r.raise_for_status()
        return r.json().get("records", [])
    except Exception as e:
        print(f"Airtable GET error [{table}]: {e}")
        return []

def at_post(table, fields):
    try:
        url = f"{AT_BASE_URL}/{requests.utils.quote(table)}"
        r = requests.post(url, headers=AT_HEADERS,
                          json={"fields": fields}, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Airtable POST error [{table}]: {e}")
        return None

def at_patch(table, record_id, fields):
    try:
        url = f"{AT_BASE_URL}/{requests.utils.quote(table)}/{record_id}"
        r = requests.patch(url, headers=AT_HEADERS,
                           json={"fields": fields}, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Airtable PATCH error [{table}]: {e}")
        return None

def fields(record):
    return record.get("fields", {})

def ok(data):
    return jsonify({"status": "ok", "data": data})

def err(msg, code=500):
    return jsonify({"status": "error", "message": msg}), code

# ─── HEALTH ──────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return ok({"service": "book-manager", "version": "1.0", "base": AIRTABLE_BASE[:8] + "..."})

# ─── DASHBOARD (aggregated — single call for OS panel) ────────────────────────

@app.route("/api/book/dashboard")
def dashboard():
    project_records  = at_get("BK_Project",  {"filterByFormula": "{Active Project}=1", "maxRecords": 1})
    chapter_records  = at_get("BK_Chapters", {"maxRecords": 20})
    task_records     = at_get("BK_Tasks",    {"filterByFormula": "AND({Status}!='Done',{Status}!='Resolved')", "maxRecords": 20})
    blocker_records  = at_get("BK_Blockers", {"filterByFormula": "{Status}='Active'", "maxRecords": 10})
    revenue_records  = at_get("BK_Revenue",  {"maxRecords": 50})
    expense_records  = at_get("BK_Expenses", {"maxRecords": 50})
    platform_records = at_get("BK_Platforms",{"maxRecords": 10})

    # Project summary
    project = {}
    if project_records:
        f = fields(project_records[0])
        project = {
            "id":           project_records[0]["id"],
            "name":         f.get("Project Name", "Tales from the Hood"),
            "code":         f.get("Project Code", "TFTH-001"),
            "author":       f.get("Author", "Bishop Roskco A. Motes, PhD"),
            "phase":        f.get("Phase", "Writing"),
            "launchStatus": f.get("Launch Status", "Not Scheduled"),
            "launchDate":   f.get("Launch Date", ""),
            "conventionDate": f.get("Convention Date", "2026-06-15"),
            "conventionName": f.get("Convention Name", ""),
            "unitsNeeded":  f.get("Units for Convention", 150),
            "printBudget":  f.get("Print Budget", 4000),
            "copyrightFiled": f.get("Copyright Filed", False),
        }

    # Chapter stats
    status_scores = {"Draft": 25, "In Review": 50, "Edited": 75, "Final": 100}
    chapters = []
    total_score = 0
    for rec in chapter_records:
        f = fields(rec)
        st = f.get("Status", "Draft")
        score = status_scores.get(st, 0)
        total_score += score
        chapters.append({
            "id":       rec["id"],
            "name":     f.get("Chapter Name", ""),
            "number":   f.get("Chapter Number", ""),
            "status":   st,
            "score":    score,
            "caseStudy":        f.get("Biblical Case Study", ""),
            "caseStudyStatus":  f.get("Case Study Status", "Missing"),
            "verified": f.get("Scripture Verified", False),
        })
    ms_pct = round(total_score / max(len(chapters), 1))

    # Tasks
    open_tasks = []
    for rec in task_records:
        f = fields(rec)
        open_tasks.append({
            "id":       rec["id"],
            "name":     f.get("Task Name", ""),
            "module":   f.get("Module", ""),
            "priority": f.get("Priority", "Medium"),
            "status":   f.get("Status", "Open"),
            "due":      f.get("Due Date", ""),
            "isBlocker":f.get("Is Blocker", False),
        })

    # Blockers
    blockers = []
    for rec in blocker_records:
        f = fields(rec)
        blockers.append({
            "id":       rec["id"],
            "name":     f.get("Blocker Name", ""),
            "category": f.get("Category", ""),
            "severity": f.get("Severity", "High"),
            "status":   f.get("Status", "Active"),
        })

    # Revenue
    total_revenue = sum(fields(r).get("Gross Amount", 0) or 0 for r in revenue_records)
    total_net     = sum(fields(r).get("Net Royalty",   0) or 0 for r in revenue_records)
    revenue_by_platform = {}
    for rec in revenue_records:
        f = fields(rec)
        plat = f.get("Platform", "Other")
        if plat not in revenue_by_platform:
            revenue_by_platform[plat] = {"gross": 0, "net": 0, "units": 0}
        revenue_by_platform[plat]["gross"] += f.get("Gross Amount", 0) or 0
        revenue_by_platform[plat]["net"]   += f.get("Net Royalty", 0) or 0
        revenue_by_platform[plat]["units"] += f.get("Units Sold", 0) or 0

    # Expenses
    total_expenses = sum(fields(r).get("Amount", 0) or 0 for r in expense_records)

    # Publishing readiness
    pub_checks = ["Copyright Filed","ISBN Print","KDP URL","IngramSpark URL","ACX URL"]
    pub_done = 0
    if project:
        if project.get("copyrightFiled"): pub_done += 1
        if project.get("isbn_print"): pub_done += 1
    platform_live = sum(1 for r in platform_records if fields(r).get("Account Status") == "Live")
    pub_pct = round((pub_done / 5) * 100)

    # Convention countdown
    try:
        conv_date = datetime.strptime(project.get("conventionDate", "2026-06-15"), "%Y-%m-%d")
        days_to_conv = (conv_date - datetime.now()).days
    except:
        days_to_conv = 0

    return ok({
        "project":         project,
        "chapters":        chapters,
        "manuscriptPct":   ms_pct,
        "publishingPct":   pub_pct,
        "openTasks":       open_tasks,
        "blockers":        blockers,
        "revenue": {
            "total":      round(total_revenue, 2),
            "totalNet":   round(total_net, 2),
            "byPlatform": revenue_by_platform,
        },
        "expenses": {
            "total": round(total_expenses, 2),
        },
        "netProfit":        round(total_revenue - total_expenses, 2),
        "daysToConvention": days_to_conv,
        "platformsLive":    platform_live,
        "generatedAt":      datetime.utcnow().isoformat(),
    })

# ─── PROJECT ─────────────────────────────────────────────────────────────────

@app.route("/api/book/project", methods=["GET"])
def get_project():
    records = at_get("BK_Project", {"filterByFormula": "{Active Project}=1", "maxRecords": 1})
    if not records:
        return err("No active project found", 404)
    return ok({"project": fields(records[0]), "id": records[0]["id"]})

@app.route("/api/book/project/<record_id>", methods=["PATCH"])
def update_project(record_id):
    body = request.json or {}
    result = at_patch("BK_Project", record_id, body)
    if not result:
        return err("Update failed")
    return ok(result)

# ─── CHAPTERS ────────────────────────────────────────────────────────────────

@app.route("/api/book/chapters", methods=["GET"])
def get_chapters():
    records = at_get("BK_Chapters", {"sort[0][field]": "Chapter Number"})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/chapters/<record_id>/status", methods=["PATCH"])
def update_chapter_status(record_id):
    body = request.json or {}
    new_status = body.get("status")
    if not new_status:
        return err("status required", 400)
    scores = {"Draft": 25, "In Review": 50, "Edited": 75, "Final": 100}
    result = at_patch("BK_Chapters", record_id, {
        "Status": new_status,
        "Completion Score": scores.get(new_status, 0)
    })
    if not result:
        return err("Update failed")
    return ok(result)

# ─── TASKS ───────────────────────────────────────────────────────────────────

@app.route("/api/book/tasks", methods=["GET"])
def get_tasks():
    status_filter = request.args.get("status", "")
    formula = f"{{Status}}='{status_filter}'" if status_filter else ""
    params = {"maxRecords": 100}
    if formula:
        params["filterByFormula"] = formula
    records = at_get("BK_Tasks", params)
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/tasks", methods=["POST"])
def create_task():
    body = request.json or {}
    if not body.get("Task Name"):
        return err("Task Name required", 400)
    body.setdefault("Status", "Open")
    body.setdefault("Priority", "Medium")
    body.setdefault("Source", "Manual")
    result = at_post("BK_Tasks", body)
    if not result:
        return err("Create failed")
    return ok(result), 201

@app.route("/api/book/tasks/<record_id>", methods=["PATCH"])
def update_task(record_id):
    body = request.json or {}
    result = at_patch("BK_Tasks", record_id, body)
    if not result:
        return err("Update failed")
    return ok(result)

# ─── EXPENSES ────────────────────────────────────────────────────────────────

@app.route("/api/book/expenses", methods=["GET"])
def get_expenses():
    records = at_get("BK_Expenses", {"sort[0][field]": "Date", "sort[0][direction]": "desc"})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/expenses", methods=["POST"])
def create_expense():
    body = request.json or {}
    if not body.get("Description"):
        return err("Description required", 400)
    body.setdefault("Business Entity", "Book Division")
    body.setdefault("FM Linked", False)
    result = at_post("BK_Expenses", body)
    if not result:
        return err("Create failed")

    # Non-blocking FM sync
    try:
        fm_url = os.environ.get("FM_APP_URL", "")
        if fm_url and body.get("Amount"):
            requests.post(f"{fm_url}/api/fm/transactions", json={
                "description": body.get("Description"),
                "amount":      -abs(body.get("Amount", 0)),
                "category":    "Book Production",
                "entity":      body.get("Business Entity", "Book Division"),
                "date":        body.get("Date", ""),
                "source":      "book-manager"
            }, timeout=5)
    except:
        pass  # FM sync failure never blocks book record

    return ok(result), 201

# ─── REVENUE ─────────────────────────────────────────────────────────────────

@app.route("/api/book/revenue", methods=["GET"])
def get_revenue():
    records = at_get("BK_Revenue", {"sort[0][field]": "Date", "sort[0][direction]": "desc"})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/revenue", methods=["POST"])
def create_revenue():
    body = request.json or {}
    if not body.get("Platform"):
        return err("Platform required", 400)
    body.setdefault("FM Linked", False)
    result = at_post("BK_Revenue", body)
    if not result:
        return err("Create failed")

    # Non-blocking FM sync
    try:
        fm_url = os.environ.get("FM_APP_URL", "")
        if fm_url and body.get("Gross Amount"):
            requests.post(f"{fm_url}/api/fm/transactions", json={
                "description": f"Book Revenue — {body.get('Platform','')}",
                "amount":      abs(body.get("Gross Amount", 0)),
                "category":    "Book Sales",
                "entity":      "Book Division",
                "date":        body.get("Date", ""),
                "source":      "book-manager"
            }, timeout=5)
    except:
        pass

    return ok(result), 201

# ─── MARKETING ───────────────────────────────────────────────────────────────

@app.route("/api/book/marketing", methods=["GET"])
def get_marketing():
    phase = request.args.get("phase", "")
    formula = f"{{Campaign Phase}}='{phase}'" if phase else ""
    params = {"maxRecords": 100}
    if formula:
        params["filterByFormula"] = formula
    records = at_get("BK_Marketing", params)
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/marketing", methods=["POST"])
def create_marketing():
    body = request.json or {}
    if not body.get("Title / Hook"):
        return err("Title / Hook required", 400)
    body.setdefault("Status", "Planned")
    body.setdefault("Agent Generated", True)
    result = at_post("BK_Marketing", body)
    if not result:
        return err("Create failed")
    return ok(result), 201

# ─── PRESS KIT ───────────────────────────────────────────────────────────────

@app.route("/api/book/press-kit", methods=["GET"])
def get_press_kit():
    records = at_get("BK_PressKit", {"sort[0][field]": "Asset Type"})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/press-kit", methods=["POST"])
def save_press_kit():
    body = request.json or {}
    if not body.get("Asset Name") or not body.get("Content"):
        return err("Asset Name and Content required", 400)
    body.setdefault("Status", "Draft")
    body.setdefault("Generated By", "Agent")
    body.setdefault("Version", 1)
    result = at_post("BK_PressKit", body)
    if not result:
        return err("Create failed")
    return ok(result), 201

# ─── PLATFORMS ───────────────────────────────────────────────────────────────

@app.route("/api/book/platforms", methods=["GET"])
def get_platforms():
    records = at_get("BK_Platforms", {"maxRecords": 20})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/platforms/<record_id>", methods=["PATCH"])
def update_platform(record_id):
    body = request.json or {}
    result = at_patch("BK_Platforms", record_id, body)
    if not result:
        return err("Update failed")
    return ok(result)

# ─── BLOCKERS ────────────────────────────────────────────────────────────────

@app.route("/api/book/blockers", methods=["GET"])
def get_blockers():
    records = at_get("BK_Blockers", {"filterByFormula": "{Status}='Active'"})
    return ok([{"id": r["id"], **fields(r)} for r in records])

@app.route("/api/book/blockers/<record_id>", methods=["PATCH"])
def update_blocker(record_id):
    body = request.json or {}
    result = at_patch("BK_Blockers", record_id, body)
    if not result:
        return err("Update failed")
    return ok(result)

# ─── AGENT ───────────────────────────────────────────────────────────────────

@app.route("/api/book/agent", methods=["POST"])
def book_agent():
    body = request.json or {}
    message    = body.get("message", "")
    history    = body.get("history", [])
    session_id = body.get("sessionId", "")

    if not message:
        return err("message required", 400)

    # Build context from live Airtable data
    project_records = at_get("BK_Project", {"filterByFormula": "{Active Project}=1", "maxRecords": 1})
    chapter_records = at_get("BK_Chapters", {"maxRecords": 20})
    blocker_records = at_get("BK_Blockers", {"filterByFormula": "{Status}='Active'", "maxRecords": 10})
    task_records    = at_get("BK_Tasks",    {"filterByFormula": "AND({Status}!='Done')", "maxRecords": 10})

    # Build live context string
    project_f = fields(project_records[0]) if project_records else {}
    chapters_summary = ", ".join(
        f"{fields(r).get('Chapter Number','?')}:{fields(r).get('Status','?')}"
        for r in chapter_records
    )
    blocker_names = [fields(r).get("Blocker Name", "") for r in blocker_records]
    open_task_names = [fields(r).get("Task Name", "") for r in task_records[:5]]

    live_context = f"""
LIVE PROJECT STATE (from Airtable — {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC):
Phase: {project_f.get('Phase', 'Writing')}
Convention Date: {project_f.get('Convention Date', '2026-06-15')}
Copyright Filed: {project_f.get('Copyright Filed', False)}
Chapters: {chapters_summary}
Active Blockers: {'; '.join(blocker_names) if blocker_names else 'None'}
Open Tasks: {'; '.join(open_task_names) if open_task_names else 'None'}
"""

    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not anthropic_key:
        return err("ANTHROPIC_API_KEY not set", 500)

    system = f"""You are the Book Manager Executive for "Tales from the Hood: A Biblical Guide to Growing from Male to Man" by Bishop Roskco A. Motes, PhD.

{live_context}

YOUR SKILL DOMAINS (all 8):
1. Writing & Structure — outline, chapter flow, voice, ghostwriting
2. Proofreading & Editing — grammar, clarity, pacing, developmental + copy editing
3. Fact Verification — cross-check all scripture references, flag anything unverified
4. Publishing — ISBN, copyright (copyright.gov), KDP, IngramSpark, LCCN, exact steps + URLs
5. Digital Distribution — Amazon, Google Play Books, Apple Books, B&N, Kobo
6. Narration / Audiobook — ACX setup, Dr. Motes recording workflow, chapter sync
7. Marketing & Promotion — launch strategy, social content, email, press kit, BookTok
8. Sales & Revenue — royalty rates, pricing strategy, bulk/speaking bundle deals

RULES:
1. Start EVERY response: current phase + ONE highest-impact action
2. Be specific — exact steps, exact URLs
3. Quick actions generate STRUCTURED USABLE OUTPUT
4. End with action items marked for task saving
5. Convention deadline: mid-June 2026 — hardcover books must be ready"""

    messages = history[-10:] + [{"role": "user", "content": message}]

    try:
        import urllib.request as ur
        payload = json.dumps({
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1000,
            "system": system,
            "messages": messages
        }).encode()
        req = ur.Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
        )
        with ur.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
        reply = data["content"][0]["text"]

        # Log to Airtable (non-blocking)
        try:
            at_post("BK_AgentLog", {
                "Session Date":     datetime.utcnow().strftime("%Y-%m-%d"),
                "Phase at Time":    project_f.get("Phase", "Writing"),
                "Prompt":           message[:500],
                "Response Summary": reply[:500],
                "Primary Module":   "Strategy",
                "Primary Outcome":  "Strategy Only",
            })
        except:
            pass

        return ok({"reply": reply, "sessionId": session_id})

    except Exception as e:
        return err(f"Agent error: {str(e)}")

# ─── AGENT LOG ───────────────────────────────────────────────────────────────

@app.route("/api/book/agent-log", methods=["GET"])
def get_agent_log():
    records = at_get("BK_AgentLog", {
        "sort[0][field]": "Created",
        "sort[0][direction]": "desc",
        "maxRecords": 20
    })
    return ok([{"id": r["id"], **fields(r)} for r in records])

# ─── OS READ ENDPOINT (public summary for OS dashboard panel) ─────────────────

@app.route("/api/book/os-summary")
def os_summary():
    """Lightweight endpoint — read-only for the Motesart OS BOOK panel"""
    project_records = at_get("BK_Project", {"filterByFormula": "{Active Project}=1", "maxRecords": 1})
    chapter_records = at_get("BK_Chapters", {"maxRecords": 20})
    blocker_records = at_get("BK_Blockers", {"filterByFormula": "{Status}='Active'", "maxRecords": 6})
    task_records    = at_get("BK_Tasks",    {"filterByFormula": "AND({Status}!='Done')", "maxRecords": 5})

    project_f = fields(project_records[0]) if project_records else {}

    status_scores = {"Draft": 25, "In Review": 50, "Edited": 75, "Final": 100}
    total_score = sum(status_scores.get(fields(r).get("Status", "Draft"), 0) for r in chapter_records)
    ms_pct = round(total_score / max(len(chapter_records), 1))

    try:
        conv_date = datetime.strptime(project_f.get("Convention Date", "2026-06-15"), "%Y-%m-%d")
        days_left = (conv_date - datetime.now()).days
    except:
        days_left = 0

    return ok({
        "projectName":     project_f.get("Project Name", "Tales from the Hood"),
        "phase":           project_f.get("Phase", "Writing"),
        "manuscriptPct":   ms_pct,
        "daysToConvention": days_left,
        "activeBlockers":  len(blocker_records),
        "openTasks":       len(task_records),
        "conventionDate":  project_f.get("Convention Date", "2026-06-15"),
        "copyrightFiled":  project_f.get("Copyright Filed", False),
    })

# ─── RUN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)
