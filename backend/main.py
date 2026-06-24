from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from database import supabase
from auth import hash_password, verify_password, create_token, verify_token
from typing import Optional
import os, uuid, random, smtplib, secrets
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ════════════════════════════════════════════════════════════
# CONFIG / CONSTANTS
# ════════════════════════════════════════════════════════════
SUPERADMIN_EMAIL    = os.getenv("SUPERADMIN_EMAIL", "arzanishw13@gmail.com")
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "ChangeThisPassword123!")
GOOGLE_CLIENT_ID    = "666475827485-d1ae76rj2sclgc02aj84gmc7rmlsba1v.apps.googleusercontent.com"
GMAIL_USER          = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD  = os.getenv("GMAIL_APP_PASSWORD")

otp_store = {}


# ════════════════════════════════════════════════════════════
# HELPERS
# ════════════════════════════════════════════════════════════
def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(to_email: str, otp: str, name: str):
    try:
        msg = MIMEMultipart()
        msg['From']    = GMAIL_USER
        msg['To']      = to_email
        msg['Subject'] = "DeepSense - Your Verification Code"

        body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #060B14; padding: 32px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0D9488; font-size: 24px; margin: 0;">🦷 DeepSense</h2>
                <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">AI-Powered Dental Intelligence</p>
            </div>
            <p style="color: #E2E8F0;">Hi <strong>{name}</strong>,</p>
            <p style="color: #94A3B8;">Your verification code for DeepSense is:</p>
            <div style="background: #0F1928; border: 2px solid #0D9488; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #0D9488; letter-spacing: 8px;">{otp}</span>
            </div>
            <p style="color: #64748B; font-size: 13px;">⏱ This code expires in <strong style="color: #E2E8F0;">10 minutes</strong>.</p>
            <p style="color: #64748B; font-size: 13px;">If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #1E293B; margin: 24px 0;">
            <p style="color: #334155; font-size: 11px; text-align: center;">DeepSense AI · Dental Intelligence Platform · Rawalpindi, Pakistan</p>
        </div>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


# ════════════════════════════════════════════════════════════
# APP SETUP
# ════════════════════════════════════════════════════════════
app = FastAPI(title="DeepSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        print(f"Token OK: {payload}")
        return payload
    except Exception as e:
        print(f"Token FAILED: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def require_verified_dentist(user=Depends(get_current_user)):
    """Admin (dentist) hai toh verified hona chahiye. Patient/superadmin ko nahi rokta."""
    if user["role"] == "admin":
        result = supabase.table("users")\
            .select("is_verified").eq("id", user["user_id"]).execute()
        if not result.data or not result.data[0].get("is_verified"):
            raise HTTPException(403, "Your account is pending verification. Please wait for admin approval.")
    return user


def get_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        if payload.get("role") != "superadmin":
            raise HTTPException(403, "Super admin access only")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


# ════════════════════════════════════════════════════════════
# MODELS
# ════════════════════════════════════════════════════════════
class RegisterModel(BaseModel):
    full_name: str
    email: str
    password: str
    role: str
    license_number: Optional[str] = None

class LoginModel(BaseModel):
    email: str
    password: str

class PatientModel(BaseModel):
    full_name: str
    email: Optional[str] = None
    date_of_birth: Optional[str] = None

class AppointmentModel(BaseModel):
    patient_id: str
    appointment_date: str
    time_slot: str
    reason: Optional[str] = None

class SendOTPModel(BaseModel):
    email: str
    full_name: str
    password: str
    role: str
    license_number: Optional[str] = None
    phone: Optional[str] = None

class VerifyOTPModel(BaseModel):
    email: str
    otp: str

class ForgotPasswordModel(BaseModel):
    email: str

class ResetPasswordModel(BaseModel):
    email: str
    otp: str
    new_password: str

class GoogleAuthModel(BaseModel):
    credential: str
    role: Optional[str] = None
    license_number: Optional[str] = None

class SuperAdminLoginModel(BaseModel):
    email: str
    password: str

class VerifyDentistModel(BaseModel):
    user_id: str
    verified: bool


# ════════════════════════════════════════════════════════════
# ROOT
# ════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {"message": "DeepSense API Running!"}


# ════════════════════════════════════════════════════════════
# AUTH — EMAIL/PASSWORD
# ════════════════════════════════════════════════════════════
@app.post("/register")
async def register(data: RegisterModel):
    try:
        existing = supabase.table("users")\
            .select("id").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(400, "Email already exists")
        hashed = hash_password(data.password)
        result = supabase.table("users").insert({
            "full_name": data.full_name,
            "email": data.email,
            "password": hashed,
            "role": data.role,
            "license_number": data.license_number
        }).execute()
        user = result.data[0]
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Success", "token": token, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/login")
async def login(data: LoginModel):
    try:
        result = supabase.table("users")\
            .select("*").eq("email", data.email).execute()
        if not result.data:
            raise HTTPException(401, "Invalid credentials")
        user = result.data[0]
        if not verify_password(data.password, user["password"]):
            raise HTTPException(401, "Invalid credentials")
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Success", "token": token, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/me")
async def get_me(user=Depends(get_current_user)):
    result = supabase.table("users")\
        .select("id,full_name,email,role,is_verified")\
        .eq("id", user["user_id"]).execute()
    return result.data[0]


@app.delete("/me")
async def delete_my_account(user=Depends(get_current_user)):
    """User apna khud ka account delete kar sake (patient ya dentist dono)."""
    try:
        # Agar patient hai, uska linked patient record bhi delete karo
        if user["role"] == "patient":
            user_data = supabase.table("users")\
                .select("email").eq("id", user["user_id"]).execute()
            if user_data.data:
                email = user_data.data[0]["email"]
                supabase.table("patients").delete().eq("email", email).execute()

        supabase.table("users").delete().eq("id", user["user_id"]).execute()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# OTP — SIGNUP
# ════════════════════════════════════════════════════════════
@app.post("/send-otp")
async def send_otp(data: SendOTPModel):
    try:
        existing = supabase.table("users")\
            .select("id").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(400, "Email already registered")

        otp = generate_otp()
        otp_store[data.email] = {
            "otp":            otp,
            "expires":        datetime.utcnow() + timedelta(minutes=10),
            "name":           data.full_name,
            "password":       data.password,
            "role":           data.role,
            "license_number": data.license_number,
            "phone":          data.phone,
        }

        sent = send_otp_email(data.email, otp, data.full_name)
        if not sent:
            raise HTTPException(500, "Failed to send OTP email. Check Gmail credentials.")

        print(f"✅ OTP sent to {data.email}")
        return {"message": "OTP sent! Check your email."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/verify-otp")
async def verify_otp(data: VerifyOTPModel):
    try:
        stored = otp_store.get(data.email)
        if not stored:
            raise HTTPException(400, "OTP not found — request again")
        if datetime.utcnow() > stored["expires"]:
            del otp_store[data.email]
            raise HTTPException(400, "OTP expired — request again")
        if stored["otp"] != data.otp:
            raise HTTPException(400, "Invalid OTP")

        hashed = hash_password(stored["password"])
        result = supabase.table("users").insert({
            "full_name":      stored["name"],
            "email":          data.email,
            "password":       hashed,
            "role":           stored["role"],
            "license_number": stored.get("license_number"),
            "phone":          stored.get("phone"),
            "is_verified":    False if stored["role"] == "admin" else True,
        }).execute()

        del otp_store[data.email]
        user  = result.data[0]
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Verified!", "token": token, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# FORGOT PASSWORD
# ════════════════════════════════════════════════════════════
@app.post("/forgot-password")
async def forgot_password(data: ForgotPasswordModel):
    try:
        existing = supabase.table("users")\
            .select("id, full_name").eq("email", data.email).execute()
        if not existing.data:
            raise HTTPException(404, "Email not found")

        user_name = existing.data[0].get("full_name", "User")
        otp = generate_otp()
        otp_store[data.email] = {
            "otp": otp,
            "expires": datetime.utcnow() + timedelta(minutes=10),
            "type": "reset"
        }

        sent = send_otp_email(data.email, otp, user_name)
        if not sent:
            raise HTTPException(500, "Email send failed!")

        print(f"Reset OTP for {data.email}: {otp}")
        return {"message": "OTP sent!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/verify-forgot-otp")
async def verify_forgot_otp(data: VerifyOTPModel):
    try:
        stored = otp_store.get(data.email)
        if not stored:
            raise HTTPException(400, "OTP not found — request again")
        if datetime.utcnow() > stored["expires"]:
            del otp_store[data.email]
            raise HTTPException(400, "OTP expired")
        if stored["otp"] != data.otp:
            raise HTTPException(400, "Invalid OTP")
        return {"message": "OTP verified!", "email": data.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/reset-password")
async def reset_password(data: ResetPasswordModel):
    try:
        stored = otp_store.get(data.email)
        if not stored:
            raise HTTPException(400, "OTP not found")
        if datetime.utcnow() > stored["expires"]:
            del otp_store[data.email]
            raise HTTPException(400, "OTP expired")
        if stored["otp"] != data.otp:
            raise HTTPException(400, "Invalid OTP")

        hashed = hash_password(data.new_password)
        supabase.table("users")\
            .update({"password": hashed})\
            .eq("email", data.email).execute()

        del otp_store[data.email]
        return {"message": "Password reset successful!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# GOOGLE SIGN-IN
# ════════════════════════════════════════════════════════════
@app.post("/google-auth")
async def google_auth(data: GoogleAuthModel):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )

        email     = idinfo.get("email")
        full_name = idinfo.get("name", "")

        if not email:
            raise HTTPException(400, "Could not retrieve email from Google")

        existing = supabase.table("users")\
            .select("*").eq("email", email).execute()

        if existing.data:
            user = existing.data[0]
            token = create_token({"user_id": user["id"], "role": user["role"]})
            return {
                "message": "Success",
                "token": token,
                "user": user,
                "is_new_user": False
            }

        if not data.role:
            return {
                "is_new_user": True,
                "needs_role": True,
                "google_email": email,
                "google_name": full_name,
            }

        if data.role == "admin" and not data.license_number:
            return {
                "is_new_user": True,
                "needs_pmc": True,
                "google_email": email,
                "google_name": full_name,
            }

        random_password = hash_password(secrets.token_urlsafe(32))

        result = supabase.table("users").insert({
            "full_name": full_name,
            "email": email,
            "password": random_password,
            "role": data.role,
            "license_number": data.license_number if data.role == "admin" else None,
            "auth_provider": "google",
            "is_verified": False if data.role == "admin" else True,
        }).execute()

        user = result.data[0]
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {
            "message": "Account created",
            "token": token,
            "user": user,
            "is_new_user": False
        }
    except ValueError:
        raise HTTPException(401, "Invalid Google token")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# SUPER ADMIN
# ════════════════════════════════════════════════════════════
@app.post("/superadmin/login")
async def superadmin_login(data: SuperAdminLoginModel):
    if data.email != SUPERADMIN_EMAIL or data.password != SUPERADMIN_PASSWORD:
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"user_id": "superadmin", "role": "superadmin"})
    return {
        "message": "Success",
        "token": token,
        "user": {"full_name": "Super Admin", "role": "superadmin", "email": data.email}
    }


@app.get("/superadmin/stats")
async def superadmin_stats(admin=Depends(get_super_admin)):
    try:
        users = supabase.table("users").select("*").execute()

        total_dentists = len([u for u in users.data if u["role"] == "admin"])
        total_patients = len([u for u in users.data if u["role"] == "patient"])
        verified_dentists   = len([u for u in users.data if u["role"] == "admin" and u.get("is_verified") == True])
        unverified_dentists = len([u for u in users.data if u["role"] == "admin" and u.get("is_verified") == False])

        reports = supabase.table("xray_reports").select("id").execute()
        appointments = supabase.table("appointments").select("id").execute()

        return {
            "total_dentists": total_dentists,
            "total_patients": total_patients,
            "verified_dentists": verified_dentists,
            "unverified_dentists": unverified_dentists,
            "total_reports": len(reports.data),
            "total_appointments": len(appointments.data),
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/superadmin/dentists")
async def superadmin_get_dentists(admin=Depends(get_super_admin)):
    try:
        result = supabase.table("users")\
            .select("id, full_name, email, license_number, phone, is_verified, auth_provider, created_at")\
            .eq("role", "admin")\
            .order("created_at", desc=True)\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/superadmin/patients")
async def superadmin_get_patients_count_only(admin=Depends(get_super_admin)):
    """HIPAA minimum-necessary: only an aggregate count, no patient records or PII."""
    try:
        result = supabase.table("users")\
            .select("id", count="exact")\
            .eq("role", "patient")\
            .execute()
        return {"total_patients": result.count}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/superadmin/patient-lookup")
async def superadmin_emergency_lookup(email: str, reason: str, admin=Depends(get_super_admin)):
    """
    Emergency-only patient lookup. Exact email match required — no browsing or partial search.
    Returns minimal info: identity + which dentist they're linked to. No medical records.
    Every lookup is logged with timestamp and stated reason for audit purposes.
    """
    try:
        if not reason or len(reason.strip()) < 10:
            raise HTTPException(400, "A reason (at least 10 characters) is required for this lookup and will be logged.")

        user_result = supabase.table("users")\
            .select("id, full_name, email, created_at")\
            .eq("email", email)\
            .eq("role", "patient")\
            .execute()

        if not user_result.data:
            log_entry = {
                "email_searched": email,
                "reason": reason,
                "found": False,
                "timestamp": datetime.utcnow().isoformat(),
            }
            print(f"🔍 AUDIT LOG — Emergency Lookup: {log_entry}")
            raise HTTPException(404, "No patient found with this exact email")

        patient_user = user_result.data[0]

        # Linked dentist dhundo (sirf naam, koi aur info nahi)
        linked = supabase.table("patients")\
            .select("admin_id")\
            .eq("email", email)\
            .execute()

        dentist_name = None
        if linked.data:
            admin_id = linked.data[0].get("admin_id")
            if admin_id:
                dentist_result = supabase.table("users")\
                    .select("full_name").eq("id", admin_id).execute()
                if dentist_result.data:
                    dentist_name = dentist_result.data[0]["full_name"]

        # Audit log — console ke liye abhi, future mein DB table bana kar permanent rakh sakte ho
        log_entry = {
            "email_searched": email,
            "reason": reason,
            "found": True,
            "patient_id": patient_user["id"],
            "timestamp": datetime.utcnow().isoformat(),
        }
        print(f"🔍 AUDIT LOG — Emergency Lookup: {log_entry}")

        return {
            "full_name": patient_user["full_name"],
            "email": patient_user["email"],
            "registered_on": patient_user["created_at"],
            "linked_dentist": dentist_name,
            "note": "This lookup has been logged for compliance purposes.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/superadmin/verify-dentist")
async def superadmin_verify_dentist(data: VerifyDentistModel, admin=Depends(get_super_admin)):
    try:
        supabase.table("users")\
            .update({"is_verified": data.verified})\
            .eq("id", data.user_id)\
            .execute()
        return {"message": "Updated successfully"}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/superadmin/user/{user_id}")
async def superadmin_delete_user(user_id: str, admin=Depends(get_super_admin)):
    """Super Admin can only delete dentist (admin role) accounts — never patients. HIPAA minimum-necessary."""
    try:
        target = supabase.table("users").select("role").eq("id", user_id).execute()
        if not target.data:
            raise HTTPException(404, "User not found")
        if target.data[0]["role"] != "admin":
            raise HTTPException(403, "Super Admin can only manage dentist accounts, not patient records")
        supabase.table("users").delete().eq("id", user_id).execute()
        return {"message": "Dentist account deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# PATIENT MANAGEMENT
# ════════════════════════════════════════════════════════════
@app.get("/search-patient")
async def search_patient(email: str, user=Depends(get_current_user)):
    try:
        result = supabase.table("users")\
            .select("id, full_name, email")\
            .eq("email", email)\
            .eq("role", "patient")\
            .execute()
        if not result.data:
            raise HTTPException(404, "Patient not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/link-patient")
async def link_patient(data: PatientModel, user=Depends(require_verified_dentist)):
    try:
        existing = supabase.table("patients")\
            .select("id")\
            .eq("admin_id", user["user_id"])\
            .eq("email", data.email)\
            .execute()
        if existing.data:
            raise HTTPException(400, "Patient already linked")
        result = supabase.table("patients").insert({
            "admin_id":      user["user_id"],
            "full_name":     data.full_name,
            "email":         data.email,
            "date_of_birth": data.date_of_birth
        }).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/patients")
async def get_patients(user=Depends(require_verified_dentist)):
    result = supabase.table("patients")\
        .select("*").eq("admin_id", user["user_id"]).execute()
    return result.data


@app.post("/patients")
async def add_patient(data: PatientModel, user=Depends(require_verified_dentist)):
    result = supabase.table("patients").insert({
        "admin_id": user["user_id"],
        "full_name": data.full_name,
        "email": data.email,
        "date_of_birth": data.date_of_birth
    }).execute()
    return result.data[0]


@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str, user=Depends(require_verified_dentist)):
    result = supabase.table("patients")\
        .select("*").eq("id", patient_id).execute()
    return result.data[0]


@app.delete("/patients/{patient_id}")
async def remove_patient(patient_id: str, user=Depends(require_verified_dentist)):
    """Dentist apne linked patient ko apni list se remove kar sake — sirf wo dentist jis ne link kiya tha."""
    try:
        existing = supabase.table("patients")\
            .select("id, admin_id").eq("id", patient_id).execute()
        if not existing.data:
            raise HTTPException(404, "Patient not found")
        if existing.data[0]["admin_id"] != user["user_id"]:
            raise HTTPException(403, "You can only remove your own linked patients")
        supabase.table("patients").delete().eq("id", patient_id).execute()
        return {"message": "Patient removed from your list"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# REPORTS
# ════════════════════════════════════════════════════════════
@app.get("/reports")
async def get_reports(user=Depends(require_verified_dentist)):
    patients = supabase.table("patients")\
        .select("id")\
        .eq("admin_id", user["user_id"]).execute()

    if not patients.data:
        return []

    patient_ids = [p["id"] for p in patients.data]

    result = supabase.table("xray_reports")\
        .select("*, patients(full_name)")\
        .in_("patient_id", patient_ids).execute()

    return result.data


@app.get("/reports/{patient_id}")
async def get_patient_reports(patient_id: str, user=Depends(get_current_user)):
    result = supabase.table("xray_reports")\
        .select("*").eq("patient_id", patient_id).execute()
    return result.data


@app.get("/my-reports")
async def get_my_reports(user=Depends(get_current_user)):
    try:
        user_data = supabase.table("users")\
            .select("email").eq("id", user["user_id"]).execute()
        if not user_data.data:
            return []
        email = user_data.data[0]["email"]
        patient = supabase.table("patients")\
            .select("id").eq("email", email).execute()
        if not patient.data:
            return []
        patient_id = patient.data[0]["id"]
        result = supabase.table("xray_reports")\
            .select("*").eq("patient_id", patient_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# APPOINTMENTS
# ════════════════════════════════════════════════════════════
@app.get("/appointments")
async def get_appointments(user=Depends(get_current_user)):
    if user["role"] == "admin":
        result_check = supabase.table("users")\
            .select("is_verified").eq("id", user["user_id"]).execute()
        if not result_check.data or not result_check.data[0].get("is_verified"):
            raise HTTPException(403, "Your account is pending verification. Please wait for admin approval.")
        result = supabase.table("appointments")\
            .select("*, patients(full_name)")\
            .eq("admin_id", user["user_id"]).execute()
    else:
        result = supabase.table("appointments")\
            .select("*")\
            .eq("patient_id", user["user_id"]).execute()
    return result.data


@app.post("/appointments")
async def book_appointment(data: AppointmentModel, user=Depends(get_current_user)):
    result = supabase.table("appointments").insert({
        "patient_id": data.patient_id,
        "admin_id": user["user_id"],
        "appointment_date": data.appointment_date,
        "time_slot": data.time_slot,
        "reason": data.reason,
        "status": "booked"
    }).execute()
    return result.data[0]


# ════════════════════════════════════════════════════════════
# AI ANALYZE
# ════════════════════════════════════════════════════════════
@app.post("/analyze")
async def analyze_xray(
    file: UploadFile = File(...),
    patient_id: str = None,
    user=Depends(require_verified_dentist)
):
    try:
        import torch
        import torchvision.transforms as transforms
        from PIL import Image
        from model import DeepSenseV3
        import io

        classes = ['Caries', 'Bone Loss', 'Fracture', 'Impacted Teeth']

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        img_tensor = transform(img).unsqueeze(0)

        model = DeepSenseV3(num_classes=4)
        model.load_state_dict(torch.load(
            os.path.join(os.path.dirname(__file__), 'deepsense_best.pth'),
            map_location=torch.device('cpu')
        ))
        model.eval()

        with torch.no_grad():
            output = model(img_tensor)
            probs = torch.softmax(output, dim=1)[0]

        findings = {classes[i]: float(probs[i]) for i in range(len(classes))}
        detected = max(findings, key=findings.get)

        nlp_report = f"""
DeepSense AI Dental Analysis Report
=====================================
Primary Finding: {detected}
Confidence: {findings[detected]*100:.1f}%

Analysis Summary:
- {detected} detected with high confidence
- Immediate clinical evaluation recommended
- Follow-up X-ray advised in 3 months

All Findings:
""" + "\n".join([f"- {k}: {v*100:.1f}%" for k, v in findings.items()])

        if patient_id:
            supabase.table("xray_reports").insert({
                "patient_id": patient_id,
                "findings": findings,
                "confidence_scores": findings,
                "nlp_report": nlp_report
            }).execute()

        return {
            "detected": detected,
            "confidence": findings[detected],
            "all_findings": findings,
            "nlp_report": nlp_report
        }
    except Exception as e:
        print(f"Analyze error: {e}")
        raise HTTPException(500, str(e))


# ════════════════════════════════════════════════════════════
# AI CHAT
# ════════════════════════════════════════════════════════════
@app.post("/chat")
async def chat(request: dict, user=Depends(require_verified_dentist)):
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        message = request.get("message", "")
        history = request.get("history", [])

        system_prompt = """You are DeepSense AI, an expert dental clinical assistant.
You help dentists analyze X-rays, understand diagnoses, suggest treatments, and answer clinical questions.
Be professional, accurate, and concise. Always recommend consulting a qualified dentist for final decisions."""

        messages = []
        for h in history:
            if h["role"] in ["user", "assistant"]:
                messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=system_prompt,
            messages=messages
        )

        return {"reply": response.content[0].text}
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(500, str(e))